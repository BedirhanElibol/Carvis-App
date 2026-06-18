import { supabase } from "../../supabaseClient";

// AI model operations are now securely handled by Supabase Edge Functions.


const LOCAL_KNOWLEDGE_BASE = {
  "yağ": "Yağ lambası yanıyorsa aracınızı hemen durdurun. Yağ seviyesini kontrol edin, sızıntı varsa mutlaka servise başvurun.",
  "fren": "Frenlerdeki ses veya yumuşama balataların bittiğine işaret eder. Güvenliğiniz için en kısa sürede kontrol ettirmelisiniz.",
  "akü": "Araç çalışmıyorsa akü bitmiş olabilir. Takviye kablosu ile çalıştırmayı deneyebilir veya bir elektrikçiye danışabilirsiniz.",
  "motor": "Motordan gelen tıkırtı veya vuruntu sesleri ciddi olabilir. Yağ seviyesini kontrol edip uzman bir ustaya görünmenizi öneririm.",
  "lastik": "Lastik basınç uyarısı mevsimsel sıcaklık farklarından olabilir. En yakın istasyonda basınçları kontrol edebilirsiniz.",
  "merhaba": "Merhaba! Ben Carvis Asistan. Aracınızla ilgili her türlü teknik soruda size yardımcı olmaya hazırım.",
  "nasılsın": "Teşekkür ederim, size yardımcı olmak için buradayım. Aracınızda bir sorun mu var?",
  "fiyat": "Fiyatlar parça ve işçiliğe göre değişebilir. Ustalardan canlı teklif alarak net maliyeti görebilirsiniz."
};

const getLocalResponse = (message) => {
  const lowerMsg = (message || "").toLowerCase();
  for (const [key, value] of Object.entries(LOCAL_KNOWLEDGE_BASE)) {
    if (lowerMsg.includes(key)) return value;
  }
  return "Bu konuda size yardımcı olabilmem için biraz daha detay verebilir misiniz? Veya bir uzmanımıza yönlendirmemi ister misiniz?";
};

export const AIService = {
  async searchProductsByKeyword(keyword) {
    if (!keyword) return [];
    try {
      const { data } = await supabase
        .from("products")
        .select("id, name, brand, price, category, image_url, stock")
        .or(`name.ilike.%${keyword}%,brand.ilike.%${keyword}%,category.ilike.%${keyword}%`)
        .eq("certified", true)
        .gt("stock", 0)
        .limit(3);
      return data || [];
    } catch { return []; }
  },

  async diagnoseIssue(userText, carModel = "Araç") {
    try {
      const prompt = `Görevin: Oto-uzman asistan. Araç: ${carModel}. Şikayet: ${userText}. SADECE JSON döndür: {"title": "Başlık", "description": "Açıklama", "urgency": "low|medium|high|critical", "estimatedCost": "Fiyat", "suggestedPartKeyword": "parça veya null"}`;
      
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: { message: prompt }
      });

      if (error) throw error;
      
      const text = data?.response || "";
      const cleanJson = text.replace(/```json|```/g, "").trim();
      return { success: true, data: JSON.parse(cleanJson) };
    } catch {
      const response = getLocalResponse(userText);
      const risk = (userText.includes("fren") || userText.includes("yağ") || userText.includes("motor")) ? "high" : "medium";
      return { 
        success: true, 
        data: {
          title: "Ön Analiz",
          description: response,
          urgency: risk,
          estimatedCost: "Teklif Alınız",
          suggestedPartKeyword: userText.includes("fren") ? "balata" : (userText.includes("yağ") ? "yağ" : null)
        }
      };
    }
  },

  async analyzeDashboardLight() {
    return { success: false, error: "API required for vision." };
  },

  async chat(message, history = []) {
    try {
      const { data, error } = await supabase.functions.invoke('ai-chat', {
        body: {
          message: message,
          systemPrompt: "Sen profesyonel bir oto uzmanı asistansın.",
          history: history
        }
      });

      if (error) throw error;
      
      return { role: "ai", content: data?.response || "Anlayamadım.", timestamp: new Date().toISOString() };
    } catch { 
      return { role: "ai", content: getLocalResponse(message), timestamp: new Date().toISOString() }; 
    }
  },
};
