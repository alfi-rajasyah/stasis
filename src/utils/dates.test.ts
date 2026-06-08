import { describe, it, expect } from 'vitest';
import { getCurrentMonth } from './dates';

describe('getCurrentMonth', () => {
  it('returns YYYY-MM format', () => {
    const result = getCurrentMonth();
    expect(result).toMatch(/^\d{4}-\d{2}$/);
  });

  it('returns current year', () => {
    const now = new Date();
    const year = now.getFullYear().toString();
    expect(getCurrentMonth()).toContain(year);
  });

  it('returns valid month (01-12)', () => {
    const month = parseInt(getCurrentMonth().split('-')[1], 10);
    expect(month).toBeGreaterThanOrEqual(1);
    expect(month).toBeLessThanOrEqual(12);
  });
});
