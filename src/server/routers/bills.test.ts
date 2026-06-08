import { describe, it, expect, beforeAll } from 'vitest';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/context';

const createCaller = createCallerFactory(appRouter);
let caller: Awaited<ReturnType<typeof createCaller>>;

beforeAll(async () => {
  caller = createCaller(await createTRPCContext());
});

describe('recurringBills router', () => {
  it('list returns array', async () => {
    const result = await caller.recurringBills.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it('add creates recurring bill entry with valid data', async () => {
    const categories = await caller.categories.list();
    const cat = categories[0];
    expect(cat).toBeDefined();

    const result = await caller.recurringBills.add({
      name: 'Test Bill',
      defaultAmount: 150000,
      dueDay: 15,
      categoryId: cat.id,
    });
    expect(result.name).toBe('Test Bill');
    expect(result.defaultAmount).toBe(150000);
    expect(result.dueDay).toBe(15);
  });

  it('add rejects negative defaultAmount', async () => {
    const categories = await caller.categories.list();
    const cat = categories[0];

    await expect(caller.recurringBills.add({
      name: 'Bad Bill',
      defaultAmount: -100,
      dueDay: 15,
      categoryId: cat.id,
    })).rejects.toThrow();
  });

  it('togglePaid flips isPaid to true', async () => {
    const categories = await caller.categories.list();
    const cat = categories[0];
    const bill = await caller.recurringBills.add({
      name: 'Togglable Bill',
      defaultAmount: 100000,
      dueDay: 10,
      categoryId: cat.id,
    });

    const result = await caller.recurringBills.togglePaid({
      billId: bill.id,
    });

    expect(result.isPaid).toBe(true);
    expect(result.billId).toBe(bill.id);
  });
});
