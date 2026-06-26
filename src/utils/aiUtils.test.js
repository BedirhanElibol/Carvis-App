import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
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
  const mockPrompt = 'Motor arıza lambası yanıyor';
  const mockVehicleContext = 'Marka: Toyota, Model: Corolla';
  const mockHistory = [{ role: 'user', content: 'Merhaba' }];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return local knowledge base result when found and NOT call supabase', async () => {
    // Arrange
    const mockLocalResult = {
      found: true,
      text: 'Motor arıza lambası yanıyorsa servise gidin.',
    };
    searchKnowledgeBase.mockReturnValue(mockLocalResult);

    // Act
    const result = await callRealGeminiAPI(mockPrompt, mockVehicleContext, mockHistory);

    // Assert
    expect(searchKnowledgeBase).toHaveBeenCalledWith(mockPrompt);
    expect(supabase.functions.invoke).not.toHaveBeenCalled();
    expect(result).toBe(
      mockLocalResult.text + '\n\n*(Bu bilgi Rapidsy teknik kütüphanesinden anlık getirildi.)*'
    );
    expect(console.log).toHaveBeenCalledWith('⚡ Hızlı cevap: Yerel veritabanından bulundu.');
  });

  it('should call supabase edge function when local knowledge base is NOT found', async () => {
    // Arrange
    searchKnowledgeBase.mockReturnValue({ found: false });

    const mockApiResponse = 'Bu durumda motoru kontrol ettirmeniz gerekir.   ';
    supabase.functions.invoke.mockResolvedValue({
      data: { response: mockApiResponse },
      error: null,
    });

    const expectedSystemPrompt = `Sen Rapidsy, tecrübeli ve samimi bir otomotiv baş ustasısın. Görevin: Kullanıcının araç sorununu dinlemek, teşhis koymak ve çözüm önerisi sunmak. Kurallar: 1. Asla çok uzun, ansiklopedik yazma. Kısa ve net ol. 2. Kesin emin değilsen "Bunu bir servise göstermelisin" de, yanlış yönlendirme. 3. Kullanıcıya sorunu anlamak için gerekirse ek soru sor (Örn: "Ses motordan mı geliyor tekerlekten mi?"). 4. Samimi bir dil kullan ("Hallederiz", "Bakalım", "Dikkat et" vb.). ${mockVehicleContext}`;

    // Act
    const result = await callRealGeminiAPI(mockPrompt, mockVehicleContext, mockHistory);

    // Assert
    expect(searchKnowledgeBase).toHaveBeenCalledWith(mockPrompt);
    expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-chat', {
      body: {
        message: mockPrompt,
        systemPrompt: expectedSystemPrompt,
        history: mockHistory,
      },
    });
    // Should return trimmed response
    expect(result).toBe(mockApiResponse.trim());
  });

  it('should format history correctly when it is not an array', async () => {
    // Arrange
    searchKnowledgeBase.mockReturnValue({ found: false });
    supabase.functions.invoke.mockResolvedValue({
      data: { response: 'Test response' },
      error: null,
    });

    // Act - string passed as history instead of array
    await callRealGeminiAPI(mockPrompt, mockVehicleContext, "string history");

    // Assert
    expect(supabase.functions.invoke).toHaveBeenCalledWith(
      'ai-chat',
      expect.objectContaining({
        body: expect.objectContaining({
          history: [],
        }),
      })
    );
  });

  it('should return fallback message when supabase returns an error', async () => {
    // Arrange
    searchKnowledgeBase.mockReturnValue({ found: false });

    const mockError = new Error('API Error');
    supabase.functions.invoke.mockResolvedValue({
      data: null,
      error: mockError,
    });

    // Act
    const result = await callRealGeminiAPI(mockPrompt, mockVehicleContext, mockHistory);

    // Assert
    expect(supabase.functions.invoke).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Edge Function AI Hatası:', mockError);
    expect(result).toBe(
      'Şu an bağlantıda küçük bir aksaklık oldu. Ancak genel olarak söyleyebilirim ki, belirttiğiniz durum için en yakın oto servisimize uğrayarak bilgisayarlı arıza tespiti yaptırmanızı öneririm.'
    );
  });

  it('should return fallback message when supabase throws an exception', async () => {
    // Arrange
    searchKnowledgeBase.mockReturnValue({ found: false });

    const mockError = new Error('Network Error');
    supabase.functions.invoke.mockRejectedValue(mockError);

    // Act
    const result = await callRealGeminiAPI(mockPrompt, mockVehicleContext, mockHistory);

    // Assert
    expect(supabase.functions.invoke).toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Edge Function AI Hatası:', mockError);
    expect(result).toBe(
      'Şu an bağlantıda küçük bir aksaklık oldu. Ancak genel olarak söyleyebilirim ki, belirttiğiniz durum için en yakın oto servisimize uğrayarak bilgisayarlı arıza tespiti yaptırmanızı öneririm.'
    );
  });
});
