/**
 * Rapidsy Anti-Leakage Utilities
 * Bu araçlar, platform dışı işlemleri engellemek için müşteri ve partner arasındaki iletişimi denetler.
 */

// Sık kullanılan IBAN veya Kredi Kartı numarası benzeri ifadeler
const IBAN_REGEX = /([A-Z]{2}[0-9]{2})(?:[ ]?[0-9]{4}){3,5}/gi;

// Türkiye telefon formatları (0555..., 555..., +90555...)
const PHONE_REGEX = /(\+90|0)?\s?5\d{2}\s?\d{3}\s?\d{2}\s?\d{2}/g;
// Karışık yazılan numaralar için basit rakam yoğunluğu (Örn: "beş yüz elli beş...") - Geliştirilebilir
const NUMBER_MASK_REGEX = /[0-9]{4,}/g;

const BANNED_KEYWORDS = [
  "whatsapp",
  "wp",
  "watsap",
  "nakit",
  "havale",
  "eft",
  "elden",
  "dışarıdan",
  "uygulamadan çık",
  "numaram"
];

/**
 * Mesajı tarar ve yasaklı kelime/telefon/IBAN bulursa sansürler (***)
 * Aynı zamanda mesajın tehlikeli olup olmadığını döner (flagged: true)
 */
export const filterMessage = (text) => {
  if (!text) return { text: "", flagged: false };
  
  let flagged = false;
  let cleanText = text;

  // 1. Check banned keywords
  BANNED_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(cleanText)) {
      flagged = true;
      cleanText = cleanText.replace(regex, "***");
    }
  });

  // 2. Check and mask phone numbers
  if (PHONE_REGEX.test(cleanText)) {
    flagged = true;
    cleanText = cleanText.replace(PHONE_REGEX, "[TELEFON GİZLENDİ]");
  }

  // 3. Check and mask IBAN
  if (IBAN_REGEX.test(cleanText)) {
    flagged = true;
    cleanText = cleanText.replace(IBAN_REGEX, "[IBAN GİZLENDİ]");
  }

  return {
    originalText: text,
    text: cleanText,
    flagged
  };
};
