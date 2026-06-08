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
        throw new Error(`Cannot delete: category is used by ${total} entries`);
      }
      return ctx.prisma.category.delete({ where: { id: input.id } });
    }),
});
