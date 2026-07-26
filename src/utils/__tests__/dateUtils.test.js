import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateDaysLeft } from '../dateUtils';

describe('calculateDaysLeft', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-05-15T00:00:00'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null if dateString is falsy', () => {
    expect(calculateDaysLeft(null)).toBeNull();
    expect(calculateDaysLeft('')).toBeNull();
    expect(calculateDaysLeft(undefined)).toBeNull();
  });

  it('returns positive days for future dates', () => {
    expect(calculateDaysLeft('2024-05-20T00:00:00')).toBe(5);
  });

  it('returns negative days for past dates', () => {
    expect(calculateDaysLeft('2024-05-10T00:00:00')).toBe(-5);
  });

  it('returns 0 for the current date', () => {
    expect(calculateDaysLeft('2024-05-15T00:00:00')).toBe(0);
  });
});
