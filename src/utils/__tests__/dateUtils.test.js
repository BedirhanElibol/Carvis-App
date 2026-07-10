import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { calculateDaysLeft } from '../dateUtils.js';

describe('calculateDaysLeft', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Use a fixed system time so that tests are deterministic.
    vi.setSystemTime(new Date('2023-10-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return null if no dateString is provided', () => {
    expect(calculateDaysLeft()).toBeNull();
    expect(calculateDaysLeft(null)).toBeNull();
    expect(calculateDaysLeft('')).toBeNull();
  });

  it('should return 0 for the current date', () => {
    // Both parsed as dates and normalized to 00:00:00.000 local time
    // We add T00:00:00 to force parsing it as local time rather than UTC midnight
    expect(calculateDaysLeft('2023-10-15T00:00:00')).toBe(0);
  });

  it('should return a positive number of days for a future date', () => {
    expect(calculateDaysLeft('2023-10-20T00:00:00')).toBe(5);
  });

  it('should return a negative number of days for a past date', () => {
    expect(calculateDaysLeft('2023-10-10T00:00:00')).toBe(-5);
  });
});
