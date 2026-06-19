import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { callRealGeminiAPI } from "../utils/aiUtils";

// Mock the modules
vi.mock("../data/automotiveKnowledge", () => ({
  searchKnowledgeBase: vi.fn(),
}));

vi.mock("../supabaseClient", () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

import { searchKnowledgeBase } from "../data/automotiveKnowledge";
import { supabase } from "../supabaseClient";

describe("aiUtils", () => {
  describe("callRealGeminiAPI", () => {
    // Preserve console.error
    const originalConsoleError = console.error;

    beforeEach(() => {
      // Mock console.error to avoid test output noise
      console.error = vi.fn();
      vi.clearAllMocks();
    });

    afterEach(() => {
      console.error = originalConsoleError;
    });

    it("should handle error from edge function and return fallback message", async () => {
      // Arrange
      searchKnowledgeBase.mockReturnValue({ found: false });

      const mockError = new Error("Network error");
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: mockError,
      });

      const prompt = "Aracım çalışmıyor";

      // Act
      const result = await callRealGeminiAPI(prompt);

      // Assert
      expect(searchKnowledgeBase).toHaveBeenCalledWith(prompt);
      expect(supabase.functions.invoke).toHaveBeenCalled();

      expect(console.error).toHaveBeenCalledWith(
        "Edge Function AI Hatası:",
        mockError
      );

      const expectedFallback = "Şu an bağlantıda küçük bir aksaklık oldu. Ancak genel olarak söyleyebilirim ki, belirttiğiniz durum için en yakın oto servisimize uğrayarak bilgisayarlı arıza tespiti yaptırmanızı öneririm.";
      expect(result).toBe(expectedFallback);
    });
  });
});
