/**
 * Carvis Vehicle Market Valuation & Expense Estimation Engine
 */

// Base valuation estimates for popular market segments (TRY - 2026 market benchmarks)
const BRAND_BASE_VALUATIONS = {
  "bmw": 1850000,
  "mercedes-benz": 2100000,
  "audi": 1750000,
  "volkswagen": 1250000,
  "volvo": 1650000,
  "porsche": 4500000,
  "ford": 980000,
  "renault": 780000,
  "fiat": 650000,
  "toyota": 1150000,
  "honda": 1200000,
  "hyundai": 890000,
  "kia": 870000,
  "peugeot": 920000,
  "opel": 850000,
  "nissan": 940000,
  "citroen": 810000,
  "skoda": 1100000,
  "seat": 920000,
  "dacia": 620000,
  "togg": 1650000,
  "tesla": 2200000,
  "cupra": 1700000,
};

export const calculateVehicleMarketValue = (vehicle) => {
  if (!vehicle) {
    return {
      currentValue: 1250000,
      previousValue: 1210000,
      trend: "up",
      percentage: 3.3,
      minRange: 1180000,
      maxRange: 1320000,
      lastUpdated: "Bugün"
    };
  }

  const brandKey = String(vehicle.brand || "").toLowerCase().trim();
  const baseValue = BRAND_BASE_VALUATIONS[brandKey] || 850000;

  const currentYear = new Date().getFullYear();
  const vehicleYear = Number(vehicle.year) || (currentYear - 5);
  const age = Math.max(0, currentYear - vehicleYear);

  // Depreciation: ~5% per year after year 1
  const ageMultiplier = Math.max(0.3, Math.pow(0.92, age));

  // KM impact: ~15,000 km per year standard
  const km = Number(vehicle.km) || age * 15000;
  const expectedKm = Math.max(1, age * 15000);
  const kmRatio = km / expectedKm;
  const kmMultiplier = kmRatio > 1.2 ? 0.92 : kmRatio < 0.8 ? 1.06 : 1.0;

  const calculatedValuation = Math.round(baseValue * ageMultiplier * kmMultiplier / 5000) * 5000;
  const previousValue = Math.round(calculatedValuation * 0.97 / 5000) * 5000;
  const percentage = 3.1;

  return {
    currentValue: calculatedValuation,
    previousValue: previousValue,
    trend: "up",
    percentage,
    minRange: Math.round(calculatedValuation * 0.95 / 5000) * 5000,
    maxRange: Math.round(calculatedValuation * 1.05 / 5000) * 5000,
    lastUpdated: "Bugün, " + new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })
  };
};

export const calculateTotalCostOfOwnership = (_vehicle) => {
  const yearlyKm = 15000;

  // Estimated yearly costs
  const fuelCostYearly = Math.round((yearlyKm / 100) * 6.8 * 44.5); // ~6.8L/100km at ~44.5 TL/L
  const maintenanceYearly = 14500;
  const insuranceYearly = 24000;
  const taxMtvYearly = 7800;

  const totalYearlyCost = fuelCostYearly + maintenanceYearly + insuranceYearly + taxMtvYearly;
  const costPerKm = (totalYearlyCost / yearlyKm).toFixed(2);

  return {
    yearlyTotal: totalYearlyCost,
    monthlyTotal: Math.round(totalYearlyCost / 12),
    costPerKm,
    breakdown: [
      { category: "Yakıt", amount: fuelCostYearly, color: "#06b6d4", icon: "Fuel" },
      { category: "Bakım & Tamir", amount: maintenanceYearly, color: "#3b82f6", icon: "Wrench" },
      { category: "Kasko & Sigorta", amount: insuranceYearly, color: "#10b981", icon: "ShieldCheck" },
      { category: "MTV & Belgeler", amount: taxMtvYearly, color: "#f59e0b", icon: "Landmark" },
    ]
  };
};
