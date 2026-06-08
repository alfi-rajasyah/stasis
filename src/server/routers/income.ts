import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const incomeRouter = router({
  list: publicProcedure
    .input(
      z.object({ month: z.string().optional() }).optional()
    )
    .query(async ({ ctx, input }) => {
      const now = new Date();
      const month = input?.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
      return ctx.prisma.incomeEntry.findMany({
        where: { month },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
      });
    }),
  add: publicProcedure
    .input(
      z.object({
        source: z.string().min(1),
        categoryId: z.string(),
        amount: z.number().int().positive('Amount must be positive'),
        month: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify category exists and is INCOME type
      const category = await ctx.prisma.category.findUnique({ where: { id: input.categoryId } });
      if (!category) throw new Error('Category not found');
      if (category.type !== 'INCOME') throw new Error('Category must be INCOME type');

      const now = new Date();
      const month = input.month ?? `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      return ctx.prisma.incomeEntry.create({
        data: { source: input.source, categoryId: input.categoryId, amount: input.amount, month },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        source: z.string().min(1),
        categoryId: z.string(),
        amount: z.number().int().positive('Amount must be positive'),
        month: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verify entry exists
      const existing = await ctx.prisma.incomeEntry.findUnique({ where: { id: input.id } });
      if (!existing) throw new Error('Income entry not found');

      // Verify category exists and is INCOME type
      const category = await ctx.prisma.category.findUnique({ where: { id: input.categoryId } });
      if (!category) throw new Error('Category not found');
      if (category.type !== 'INCOME') throw new Error('Category must be INCOME type');

      return ctx.prisma.incomeEntry.update({
        where: { id: input.id },
        data: {
          source: input.source,
          categoryId: input.categoryId,
          amount: input.amount,
          ...(input.month && { month: input.month }),
        },
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify entry exists
      const existing = await ctx.prisma.incomeEntry.findUnique({ where: { id: input.id } });
      if (!existing) throw new Error('Income entry not found');

      return ctx.prisma.incomeEntry.delete({ where: { id: input.id } });
    }),
});
