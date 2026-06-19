import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { calculateDaysLeft, calculateDueDate } from './dateUtils';

describe('dateUtils', () => {
  describe('calculateDaysLeft', () => {
    beforeEach(() => {
      // Mock the current date to be a fixed point in local time to prevent timezone flakiness
      // Use local date strings to prevent Z (UTC) offset issues with local setHours(0)
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-01T12:00:00'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return null when dateString is falsy', () => {
      expect(calculateDaysLeft(null)).toBeNull();
      expect(calculateDaysLeft('')).toBeNull();
      expect(calculateDaysLeft(undefined)).toBeNull();
    });

    it('should correctly calculate days left for a future date', () => {
      expect(calculateDaysLeft('2024-01-11T12:00:00')).toBe(10);
      expect(calculateDaysLeft('2024-01-02T12:00:00')).toBe(1);
    });

    it('should correctly calculate days left for a past date', () => {
      expect(calculateDaysLeft('2023-12-22T12:00:00')).toBe(-10);
      expect(calculateDaysLeft('2023-12-31T12:00:00')).toBe(-1);
    });

    it('should return 0 for the current date', () => {
      expect(calculateDaysLeft('2024-01-01T00:00:00')).toBe(0);
      expect(calculateDaysLeft('2024-01-01T23:59:59')).toBe(0);
    });
  });

  describe('calculateDueDate', () => {
    it('should return null when lastDate is falsy', () => {
      expect(calculateDueDate(null, 1)).toBeNull();
      expect(calculateDueDate('', 1)).toBeNull();
      expect(calculateDueDate(undefined, 1)).toBeNull();
    });

    it('should correctly add 1 year', () => {
      expect(calculateDueDate('2023-05-15', 1)).toBe('2024-05-15');
    });

    it('should correctly add multiple years', () => {
      expect(calculateDueDate('2023-05-15', 5)).toBe('2028-05-15');
    });

    it('should correctly handle leap years', () => {
      // February 29th, 2024 is a leap year. Adding 1 year should result in March 1st, 2025 (or Feb 28th depending on JS Date implementation)
      // JS Date object adds years by incrementing the year, if month is Feb and date is 29, but year is not leap, it rolls over to March 1.
      expect(calculateDueDate('2024-02-29', 1)).toBe('2025-03-01');

      // Adding 4 years to a leap year should be another leap year
      expect(calculateDueDate('2024-02-29', 4)).toBe('2028-02-29');
    });
  });
});
