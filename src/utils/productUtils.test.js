import { describe, it, expect } from 'vitest';
import { getBuyBoxWinner } from './productUtils';

describe('getBuyBoxWinner', () => {
  it('should return null if offers array is empty or null', () => {
    expect(getBuyBoxWinner(null)).toBeNull();
    expect(getBuyBoxWinner(undefined)).toBeNull();
    expect(getBuyBoxWinner([])).toBeNull();
  });

  it('should correctly score and select the winner among multiple offers', () => {
    const offers = [
      { id: 1, price: 100, rating: 4.5, stock: 15, deliveryTime: 1 },
      { id: 2, price: 90, rating: 4.8, stock: 5, deliveryTime: 3 },
      { id: 3, price: 110, rating: 4.2, stock: 0, deliveryTime: 5 },
    ];
    // score calculation:
    // price max: 110, min: 90
    // id 1:
    // price: ((110 - 100) / (110 - 90)) * 60 = 30
    // rating: (4.5 / 5) * 25 = 22.5
    // stock: 15 > 10 -> 10
    // deliveryTime: 1 -> 5
    // total = 30 + 22.5 + 10 + 5 = 67.5 -> 68

    // id 2:
    // price: ((110 - 90) / (110 - 90)) * 60 = 60
    // rating: (4.8 / 5) * 25 = 24
    // stock: 5 > 0 -> 5
    // deliveryTime: 3 <= 3 -> 2
    // total = 60 + 24 + 5 + 2 = 91 -> 91

    // id 3:
    // price: ((110 - 110) / (110 - 90)) * 60 = 0
    // rating: (4.2 / 5) * 25 = 21
    // stock: 0 -> 0
    // deliveryTime: 5 -> 0
    // total = 0 + 21 + 0 + 0 = 21 -> 21

    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(2);
    expect(winner.buyBoxScore).toBe(91);
    expect(winner.isBuyBoxWinner).toBe(true);
  });

  it('should handle all items having the same price', () => {
    const offers = [
      { id: 1, price: 100, rating: 4.0, stock: 5, deliveryTime: 4 },
      { id: 2, price: 100, rating: 5.0, stock: 15, deliveryTime: 1 },
    ];

    // id 1: price = 60, rating = 20, stock = 5, delivery = 0 => 85
    // id 2: price = 60, rating = 25, stock = 10, delivery = 5 => 100

    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(2);
    expect(winner.buyBoxScore).toBe(100);
  });

  it('should correctly apply stock scoring rules', () => {
    const offers = [
      { id: 1, price: 100, rating: 5.0, stock: 15, deliveryTime: 5 }, // stock score = 10 -> total = 60 + 25 + 10 + 0 = 95
      { id: 2, price: 100, rating: 5.0, stock: 5, deliveryTime: 5 },  // stock score = 5 -> total = 60 + 25 + 5 + 0 = 90
      { id: 3, price: 100, rating: 5.0, stock: 0, deliveryTime: 5 },  // stock score = 0 -> total = 60 + 25 + 0 + 0 = 85
    ];

    const results = offers.map(offer => getBuyBoxWinner([offer]));

    expect(results[0].buyBoxScore).toBe(95);
    expect(results[1].buyBoxScore).toBe(90);
    expect(results[2].buyBoxScore).toBe(85);
  });

  it('should correctly apply delivery scoring rules', () => {
    const offers = [
      { id: 1, price: 100, rating: 5.0, stock: 0, deliveryTime: 1 }, // delivery score = 5 -> total = 60 + 25 + 0 + 5 = 90
      { id: 2, price: 100, rating: 5.0, stock: 0, deliveryTime: 2 }, // delivery score = 2 -> total = 60 + 25 + 0 + 2 = 87
      { id: 3, price: 100, rating: 5.0, stock: 0, deliveryTime: 3 }, // delivery score = 2 -> total = 60 + 25 + 0 + 2 = 87
      { id: 4, price: 100, rating: 5.0, stock: 0, deliveryTime: 4 }, // delivery score = 0 -> total = 60 + 25 + 0 + 0 = 85
    ];

    const results = offers.map(offer => getBuyBoxWinner([offer]));

    expect(results[0].buyBoxScore).toBe(90);
    expect(results[1].buyBoxScore).toBe(87);
    expect(results[2].buyBoxScore).toBe(87);
    expect(results[3].buyBoxScore).toBe(85);
  });
});
