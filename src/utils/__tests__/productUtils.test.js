import { describe, it, expect } from 'vitest';
import { getBuyBoxWinner } from '../productUtils';

describe('getBuyBoxWinner', () => {
  it('should return null if offers is null', () => {
    expect(getBuyBoxWinner(null)).toBeNull();
  });

  it('should return null if offers is empty', () => {
    expect(getBuyBoxWinner([])).toBeNull();
  });

  it('should return the single offer as winner and calculate score correctly', () => {
    const offer = { id: 1, price: 100, rating: 5, stock: 20, deliveryTime: 1 };
    const expected = {
      id: 1,
      price: 100,
      rating: 5,
      stock: 20,
      deliveryTime: 1,
      buyBoxScore: 100, // 60 (price) + 25 (rating) + 10 (stock > 10) + 5 (delivery 1)
      isBuyBoxWinner: true
    };

    expect(getBuyBoxWinner([offer])).toEqual(expected);
  });

  it('should prioritize offer with lowest price', () => {
    const offers = [
      { id: 1, price: 100, rating: 4, stock: 20, deliveryTime: 2 },
      { id: 2, price: 90, rating: 4, stock: 20, deliveryTime: 2 }
    ];

    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(2);
    expect(winner.isBuyBoxWinner).toBe(true);
  });

  it('should prioritize offer with better rating', () => {
    const offers = [
      { id: 1, price: 100, rating: 3, stock: 20, deliveryTime: 2 },
      { id: 2, price: 100, rating: 5, stock: 20, deliveryTime: 2 }
    ];

    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(2);
    expect(winner.isBuyBoxWinner).toBe(true);
  });

  it('should prioritize offer with better stock', () => {
    const offers = [
      { id: 1, price: 100, rating: 4, stock: 5, deliveryTime: 2 }, // stock 5 gives +5
      { id: 2, price: 100, rating: 4, stock: 20, deliveryTime: 2 } // stock 20 gives +10
    ];

    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(2);
    expect(winner.isBuyBoxWinner).toBe(true);
  });

  it('should prioritize offer with faster delivery time', () => {
    const offers = [
      { id: 1, price: 100, rating: 4, stock: 20, deliveryTime: 5 }, // delivery 5 gives +0
      { id: 2, price: 100, rating: 4, stock: 20, deliveryTime: 1 }  // delivery 1 gives +5
    ];

    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(2);
    expect(winner.isBuyBoxWinner).toBe(true);
  });
});
