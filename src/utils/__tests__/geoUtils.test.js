import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance } from '../geoUtils';

describe('calculateHaversineDistance', () => {
  it('returns 0 when coordinates are identical', () => {
    const lat = 40.7128;
    const lon = -74.0060;
    const distance = calculateHaversineDistance(lat, lon, lat, lon);
    expect(distance).toBe(0);
  });

  it('calculates distance between New York and London', () => {
    const nyLat = 40.7128;
    const nyLon = -74.0060;
    const londonLat = 51.5074;
    const londonLon = -0.1278;

    const distance = calculateHaversineDistance(nyLat, nyLon, londonLat, londonLon);

    // Distance should be approximately 5570 km
    expect(distance).toBeGreaterThan(5500000);
    expect(distance).toBeLessThan(5600000);
    // More precise check
    expect(distance).toBeCloseTo(5570222, -1);
  });

  it('calculates distance between Paris and Berlin', () => {
    const parisLat = 48.8566;
    const parisLon = 2.3522;
    const berlinLat = 52.5200;
    const berlinLon = 13.4050;

    const distance = calculateHaversineDistance(parisLat, parisLon, berlinLat, berlinLon);

    // Distance should be approximately 877 km
    expect(distance).toBeGreaterThan(870000);
    expect(distance).toBeLessThan(880000);
    // More precise check
    expect(distance).toBeCloseTo(877463, 0);
  });

  it('handles negative coordinates correctly', () => {
    // Rio de Janeiro (South, West) to Sydney (South, East)
    const rioLat = -22.9068;
    const rioLon = -43.1729;
    const sydneyLat = -33.8688;
    const sydneyLon = 151.2093;

    const distance = calculateHaversineDistance(rioLat, rioLon, sydneyLat, sydneyLon);

    // Distance should be approximately 13500 km
    expect(distance).toBeGreaterThan(13000000);
    expect(distance).toBeLessThan(14000000);
  });

  it('is commutative (distance from A to B is same as B to A)', () => {
    const lat1 = 40.7128;
    const lon1 = -74.0060;
    const lat2 = 51.5074;
    const lon2 = -0.1278;

    const distAB = calculateHaversineDistance(lat1, lon1, lat2, lon2);
    const distBA = calculateHaversineDistance(lat2, lon2, lat1, lon1);

    expect(distAB).toBe(distBA);
  });
});
