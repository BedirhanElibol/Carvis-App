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
