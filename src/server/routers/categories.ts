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
});
