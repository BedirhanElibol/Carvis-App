/**
 * Validation Utilities for Mandatory Business Preconditions
 * Centralized checks for Orders, Service Requests, Partner Eligibility, and Profile Completeness.
 */

/**
 * Validates preconditions for placing an order (Checkout)
 */
export const validateOrderPreconditions = ({ cart = [], selectedAddress = null, currentUser = null }) => {
  const errors = [];

  if (!cart || cart.length === 0) {
    errors.push("Sepetiniz boş. Lütfen ürün veya servis ekleyin.");
  }

  if (!selectedAddress) {
    errors.push("Teslimat adresi seçilmelidir.");
  } else if (!selectedAddress.fullAddress && !selectedAddress.address) {
    errors.push("Teslimat adresinde eksik detaylar var.");
  }

  const phone = currentUser?.phone || currentUser?.user_metadata?.phone;
  if (!phone || phone.trim() === "") {
    errors.push("Sipariş ve kargo güncellemeleri için kullanıcı profilinde telefon numarası bulunmalıdır.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validates preconditions for creating a Service Request (Teklif İsteme)
 */
export const validateServiceRequestPreconditions = ({ selectedVehicleId, vehicles = [], description = "", currentUser = null }) => {
  const errors = [];

  if (!vehicles || vehicles.length === 0) {
    errors.push("Garajınızda henüz kayıtlı bir araç bulunmuyor. Lütfen önce aracınızı ekleyin.");
  } else if (!selectedVehicleId) {
    errors.push("Lütfen işlem yapılacak aracı seçin.");
  }

  if (!description || description.trim().length < 10) {
    errors.push("Lütfen en az 10 karakterlik detaylı bir talep açıklaması girin.");
  }

  const phone = currentUser?.phone || currentUser?.user_metadata?.phone;
  if (!phone || phone.trim() === "") {
    errors.push("Ustaların size teklif verebilmesi için iletişim telefon numaranızın profilinizde ekli olması gerekir.");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Analyzes User Profile Completeness (Profil Doluluk Oranı & Eksik Alanlar)
 */
export const validateUserProfileCompleteness = (currentUser) => {
  if (!currentUser || currentUser.isAnonymous) {
    return {
      completeness: 0,
      missingFields: ["Oturum Açılmadı"],
      isComplete: false,
    };
  }

  const requiredFields = [
    { key: "full_name", label: "Ad Soyad", check: () => currentUser.user_metadata?.full_name || currentUser.displayName },
    { key: "phone", label: "Telefon Numarası", check: () => currentUser.phone || currentUser.user_metadata?.phone },
    { key: "address", label: "Teslimat / Adres Bilgisi", check: () => currentUser.address || currentUser.user_metadata?.address },
    { key: "email", label: "E-posta Adresi", check: () => currentUser.email },
  ];

  const missingFields = requiredFields.filter((f) => !f.check() || f.check().trim() === "").map((f) => f.label);
  const completedCount = requiredFields.length - missingFields.length;
  const completeness = Math.round((completedCount / requiredFields.length) * 100);

  return {
    completeness,
    missingFields,
    isComplete: missingFields.length === 0,
  };
};

/**
 * Validates Email against MailCheck.ai API to block disposable / temporary emails (Free / Unlimited)
 */
export const checkDisposableEmail = async (email) => {
  if (!email || !email.includes("@")) return { isValid: true, isDisposable: false };
  const domain = email.split("@")[1].toLowerCase().trim();
  
  try {
    const res = await fetch(`https://api.mailcheck.ai/domain/${domain}`);
    if (!res.ok) return { isValid: true, isDisposable: false };
    
    const data = await res.json();
    if (data.disposable) {
      return {
        isValid: false,
        isDisposable: true,
        error: "Geçici / kullan-at (disposable) e-posta adresleri güvenlik nedeniyle kabul edilmemektedir."
      };
    }
    return { isValid: true, isDisposable: false };
  } catch (err) {
    console.warn("MailCheck API error:", err);
    return { isValid: true, isDisposable: false };
  }
};

/**
 * Sanitizes Kilometer inputs: Disallows negative values, caps at 2,000,000 KM
 */
export const sanitizeKm = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const parsed = parseInt(String(val).replace(/[^0-9-]/g, ""), 10);
  if (isNaN(parsed) || parsed < 0) return 0; // Negatif kilometre (örn: -500) engelleme
  return Math.min(parsed, 2000000); // Azami 2.000.000 KM sınırı
};

/**
 * Sanitizes Monetary & Price inputs: Disallows negative prices
 */
export const sanitizePrice = (val) => {
  if (val === null || val === undefined || val === "") return 0;
  const parsed = parseFloat(String(val).replace(",", ".").replace(/[^0-9.-]/g, ""));
  if (isNaN(parsed) || parsed < 0) return 0; // Negatif fiyat (-100 TL) engelleme
  return Math.round(parsed * 100) / 100;
};

/**
 * Sanitizes Model Year inputs: 1950 - 2027
 */
export const sanitizeYear = (val) => {
  const currentYear = new Date().getFullYear();
  if (!val) return currentYear;
  const parsed = parseInt(String(val).replace(/[^0-9]/g, ""), 10);
  if (isNaN(parsed) || parsed < 1950) return 1950;
  if (parsed > currentYear + 1) return currentYear + 1;
  return parsed;
};

/**
 * Strict Vehicle Input Validator
 */
export const validateVehicleInputs = ({ km, year, plate }) => {
  const errors = [];
  const parsedKm = parseInt(km, 10);
  const parsedYear = parseInt(year, 10);

  if (!isNaN(parsedKm) && parsedKm < 0) {
    errors.push("Kilometre değeri negatif (-500 vb.) olamaz.");
  }
  if (!isNaN(parsedKm) && parsedKm > 2000000) {
    errors.push("Kilometre değeri 2.000.000 KM sınırını aşamaz.");
  }
  if (!isNaN(parsedYear) && (parsedYear < 1950 || parsedYear > new Date().getFullYear() + 1)) {
    errors.push(`Model yılı 1950 ile ${new Date().getFullYear() + 1} arasında olmalıdır.`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
