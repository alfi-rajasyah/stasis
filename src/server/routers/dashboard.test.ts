import { describe, it, expect, beforeAll } from 'vitest';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/context';

const createCaller = createCallerFactory(appRouter);
let caller: Awaited<ReturnType<typeof createCaller>>;

beforeAll(async () => {
  caller = createCaller(await createTRPCContext());
});

describe('dashboard router', () => {
  it('getSummary returns correct shape', async () => {
    const result = await caller.dashboard.getSummary();
    expect(result).toHaveProperty('month');
    expect(result).toHaveProperty('income');
    expect(result).toHaveProperty('committed');
    expect(result).toHaveProperty('free');
    expect(result).toHaveProperty('committedPercent');
    expect(result).toHaveProperty('upcomingDues');
    expect(result).toHaveProperty('debts');
    expect(typeof result.income).toBe('number');
    expect(typeof result.committed).toBe('number');
    expect(typeof result.free).toBe('number');
    // income > 0 with seed data, so committedPercent should be a number (not null)
    expect(result.committedPercent).toBeTypeOf('number');
  });

  it('getSummary handles zero income (no NaN)', async () => {
    const result = await caller.dashboard.getSummary({ month: '2000-01' });
    expect(result.income).toBe(0);
    expect(result.committed).toBe(0);
    expect(result.free).toBe(0);
    expect(result.committedPercent).toBeNull();
    expect(Number.isNaN(result.free)).toBe(false);
  });
});
