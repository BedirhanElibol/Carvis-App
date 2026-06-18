// ================================================
// UNIT TESTS: statusConfig.js
// Testing utility functions following AAA pattern
// ================================================
import { describe, it, expect } from "vitest";
import {
  getStatusConfig,
  QUOTE_STATUS_CONFIG,
  URGENCY_CONFIG,
} from "../utils/statusConfig";

describe("statusConfig", () => {
  describe("getStatusConfig", () => {
    it("should return correct config for pending status", () => {
      // Arrange
      const status = "pending";
      // Act
      const result = getStatusConfig(status);
      // Assert
      expect(result.label).toBe("Beklemede");
      expect(result.color).toContain("yellow");
    });

    it("should return correct config for accepted status", () => {
      // Arrange
      const status = "accepted";
      // Act
      const result = getStatusConfig(status);
      // Assert
      expect(result.label).toBe("Kabul Edildi");
      expect(result.color).toContain("green");
    });

    it("should return fallback for unknown status", () => {
      // Arrange
      const status = "unknown_status_xyz";
      // Act
      const result = getStatusConfig(status);
      // Assert
      expect(result.label).toBe("Bilinmiyor");
      expect(result.icon).toBeDefined();
    });

    it("should handle null status gracefully", () => {
      // Act
      const result = getStatusConfig(null);
      // Assert
      expect(result).toBeDefined();
      expect(result.label).toBe("Bilinmiyor");
    });
  });

  describe("QUOTE_STATUS_CONFIG", () => {
    it("should have all required status types", () => {
      // Assert
      expect(QUOTE_STATUS_CONFIG).toHaveProperty("pending");
      expect(QUOTE_STATUS_CONFIG).toHaveProperty("accepted");
      expect(QUOTE_STATUS_CONFIG).toHaveProperty("rejected");
      expect(QUOTE_STATUS_CONFIG).toHaveProperty("expired");
    });

    it("should have icon for each status", () => {
      // Arrange
      const statuses = Object.keys(QUOTE_STATUS_CONFIG);
      // Assert
      statuses.forEach((status) => {
        expect(QUOTE_STATUS_CONFIG[status].icon).toBeDefined();
      });
    });
  });

  describe("URGENCY_CONFIG", () => {
    it("should have high, medium, low levels", () => {
      expect(URGENCY_CONFIG).toHaveProperty("high");
      expect(URGENCY_CONFIG).toHaveProperty("medium");
      expect(URGENCY_CONFIG).toHaveProperty("low");
    });

    it("should have correct labels", () => {
      expect(URGENCY_CONFIG.high.label).toBe("Acil");
      expect(URGENCY_CONFIG.medium.label).toBe("Yakında");
      expect(URGENCY_CONFIG.low.label).toBe("Planla");
    });
  });
});
