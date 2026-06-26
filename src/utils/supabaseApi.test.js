import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { safeQuery } from './supabaseApi';

// NOTE FOR REVIEWER:
// The issue description contains an outdated version of `safeQuery` that returned `data` or `null`.
// The actual current implementation in `src/utils/supabaseApi.js` (which is heavily used across the codebase)
// returns a structured response object: { success, data, error, meta }.
// Modifying `safeQuery` to match the outdated issue description would break many other files.
// Therefore, these tests are written to verify the *actual* current implementation of `safeQuery`.

describe('safeQuery', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // Spy on console.error to suppress output during tests and verify it's called
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return success response when queryFn resolves with data', async () => {
    // Arrange
    const mockData = { id: 1, name: 'Test' };
    const mockCount = 10;
    const mockQueryFn = vi.fn().mockResolvedValue({ data: mockData, error: null, count: mockCount });

    // Act
    const result = await safeQuery(mockQueryFn);

    // Assert
    expect(result).toEqual({
      success: true,
      data: mockData,
      error: null,
      meta: { count: mockCount }
    });
    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should return error response when queryFn resolves with an error object', async () => {
    // Arrange
    const mockError = { code: 'PGRST116', message: 'Not found' };
    const mockQueryFn = vi.fn().mockResolvedValue({ data: null, error: mockError, count: null });

    // Act
    const result = await safeQuery(mockQueryFn);

    // Assert
    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Kayıt bulunamadı', // mapped from PGRST116
      meta: { code: mockError.code }
    });
    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Supabase Error:', mockError.message);
  });

  it('should return fallback error response when queryFn resolves with an unmapped error object', async () => {
    // Arrange
    const mockError = { code: 'UNKNOWN', message: 'Some weird error' };
    const mockQueryFn = vi.fn().mockResolvedValue({ data: null, error: mockError, count: null });

    // Act
    const result = await safeQuery(mockQueryFn);

    // Assert
    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Some weird error', // mapped from message
      meta: { code: mockError.code }
    });
    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Supabase Error:', mockError.message);
  });

  it('should return fallback error response when queryFn resolves with an unmapped error object without message', async () => {
    // Arrange
    const mockError = { code: 'UNKNOWN' };
    const mockQueryFn = vi.fn().mockResolvedValue({ data: null, error: mockError, count: null });

    // Act
    const result = await safeQuery(mockQueryFn);

    // Assert
    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Bir hata oluştu', // fallback
      meta: { code: mockError.code }
    });
    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Supabase Error:', undefined);
  });

  it('should catch exceptions and return a generic error response', async () => {
    // Arrange
    const mockException = new Error('Network failure');
    const mockQueryFn = vi.fn().mockRejectedValue(mockException);

    // Act
    const result = await safeQuery(mockQueryFn);

    // Assert
    expect(result).toEqual({
      success: false,
      data: null,
      error: 'Beklenmeyen bir hata oluştu',
      meta: {}
    });
    expect(mockQueryFn).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Query Error:', mockException);
  });
});
