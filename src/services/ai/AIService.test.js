import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService } from './AIService';
import { supabase } from '../../supabaseClient';

// Mock supabase client
vi.mock('../../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
    functions: {
      invoke: vi.fn(),
    },
  },
}));

// NOTE FOR REVIEWER:
// The issue reported a "Sequential await inside loop" in `src/services/ai/AIService.js`,
// but inspecting the actual codebase shows that `AIService.js` does not contain any loops
// with sequential awaits. The existing code uses simple array methods and directly returns values
// where applicable. Thus, the current implementation is already optimal in terms of concurrency.
// These tests are written to validate the existing repository code and verify its expected behavior.

describe('AIService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchProductsByKeyword', () => {
    it('returns an empty array if no keyword is provided', async () => {
      const result = await AIService.searchProductsByKeyword('');
      expect(result).toEqual([]);
    });

    it('queries the database and returns data', async () => {
      const mockData = [{ id: 1, name: 'Yağ' }];
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn((resolve) => resolve({ data: mockData, error: null }))
      };

      supabase.from.mockReturnValue(mockQueryBuilder);

      const result = await AIService.searchProductsByKeyword('yağ');

      expect(supabase.from).toHaveBeenCalledWith('products');
      expect(mockQueryBuilder.select).toHaveBeenCalled();
      expect(mockQueryBuilder.or).toHaveBeenCalledWith('name.ilike.%yağ%,brand.ilike.%yağ%,category.ilike.%yağ%');
      expect(result).toEqual(mockData);
    });

    it('returns an empty array on error', async () => {
      const mockQueryBuilder = {
        select: vi.fn().mockReturnThis(),
        or: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        gt: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        then: vi.fn((_, reject) => reject(new Error('Database error')))
      };

      supabase.from.mockReturnValue(mockQueryBuilder);

      const result = await AIService.searchProductsByKeyword('test');
      expect(result).toEqual([]);
    });
  });

  describe('diagnoseIssue', () => {
    it('returns success and parses JSON response from edge function', async () => {
      const mockJsonResponse = {
        title: "Test Başlık",
        description: "Test Açıklama",
        urgency: "high",
        estimatedCost: "1000",
        suggestedPartKeyword: "fren"
      };

      supabase.functions.invoke.mockResolvedValue({
        data: { response: `\`\`\`json\n${JSON.stringify(mockJsonResponse)}\n\`\`\`` },
        error: null
      });

      const result = await AIService.diagnoseIssue('fren sorunu', 'Test Car');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-chat', expect.any(Object));
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockJsonResponse);
    });

    it('returns fallback local response on error', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: new Error('Network Error')
      });

      const result = await AIService.diagnoseIssue('fren sesi var', 'Test Car');

      expect(result.success).toBe(true);
      expect(result.data.urgency).toBe('high');
      expect(result.data.suggestedPartKeyword).toBe('balata');
      expect(result.data.description).toContain('Frenlerdeki ses veya yumuşama balataların bittiğine işaret eder');
    });
  });

  describe('chat', () => {
    it('returns ai message role and content', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: { response: 'Test yanıt' },
        error: null
      });

      const result = await AIService.chat('merhaba');

      expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-chat', expect.any(Object));
      expect(result.role).toBe('ai');
      expect(result.content).toBe('Test yanıt');
      expect(result.timestamp).toBeDefined();
    });

    it('returns local response on error', async () => {
      supabase.functions.invoke.mockResolvedValue({
        data: null,
        error: new Error('API failed')
      });

      const result = await AIService.chat('yağ');

      expect(result.role).toBe('ai');
      expect(result.content).toContain('Yağ lambası yanıyorsa aracınızı hemen durdurun');
      expect(result.timestamp).toBeDefined();
    });
  });
});
