import { z } from 'zod';
import { publicProcedure, router } from '../trpc';
import { getAIConfig, AI_ENV_DEFAULTS } from '@/lib/ai-provider';

export const aiRouter = router({
  conversations: publicProcedure.query(async ({ ctx }) => {
    const conversations = await ctx.prisma.aiConversation.findMany({
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return conversations.map(c => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      messages: c.messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
    }));
  }),

  conversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .query(async ({ ctx, input }) => {
      const conversation = await ctx.prisma.aiConversation.findUnique({
        where: { id: input.conversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!conversation) return null;

      return {
        id: conversation.id,
        messages: conversation.messages.map(m => ({
          role: m.role as 'user' | 'assistant',
          content: m.content ?? '',
        })),
      };
    }),

  createConversation: publicProcedure.mutation(async ({ ctx }) => {
    return ctx.prisma.aiConversation.create({
      data: {},
    });
  }),

  addMessages: publicProcedure
    .input(z.object({
      conversationId: z.string(),
      messages: z.array(z.object({
        role: z.string(),
        content: z.string(),
      })),
    }))
    .mutation(async ({ ctx, input }) => {
      // Auto-title from first user message if not already set
      const firstUserMsg = input.messages.find(m => m.role === 'user');
      if (firstUserMsg) {
        await ctx.prisma.aiConversation.updateMany({
          where: { id: input.conversationId, title: null },
          data: { title: firstUserMsg.content.slice(0, 40) },
        });
      }

      for (const msg of input.messages) {
        await ctx.prisma.aiMessage.create({
          data: {
            conversationId: input.conversationId,
            role: msg.role,
            content: msg.content,
          },
        });
      }
      return { success: true };
    }),

  deleteConversation: publicProcedure
    .input(z.object({ conversationId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.aiMessage.deleteMany({
        where: { conversationId: input.conversationId },
      });
      await ctx.prisma.aiConversation.delete({
        where: { id: input.conversationId },
      });
      return { success: true };
    }),

  getSetting: publicProcedure
    .input(z.object({ key: z.string() }))
    .query(async ({ ctx, input }) => {
      const setting = await ctx.prisma.setting.findUnique({
        where: { key: input.key },
      });
      return { value: setting?.value ?? null };
    }),

  setSetting: publicProcedure
    .input(z.object({ key: z.string(), value: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.prisma.setting.upsert({
        where: { key: input.key },
        update: { value: input.value },
        create: { key: input.key, value: input.value },
      });
      return { success: true };
    }),

  /** Returns the effective AI config (settings overrides + env fallbacks) */
  getConfig: publicProcedure.query(async ({ ctx }) => {
    const config = await getAIConfig(ctx.prisma);
    return {
      saved: {
        baseURL: config.baseURL === process.env.AI_BASE_URL ? '' : config.baseURL,
        model: config.model === process.env.AI_MODEL ? '' : config.model,
        apiKey: config.apiKey === process.env.AI_API_KEY ? '' : config.apiKey,
        fallbackModel: config.fallbackModel === process.env.AI_FALLBACK_MODEL ? '' : config.fallbackModel,
      },
      effective: config,
      defaults: AI_ENV_DEFAULTS,
    };
  }),
});
