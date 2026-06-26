import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AIService } from './AIService';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => ({
  supabase: {
    functions: {
      invoke: vi.fn(),
    },
  },
}));

describe('AIService.diagnoseIssue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should successfully parse and return JSON from AI model response', async () => {
    const mockApiResponse = {
      data: {
        response: '```json\n{"title": "Fren Balata Uyarısı", "description": "Fren balatalarınız bitmiş olabilir.", "urgency": "high", "estimatedCost": "1000 TL", "suggestedPartKeyword": "balata"}\n```'
      },
      error: null
    };

    supabase.functions.invoke.mockResolvedValue(mockApiResponse);

    const result = await AIService.diagnoseIssue('frenlerden ses geliyor', 'BMW M3');

    expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-chat', {
      body: {
        message: expect.stringContaining('Görevin: Oto-uzman asistan. Araç: BMW M3. Şikayet: frenlerden ses geliyor.')
      }
    });

    expect(result).toEqual({
      success: true,
      data: {
        title: "Fren Balata Uyarısı",
        description: "Fren balatalarınız bitmiş olabilir.",
        urgency: "high",
        estimatedCost: "1000 TL",
        suggestedPartKeyword: "balata"
      }
    });
  });

  it('should fallback to local knowledge base when AI model throws an error', async () => {
    const mockError = new Error('API failure');
    supabase.functions.invoke.mockRejectedValue(mockError);

    const result = await AIService.diagnoseIssue('yağ lambası yanıyor');

    expect(result).toEqual({
      success: true,
      data: {
        title: 'Ön Analiz',
        description: 'Yağ lambası yanıyorsa aracınızı hemen durdurun. Yağ seviyesini kontrol edin, sızıntı varsa mutlaka servise başvurun.',
        urgency: 'high',
        estimatedCost: 'Teklif Alınız',
        suggestedPartKeyword: 'yağ'
      }
    });
  });

  it('should fallback to local knowledge base with medium risk when no critical keyword is found', async () => {
    const mockError = new Error('API failure');
    supabase.functions.invoke.mockRejectedValue(mockError);

    const result = await AIService.diagnoseIssue('cam silecekleri çalışmıyor');

    expect(result).toEqual({
      success: true,
      data: {
        title: 'Ön Analiz',
        description: 'Bu konuda size yardımcı olabilmem için biraz daha detay verebilir misiniz? Veya bir uzmanımıza yönlendirmemi ister misiniz?',
        urgency: 'medium',
        estimatedCost: 'Teklif Alınız',
        suggestedPartKeyword: null
      }
    });
  });
});
