import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import { callRealGeminiAPI } from './aiUtils';
import { searchKnowledgeBase } from '../data/automotiveKnowledge';
import { supabase } from '../supabaseClient';

// Mock dependencies
vi.mock('../data/automotiveKnowledge', () => ({
  searchKnowledgeBase: vi.fn(),
}));

vi.mock('../supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('callRealGeminiAPI', () => {
  const fallbackMessage = "Şu an bağlantıda küçük bir aksaklık oldu. Ancak genel olarak söyleyebilirim ki, belirttiğiniz durum için en yakın oto servisimize uğrayarak bilgisayarlı arıza tespiti yaptırmanızı öneririm.";

  beforeEach(() => {
    // Spy on console methods to keep output clean and allow assertions
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should return response from local knowledge base if found', async () => {
    searchKnowledgeBase.mockReturnValue({ found: true, text: 'Mock local response' });

    const result = await callRealGeminiAPI('test prompt');

    expect(searchKnowledgeBase).toHaveBeenCalledWith('test prompt');
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
    expect(result).toBe('Mock local response\n\n*(Bu bilgi Rapidsy teknik kütüphanesinden anlık getirildi.)*');
    expect(console.log).toHaveBeenCalledWith("⚡ Hızlı cevap: Yerel veritabanından bulundu.");
  });

  it('should call Supabase edge function if not found locally', async () => {
    searchKnowledgeBase.mockReturnValue({ found: false });
    supabase.functions.invoke.mockResolvedValue({
      data: { response: '  Mock edge response  ' },
      error: null
    });

    const prompt = 'test prompt';
    const vehicleContext = 'Toyota Corolla';
    const history = [{ role: 'user', content: 'hello' }];

    const result = await callRealGeminiAPI(prompt, vehicleContext, history);

    expect(searchKnowledgeBase).toHaveBeenCalledWith(prompt);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-chat', {
      body: {
        message: prompt,
        systemPrompt: expect.stringContaining(vehicleContext),
        history: history,
      }
    });
    // System prompt structure
    const invokeCallArgs = supabase.functions.invoke.mock.calls[0][1];
    expect(invokeCallArgs.body.systemPrompt).toContain('Sen Rapidsy, tecrübeli ve samimi bir otomotiv baş ustasısın.');

    expect(result).toBe('Mock edge response'); // Trimmed
  });

  it('should handle invalid history by passing an empty array', async () => {
    searchKnowledgeBase.mockReturnValue({ found: false });
    supabase.functions.invoke.mockResolvedValue({
      data: { response: 'Mock response' },
      error: null
    });

    await callRealGeminiAPI('test prompt', '', 'invalid history string');

    expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-chat', expect.objectContaining({
      body: expect.objectContaining({
        history: []
      })
    }));
  });

  it('should catch and handle errors returned in the invoke payload', async () => {
    searchKnowledgeBase.mockReturnValue({ found: false });
    const mockError = new Error('Invoke error payload');
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: mockError
    });

    const result = await callRealGeminiAPI('test prompt');

    expect(console.error).toHaveBeenCalledWith("Edge Function AI Hatası:", mockError);
    expect(result).toBe(fallbackMessage);
  });

  it('should catch exceptions thrown by invoke', async () => {
    searchKnowledgeBase.mockReturnValue({ found: false });
    const mockError = new Error('Network error');
    supabase.functions.invoke.mockRejectedValue(mockError);

    const result = await callRealGeminiAPI('test prompt');

    expect(console.error).toHaveBeenCalledWith("Edge Function AI Hatası:", mockError);
    expect(result).toBe(fallbackMessage);
  });
});
