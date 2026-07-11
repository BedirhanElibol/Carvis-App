import { describe, it, expect } from 'vitest';
import { getBuyBoxWinner } from '../productUtils';

describe('getBuyBoxWinner', () => {
  it('should return null when offers is null or undefined', () => {
    expect(getBuyBoxWinner(null)).toBeNull();
    expect(getBuyBoxWinner(undefined)).toBeNull();
  });

  it('should return null when offers array is empty', () => {
    expect(getBuyBoxWinner([])).toBeNull();
  });

  it('should calculate correct score for a single offer (maxPrice === minPrice)', () => {
    const offers = [
      { id: 1, price: 100, rating: 5, stock: 20, deliveryTime: 1 },
    ];

    // Expected score:
    // price (max===min) -> 60
    // rating (5/5 * 25) -> 25
    // stock (> 10) -> 10
    // delivery (1) -> 5
    // Total = 100

    const result = getBuyBoxWinner(offers);
    expect(result).toEqual({
      id: 1,
      price: 100,
      rating: 5,
      stock: 20,
      deliveryTime: 1,
      buyBoxScore: 100,
      isBuyBoxWinner: true
    });
  });

  it('should correctly scale scores and pick the winner among multiple offers', () => {
    const offers = [
      { id: 1, price: 100, rating: 4, stock: 5, deliveryTime: 2 },
      { id: 2, price: 200, rating: 5, stock: 15, deliveryTime: 1 },
    ];

    // maxPrice = 200, minPrice = 100

    // Offer 1 Score:
    // price: ((200-100)/(200-100)) * 60 = 60
    // rating: (4/5) * 25 = 20
    // stock: (>0, <=10) = 5
    // delivery: (<=3) = 2
    // Total = 87

    // Offer 2 Score:
    // price: ((200-200)/(200-100)) * 60 = 0
    // rating: (5/5) * 25 = 25
    // stock: (>10) = 10
    // delivery: (1) = 5
    // Total = 40

    const result = getBuyBoxWinner(offers);

    expect(result.id).toBe(1);
    expect(result.buyBoxScore).toBe(87);
    expect(result.isBuyBoxWinner).toBe(true);
  });

  it('should correctly apply stock and delivery time tier weights', () => {
    const offers = [
      { id: 1, price: 100, rating: 5, stock: 0, deliveryTime: 5 }, // No stock/delivery points
      { id: 2, price: 100, rating: 5, stock: 1, deliveryTime: 3 }, // Partial stock/delivery points
      { id: 3, price: 100, rating: 5, stock: 11, deliveryTime: 1 }, // Full stock/delivery points
    ];

    // maxPrice = 100, minPrice = 100 (all get 60 price points)
    // rating = 5 for all (all get 25 rating points)

    // Offer 1: price 60 + rating 25 + stock 0 + delivery 0 = 85
    // Offer 2: price 60 + rating 25 + stock 5 + delivery 2 = 92
    // Offer 3: price 60 + rating 25 + stock 10 + delivery 5 = 100

    const result = getBuyBoxWinner(offers);

    expect(result.id).toBe(3);
    expect(result.buyBoxScore).toBe(100);
    expect(result.isBuyBoxWinner).toBe(true);
  });
});
