/**
 * Rapidsy Secure Logger Utility
 * OWASP Mobile M2:2024 (Insecure Data Storage & Leakage Prevention)
 * Masking PII and sensitive tokens in console outputs.
 */

const PII_PATTERNS = {
  plate: /[0-9]{2}\s?[A-Z]{1,3}\s?[0-9]{2,4}/gi,
  phone: /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  token: /eyJ[a-zA-Z0-9-_=]+\.eyJ[a-zA-Z0-9-_=]+\.?[a-zA-Z0-9-_.+/=]*/g,
  cardNumber: /\b(?:\d[ -]*?){13,16}\b/g
};

const maskSensitiveData = (value) => {
  if (typeof value !== "string") {
    try {
      value = JSON.stringify(value);
    } catch {
      return "[Unserializable Data]";
    }
  }

  return value
    .replace(PII_PATTERNS.token, "[SECURE_TOKEN_MASKED]")
    .replace(PII_PATTERNS.cardNumber, "[CARD_NUMBER_MASKED]")
    .replace(PII_PATTERNS.phone, "[PHONE_NUMBER_MASKED]")
    .replace(PII_PATTERNS.plate, "[LICENSE_PLATE_MASKED]")
    .replace(PII_PATTERNS.email, "[EMAIL_MASKED]");
};

const isProd = import.meta.env.PROD;

export const logger = {
  info: (message, ...optionalParams) => {
    if (isProd) return; // Do not show verbose info in production console
    console.info(`[Rapidsy INFO] ${maskSensitiveData(message)}`, ...optionalParams.map(maskSensitiveData));
  },
  warn: (message, ...optionalParams) => {
    console.warn(`[Rapidsy WARN] ${maskSensitiveData(message)}`, ...optionalParams.map(maskSensitiveData));
  },
  error: (message, ...optionalParams) => {
    console.error(`[Rapidsy ERROR] ${maskSensitiveData(message)}`, ...optionalParams.map(maskSensitiveData));
  },
  debug: (message, ...optionalParams) => {
    if (isProd) return;
    console.debug(`[Rapidsy DEBUG] ${maskSensitiveData(message)}`, ...optionalParams.map(maskSensitiveData));
  }
};
