import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const categoriesRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.category.findMany({ orderBy: [{ type: 'asc' }, { name: 'asc' }] });
  }),
  add: publicProcedure
    .input(
      z.object({
        name: z.string().min(1, 'Name is required'),
        type: z.enum(['INCOME', 'EXPENSE']),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.category.create({ data: input });
    }),
  getUsage: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const [subscriptions, bills, debts, income, budget] = await Promise.all([
        ctx.prisma.subscription.count({ where: { categoryId: input.id } }),
        ctx.prisma.recurringBill.count({ where: { categoryId: input.id } }),
        ctx.prisma.debt.count({ where: { categoryId: input.id } }),
        ctx.prisma.incomeEntry.count({ where: { categoryId: input.id } }),
        ctx.prisma.budgetAllocation.count({ where: { categoryId: input.id } }),
      ]);
      return { subscriptions, bills, debts, income, budget };
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if category is in use
      const entries = await ctx.prisma.incomeEntry.count({ where: { categoryId: input.id } });
      const allocs = await ctx.prisma.budgetAllocation.count({ where: { categoryId: input.id } });
      const subs = await ctx.prisma.subscription.count({ where: { categoryId: input.id } });
      const bills = await ctx.prisma.recurringBill.count({ where: { categoryId: input.id } });
      const debts = await ctx.prisma.debt.count({ where: { categoryId: input.id } });
      const total = entries + allocs + subs + bills + debts;
      if (total > 0) {
        const parts: string[] = [];
        if (entries > 0) parts.push(`${entries} ${entries === 1 ? 'income entry' : 'income entries'}`);
        if (allocs > 0) parts.push(`${allocs} ${allocs === 1 ? 'budget allocation' : 'budget allocations'}`);
        if (subs > 0) parts.push(`${subs} ${subs === 1 ? 'subscription' : 'subscriptions'}`);
        if (bills > 0) parts.push(`${bills} ${bills === 1 ? 'bill' : 'bills'}`);
        if (debts > 0) parts.push(`${debts} ${debts === 1 ? 'debt' : 'debts'}`);
        throw new Error(`Cannot delete: category is used by ${parts.join(', ')}`);
      }
      return ctx.prisma.category.delete({ where: { id: input.id } });
    }),
});
