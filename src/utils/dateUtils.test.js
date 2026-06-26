import { describe, it, expect } from "vitest";
import { calculateDueDate, calculateDaysLeft } from "./dateUtils";

describe("calculateDueDate", () => {
  it("should return null if lastDate is not provided", () => {
    expect(calculateDueDate(null, 1)).toBeNull();
    expect(calculateDueDate(undefined, 1)).toBeNull();
    expect(calculateDueDate("", 1)).toBeNull();
  });

  it("should calculate due date correctly for 1 year", () => {
    expect(calculateDueDate("2023-01-01", 1)).toBe("2024-01-01");
  });

  it("should calculate due date correctly for multiple years", () => {
    expect(calculateDueDate("2020-05-15", 5)).toBe("2025-05-15");
  });

  it("should calculate due date correctly for 0 years", () => {
    expect(calculateDueDate("2022-10-10", 0)).toBe("2022-10-10");
  });

  it("should handle leap years correctly (Feb 29 -> March 1 next year)", () => {
    // 2024 is a leap year. Adding 1 year will land on 2025, which doesn't have Feb 29.
    // Date.setFullYear behavior is to overflow to March 1.
    expect(calculateDueDate("2024-02-29", 1)).toBe("2025-03-01");
  });

  it("should handle leap year to leap year correctly", () => {
    expect(calculateDueDate("2020-02-29", 4)).toBe("2024-02-29");
  });
});
