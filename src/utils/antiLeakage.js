/**
 * Carvis Anti-Leakage & Content Moderation Utilities
 * Bu araçlar, platform dışı işlemleri ve güvenlik risklerini engellemek için 
 * müşteri ve partner arasındaki mesajları denetler (Telefon, IBAN, E-posta, Link, Harici İletişim).
 */

// IBAN Numarası (TR + 24 Hane, boşluklu veya boşluksuz)
const IBAN_REGEX = /\bTR\s?\d{2}(?:\s?\d{4}){5}\s?\d{2}\b|\bTR[0-9]{24}\b/gi;

// Türkiye Telefon Formatları (05xx..., +90 5xx..., 5xx..., 0-5xx..., parantezli vb.)
const PHONE_REGEX = /(\+?90|0)?\s*\(?\s*5\d{2}\s*\)?\s*[\d.-]{3}\s*[\d.-]{2}\s*[\d.-]{2}|\b0?5\d{9}\b|\b5\d{9}\b/g;

// Harf Aralıklı veya Boşluklu Yazılmış Rakam Dizileri (Örn: 0 5 3 2 1 2 3 4 5 6 7 veya 0-5-3-2...)
const SPACED_DIGITS_REGEX = /(?:\b\d[\s.-]){9,11}\d\b/g;

// Türkçe Yazıyla Yazılmış Telefon Numaraları (Örn: sıfır beş yüz elli beş...)
const WRITTEN_NUM_REGEX = /(sıfır|bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|yirmi|otuz|kırk|elli|altmış|yetmiş|seksen|doksan|yüz|bin)\s*(sıfır|bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|yirmi|otuz|kırk|elli|altmış|yetmiş|seksen|doksan|yüz|bin)+/gi;

// E-posta Adresleri
const EMAIL_REGEX = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/gi;

// Harici Web Linkleri & Sosyal Medya
const URL_REGEX = /(https?:\/\/|www\.)[^\s]+|\b(instagram\.com|facebook\.com|wa\.me|t\.me|sahibinden\.com|armut\.com)\/[^\s]+/gi;

// Yasaklı Anahtar Kelimeler (Platform dışı yönlendirmeler)
const BANNED_KEYWORDS = [
  "whatsapp", "watsap", "watsapp", "wp", "wpden", "wptan",
  "instagram", "ig", "dmden", "dmdem",
  "numaram", "numaramı", "tel no", "telefonum", "ara beni", "ulaş bana", "bana ulaş", "telefonumu",
  "nakit", "havale", "eft", "elden", "dışarıdan", "dışardan", "uygulamadan çık", "komisyonsuz",
  "iban", "hesap no", "hesabıma"
];

/**
 * Mesajı tarar ve yasaklı kelime, telefon, e-posta, IBAN veya link bulursa [İLETİŞİM BİLGİSİ GİZLENDİ] olarak gizler.
 * Aynı zamanda mesajın ihlal içerip içermediğini döner (flagged: true).
 */
export const filterMessage = (text) => {
  if (!text) return { text: "", flagged: false, reason: "" };
  
  let flagged = false;
  let cleanText = text;
  let reasons = [];

  // 1. IBAN kontrolü
  if (IBAN_REGEX.test(cleanText)) {
    flagged = true;
    reasons.push("IBAN paylaşımı engellendi");
    cleanText = cleanText.replace(IBAN_REGEX, "[IBAN GİZLENDİ]");
  }

  // 2. Telefon numarası kontrolü (Normal formatlar)
  if (PHONE_REGEX.test(cleanText)) {
    flagged = true;
    reasons.push("Telefon numarası engellendi");
    cleanText = cleanText.replace(PHONE_REGEX, "[TELEFON GİZLENDİ]");
  }

  // 3. Aralıklı rakamlar kontrolü (0 5 3 2 ...)
  if (SPACED_DIGITS_REGEX.test(cleanText)) {
    flagged = true;
    reasons.push("Aralıklı numara paylaşımı engellendi");
    cleanText = cleanText.replace(SPACED_DIGITS_REGEX, "[TELEFON GİZLENDİ]");
  }

  // 4. Yazı ile yazılmış numaralar kontrolü (sıfır beş yüz...)
  if (WRITTEN_NUM_REGEX.test(cleanText)) {
    flagged = true;
    reasons.push("Yazıyla numara paylaşımı engellendi");
    cleanText = cleanText.replace(WRITTEN_NUM_REGEX, "[TELEFON GİZLENDİ]");
  }

  // 5. E-posta kontrolü
  if (EMAIL_REGEX.test(cleanText)) {
    flagged = true;
    reasons.push("E-posta adresi engellendi");
    cleanText = cleanText.replace(EMAIL_REGEX, "[E-POSTA GİZLENDİ]");
  }

  // 6. Harici Link kontrolü
  if (URL_REGEX.test(cleanText)) {
    flagged = true;
    reasons.push("Harici link paylaşımı engellendi");
    cleanText = cleanText.replace(URL_REGEX, "[LİNK GİZLENDİ]");
  }

  // 7. Yasaklı kelimeler kontrolü
  BANNED_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(cleanText)) {
      flagged = true;
      reasons.push(`"${keyword}" kelimesi engellendi`);
      cleanText = cleanText.replace(regex, "***");
    }
  });

  return {
    originalText: text,
    text: cleanText,
    flagged,
    reason: reasons.join(", ")
  };
};
