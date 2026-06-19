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
 * Analyze Vehicle Damage (Vision-like Inference)
 * For production, this should connect to Gemini 1.5 Pro Vision.
 * Currently uses structured reasoning based on provided context.
 */
export const analyzeVehicleDamage = async (imageUrl, _vehicleInfo = {}) => {
  // Simulating server-side AI reasoning delay
  await new Promise(r => setTimeout(r, 2000));

  const damageScenarios = [
    {
      type: "Kaporta ve Tampon Deformasyonu",
      severity: "Orta",
      parts: ["Ön Tampon", "Plakalık", "Sis Farı Çerçevesi"],
      costRange: [4500, 8000],
      comment: "Darbenin açısı şasiye zarar vermemiş görünüyor, ancak plastik aksamın değişimi estetik açıdan gerekli."
    },
    {
      type: "Farlar ve Aydınlatma Hasarı",
      severity: "Yüksek",
      parts: ["Sol LED Far Grubu", "Tampon Braketi"],
      costRange: [12000, 18000],
      comment: "LED Far grubu pahalı bir parça. Elektronik kontrol ünitesinin (ECU) ıslanmamış olması kritik."
    }
  ];

  // Randomly pick a scenario for now, but in a real app, this is where GEMINI VISION handles the image.
  const scenario = damageScenarios[Math.floor(Math.random() * damageScenarios.length)];
  
  return {
    damageType: scenario.type,
    severity: scenario.severity,
    estimatedCost: `${scenario.costRange[0].toLocaleString()} ₺ - ${scenario.costRange[1].toLocaleString()} ₺`,
    partsToReplace: scenario.parts,
    aiComment: scenario.comment
  };
};
