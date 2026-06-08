import { describe, it, expect, beforeAll } from 'vitest';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/context';

const createCaller = createCallerFactory(appRouter);
let caller: Awaited<ReturnType<typeof createCaller>>;

beforeAll(async () => {
  caller = createCaller(await createTRPCContext());
});

describe('subscriptions router', () => {
  it('list returns array', async () => {
    const result = await caller.subscriptions.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('add creates subscription entry with valid data', async () => {
    const categories = await caller.categories.list();
    const cat = categories[0];
    expect(cat).toBeDefined();

    const result = await caller.subscriptions.add({
      name: 'Test Subscription',
      amount: 99000,
      billingCycle: 'monthly',
      nextBillingDate: '2025-07-01',
      categoryId: cat.id,
    });
    expect(result.name).toBe('Test Subscription');
    expect(result.amount).toBe(99000);
    expect(result.status).toBe('active');
  });

  it('add rejects negative amount', async () => {
    const categories = await caller.categories.list();
    const cat = categories[0];

    await expect(caller.subscriptions.add({
      name: 'Bad Sub',
      amount: -100,
      billingCycle: 'monthly',
      nextBillingDate: '2025-07-01',
      categoryId: cat.id,
    })).rejects.toThrow();
  });

  it('pay advances next billing date', async () => {
    const categories = await caller.categories.list();
    const cat = categories[0];
    const sub = await caller.subscriptions.add({
      name: 'Payable Sub',
      amount: 50000,
      billingCycle: 'monthly',
      nextBillingDate: '2025-07-15',
      categoryId: cat.id,
    });

    const originalMonth = sub.nextBillingDate.getMonth();
    const result = await caller.subscriptions.pay({
      subscriptionId: sub.id,
      amount: 50000,
    });

    expect(result.nextBillingDate.getMonth()).toBe((originalMonth + 1) % 12);
  });

  it('cancel sets status to cancelled', async () => {
    const categories = await caller.categories.list();
    const cat = categories[0];
    const sub = await caller.subscriptions.add({
      name: 'Cancellable Sub',
      amount: 25000,
      billingCycle: 'monthly',
      nextBillingDate: '2025-08-01',
      categoryId: cat.id,
    });

    const result = await caller.subscriptions.cancel({
      subscriptionId: sub.id,
    });
    expect(result.status).toBe('cancelled');
  });
});
