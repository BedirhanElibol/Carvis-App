export class AIService {
    static AI_CORE_URL = process.env.AI_CORE_URL || 'http://127.0.0.1:8000/api/v1/diagnose';

    /**
     * Sends the vehicle issue description to the Carvis AI Core for diagnosis.
     * @param {string} userId - The WhatsApp number or ID of the user
     * @param {string} description - The issue description
     * @returns {Promise<Object>} - Diagnosis result
     */
    static async getDiagnosis(userId, description) {
        try {
            console.log(`🧠 AI Analizi başlatılıyor... Kullanıcı: ${userId}`);
            
            const response = await fetch(this.AI_CORE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: userId,
                    description: description
                })
            });

            if (!response.ok) {
                throw new Error(`AI Core yanıt vermedi: ${response.status}`);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('❌ AI Teşhis Hatası:', error.message);
            return null;
        }
    }

    /**
     * Formats the AI diagnosis result into a user-friendly WhatsApp message.
     * @param {Object} diagnosis 
     * @returns {string}
     */
    static formatResponse(diagnosis) {
        if (!diagnosis) {
            return "🤖 *Carvis AI:* Şu anda teşhis motoruma bağlanamıyorum. Lütfen daha sonra tekrar deneyin veya doğrudan acil çağrı merkezimizi arayın.";
        }

        const confidencePercent = Math.round(diagnosis.confidence_score * 100);
        
        let severityIcon = "🟢";
        if (diagnosis.severity === "Medium") severityIcon = "🟡";
        if (diagnosis.severity === "High" || diagnosis.severity === "Critical") severityIcon = "🔴";

        return `🤖 *Carvis Yapay Zeka Teşhis Raporu*\n\n` +
               `*Tespit Edilen Sorun:* ${diagnosis.predicted_issue}\n` +
               `*Güven Skoru:* %${confidencePercent}\n` +
               `*Durum:* ${severityIcon} ${diagnosis.severity}\n\n` +
               `🛠️ *Önerilen Aksiyon:* ${diagnosis.recommended_action}\n\n` +
               `_Not: Ekiplerimiz durumunuzla ilgilenmektedir. Lütfen güvenli bir alanda bekleyiniz._`;
    }
}
