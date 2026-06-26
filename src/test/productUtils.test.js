// ================================================
// UNIT TESTS: productUtils.js
// Testing utility functions following AAA pattern
// ================================================
import { describe, it, expect } from "vitest";
import { getBuyBoxWinner } from "../utils/productUtils";

describe("productUtils", () => {
  describe("getBuyBoxWinner", () => {
    it("should return null for null or undefined input", () => {
      // Act & Assert
      expect(getBuyBoxWinner(null)).toBeNull();
      expect(getBuyBoxWinner(undefined)).toBeNull();
    });

    it("should return null for an empty array", () => {
      // Act
      const result = getBuyBoxWinner([]);
      // Assert
      expect(result).toBeNull();
    });

    it("should return the only offer as the winner for a single-offer array", () => {
      // Arrange
      const offers = [{ id: 1, price: 100, rating: 4, stock: 5, deliveryTime: 2 }];
      // Act
      const result = getBuyBoxWinner(offers);
      // Assert
      expect(result.id).toBe(1);
      expect(result.isBuyBoxWinner).toBe(true);
      expect(result.buyBoxScore).toBeDefined();
    });

    it("should favor the offer with the lowest price when other factors are equal", () => {
      // Arrange
      const offers = [
        { id: 1, price: 120, rating: 5, stock: 20, deliveryTime: 1 },
        { id: 2, price: 100, rating: 5, stock: 20, deliveryTime: 1 },
      ];
      // Act
      const result = getBuyBoxWinner(offers);
      // Assert
      expect(result.id).toBe(2);
    });

    it("should favor the offer with the highest rating when other factors are equal", () => {
      // Arrange
      const offers = [
        { id: 1, price: 100, rating: 4.8, stock: 20, deliveryTime: 1 },
        { id: 2, price: 100, rating: 4.2, stock: 20, deliveryTime: 1 },
      ];
      // Act
      const result = getBuyBoxWinner(offers);
      // Assert
      expect(result.id).toBe(1);
    });

    it("should favor the offer with better stock (stock > 10 vs stock > 0) when other factors are equal", () => {
      // Arrange
      const offers = [
        { id: 1, price: 100, rating: 4.5, stock: 5, deliveryTime: 1 },
        { id: 2, price: 100, rating: 4.5, stock: 15, deliveryTime: 1 },
      ];
      // Act
      const result = getBuyBoxWinner(offers);
      // Assert
      expect(result.id).toBe(2);
    });

    it("should favor the offer with faster delivery time when other factors are equal", () => {
      // Arrange
      const offers = [
        { id: 1, price: 100, rating: 4.5, stock: 20, deliveryTime: 3 },
        { id: 2, price: 100, rating: 4.5, stock: 20, deliveryTime: 1 },
      ];
      // Act
      const result = getBuyBoxWinner(offers);
      // Assert
      expect(result.id).toBe(2);
    });

    it("should correctly calculate the buy box winner in a complex scenario", () => {
      // Arrange
      const offers = [
        { id: 1, price: 120, rating: 5, stock: 15, deliveryTime: 1 }, // Score: 0 + 25 + 10 + 5 = 40
        { id: 2, price: 100, rating: 4, stock: 5, deliveryTime: 4 },  // Score: 60 + 20 + 5 + 0 = 85
        { id: 3, price: 110, rating: 4.5, stock: 20, deliveryTime: 2 }, // Score: 30 + 22.5 + 10 + 2 = 64.5 -> 65
      ];

      // Act
      const result = getBuyBoxWinner(offers);

      // Assert
      expect(result.id).toBe(2);
      expect(result.isBuyBoxWinner).toBe(true);
      expect(result.buyBoxScore).toBe(85);
    });
  });
});
