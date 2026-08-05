/**
 * Carvis Authentic Vehicle Valuation & Expense Engine
 * NO arbitrary or fake base valuation multipliers.
 * Only processes verified user inputs, actual logged expenses, and official records.
 */

export const calculateVehicleMarketValue = (vehicle) => {
  if (!vehicle) {
    return {
      hasValue: false,
      currentValue: null,
      message: "Araç Seçilmedi",
      lastUpdated: "—"
    };
  }

  // Check if user entered a custom purchase price or kasko valuation
  const userDeclaredValue = Number(vehicle.purchase_price) || Number(vehicle.kasko_value) || null;

  if (userDeclaredValue && userDeclaredValue > 0) {
    return {
      hasValue: true,
      currentValue: userDeclaredValue,
      source: "Kullanıcı Beyanı / Alış Fiyatı",
      lastUpdated: vehicle.updated_at ? new Date(vehicle.updated_at).toLocaleDateString("tr-TR") : "Güncel"
    };
  }

  // If no authentic user valuation is recorded, return explicit null/unspecified state
  return {
    hasValue: false,
    currentValue: null,
    message: "Değer Belirtilmedi (Girmek İçin Tıklayın)",
    lastUpdated: "—"
  };
};

export const calculateTotalCostOfOwnership = (vehicle, actualLogs = {}) => {
  const fuelTotal = Number(actualLogs.fuelTotal) || 0;
  const serviceTotal = Number(actualLogs.serviceTotal) || 0;
  const insuranceTotal = Number(actualLogs.insuranceTotal) || 0;

  const totalCost = fuelTotal + serviceTotal + insuranceTotal;
  const hasExpenses = totalCost > 0;

  return {
    hasExpenses,
    totalCost,
    breakdown: [
      { category: "Yakıt Harcamaları", amount: fuelTotal, color: "#06b6d4", icon: "Fuel" },
      { category: "Bakım & Tamir Faturaları", amount: serviceTotal, color: "#3b82f6", icon: "Wrench" },
      { category: "Kasko / Sigorta Ödemeleri", amount: insuranceTotal, color: "#10b981", icon: "ShieldCheck" },
    ]
  };
};
