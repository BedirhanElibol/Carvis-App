import { describe, it, expect } from 'vitest';
import { getBuyBoxWinner } from '../productUtils';

describe('getBuyBoxWinner', () => {
  it('should return null for empty or null offers', () => {
    expect(getBuyBoxWinner(null)).toBeNull();
    expect(getBuyBoxWinner(undefined)).toBeNull();
    expect(getBuyBoxWinner([])).toBeNull();
  });

  it('should return the only offer as winner when there is only one offer', () => {
    const singleOffer = [{ id: 1, price: 100, rating: 4, stock: 5, deliveryTime: 2 }];
    const winner = getBuyBoxWinner(singleOffer);
    expect(winner.id).toBe(1);
    expect(winner.isBuyBoxWinner).toBe(true);
    // score calculation:
    // price: maxPrice == minPrice == 100, so priceScore = 60
    // rating: (4/5)*25 = 20
    // stock: >0, score = 5
    // deliveryTime: <=3, score = 2
    // total = 60 + 20 + 5 + 2 = 87
    expect(winner.buyBoxScore).toBe(87);
  });

  it('should favor lower price', () => {
    const offers = [
      { id: 1, price: 100, rating: 5, stock: 20, deliveryTime: 1 },
      { id: 2, price: 80, rating: 5, stock: 20, deliveryTime: 1 }, // same properties, lower price
    ];
    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(2);
  });

  it('should favor higher rating', () => {
    const offers = [
      { id: 1, price: 100, rating: 4, stock: 20, deliveryTime: 1 },
      { id: 2, price: 100, rating: 5, stock: 20, deliveryTime: 1 }, // same properties, higher rating
    ];
    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(2);
  });

  it('should favor higher stock (stock > 10 vs stock > 0 vs no stock)', () => {
    const offers = [
      { id: 1, price: 100, rating: 5, stock: 0, deliveryTime: 1 }, // score + 0
      { id: 2, price: 100, rating: 5, stock: 5, deliveryTime: 1 }, // score + 5
      { id: 3, price: 100, rating: 5, stock: 15, deliveryTime: 1 }, // score + 10
    ];
    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(3);
  });

  it('should favor faster delivery (delivery = 1 vs delivery <= 3 vs delivery > 3)', () => {
    const offers = [
      { id: 1, price: 100, rating: 5, stock: 20, deliveryTime: 5 }, // score + 0
      { id: 2, price: 100, rating: 5, stock: 20, deliveryTime: 3 }, // score + 2
      { id: 3, price: 100, rating: 5, stock: 20, deliveryTime: 1 }, // score + 5
    ];
    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(3);
  });

  it('should calculate the overall winner correctly combining all factors', () => {
    const offers = [
      { id: 1, price: 120, rating: 5, stock: 15, deliveryTime: 1 }, // price worst (0), rating (25), stock (10), delivery (5) -> 40
      { id: 2, price: 100, rating: 4, stock: 5, deliveryTime: 2 }, // price best (60), rating (20), stock (5), delivery (2) -> 87
      { id: 3, price: 110, rating: 4.5, stock: 2, deliveryTime: 5 }, // price middle ((120-110)/(120-100)*60 = 30), rating (22.5), stock (5), delivery (0) -> 57.5 ~ 58
    ];

    // offer 1: buyBoxScore = 40
    // offer 2: buyBoxScore = 87
    // offer 3: buyBoxScore = 58

    const winner = getBuyBoxWinner(offers);
    expect(winner.id).toBe(2);
    expect(winner.buyBoxScore).toBe(87);
  });
});
