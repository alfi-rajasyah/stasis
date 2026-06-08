import { describe, it, expect, beforeAll } from 'vitest';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/context';
import type { AppRouter } from '@/server/root';

const createCaller = createCallerFactory(appRouter);
let caller: Awaited<ReturnType<typeof createCaller>>;

beforeAll(async () => {
  caller = createCaller(await createTRPCContext());
  // Ensure seed allocation for Housing is at 5000000 before any budget test runs
  try {
    const categories = await caller.categories.list();
    const housingCat = categories.find((c: { name: string }) => c.name === 'Housing');
    if (housingCat) {
      await caller.budget.set({ categoryId: housingCat.id, allocatedAmount: 5000000 });
    }
  } catch {
    // ignore cleanup errors
  }
});

describe('budget router', () => {
  it('getAll returns expense categories with allocations', async () => {
    const result = await caller.budget.getAll();
    expect(result).toHaveProperty('month');
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('totalAllocated');
    expect(Array.isArray(result.categories)).toBe(true);
    expect(result.categories.length).toBeGreaterThanOrEqual(8);
    // Housing should have seed allocation of 5000000
    const housing = result.categories.find((c: { name: string }) => c.name === 'Housing');
    expect(housing).toBeDefined();
    expect(housing!.allocated).toBe(5000000);
  });

  it('set creates new allocation', async () => {
    const categories = await caller.categories.list();
    const expenseCat = categories.find(
      (c: { type: string; name: string }) => c.type === 'EXPENSE' && c.name === 'Food & Dining'
    )!;
    expect(expenseCat).toBeDefined();

    const result = await caller.budget.set({
      categoryId: expenseCat.id,
      allocatedAmount: 1000000,
    });
    expect(result.allocatedAmount).toBe(1000000);
    expect(result.categoryId).toBe(expenseCat.id);
  });

  it('set updates existing allocation', async () => {
    const categories = await caller.categories.list();
    const housingCat = categories.find((c: { name: string }) => c.name === 'Housing')!;
    expect(housingCat).toBeDefined();

    const result = await caller.budget.set({
      categoryId: housingCat.id,
      allocatedAmount: 6000000,
    });
    expect(result.allocatedAmount).toBe(6000000);
  });

  it('set rejects negative amount', async () => {
    await expect(caller.budget.set({
      categoryId: 'some-id',
      allocatedAmount: -100,
    })).rejects.toThrow();
  });

  it('set rejects INCOME category', async () => {
    const categories = await caller.categories.list();
    const incomeCat = categories.find((c: { type: string }) => c.type === 'INCOME')!;
    expect(incomeCat).toBeDefined();

    await expect(caller.budget.set({
      categoryId: incomeCat.id,
      allocatedAmount: 100000,
    })).rejects.toThrow();
  });
});
