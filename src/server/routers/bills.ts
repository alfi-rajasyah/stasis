import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const billsRouter = router({
  list: publicProcedure
    .input(z.object({ month: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Get all active recurring bills
      const bills = await ctx.prisma.recurringBill.findMany({
        where: { status: 'active' },
        include: { category: true },
      });

      // Get this month's payments
      const payments = await ctx.prisma.billPayment.findMany({
        where: { month },
      });

      const paymentMap = new Map(payments.map(p => [p.billId, p]));

      return bills.map(bill => {
        const payment = paymentMap.get(bill.id);
        const today = now.getDate();
        const isOverdue = !payment?.isPaid && bill.dueDay < today;
        const isDueSoon = !payment?.isPaid && bill.dueDay <= today + 3 && bill.dueDay >= today;

        return {
          ...bill,
          payment,
          isOverdue,
          isDueSoon,
          status: payment?.isPaid ? 'paid' : isOverdue ? 'overdue' : isDueSoon ? 'due_soon' : 'pending',
        };
      });
    }),

  add: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      defaultAmount: z.number().int().positive(),
      dueDay: z.number().int().min(1).max(31),
      categoryId: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.recurringBill.create({
        data: { name: input.name, defaultAmount: input.defaultAmount, dueDay: input.dueDay, categoryId: input.categoryId, notes: input.notes },
      });
    }),

  togglePaid: publicProcedure
    .input(z.object({ billId: z.string(), month: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const now = new Date();
      const month = input.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      const existing = await ctx.prisma.billPayment.findFirst({
        where: { billId: input.billId, month },
      });

      const bill = await ctx.prisma.recurringBill.findUnique({ where: { id: input.billId } });
      if (!bill) throw new Error('Bill not found');

      if (existing) {
        // Toggle
        return ctx.prisma.billPayment.update({
          where: { id: existing.id },
          data: { isPaid: !existing.isPaid, paidDate: existing.isPaid ? null : new Date() },
        });
      }

      // Create new payment (paid)
      return ctx.prisma.billPayment.create({
        data: { billId: input.billId, amount: bill.defaultAmount, month, isPaid: true, paidDate: new Date() },
      });
    }),
});
