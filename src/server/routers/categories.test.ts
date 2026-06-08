import { describe, it, expect, beforeAll } from 'vitest';
import { createCallerFactory } from '@/server/trpc';
import { appRouter } from '@/server/root';
import { createTRPCContext } from '@/server/context';

const createCaller = createCallerFactory(appRouter);
let caller: Awaited<ReturnType<typeof createCaller>>;

beforeAll(async () => {
  caller = createCaller(await createTRPCContext());
});

describe('categories router', () => {
  it('list returns categories', async () => {
    const result = await caller.categories.list();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(10);
  });

  it('list returns categories with correct shape', async () => {
    const result = await caller.categories.list();
    const cat = result[0];
    expect(cat).toHaveProperty('id');
    expect(cat).toHaveProperty('name');
    expect(cat).toHaveProperty('type');
    expect(cat).toHaveProperty('color');
  });

  it('add creates new category', async () => {
    const result = await caller.categories.add({
      name: 'Test Cat',
      type: 'EXPENSE',
      color: '#FF0000',
    });
    expect(result.name).toBe('Test Cat');
    expect(result.type).toBe('EXPENSE');
    expect(result.color).toBe('#FF0000');
  });

  it('add rejects invalid hex color', async () => {
    await expect(caller.categories.add({
      name: 'Bad',
      type: 'EXPENSE',
      color: 'not-a-color',
    })).rejects.toThrow();
  });

  it('add rejects empty name', async () => {
    await expect(caller.categories.add({
      name: '',
      type: 'EXPENSE',
      color: '#FF0000',
    })).rejects.toThrow();
  });
});
