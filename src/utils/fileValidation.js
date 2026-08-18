/**
 * File Upload Security & Validation Utility
 * Enforces file size limits, MIME type verification, extension checks,
 * and safe UUID file naming.
 */

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/heic'],
  pdf: ['application/pdf'],
  audio: ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/webm', 'audio/mp4', 'audio/x-m4a', 'audio/m4a']
};

const ALLOWED_EXTENSIONS = {
  image: ['jpg', 'jpeg', 'png', 'webp', 'heic'],
  pdf: ['pdf'],
  audio: ['mp3', 'wav', 'ogg', 'webm', 'm4a']
};

/**
 * Validates a file before upload.
 * @param {File} file - The input file object from input element.
 * @param {'image' | 'pdf' | 'audio' | 'all'} allowedCategory - Category of allowed file types.
 * @param {number} customMaxSizeBytes - Optional max file size in bytes (defaults to 5MB).
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateUploadFile(file, allowedCategory = 'all', customMaxSizeBytes = MAX_FILE_SIZE_BYTES) {
  if (!file) {
    return { valid: false, error: 'Dosya seçilmedi.' };
  }

  // 1. File Size Check
  if (file.size > customMaxSizeBytes) {
    const sizeMB = (customMaxSizeBytes / (1024 * 1024)).toFixed(0);
    return { valid: false, error: `Dosya boyutu çok büyük. Maksimum ${sizeMB} MB yükleyebilirsiniz.` };
  }

  // 2. Extension Check
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension) {
    return { valid: false, error: 'Geçersiz dosya adı veya uzantısı.' };
  }

  // Prevent dangerous executable or script extensions
  const FORBIDDEN_EXTENSIONS = ['exe', 'bat', 'cmd', 'sh', 'php', 'pl', 'py', 'js', 'html', 'htm', 'svg', 'dll', 'vbs', 'ps1'];
  if (FORBIDDEN_EXTENSIONS.includes(extension)) {
    return { valid: false, error: 'Çalıştırılabilir veya güvensiz dosya uzantılarına izin verilmez.' };
  }

  // 3. Category MIME & Extension Validation
  let validMimes = [];
  let validExts = [];

  if (allowedCategory === 'all') {
    validMimes = [...ALLOWED_MIME_TYPES.image, ...ALLOWED_MIME_TYPES.pdf, ...ALLOWED_MIME_TYPES.audio];
    validExts = [...ALLOWED_EXTENSIONS.image, ...ALLOWED_EXTENSIONS.pdf, ...ALLOWED_EXTENSIONS.audio];
  } else if (ALLOWED_MIME_TYPES[allowedCategory]) {
    validMimes = ALLOWED_MIME_TYPES[allowedCategory];
    validExts = ALLOWED_EXTENSIONS[allowedCategory];
  }

  if (validMimes.length > 0 && !validMimes.includes(file.type.toLowerCase())) {
    return { valid: false, error: `Desteklenmeyen dosya türü: ${file.type || extension}. Lütfen geçerli bir dosya yükleyin.` };
  }

  if (validExts.length > 0 && !validExts.includes(extension)) {
    return { valid: false, error: `Desteklenmeyen dosya uzantısı (.${extension}).` };
  }

  return { valid: true };
}

/**
 * Generates a safe, sanitized UUID-based filename.
 * @param {File} file 
 * @returns {string} Safe file name with extension
 */
export function generateSafeFileName(file) {
  const extension = file.name.split('.').pop()?.toLowerCase() || 'bin';
  const randomUuid = crypto.randomUUID ? crypto.randomUUID() : Date.now() + '_' + Math.random().toString(36).substring(2, 9);
  return `${randomUuid}.${extension}`;
}
