import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance } from '../geoUtils';

describe('calculateHaversineDistance', () => {
  it('returns 0 for identical coordinates', () => {
    expect(calculateHaversineDistance(0, 0, 0, 0)).toBe(0);
    expect(calculateHaversineDistance(50, 50, 50, 50)).toBe(0);
    expect(calculateHaversineDistance(-40, -40, -40, -40)).toBe(0);
  });

  it('calculates distance between close points accurately', () => {
    // 0,0 to 0,1 (approx 111.19 km)
    const distance = calculateHaversineDistance(0, 0, 0, 1);
    expect(distance).toBeCloseTo(111194.92, 0); // within 1 meter
  });

  it('calculates expected distance between London and Paris', () => {
    // London: 51.5074, -0.1278
    // Paris: 48.8566, 2.3522
    // Approx 343.5 km
    const distance = calculateHaversineDistance(51.5074, -0.1278, 48.8566, 2.3522);
    expect(distance).toBeCloseTo(343556.06, 0); // within 1 meter
  });

  it('calculates expected distance between New York and Los Angeles', () => {
    // NY: 40.7128, -74.0060
    // LA: 34.0522, -118.2437
    // Approx 3935 km
    const distance = calculateHaversineDistance(40.7128, -74.0060, 34.0522, -118.2437);
    expect(distance).toBeCloseTo(3935746.25, 0); // within 1 meter
  });

  it('handles negative coordinates correctly (Sydney to Cape Town)', () => {
    // Sydney: -33.8688, 151.2093
    // Cape Town: -33.9249, 18.4241
    // Approx 11011 km
    const distance = calculateHaversineDistance(-33.8688, 151.2093, -33.9249, 18.4241);
    expect(distance).toBeCloseTo(11011664.13, 0); // within 1 meter
  });
});
