import { z } from 'zod';
import { publicProcedure, router } from '../trpc';

export const subscriptionsRouter = router({
  list: publicProcedure.query(async ({ ctx }) => {
    return ctx.prisma.subscription.findMany({
      include: { category: true },
      orderBy: { nextBillingDate: 'asc' },
    });
  }),

  add: publicProcedure
    .input(z.object({
      name: z.string().min(1),
      amount: z.number().int().positive(),
      currency: z.enum(['IDR', 'USD']).default('IDR'),
      billingCycle: z.enum(['monthly', 'yearly', 'quarterly']),
      nextBillingDate: z.string().transform(s => new Date(s)),
      categoryId: z.string(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.subscription.create({ data: input });
    }),

  pay: publicProcedure
    .input(z.object({ subscriptionId: z.string(), amount: z.number().int().positive().optional() }))
    .mutation(async ({ ctx, input }) => {
      const sub = await ctx.prisma.subscription.findUnique({ where: { id: input.subscriptionId } });
      if (!sub) throw new Error('Subscription not found');

      const payAmount = input.amount ?? sub.amount;

      // Log payment
      await ctx.prisma.subscriptionPayment.create({
        data: { subscriptionId: input.subscriptionId, amount: payAmount, paidDate: new Date() },
      });

      // Advance next billing date based on cycle
      const nextDate = new Date(sub.nextBillingDate);
      switch (sub.billingCycle) {
        case 'monthly': nextDate.setMonth(nextDate.getMonth() + 1); break;
        case 'yearly': nextDate.setFullYear(nextDate.getFullYear() + 1); break;
        case 'quarterly': nextDate.setMonth(nextDate.getMonth() + 3); break;
      }

      return ctx.prisma.subscription.update({
        where: { id: input.subscriptionId },
        data: { nextBillingDate: nextDate },
      });
    }),

  cancel: publicProcedure
    .input(z.object({ subscriptionId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.subscription.update({
        where: { id: input.subscriptionId },
        data: { status: 'cancelled' },
      });
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.subscriptionPayment.deleteMany({ where: { subscriptionId: input.id } });
      return ctx.prisma.subscription.delete({ where: { id: input.id } });
    }),
});
