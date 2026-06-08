import { describe, it, expect, beforeAll } from 'vitest';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/context';

const createCaller = createCallerFactory(appRouter);
let caller: Awaited<ReturnType<typeof createCaller>>;

beforeAll(async () => {
  caller = createCaller(await createTRPCContext());
});

describe('debts router', () => {
  it('list returns array with computed fields', async () => {
    const result = await caller.debts.list();
    expect(Array.isArray(result)).toBe(true);
    if (result.length > 0) {
      expect(result[0]).toHaveProperty('progressPercent');
      expect(result[0]).toHaveProperty('monthsRemaining');
    }
  });

  it('add creates debt entry with valid data', async () => {
    const categories = await caller.categories.list();
    const cat = categories[0];
    expect(cat).toBeDefined();

    const result = await caller.debts.add({
      name: 'Test Debt',
      creditor: 'Test Bank',
      principalAmount: 1000000,
      interestRate: 0.05,
      monthlyPayment: 200000,
      startDate: '2025-01-01',
      categoryId: cat.id,
    });
    expect(result.name).toBe('Test Debt');
    expect(result.principalAmount).toBe(1000000);
    expect(result.remainingAmount).toBe(1000000);
    expect(result.status).toBe('active');
  });

  it('add rejects negative principalAmount', async () => {
    const categories = await caller.categories.list();
    const cat = categories[0];

    await expect(caller.debts.add({
      name: 'Bad Debt',
      creditor: 'Bad Bank',
      principalAmount: -500000,
      interestRate: 0.05,
      monthlyPayment: 100000,
      startDate: '2025-01-01',
      categoryId: cat.id,
    })).rejects.toThrow();
  });

  it('pay reduces remaining balance', async () => {
    const categories = await caller.categories.list();
    const cat = categories[0];
    const debt = await caller.debts.add({
      name: 'Payable Debt',
      creditor: 'Payable Bank',
      principalAmount: 100000,
      interestRate: 0,
      monthlyPayment: 50000,
      startDate: '2025-03-01',
      categoryId: cat.id,
    });

    const result = await caller.debts.pay({
      debtId: debt.id,
      amount: 30000,
    });

    expect(result.remainingAmount).toBe(70000);
  });
});
