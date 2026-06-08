import { describe, it, expect, beforeAll } from 'vitest';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/context';

const createCaller = createCallerFactory(appRouter);
let caller: Awaited<ReturnType<typeof createCaller>>;

beforeAll(async () => {
  caller = createCaller(await createTRPCContext());
});

describe('income router', () => {
  it('list returns array', async () => {
    const result = await caller.income.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('add creates income entry with valid INCOME category', async () => {
    const categories = await caller.categories.list();
    const incomeCat = categories.find((c: { type: string }) => c.type === 'INCOME')!;
    expect(incomeCat).toBeDefined();

    const result = await caller.income.add({
      source: 'Test Income',
      categoryId: incomeCat.id,
      amount: 500000,
    });
    expect(result.source).toBe('Test Income');
    expect(result.amount).toBe(500000);
  });

  it('add rejects negative amount', async () => {
    const categories = await caller.categories.list();
    const incomeCat = categories.find((c: { type: string }) => c.type === 'INCOME')!;

    await expect(caller.income.add({
      source: 'Negative',
      categoryId: incomeCat.id,
      amount: -100,
    })).rejects.toThrow();
  });

  it('add rejects non-INCOME category', async () => {
    const categories = await caller.categories.list();
    const expenseCat = categories.find((c: { type: string }) => c.type === 'EXPENSE')!;

    await expect(caller.income.add({
      source: 'Bad Cat',
      categoryId: expenseCat.id,
      amount: 1000,
    })).rejects.toThrow();
  });
});
