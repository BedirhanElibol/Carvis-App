import { searchKnowledgeBase } from "../data/automotiveKnowledge";
import { supabase } from "../supabaseClient";


export const callRealGeminiAPI = async (
  prompt,
  vehicleContext = "",
  history = "",
) => {
  // 1. ÖNCE YEREL BİLGİ BANKASINI TARA (RAG Light)
  const localResult = searchKnowledgeBase(prompt);
  if (localResult.found) {
    return (
      localResult.text +
      "\n\n*(Bu bilgi Rapidsy teknik kütüphanesinden anlık getirildi.)*"
    );
  }

  // 2. YERELDE YOKSA EDGE FUNCTION ÜZERİNDEN API'YE GİT
  const systemPrompt = `Sen Rapidsy, tecrübeli ve samimi bir otomotiv baş ustasısın. Görevin: Kullanıcının araç sorununu dinlemek, teşhis koymak ve çözüm önerisi sunmak. Kurallar: 1. Asla çok uzun, ansiklopedik yazma. Kısa ve net ol. 2. Kesin emin değilsen "Bunu bir servise göstermelisin" de, yanlış yönlendirme. 3. Kullanıcıya sorunu anlamak için gerekirse ek soru sor (Örn: "Ses motordan mı geliyor tekerlekten mi?"). 4. Samimi bir dil kullan ("Hallederiz", "Bakalım", "Dikkat et" vb.). ${vehicleContext}`;

  try {
    const { data, error } = await supabase.functions.invoke('ai-chat', {
      body: {
        message: prompt,
        systemPrompt: systemPrompt,
        history: Array.isArray(history) ? history : []
      }
    });

    if (error) throw error;
    if (data?.response) {
      return data.response.trim();
    }
  } catch (error) {
    console.error("Edge Function AI Hatası:", error);
  }

  return "Şu an bağlantıda küçük bir aksaklık oldu. Ancak genel olarak söyleyebilirim ki, belirttiğiniz durum için en yakın oto servisimize uğrayarak bilgisayarlı arıza tespiti yaptırmanızı öneririm.";
};

/**
 * Analyze Vehicle Damage (Vision-based Inference)
 * Calls Supabase Edge Function for AI-powered damage analysis.
 * Falls back to a descriptive message if the function is not deployed.
 */
export const analyzeVehicleDamage = async (_imageUrl, vehicleInfo = {}) => {
  try {
    const { data, error } = await supabase.functions.invoke('ai-damage-analysis', {
      body: {
        imageUrl: _imageUrl,
        vehicleInfo,
      },
    });

    if (error) throw error;

    if (data?.damageType) {
      return {
        damageType: data.damageType,
        severity: data.severity,
        estimatedCost: data.estimatedCost,
        partsToReplace: data.partsToReplace || [],
        aiComment: data.aiComment,
      };
    }
  } catch (err) {
    console.error("AI Damage Analysis error:", err);
  }

  return {
    damageType: "Analiz Edilemedi",
    severity: "Bilinmiyor",
    estimatedCost: "Belirlenemedi",
    partsToReplace: [],
    aiComment:
      "Hasar analizi şu an yapılamıyor. Lütfen fotoğrafı servis talebi oluştururken ekleyin, ustalarımız detaylı inceleme yapacaktır.",
  };
};
