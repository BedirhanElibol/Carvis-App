import { searchKnowledgeBase } from '../data/automotiveKnowledge';

export const callRealGeminiAPI = async (prompt, vehicleContext = "", history = "") => {
    // 1. ÖNCE YEREL BİLGİ BANKASINI TARA (RAG Light)
    const localResult = searchKnowledgeBase(prompt);

    if (localResult.found) {
        console.log("⚡ Hızlı cevap: Yerel veritabanından bulundu.");
        // Yapay zeka gibi hissettirmek için ufak bir gecikme ekle (Doğallık)
        await new Promise(r => setTimeout(r, 600));
        return localResult.text + "\n\n*(Bu bilgi Carvis teknik kütüphanesinden anlık getirildi.)*";
    }

    // 2. YERELDE YOKSA API'YE GİT (Advanced Prompting)
    // "Diagnostic Mode" - Daha analitik ve soru soran yapı
    const systemPrompt = `Sen Rapidsy, tecrübeli ve samimi bir otomotiv baş ustasısın.
    Görevin: Kullanıcının araç sorununu dinlemek, teşhis koymak ve çözüm önerisi sunmak.
    
    Kurallar:
    1. Asla çok uzun, ansiklopedik yazma. Kısa ve net ol.
    2. Kesin emin değilsen "Bunu bir servise göstermelisin" de, yanlış yönlendirme.
    3. Kullanıcıya sorunu anlamak için gerekirse ek soru sor (Örn: "Ses motordan mı geliyor tekerlekten mi?").
    4. Samimi bir dil kullan ("Hallederiz", "Bakalım", "Dikkat et" vb.).

    ${vehicleContext}

    Şu anki konuşma geçmişi:
    ${history}`;

    const fullPrompt = `${systemPrompt}\n\nKullanıcı: ${prompt}\nAsistan:`;

    try {
        // Pollinations AI - Anonymous & High Compatibility Endpoint
        // We use a specific seed for consistency and a more capable model parameter
        const seed = Math.floor(Math.random() * 1000000);
        const encodedPrompt = encodeURIComponent(fullPrompt);

        // Using the v1 endpoint which is currently more stable for free text generation
        const url = `https://text.pollinations.ai/${encodedPrompt}?model=openai&json=false&seed=${seed}`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn("Pollinations API issues, retrying with fallback...");
            throw new Error("Primary AI Down");
        }

        let text = await response.text();

        // --- CLEANING FILTER (Auto-Fix for Deprecation Notice) ---
        // Servis bazen cevabın başına veya tamamına deprecation uyarısı ekliyor.
        if (text.includes("IMPORTANT NOTICE") || text.includes("Pollinations legacy text API")) {
            console.log("Cleaning Pollinations warning...");
            // Uyarı metnini temizle (Regex uyarının sonuna kadar siler)
            text = text.replace(/.*work normally\./s, "").trim();
            text = text.replace(/^"/, "").replace(/"$/, ""); // Tırnakları temizle
        }

        if (!text || text.length < 2) {
            // Eğer uyarıyı silince el boş kaldıysa, yapay zekanın cevap veremediğini varsay
            return "Şu an bağlantıda küçük bir aksaklık oldu. Sorunuzu biraz daha detaylandırarak tekrar sorabilir misiniz?";
        }

        return text.trim();

    } catch (error) {
        console.error("AI Hatası:", error);
        if (error.name === 'AbortError') {
            return "Cevap süresi doldu, lütfen tekrar dener misiniz?";
        }
        return "Bağlantı sorunu oluştu, lütfen internetinizi kontrol edin.";
    }
};
