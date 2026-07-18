import { describe, it, expect } from 'vitest';
import { calculateHaversineDistance } from '../geoUtils';

describe('calculateHaversineDistance', () => {
    it('should return 0 for identical points', () => {
        const lat = 40.7128;
        const lon = -74.0060;
        const distance = calculateHaversineDistance(lat, lon, lat, lon);
        expect(distance).toBe(0);
    });

    it('should calculate known distance between two cities correctly (New York to London)', () => {
        // New York
        const lat1 = 40.7128;
        const lon1 = -74.0060;
        // London
        const lat2 = 51.5074;
        const lon2 = -0.1278;

        const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);

        // Approximate distance is ~5570 km.
        // We check if it's within a reasonable margin of error (e.g., 5570km +- 50km)
        const expectedDistance = 5570 * 1000;
        const marginOfError = 50 * 1000;

        expect(distance).toBeGreaterThan(expectedDistance - marginOfError);
        expect(distance).toBeLessThan(expectedDistance + marginOfError);
    });

    it('should calculate symmetric distances', () => {
        const lat1 = 40.7128;
        const lon1 = -74.0060;
        const lat2 = 34.0522; // Los Angeles
        const lon2 = -118.2437;

        const distanceAtoB = calculateHaversineDistance(lat1, lon1, lat2, lon2);
        const distanceBtoA = calculateHaversineDistance(lat2, lon2, lat1, lon1);

        expect(distanceAtoB).toBe(distanceBtoA);
    });

    it('should handle negative coordinates correctly', () => {
        // Sydney
        const lat1 = -33.8688;
        const lon1 = 151.2093;
        // Rio de Janeiro
        const lat2 = -22.9068;
        const lon2 = -43.1729;

        const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);

        // Approximate distance is ~13520 km
        const expectedDistance = 13520 * 1000;
        const marginOfError = 50 * 1000;

        expect(distance).toBeGreaterThan(expectedDistance - marginOfError);
        expect(distance).toBeLessThan(expectedDistance + marginOfError);
    });

    it('should calculate short distances accurately', () => {
        // Points roughly 1 km apart (e.g., within a city)
        const lat1 = 51.5000;
        const lon1 = -0.1000;
        const lat2 = 51.5090; // Approx 1km north
        const lon2 = -0.1000;

        const distance = calculateHaversineDistance(lat1, lon1, lat2, lon2);

        // Approx 1000.75m distance
        const expectedDistance = 1000.75;
        const marginOfError = 10;

        expect(distance).toBeGreaterThan(expectedDistance - marginOfError);
        expect(distance).toBeLessThan(expectedDistance + marginOfError);
    });
});
