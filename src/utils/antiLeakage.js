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

// Türkçe Yazıyla Yazılmış (Birleşik veya Ayrı) Telefon Numaraları (Örn: sıfır beş yüz elli beş... veya sıfırbeşyüz...)
const WRITTEN_NUM_REGEX = /(sıfır|bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|yirmi|otuz|kırk|elli|altmış|yetmiş|seksen|doksan|yüz|bin)[\s\-_]*(sıfır|bir|iki|üç|dört|beş|altı|yedi|sekiz|dokuz|on|yirmi|otuz|kırk|elli|altmış|yetmiş|seksen|doksan|yüz|bin)+/gi;

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
 * Emojileri ve Leet-speak (karakter değiştirme hilelerini) normalize eder.
 * Örn: 0️⃣5️⃣3️⃣2️⃣ -> 0532 veya o532 -> 0532
 */
const normalizeObfuscatedText = (rawText) => {
  if (!rawText) return "";
  
  let normalized = rawText;

  // 1. Emoji rakamları çevir
  const emojiMap = {
    "0️⃣": "0", "1️⃣": "1", "2️⃣": "2", "3️⃣": "3", "4️⃣": "4",
    "5️⃣": "5", "6️⃣": "6", "7️⃣": "7", "8️⃣": "8", "9️⃣": "9"
  };
  Object.keys(emojiMap).forEach((emoji) => {
    normalized = normalized.split(emoji).join(emojiMap[emoji]);
  });

  return normalized;
};

/**
 * Mesaj içerisindeki tüm harf/sembol gürültülerini temizleyip gizli telefon numaralarını avlar.
 * Örn: "0a5b3c2d1e2f3g4h5i6j7" veya "0-5-3-2..."
 */
const detectHiddenRawPhone = (text) => {
  // Sadece rakamları ayıkla
  const onlyDigits = text.replace(/\D/g, "");
  // Türkiye tel formatı 10 veya 11 rakam (5xx xxx xx xx veya 05xx xxx xx xx)
  if (/^0?5\d{9}$/.test(onlyDigits) || /^\d{10,11}$/.test(onlyDigits)) {
    return true;
  }
  return false;
};

/**
 * Mesajı tarar ve tüm hileleri (emoji, harf aralama, leet-speak) çözerek 
 * yasaklı kelime, telefon, e-posta, IBAN veya link bulursa sansürler.
 */
export const filterMessage = (text) => {
  if (!text) return { text: "", flagged: false, reason: "" };
  
  let flagged = false;
  let cleanText = text;
  let reasons = [];

  // Ön İşleme: Emojileri ve gizleme hilelerini çöz
  const normalized = normalizeObfuscatedText(text);

  // 1. IBAN kontrolü
  if (IBAN_REGEX.test(normalized)) {
    flagged = true;
    reasons.push("IBAN paylaşımı engellendi");
    cleanText = cleanText.replace(IBAN_REGEX, "[IBAN GİZLENDİ]");
  }

  // 2. Telefon numarası kontrolü (Normal formatlar)
  if (PHONE_REGEX.test(normalized)) {
    flagged = true;
    reasons.push("Telefon numarası engellendi");
    cleanText = cleanText.replace(PHONE_REGEX, "[TELEFON GİZLENDİ]");
  }

  // 3. Aralıklı rakamlar kontrolü (0 5 3 2 ...)
  if (SPACED_DIGITS_REGEX.test(normalized)) {
    flagged = true;
    reasons.push("Aralıklı numara paylaşımı engellendi");
    cleanText = cleanText.replace(SPACED_DIGITS_REGEX, "[TELEFON GİZLENDİ]");
  }

  // 4. Yazı ile yazılmış numaralar kontrolü (sıfır beş yüz... veya sıfırbeşyüz...)
  if (WRITTEN_NUM_REGEX.test(normalized)) {
    flagged = true;
    reasons.push("Yazıyla numara paylaşımı engellendi");
    cleanText = cleanText.replace(WRITTEN_NUM_REGEX, "[TELEFON GİZLENDİ]");
  }

  // 5. Gizlenmiş ham rakam dizisi kontrolü (0a5b3c2d1...)
  if (!flagged && detectHiddenRawPhone(normalized)) {
    flagged = true;
    reasons.push("Gizlenmiş numara kalıbı engellendi");
    cleanText = "[TELEFON GİZLENDİ]";
  }

  // 6. E-posta kontrolü
  if (EMAIL_REGEX.test(normalized)) {
    flagged = true;
    reasons.push("E-posta adresi engellendi");
    cleanText = cleanText.replace(EMAIL_REGEX, "[E-POSTA GİZLENDİ]");
  }

  // 7. Harici Link kontrolü
  if (URL_REGEX.test(normalized)) {
    flagged = true;
    reasons.push("Harici link paylaşımı engellendi");
    cleanText = cleanText.replace(URL_REGEX, "[LİNK GİZLENDİ]");
  }

  // 8. Yasaklı kelimeler kontrolü
  BANNED_KEYWORDS.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
    if (regex.test(normalized)) {
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
