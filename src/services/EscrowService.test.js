import { describe, it, expect, vi } from 'vitest';
import { calculateEscrowFee } from './EscrowService';

vi.mock('../supabaseClient', () => ({
  supabase: {}
}));

describe('calculateEscrowFee', () => {
  it('should return minimum fee 50 when calculated fee is less than 50', () => {
    // 1000 * 0.015 = 15
    const fee = calculateEscrowFee(1000);
    expect(fee).toBe(50);
  });

  it('should return maximum fee 1000 when calculated fee is more than 1000', () => {
    // 100000 * 0.015 = 1500
    const fee = calculateEscrowFee(100000);
    expect(fee).toBe(1000);
  });

  it('should return calculated fee when it is between 50 and 1000', () => {
    // 10000 * 0.015 = 150
    const fee = calculateEscrowFee(10000);
    expect(fee).toBe(150);
  });

  it('should return minimum fee 50 when amount is 0', () => {
    // 0 * 0.015 = 0
    const fee = calculateEscrowFee(0);
    expect(fee).toBe(50);
  });

  it('should return exactly 50.0001 when amount is 3333.34', () => {
    // 3333.34 * 0.015 = 50.0001
    const fee = calculateEscrowFee(3333.34);
    expect(fee).toBe(50.0001);
  });

  it('should return exactly 1000 when amount is 66666.67', () => {
    // 66666.67 * 0.015 = 1000.00005 > 1000 -> 1000
    const fee = calculateEscrowFee(66666.67);
    expect(fee).toBe(1000);
  });
});
