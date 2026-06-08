import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const dashboardRouter = router({
  getSummary: publicProcedure
    .input(
      z.object({ month: z.string().optional() }).optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const monthNum = parseInt(monthStr, 10);

      // Fetch all data in parallel
      const incomeAgg = ctx.prisma.incomeEntry.aggregate({
        where: { month },
        _sum: { amount: true },
      });

      const activeSubscriptions = ctx.prisma.subscription.findMany({
        where: { status: 'active' },
        select: { amount: true, billingCycle: true },
      });

      const activeBills = ctx.prisma.recurringBill.findMany({
        where: { status: 'active' },
        select: { id: true, name: true, defaultAmount: true, dueDay: true },
      });

      const activeDebts = ctx.prisma.debt.findMany({
        where: { status: 'active' },
        select: {
          id: true,
          name: true,
          creditor: true,
          principalAmount: true,
          remainingAmount: true,
          monthlyPayment: true,
        },
      });

      const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      const upcomingSubscriptions = ctx.prisma.subscription.findMany({
        where: {
          status: 'active',
          nextBillingDate: {
            gte: now,
            lte: sevenDaysFromNow,
          },
        },
        select: { name: true, amount: true, nextBillingDate: true },
      });

      const [
        incomeResult,
        subscriptions,
        bills,
        debts,
        subsUpcoming,
      ] = await Promise.all([
        incomeAgg,
        activeSubscriptions,
        activeBills,
        activeDebts,
        upcomingSubscriptions,
      ]);

      const income = incomeResult._sum.amount ?? 0;

      // === committed: sum of real tracker obligations ===

      // 1. Active subscriptions monthly cost (normalize billing cycles)
      const subscriptionMonthlyCost = subscriptions.reduce((sum, sub) => {
        switch (sub.billingCycle) {
          case 'yearly': return sum + Math.round(sub.amount / 12);
          case 'quarterly': return sum + Math.round(sub.amount / 3);
          default: return sum + sub.amount; // monthly or unknown
        }
      }, 0);

      // 2. This month's unpaid recurring bills
      const billIds = bills.map(b => b.id);
      const billPaymentsThisMonth = billIds.length > 0
        ? await ctx.prisma.billPayment.findMany({
            where: { billId: { in: billIds }, month },
            select: { billId: true, isPaid: true },
          })
        : [];
      const paidBillIds = new Set(
        billPaymentsThisMonth.filter(p => p.isPaid).map(p => p.billId)
      );
      const unpaidBillsAmount = bills
        .filter(b => !paidBillIds.has(b.id))
        .reduce((sum, b) => sum + b.defaultAmount, 0);

      // 3. Active debts monthly payment
      const debtsMonthlyTotal = debts.reduce((sum, d) => sum + d.monthlyPayment, 0);

      const committed = subscriptionMonthlyCost + unpaidBillsAmount + debtsMonthlyTotal;

      // Free cash (floor at 0)
      const free = Math.max(0, income - committed);

      // Committed percentage (null when income is 0)
      let committedPercent: number | null = null;
      if (income > 0) {
        committedPercent = Math.round((committed / income) * 100);
      }

      // === upcomingDues: next 5 dues within 7 days ===

      const daysInMonth = new Date(year, monthNum, 0).getDate();

      // Bills without a payment record for this month AND dueDay within 7 days
      const upcomingBills = bills
        .filter(b => !paidBillIds.has(b.id))
        .map(bill => {
          const dueDay = Math.min(bill.dueDay, daysInMonth);
          const dueDate = new Date(year, monthNum - 1, dueDay);
          return { bill, dueDate };
        })
        .filter(({ dueDate }) => dueDate >= now && dueDate <= sevenDaysFromNow)
        .map(({ bill, dueDate }) => ({
          type: 'bill' as const,
          name: bill.name,
          amount: bill.defaultAmount,
          dueDate: dueDate.toISOString(),
        }));

      const upcomingSubs = subsUpcoming.map(sub => ({
        type: 'subscription' as const,
        name: sub.name,
        amount: sub.amount,
        dueDate: sub.nextBillingDate.toISOString(),
      }));

      const upcomingDues = [...upcomingSubs, ...upcomingBills]
        .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
        .slice(0, 5);

      // === debts: active debts with computed fields ===

      const debtsResult = debts.map(d => ({
        id: d.id,
        name: d.name,
        creditor: d.creditor,
        remainingAmount: d.remainingAmount,
        progressPercent: d.principalAmount > 0
          ? Math.round(((d.principalAmount - d.remainingAmount) / d.principalAmount) * 100)
          : 0,
        monthsRemaining: d.monthlyPayment > 0
          ? Math.ceil(d.remainingAmount / d.monthlyPayment)
          : null,
      }));

      return {
        month,
        income,
        committed,
        free,
        committedPercent,
        upcomingDues,
        debts: debtsResult,
      };
    }),
});
