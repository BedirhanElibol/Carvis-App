import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getExchangeRates, calculateRoute } from './externalApis';

describe('calculateRoute', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should calculate distance and duration successfully', async () => {
    const mockResponse = {
      code: 'Ok',
      routes: [
        {
          distance: 15200.5,
          duration: 1200.2,
        },
      ],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const startCoords = { lat: 41.0082, lng: 28.9784 };
    const endCoords = { lat: 40.1885, lng: 29.0610 };

    const result = await calculateRoute(startCoords, endCoords);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://router.project-osrm.org/route/v1/driving/28.9784,41.0082;29.061,40.1885?overview=false'
    );
    expect(result).toEqual({
      distance: 15200.5,
      duration: 1200.2,
    });
  });

  it('should throw an error when API response is not ok', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const startCoords = { lat: 41.0, lng: 28.0 };
    const endCoords = { lat: 40.0, lng: 29.0 };

    await expect(calculateRoute(startCoords, endCoords)).rejects.toThrow('OSRM API Error: 500');

    consoleSpy.mockRestore();
  });

  it('should throw an error when API returns no route', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ code: 'NoRoute', routes: [] }),
    });

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const startCoords = { lat: 41.0, lng: 28.0 };
    const endCoords = { lat: 40.0, lng: 29.0 };

    await expect(calculateRoute(startCoords, endCoords)).rejects.toThrow('No route found');

    consoleSpy.mockRestore();
  });
});

describe('getExchangeRates', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2024-03-15T12:00:00Z'));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('should successfully fetch exchange rates from API', async () => {
    const mockResponse = {
      rates: {
        TRY: 32.15,
      },
      time_last_update_utc: 'Thu, 14 Mar 2024 00:00:00 +0000',
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await getExchangeRates('USD', 'TRY');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.exchangerate-api.com/v4/latest/USD',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        signal: expect.any(AbortSignal),
      })
    );

    expect(result).toEqual({
      rate: 32.15,
      date: '14',
    });
  });

  it('should fallback to local values when fetch fails', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));

    // The console.warn will be called during the fallback
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getExchangeRates('USD', 'TRY');

    expect(result).toEqual({
      rate: 38.45,
      date: '2024-03-15',
    });

    consoleSpy.mockRestore();
  });

  it('should fallback to 1 if no fallback is defined for the currency pair', async () => {
    global.fetch.mockRejectedValueOnce(new Error('Network error'));
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const result = await getExchangeRates('GBP', 'JPY');

    expect(result).toEqual({
      rate: 1,
      date: '2024-03-15',
    });

    consoleSpy.mockRestore();
  });
});
