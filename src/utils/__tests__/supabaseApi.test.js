import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchPaginated } from '../supabaseApi';
import { supabase } from '../../supabaseClient';

const mockQueryBuilder = {
  select: vi.fn().mockReturnThis(),
  range: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
};

vi.mock('../../supabaseClient', () => {
  return {
    supabase: {
      from: vi.fn(() => mockQueryBuilder)
    }
  };
});

describe('fetchPaginated', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should format successful query correctly and apply default options', async () => {
    mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: ['item1'], error: null, count: 5 }));

    const result = await fetchPaginated('test_table');

    expect(supabase.from).toHaveBeenCalledWith('test_table');
    expect(mockQueryBuilder.select).toHaveBeenCalledWith('*', { count: 'exact' });
    expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 19); // default limit 20
    expect(mockQueryBuilder.order).toHaveBeenCalledWith('created_at', { ascending: false });

    expect(result).toEqual({
      success: true,
      data: ['item1'],
      error: null,
      meta: {
        count: 5,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasMore: false // to (19) < count (5) - 1 (4) -> false
      }
    });
  });

  it('should format successful query correctly when page is explicitly 1', async () => {
    mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: ['item1', 'item2'], error: null, count: 2 }));

    const result = await fetchPaginated('test_table', { page: 1, limit: 10 });

    expect(mockQueryBuilder.range).toHaveBeenCalledWith(0, 9);
    expect(result.meta.page).toBe(1);
    expect(result.meta.hasMore).toBe(false);
  });

  it('should calculate the range correctly for subsequent pages', async () => {
    mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: ['item3', 'item4'], error: null, count: 12 }));

    const result = await fetchPaginated('test_table', { page: 2, limit: 10 });

    expect(mockQueryBuilder.range).toHaveBeenCalledWith(10, 19);
    expect(result.meta.page).toBe(2);
    expect(result.meta.hasMore).toBe(false); // to (19) < count (12) - 1 (11) is false
  });

  it('should apply filters if provided', async () => {
    mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: [], error: null, count: 0 }));

    await fetchPaginated('test_table', { 
      filters: { status: 'active', user_id: 123, nullValue: null, undefinedValue: undefined } 
    });

    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('status', 'active');
    expect(mockQueryBuilder.eq).toHaveBeenCalledWith('user_id', 123);
    // null and undefined should be skipped
    expect(mockQueryBuilder.eq).toHaveBeenCalledTimes(2);
  });

  it('should handle custom select and order options', async () => {
    mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: [], error: null, count: 0 }));

    await fetchPaginated('test_table', { 
      select: 'id, name',
      orderBy: 'updated_at',
      ascending: true
    });

    expect(mockQueryBuilder.select).toHaveBeenCalledWith('id, name', { count: 'exact' });
    expect(mockQueryBuilder.order).toHaveBeenCalledWith('updated_at', { ascending: true });
  });

  it('should handle hasMore calculation correctly for multiple pages', async () => {
    mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: ['i1', 'i2'], error: null, count: 10 }));

    // Requesting page 1 with limit 2, so to = 1. count = 10. 1 < 9 is true
    const result = await fetchPaginated('test_table', { page: 1, limit: 2 });
    
    expect(result.meta.totalPages).toBe(5);
    expect(result.meta.hasMore).toBe(true);
  });

  it('should handle missing count property gracefully', async () => {
    mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: ['item'], error: null, count: undefined }));

    const result = await fetchPaginated('test_table', { limit: 10 });
    
    expect(result.meta.totalPages).toBe(0);
    expect(result.meta.hasMore).toBe(false);
  });

  it('should return error format on query failure', async () => {
    const errorObj = { message: 'Database error', code: '123' };
    mockQueryBuilder.then = vi.fn((resolve) => resolve({ data: null, error: errorObj, count: null }));

    const result = await fetchPaginated('test_table');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Database error');
    expect(result.data).toBeNull();
    expect(result.meta).toEqual({ code: '123' });
  });

  it('should return error format on exception', async () => {
    mockQueryBuilder.then = vi.fn(() => { throw new Error('Network error'); });

    const result = await fetchPaginated('test_table');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Beklenmeyen bir hata oluştu');
    expect(result.data).toBeNull();
  });
});
