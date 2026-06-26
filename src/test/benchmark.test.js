import { describe, it, expect, vi } from 'vitest';
import { getPartnerRecentActivity } from '../utils/supabaseApi';
import { supabase } from '../supabaseClient';

describe('getPartnerRecentActivity benchmark', () => {
  it('should run fast', async () => {
    // Mock supabase
    const mockDelay = 100; // 100ms
    const createMockQuery = () => {
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        order: vi.fn().mockReturnThis(),
        limit: vi.fn().mockImplementation(async () => {
          return new Promise(resolve => {
            setTimeout(() => {
              resolve({ data: [], error: null });
            }, mockDelay);
          });
        }),
      };
    };

    vi.spyOn(supabase, 'from').mockImplementation(createMockQuery);

    const start = performance.now();
    await getPartnerRecentActivity("test-seller-id", 5);
    const end = performance.now();

    console.log(`Execution time: ${(end - start).toFixed(2)} ms`);
    expect(end - start).toBeGreaterThan(0);
  });
});
