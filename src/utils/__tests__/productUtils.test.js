import { describe, it, expect } from 'vitest';
import { getBuyBoxWinner } from '../productUtils';

describe('getBuyBoxWinner', () => {
  it('should return null for null, undefined or empty array', () => {
    expect(getBuyBoxWinner(null)).toBeNull();
    expect(getBuyBoxWinner(undefined)).toBeNull();
    expect(getBuyBoxWinner([])).toBeNull();
  });

  it('should return the single offer as winner if only one offer is provided', () => {
    const offers = [
      { id: 1, price: 100, rating: 4.5, stock: 20, deliveryTime: 1 }
    ];
    const result = getBuyBoxWinner(offers);

    expect(result).not.toBeNull();
    expect(result.id).toBe(1);
    expect(result.isBuyBoxWinner).toBe(true);
    expect(result.buyBoxScore).toBeGreaterThan(0);
  });

  it('should correctly calculate the buy box winner based on scoring logic', () => {
    const offers = [
      { id: 1, price: 150, rating: 4.0, stock: 5, deliveryTime: 4 }, // Score: price: 0 (max price), rating: 20, stock: 5, delivery: 0 -> 25
      { id: 2, price: 100, rating: 4.5, stock: 20, deliveryTime: 1 }, // Score: price: 60 (min price), rating: 22.5, stock: 10, delivery: 5 -> 97.5 (rounds to 98)
      { id: 3, price: 120, rating: 5.0, stock: 15, deliveryTime: 2 }, // Score: price: ((150-120)/(150-100))*60 = 36, rating: 25, stock: 10, delivery: 2 -> 73
    ];
    const result = getBuyBoxWinner(offers);

    expect(result).not.toBeNull();
    expect(result.id).toBe(2);
    expect(result.isBuyBoxWinner).toBe(true);
    expect(result.buyBoxScore).toBe(98);
  });

  it('should deterministically choose a winner when offers have identically overlapping points', () => {
    // Both offers have identical characteristics, leading to the same score.
    const offers = [
      { id: 1, price: 100, rating: 5.0, stock: 20, deliveryTime: 1 },
      { id: 2, price: 100, rating: 5.0, stock: 20, deliveryTime: 1 },
      { id: 3, price: 100, rating: 5.0, stock: 20, deliveryTime: 1 }
    ];

    const result = getBuyBoxWinner(offers);

    // Sort is technically a stable sort in modern JS, but since scores are equal,
    // order is maintained, so the first element (id: 1) should be chosen.
    expect(result).not.toBeNull();
    expect(result.id).toBe(1);
    expect(result.isBuyBoxWinner).toBe(true);

    // Max score possible: price(60) + rating(25) + stock(10) + delivery(5) = 100
    expect(result.buyBoxScore).toBe(100);
  });
});
