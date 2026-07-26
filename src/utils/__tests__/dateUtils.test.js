import { describe, it, expect } from 'vitest';
import { calculateDueDate } from '../dateUtils';

describe('calculateDueDate', () => {
  it('should return null when lastDate is falsy', () => {
    expect(calculateDueDate(null, 1)).toBeNull();
    expect(calculateDueDate(undefined, 1)).toBeNull();
    expect(calculateDueDate('', 1)).toBeNull();
  });

  it('should add a standard number of years correctly', () => {
    expect(calculateDueDate('2024-01-01', 1)).toBe('2025-01-01');
    expect(calculateDueDate('2023-05-15', 3)).toBe('2026-05-15');
  });

  it('should handle periodInYears being 0', () => {
    expect(calculateDueDate('2024-10-10', 0)).toBe('2024-10-10');
  });

  it('should handle leap years explicitly', () => {
    expect(calculateDueDate('2024-02-29', 1)).toBe('2025-03-01');
    expect(calculateDueDate('2024-02-29', 4)).toBe('2028-02-29');
  });
});
