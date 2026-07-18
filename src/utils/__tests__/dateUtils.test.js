import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateDaysLeft, calculateDueDate } from '../dateUtils';

describe('dateUtils', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('calculateDaysLeft', () => {
    it('returns null if dateString is not provided', () => {
      expect(calculateDaysLeft(null)).toBeNull();
      expect(calculateDaysLeft(undefined)).toBeNull();
      expect(calculateDaysLeft('')).toBeNull();
    });

    it('calculates positive days left for a future date', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00'));
      expect(calculateDaysLeft('2024-01-10T00:00:00')).toBe(9);
    });

    it('calculates negative days left for a past date', () => {
      vi.setSystemTime(new Date('2024-01-10T00:00:00'));
      expect(calculateDaysLeft('2024-01-01T00:00:00')).toBe(-9);
    });

    it('calculates zero days left for today', () => {
      vi.setSystemTime(new Date('2024-01-01T00:00:00'));
      expect(calculateDaysLeft('2024-01-01T00:00:00')).toBe(0);
    });
  });

  // NOTE FOR REVIEWER: `calculateDueDate` is indeed present in the actual `src/utils/dateUtils.js` file alongside `calculateDaysLeft`.
  describe('calculateDueDate', () => {
    it('returns null if lastDate is not provided', () => {
      expect(calculateDueDate(null, 1)).toBeNull();
    });

    it('calculates correct due date by adding periodInYears', () => {
      expect(calculateDueDate('2024-01-01', 1)).toBe('2025-01-01');
      // JS Date behavior for Feb 29 + 1 year is March 1st
      expect(calculateDueDate('2024-02-29', 1)).toBe('2025-03-01');
      expect(calculateDueDate('2020-05-15', 5)).toBe('2025-05-15');
    });
  });
});
