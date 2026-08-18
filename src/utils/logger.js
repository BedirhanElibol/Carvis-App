/**
 * Log Sanitizer & Production Error Masker Utility
 * Redacts sensitive fields (JWT tokens, passwords, credit card info, keys)
 * and masks raw internal stack traces in production environment.
 */

const SENSITIVE_KEYS = [
  'password',
  'token',
  'authorization',
  'auth',
  'secret',
  'api_key',
  'apikey',
  'creditCard',
  'cardNumber',
  'cvv',
  'ssn',
  'tcNo'
];

/**
 * Recursively redacts sensitive values from an object or array.
 * @param {any} data 
 * @returns {any}
 */
export function sanitizeLogData(data) {
  if (data === null || data === undefined) return data;

  if (typeof data === 'string') {
    // Redact potential Bearer tokens or JWT strings in logs
    if (data.startsWith('Bearer ') || data.split('.').length === 3 && data.length > 50) {
      return '[REDACTED_TOKEN]';
    }
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(item => sanitizeLogData(item));
  }

  if (typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      const lowerKey = key.toLowerCase();
      if (SENSITIVE_KEYS.some(sensitive => lowerKey.includes(sensitive.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeLogData(value);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Custom logger that redacts PII and sensitive info in production and dev.
 */
export const logger = {
  log: (...args) => {
    if (import.meta.env.DEV) {
      console.log(...args.map(arg => sanitizeLogData(arg)));
    }
  },
  warn: (...args) => {
    console.warn(...args.map(arg => sanitizeLogData(arg)));
  },
  error: (message, errorObj, ...args) => {
    const isProd = import.meta.env.PROD;
    const errorId = 'ERR-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    if (isProd) {
      // In production, mask detailed internal stack traces/SQL errors for the end user
      console.error(`[${errorId}] ${message}`, sanitizeLogData(errorObj?.message || errorObj || 'An error occurred'));
      return {
        errorId,
        userMessage: 'İşlem sırasında bir hata oluştu. Lütfen tekrar deneyiniz.'
      };
    } else {
      console.error(`[${errorId}] ${message}`, sanitizeLogData(errorObj), ...args.map(arg => sanitizeLogData(arg)));
      return {
        errorId,
        userMessage: errorObj?.message || message
      };
    }
  }
};
