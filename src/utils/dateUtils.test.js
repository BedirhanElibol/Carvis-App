import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateDaysLeft } from './dateUtils';

describe('calculateDaysLeft', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime('2024-01-01T12:00:00');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('returns null if dateString is falsy', () => {
    expect(calculateDaysLeft(null)).toBeNull();
    expect(calculateDaysLeft(undefined)).toBeNull();
    expect(calculateDaysLeft('')).toBeNull();
  });

  it('returns 0 for the current date', () => {
    expect(calculateDaysLeft('2024-01-01T15:00:00')).toBe(0);
  });

  it('returns correct positive number of days for future dates', () => {
    expect(calculateDaysLeft('2024-01-06T12:00:00')).toBe(5);
  });

  it('returns correct negative number of days for past dates', () => {
    expect(calculateDaysLeft('2023-12-30T12:00:00')).toBe(-2);
  });
});
