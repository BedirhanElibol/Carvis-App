import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEVStations } from './externalApis.js';

describe('getEVStations', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('console', { error: vi.fn(), warn: vi.fn(), log: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  it('should return empty array if API key is missing', async () => {
    import.meta.env.VITE_OPEN_CHARGE_MAP_KEY = '';
    const result = await getEVStations(41, 29);
    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('OpenChargeMap Key missing, cannot fetch stations.');
  });

  it('should fetch and return data when API key is present', async () => {
    import.meta.env.VITE_OPEN_CHARGE_MAP_KEY = 'test-key';
    const mockData = [{ id: 1, title: 'Station 1' }];
    fetch.mockResolvedValueOnce({
      json: vi.fn().mockResolvedValueOnce(mockData)
    });
    
    const result = await getEVStations(41, 29, 15);
    expect(result).toEqual(mockData);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.openchargemap.io/v3/poi/?output=json&latitude=41&longitude=29&distance=15&maxresults=10&key=test-key',
      expect.objectContaining({
        headers: { "User-Agent": "RapidsyApp/1.0" }
      })
    );
  });

  it('should handle fetch errors gracefully and return empty array', async () => {
    import.meta.env.VITE_OPEN_CHARGE_MAP_KEY = 'test-key';
    fetch.mockRejectedValueOnce(new Error('Network error'));
    
    const result = await getEVStations(41, 29);
    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('EV Station Error:', expect.any(Error));
  });
});
