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
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should return parsed data on success', async () => {
    supabase.functions.invoke.mockResolvedValueOnce({
      data: {
        damageType: 'Test Damage',
        severity: 'High',
        estimatedCost: '1000',
        partsToReplace: ['Bumper'],
        aiComment: 'Test comment'
      },
      error: null
    });

    const result = await analyzeVehicleDamage('test.jpg', { make: 'Toyota' });

    expect(supabase.functions.invoke).toHaveBeenCalledWith('ai-damage-analysis', {
      body: { imageUrl: 'test.jpg', vehicleInfo: { make: 'Toyota' } }
    });
    expect(result).toEqual({
      damageType: 'Test Damage',
      severity: 'High',
      estimatedCost: '1000',
      partsToReplace: ['Bumper'],
      aiComment: 'Test comment'
    });
  });

  it('should return fallback data and log error on failure', async () => {
    const mockError = new Error('Function failed');
    supabase.functions.invoke.mockResolvedValueOnce({
      data: null,
      error: mockError
    });

    const result = await analyzeVehicleDamage('test.jpg');

    expect(console.error).toHaveBeenCalledWith('AI Damage Analysis error:', mockError);
    expect(result).toEqual({
      damageType: "Analiz Edilemedi",
      severity: "Bilinmiyor",
      estimatedCost: "Belirlenemedi",
      partsToReplace: [],
      aiComment: "Hasar analizi şu an yapılamıyor. Lütfen fotoğrafı servis talebi oluştururken ekleyin, ustalarımız detaylı inceleme yapacaktır.",
    });
  });
});
