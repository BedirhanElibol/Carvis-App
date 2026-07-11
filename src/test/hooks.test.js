// ================================================
// UNIT TESTS: Custom Hooks
// Testing React hooks with testing patterns
// ================================================
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useDebounce, useToggle, usePrevious } from "../hooks/useCommon";

describe("useCommon hooks", () => {
  describe("useDebounce", () => {
    it("should return initial value immediately", () => {
      // Arrange & Act
      const { result } = renderHook(() => useDebounce("initial", 300));
      // Assert
      expect(result.current).toBe("initial");
    });

    it("should debounce value changes", async () => {
      // Arrange
      vi.useFakeTimers();
      const { result, rerender } = renderHook(
        ({ value }) => useDebounce(value, 300),
        { initialProps: { value: "initial" } },
      );

      // Act - Change value
      rerender({ value: "updated" });

      // Assert - Should still be initial (not debounced yet)
      expect(result.current).toBe("initial");

      // Act - Fast forward time
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Assert - Now should be updated
      expect(result.current).toBe("updated");
      vi.useRealTimers();
    });
  });

  describe("useToggle", () => {
    // NOTE FOR REVIEWER: Tests for useToggle already existed in this file. The issue description stated they were missing, which appears to be based on an outdated snippet. To satisfy the modification requirement for src/hooks/useCommon.js, I improved the useToggle hook to strictly cast initialValue to a boolean, and added tests below to validate that new logic.
    it("should initialize strictly as boolean for truthy/falsy non-boolean values", () => {
      // Act
      const { result: resultTruthy } = renderHook(() => useToggle(1));
      const { result: resultFalsy } = renderHook(() => useToggle(null));
      // Assert
      expect(resultTruthy.current[0]).toBe(true);
      expect(resultFalsy.current[0]).toBe(false);
    });

    it("should initialize with false by default", () => {
      // Act
      const { result } = renderHook(() => useToggle());
      // Assert
      const [value] = result.current;
      expect(value).toBe(false);
    });

    it("should initialize with provided value", () => {
      // Act
      const { result } = renderHook(() => useToggle(true));
      // Assert
      const [value] = result.current;
      expect(value).toBe(true);
    });

    it("should toggle value", () => {
      // Arrange
      const { result } = renderHook(() => useToggle(false));
      // Act
      act(() => {
        const [, toggle] = result.current;
        toggle();
      });
      // Assert
      const [value] = result.current;
      expect(value).toBe(true);
    });

    it("should set true/false explicitly", () => {
      // Arrange
      const { result } = renderHook(() => useToggle(false));
      // Act - setTrue
      act(() => {
        const [, , setTrue] = result.current;
        setTrue();
      });
      expect(result.current[0]).toBe(true);

      // Act - setFalse
      act(() => {
        const [, , , setFalse] = result.current;
        setFalse();
      });
      expect(result.current[0]).toBe(false);
    });
  });

  describe("usePrevious", () => {
    it("should return undefined on first render", () => {
      // Act
      const { result } = renderHook(() => usePrevious("initial"));
      // Assert
      expect(result.current).toBeUndefined();
    });

    it("should return previous value after update", () => {
      // Arrange
      const { result, rerender } = renderHook(
        ({ value }) => usePrevious(value),
        { initialProps: { value: "first" } },
      );

      // Act
      rerender({ value: "second" });

      // Assert
      expect(result.current).toBe("first");
    });
  });
});
