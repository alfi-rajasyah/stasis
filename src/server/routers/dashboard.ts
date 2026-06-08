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

      // Total income for the month
      const incomeAgg = await ctx.prisma.incomeEntry.aggregate({
        where: { month },
        _sum: { amount: true },
      });
      const income = incomeAgg._sum.amount ?? 0;

      // Committed = sum of budget allocations (aggregate of budget_allocations for the month)
      const budgetAgg = await ctx.prisma.budgetAllocation.aggregate({
        where: { month },
        _sum: { allocatedAmount: true },
      });
      const committed = budgetAgg._sum.allocatedAmount ?? 0;

      // Free cash (floor at 0 to avoid negative display)
      const free = Math.max(0, income - committed);

      // Committed percentage (null when income is 0 to avoid NaN/Infinity)
      let committedPercent: number | null = null;
      if (income > 0) {
        committedPercent = Math.round((committed / income) * 100);
      }

      return {
        month,
        income,
        committed,
        free,
        committedPercent,
        upcomingDues: [] as never[],
        debts: [] as never[],
      };
    }),
});
