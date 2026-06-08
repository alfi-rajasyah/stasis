import { describe, it, expect } from 'vitest';
import { formatIDR } from './format';

describe('formatIDR', () => {
  it('formats zero', () => {
    expect(formatIDR(0)).toBe('Rp 0');
  });

  it('formats thousands', () => {
    expect(formatIDR(1000)).toBe('Rp 1.000');
  });

  it('formats millions', () => {
    expect(formatIDR(15000000)).toBe('Rp 15.000.000');
  });

  it('formats billions', () => {
    expect(formatIDR(1000000000)).toBe('Rp 1.000.000.000');
  });

  it('formats simple hundreds', () => {
    expect(formatIDR(999)).toBe('Rp 999');
  });

  it('formats edge case 100000', () => {
    expect(formatIDR(100000)).toBe('Rp 100.000');
  });

  it('handles negative values', () => {
    expect(formatIDR(-5000)).toBe('-Rp 5.000');
  });
});
