import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeVehicleDamage } from '../aiUtils';
import { supabase } from '../../supabaseClient';

vi.mock('../../supabaseClient', () => {
  return {
    supabase: {
      functions: {
        invoke: vi.fn()
      }
    }
  };
});

describe('analyzeVehicleDamage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct format on error path', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Mock the invoke call to return an error
    supabase.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: new Error('Network error or API failure')
    });

    const imageUrl = 'https://example.com/test-image.jpg';
    const vehicleInfo = { make: 'Toyota' };

    const result = await analyzeVehicleDamage(imageUrl, vehicleInfo);

    expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-damage-analysis', {
      body: {
        imageUrl,
        vehicleInfo
      }
    });

    expect(consoleSpy).toHaveBeenCalledWith("AI Damage Analysis error:", expect.any(Error));

    expect(result).toEqual({
      damageType: "Analiz Edilemedi",
      severity: "Bilinmiyor",
      estimatedCost: "Belirlenemedi",
      partsToReplace: [],
      aiComment: "Hasar analizi şu an yapılamıyor. Lütfen fotoğrafı servis talebi oluştururken ekleyin, ustalarımız detaylı inceleme yapacaktır."
    });

    consoleSpy.mockRestore();
  });

  it('should return correct format on successful response', async () => {
    // Mock the invoke call to return success
    supabase.functions.invoke.mockResolvedValueOnce({
      data: {
        damageType: "Çizik",
        severity: "Hafif",
        estimatedCost: "500-1000 TL",
        partsToReplace: ["Tampon"],
        aiComment: "Yüzeysel çizik görünüyor."
      },
      error: null
    });

    const imageUrl = 'https://example.com/test-image.jpg';
    const vehicleInfo = { make: 'Toyota' };

    const result = await analyzeVehicleDamage(imageUrl, vehicleInfo);

    expect(result).toEqual({
      damageType: "Çizik",
      severity: "Hafif",
      estimatedCost: "500-1000 TL",
      partsToReplace: ["Tampon"],
      aiComment: "Yüzeysel çizik görünüyor."
    });
  });
});
