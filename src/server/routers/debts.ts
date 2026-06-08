import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const debtsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    const debts = await ctx.prisma.debt.findMany({
      where: { status: 'active' },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return debts.map(debt => {
      const paidPrincipal = debt.principalAmount - debt.remainingAmount;
      const progressPercent = Math.round((paidPrincipal / debt.principalAmount) * 100);
      const monthsRemaining = debt.monthlyPayment > 0
        ? Math.ceil(debt.remainingAmount / debt.monthlyPayment)
        : null;

      return { ...debt, progressPercent, monthsRemaining };
    });
  }),

  add: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      creditor: z.string().min(1),
      principalAmount: z.number().int().positive(),
      interestRate: z.number().min(0),
      monthlyPayment: z.number().int().positive(),
      startDate: z.string().transform(s => new Date(s)),
      categoryId: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.debt.create({
        data: { ...input, remainingAmount: input.principalAmount },
      });
    }),

  pay: publicProcedure
    .input(z.object({
      debtId: z.string(),
      amount: z.number().int().positive(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const debt = await ctx.prisma.debt.findUnique({ where: { id: input.debtId } });
      if (!debt) throw new Error('Debt not found');

      // Log payment
      await ctx.prisma.debtPayment.create({
        data: { debtId: input.debtId, amount: input.amount, paymentDate: new Date(), notes: input.notes },
      });

      // Reduce remaining amount
      const newRemaining = Math.max(0, debt.remainingAmount - input.amount);

      return ctx.prisma.debt.update({
        where: { id: input.debtId },
        data: {
          remainingAmount: newRemaining,
          status: newRemaining === 0 ? 'paid_off' : 'active',
        },
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.debtPayment.deleteMany({ where: { debtId: input.id } });
      return ctx.prisma.debt.delete({ where: { id: input.id } });
    }),
});
