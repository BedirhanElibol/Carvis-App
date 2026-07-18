import { describe, it, expect } from 'vitest';
import { calculateDueDate } from '../dateUtils';

describe('calculateDueDate', () => {
  it('should return null when lastDate is falsy', () => {
    expect(calculateDueDate(null, 1)).toBeNull();
    expect(calculateDueDate(undefined, 1)).toBeNull();
    expect(calculateDueDate('', 1)).toBeNull();
  });

  it('should correctly add 1 year to a standard date', () => {
    expect(calculateDueDate('2023-01-15', 1)).toBe('2024-01-15');
  });

  it('should correctly add multiple years to a standard date', () => {
    expect(calculateDueDate('2020-05-20', 3)).toBe('2023-05-20');
  });

  it('should handle leap years correctly', () => {
    expect(calculateDueDate('2024-02-29', 1)).toBe('2025-03-01');
  });
});
