import { describe, it, expect } from 'vitest';
import { getBuyBoxWinner } from '../productUtils';

describe('getBuyBoxWinner', () => {
  it('returns null for empty or null offers', () => {
    expect(getBuyBoxWinner(null)).toBeNull();
    expect(getBuyBoxWinner([])).toBeNull();
  });

  it('calculates score correctly for a single offer', () => {
    const offers = [
      { id: 1, price: 100, rating: 5, stock: 15, deliveryTime: 1 }
    ];
    const winner = getBuyBoxWinner(offers);

    // Price: 60 (max=min), Rating: (5/5)*25 = 25, Stock: (>10) 10, Delivery: (1) 5 => Total: 100
    expect(winner.isBuyBoxWinner).toBe(true);
    expect(winner.buyBoxScore).toBe(100);
    expect(winner.id).toBe(1);
  });

  it('evaluates price correctly (lower is better)', () => {
    const offers = [
      { id: 1, price: 100, rating: 5, stock: 15, deliveryTime: 1 },
      { id: 2, price: 200, rating: 5, stock: 15, deliveryTime: 1 }
    ];
    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(1);

    // Offer 1: Price: ((200-100)/(200-100))*60 = 60, Rating: 25, Stock: 10, Delivery: 5 => Total: 100
    // Offer 2: Price: ((200-200)/(200-100))*60 = 0, Rating: 25, Stock: 10, Delivery: 5 => Total: 40
    expect(winner.buyBoxScore).toBe(100);
  });

  it('evaluates rating correctly (higher is better)', () => {
    const offers = [
      { id: 1, price: 100, rating: 3, stock: 15, deliveryTime: 1 },
      { id: 2, price: 100, rating: 5, stock: 15, deliveryTime: 1 }
    ];
    const winner = getBuyBoxWinner(offers);

    // Both price: max=min=100 => 60
    // Both stock: 15 => 10
    // Both delivery: 1 => 5
    // Offer 1 rating: (3/5)*25 = 15 => Total: 90
    // Offer 2 rating: (5/5)*25 = 25 => Total: 100
    expect(winner.id).toBe(2);
    expect(winner.buyBoxScore).toBe(100);
  });

  it('evaluates stock correctly', () => {
    const offers = [
      { id: 1, price: 100, rating: 5, stock: 0, deliveryTime: 1 }, // stock: 0 => 0
      { id: 2, price: 100, rating: 5, stock: 5, deliveryTime: 1 }, // stock: 5 (>0) => 5
      { id: 3, price: 100, rating: 5, stock: 15, deliveryTime: 1 } // stock: 15 (>10) => 10
    ];
    const winner = getBuyBoxWinner(offers);

    // Only difference is stock. Max score goes to >10 stock.
    expect(winner.id).toBe(3);
    expect(winner.buyBoxScore).toBe(100);
  });

  it('evaluates delivery time correctly', () => {
    const offers = [
      { id: 1, price: 100, rating: 5, stock: 15, deliveryTime: 5 }, // time: 5 (>3) => 0
      { id: 2, price: 100, rating: 5, stock: 15, deliveryTime: 2 }, // time: 2 (<=3) => 2
      { id: 3, price: 100, rating: 5, stock: 15, deliveryTime: 1 }  // time: 1 => 5
    ];
    const winner = getBuyBoxWinner(offers);

    // Only difference is delivery time. Max score goes to 1 day delivery.
    expect(winner.id).toBe(3);
    expect(winner.buyBoxScore).toBe(100);
  });
});
