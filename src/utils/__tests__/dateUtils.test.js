import { describe, it, expect } from 'vitest';
import { calculateDueDate } from '../dateUtils';

describe('calculateDueDate', () => {
  it('returns null if lastDate is not provided', () => {
    expect(calculateDueDate(null, 1)).toBeNull();
    expect(calculateDueDate(undefined, 1)).toBeNull();
    expect(calculateDueDate('', 1)).toBeNull();
  });

  it('adds years to a given date correctly', () => {
    expect(calculateDueDate('2020-01-01', 1)).toBe('2021-01-01');
    expect(calculateDueDate('2020-01-01', 5)).toBe('2025-01-01');
    expect(calculateDueDate('2023-12-31', 2)).toBe('2025-12-31');
  });

  it('handles leap years correctly', () => {
    // If we add 1 year to a leap day, it usually rolls over to March 1st
    // since Feb 29 doesn't exist in the next year.
    expect(calculateDueDate('2020-02-29', 1)).toBe('2021-03-01');

    // If we add 4 years, it should land on the next leap day
    expect(calculateDueDate('2020-02-29', 4)).toBe('2024-02-29');
  });

  it('handles zero years', () => {
    expect(calculateDueDate('2022-05-15', 0)).toBe('2022-05-15');
  });

  it('handles negative years', () => {
    expect(calculateDueDate('2025-05-15', -1)).toBe('2024-05-15');
    expect(calculateDueDate('2025-05-15', -5)).toBe('2020-05-15');
  });

  it('formats single-digit months and days correctly', () => {
    expect(calculateDueDate('2020-05-05', 1)).toBe('2021-05-05');
  });
});
