import { describe, it, expect, beforeAll } from 'vitest';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/context';

const createCaller = createCallerFactory(appRouter);
let caller: Awaited<ReturnType<typeof createCaller>>;

beforeAll(async () => {
  caller = createCaller(await createTRPCContext());
});

describe('ai router', () => {
  it('createConversation creates and returns conversation', async () => {
    const result = await caller.ai.createConversation();
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('createdAt');
  });

  it('conversations returns created conversations in list', async () => {
    // Create a conversation first
    const created = await caller.ai.createConversation();

    const conversations = await caller.ai.conversations();
    expect(Array.isArray(conversations)).toBe(true);
    expect(conversations.length).toBeGreaterThanOrEqual(1);

    const found = conversations.find((c: { id: string }) => c.id === created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });
});
