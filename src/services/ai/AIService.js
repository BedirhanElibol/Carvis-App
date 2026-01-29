import { GoogleGenerativeAI } from "@google/generative-ai";

// Carvis AI Service (Gemini Integration)
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const SIMULATION_DELAY = 1000;

// Initialize Gemini if API key is present
let genAI = null;
let model = null;

if (API_KEY && API_KEY !== 'YOUR_GEMINI_API_KEY') {
    try {
        genAI = new GoogleGenerativeAI(API_KEY);
        model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        console.log("Carvis AI: Gemini Pro initialized.");
    } catch (e) {
        console.error("Carvis AI Initialization Error:", e);
    }
}

export const AIService = {

    /**
     * Metin tabanlı arıza tahmini
     */
    async diagnoseIssue(userText, carModel = "Bilinmeyen Araç") {
        if (!model) return this.mockDiagnose(userText);

        try {
            const prompt = `Sen Carvis uygulamasının uzman otomobil mekaniği asistanısın. 
            Araç: ${carModel}
            Kullanıcı Şikayeti: "${userText}"
            
            Lütfen şu formatta JSON cevabı dön (SADECE JSON):
            {
                "title": "Arıza Başlığı",
                "description": "Detaylı açıklama",
                "urgency": "low|medium|high|critical",
                "estimatedCost": "Fiyat aralığı (₺)",
                "suggestedService": "mechanic|electrician|tire_shop|body_shop"
            }`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // JSON temizleme (Markdown bloklarını kaldır)
            const cleanJson = text.replace(/```json|```/g, "").trim();
            const data = JSON.parse(cleanJson);

            return { success: true, data, message: "AI Analizi Tamamlandı" };
        } catch (error) {
            console.error("Gemini Diagnose Error:", error);
            return this.mockDiagnose(userText);
        }
    },

    /**
     * Görüntüden Arıza Lambası Tanıma
     */
    async analyzeDashboardLight(imageFile) {
        if (!model || !imageFile) return this.mockAnalyzeLight();

        try {
            // Helper function to convert file to generative part
            async function fileToGenerativePart(file) {
                const base64EncodedDataPromise = new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result.split(',')[1]);
                    reader.readAsDataURL(file);
                });
                return {
                    inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
                };
            }

            const imagePart = await fileToGenerativePart(imageFile);
            const prompt = "Bu arıza lambasının anlamı nedir? Olası sebepleri ve çözüm önerilerini listeleyerek JSON formatında dön. {name, possibleCauses[], advice, riskLevel}";

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            const cleanJson = text.replace(/```json|```/g, "").trim();
            const data = JSON.parse(cleanJson);

            return { success: true, data };
        } catch (error) {
            console.error("Gemini Vision Error:", error);
            return this.mockAnalyzeLight();
        }
    },

    /**
     * AI Asistan (Chatbot)
     */
    async chat(message, history = []) {
        if (!model) return this.mockChat(message);

        try {
            const chatSession = model.startChat({
                history: history.map(h => ({
                    role: h.role === 'ai' ? 'model' : 'user',
                    parts: [{ text: h.content }],
                })),
                generationConfig: { maxOutputTokens: 500 }
            });

            const prompt = `Sen Carvis'in akıllı asistanısın. Kısa, samimi ve teknik olarak doğru cevaplar ver. 
            Kullanıcılara arıza, bakım, otopark ve valet hizmetlerinde yardımcı ol.
            Kullanıcı Mesajı: ${message}`;

            const result = await chatSession.sendMessage(prompt);
            const response = await result.response;

            return {
                role: 'ai',
                content: response.text(),
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            console.error("Gemini Chat Error:", error);
            return this.mockChat(message);
        }
    },

    // --- MOCK FALLBACKS ---

    async mockDiagnose(userText) {
        await new Promise(r => setTimeout(r, SIMULATION_DELAY));
        const text = userText.toLowerCase();
        let diagnosis = {
            title: "Genel Kontrol Gerekli",
            description: "Belirttiğiniz sorun için genel bir servis kontrolü önerilir.",
            urgency: "medium",
            estimatedCost: "500 - 1500 ₺",
            suggestedService: "mechanic"
        };

        if (text.includes("ses") || text.includes("tıkırtı")) {
            diagnosis.title = "Mekanik Aksam Sesi";
            diagnosis.urgency = "high";
        } else if (text.includes("fren")) {
            diagnosis.title = "Fren Sistemi";
            diagnosis.urgency = "critical";
        }

        return { success: true, data: diagnosis };
    },

    async mockAnalyzeLight() {
        await new Promise(r => setTimeout(r, SIMULATION_DELAY));
        return {
            success: true,
            data: {
                name: "Simüle Edilen Arıza Lambası",
                possibleCauses: ["Sensör hatası", "Sıvı seviyesi düşük"],
                advice: "En yakın yetkili servise başvurun.",
                riskLevel: "medium"
            }
        };
    },

    async mockChat(message) {
        await new Promise(r => setTimeout(r, 600));
        let reply = "Şu an bağlantımda bir sorun var ama temel araç bilgilerini verebilirim.";
        if (message.toLowerCase().includes("merhaba")) reply = "Merhaba! Ben Carvis AI. Size nasıl yardımcı olabilirim?";
        return { role: 'ai', content: reply, timestamp: new Date().toISOString() };
    }
};
