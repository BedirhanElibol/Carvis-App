import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchVehicleModels, decodeVin, getEVStations } from '../services/externalApis.js';

describe('externalApis', () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  describe('fetchVehicleModels', () => {
    it('should return an empty array if fetch rejects (error handling test)', async () => {
      vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

      const result = await fetchVehicleModels('Toyota');
      expect(result).toEqual([]);
    });

    it('should return an empty array if response is not ok', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500
        })
      ));

      const result = await fetchVehicleModels('Toyota');
      expect(result).toEqual([]);
    });
  });

  describe('decodeVin', () => {
    it('should return null if Results are missing', async () => {
      vi.stubGlobal('fetch', vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({}),
        })
      ));

      const result = await decodeVin('12345678901234567');
      expect(result).toBeNull();
    });

    it('should throw an error if fetch rejects', async () => {
      vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

      await expect(decodeVin('12345678901234567')).rejects.toThrow('Network error');
    });

    it('should throw an error if the VIN length is invalid', async () => {
      await expect(decodeVin('123')).rejects.toThrow('Invalid VIN length');
    });
  });

  describe('getEVStations', () => {
    it('should return an empty array if fetch rejects', async () => {
      vi.stubGlobal('fetch', vi.fn(() => Promise.reject(new Error('Network error'))));

      // Mock import.meta.env
      vi.stubEnv('VITE_OPEN_CHARGE_MAP_KEY', 'test_key');

      const result = await getEVStations(40.7128, -74.0060);
      expect(result).toEqual([]);

      vi.unstubAllEnvs();
    });

    it('should return an empty array if API_KEY is missing', async () => {
      // Stub the environment to ensure no key is present
      vi.stubEnv('VITE_OPEN_CHARGE_MAP_KEY', '');

      const result = await getEVStations(40.7128, -74.0060);
      expect(result).toEqual([]);

      vi.unstubAllEnvs();
    });
  });
});
