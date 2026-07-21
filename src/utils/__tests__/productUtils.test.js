import { describe, it, expect } from 'vitest';
import { getBuyBoxWinner } from '../productUtils';

describe('getBuyBoxWinner', () => {
  it('should return null for undefined', () => {
    expect(getBuyBoxWinner(undefined)).toBeNull();
  });

  it('should return null for null', () => {
    expect(getBuyBoxWinner(null)).toBeNull();
  });

  it('should return null for an empty array', () => {
    expect(getBuyBoxWinner([])).toBeNull();
  });

  it('should correctly calculate the winner based on scoring logic', () => {
    const offers = [
      {
        id: 'A',
        price: 100,
        rating: 5,
        stock: 15,
        deliveryTime: 1
      },
      {
        id: 'B',
        price: 150,
        rating: 4,
        stock: 5,
        deliveryTime: 4
      }
    ];

    const winner = getBuyBoxWinner(offers);
    expect(winner).not.toBeNull();
    expect(winner.id).toBe('A');
    expect(winner.isBuyBoxWinner).toBe(true);
    // You can also assert the scores if you calculate them manually:
    // Offer A score should be higher than Offer B
    // A: Price: max(150), min(100) -> ((150 - 100)/(150 - 100)) * 60 = 60
    //    Rating: (5/5) * 25 = 25
    //    Stock: > 10 = 10
    //    Delivery: 1 = 5
    //    Total = 100
    // B: Price: ((150 - 150)/(50)) * 60 = 0
    //    Rating: (4/5) * 25 = 20
    //    Stock: > 0 = 5
    //    Delivery: > 3 = 0
    //    Total = 25
    expect(winner.buyBoxScore).toBe(100);
  });
});
