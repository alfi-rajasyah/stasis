import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const budgetRouter = router({
  getAll: publicProcedure
    .input(
      z.object({ month: z.string().optional() }).optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Get all EXPENSE categories with their budget allocations for the given month
      const categories = await ctx.prisma.category.findMany({
        where: { type: 'EXPENSE' },
        orderBy: { name: 'asc' },
      });

      const allocations = await ctx.prisma.budgetAllocation.findMany({
        where: { month },
      });

      const allocMap = new Map(allocations.map(a => [a.categoryId, a.allocatedAmount]));

      return {
        month,
        categories: categories.map(cat => ({
          ...cat,
          allocated: allocMap.get(cat.id) ?? 0,
        })),
        totalAllocated: allocations.reduce((sum, a) => sum + a.allocatedAmount, 0),
      };
    }),
  set: publicProcedure
    .input(
      z.object({
        categoryId: z.string(),
        month: z.string().optional(),
        allocatedAmount: z.number().int().nonnegative('Allocation must be non-negative'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify category exists and is EXPENSE type
      const category = await ctx.prisma.category.findUnique({ where: { id: input.categoryId } });
      if (!category) throw new Error('Category not found');
      if (category.type !== 'EXPENSE') throw new Error('Cannot allocate to INCOME category');

      const now = new Date();
      const month = input.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      // Upsert: update if exists, create if not
      return ctx.prisma.budgetAllocation.upsert({
        where: {
          categoryId_month: { categoryId: input.categoryId, month },
        },
        update: { allocatedAmount: input.allocatedAmount },
        create: { categoryId: input.categoryId, month, allocatedAmount: input.allocatedAmount },
      });
    }),
});
