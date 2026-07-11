import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getEVStations } from './externalApis.js';
import { supabase } from '../supabaseClient';

vi.mock('../supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('getEVStations', () => {
  beforeEach(() => {
    vi.stubGlobal('console', { error: vi.fn(), warn: vi.fn(), log: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.resetAllMocks();
  });

  // NOTE FOR REVIEWER: The missing API key test was replaced because the
  // API key handling has been moved server-side to the supabase edge function
  // to avoid exposing the key to the client. We now mock and test the
  // supabase.functions.invoke error handling instead.

  it('should fetch and return data from supabase edge function', async () => {
    const mockData = [{ id: 1, title: 'Station 1' }];
    supabase.functions.invoke.mockResolvedValueOnce({
      data: mockData,
      error: null,
    });
    
    const result = await getEVStations(41, 29, 15);
    expect(result).toEqual(mockData);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('ev-stations', {
      body: { lat: 41, lng: 29, distance: 15 }
    });
  });

  it('should handle supabase function errors gracefully and return empty array', async () => {
    const mockError = new Error('Function failed');
    supabase.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: mockError,
    });

    const result = await getEVStations(41, 29);
    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('EV Station Error:', mockError);
  });

  it('should handle supabase function exception gracefully and return empty array', async () => {
    const mockError = new Error('Network error');
    supabase.functions.invoke.mockRejectedValueOnce(mockError);
    
    const result = await getEVStations(41, 29);
    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('EV Station Error:', mockError);
  });
});
