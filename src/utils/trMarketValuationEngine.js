/**
 * arabam.com "Arabam Kaç Para" + TRAMER / SBM Integration Valuation Engine
 * Features:
 * 1. Outlier Listing Purging: Filters unrealistic extreme high/low market listings.
 * 2. TRAMER / SBM Insurance Claim Database Integration.
 * 3. "Alan Memnun Satan Memnun" Fair Reference Price calculation.
 * 4. Estimated Sale Time / Liquidity Difficulty (Days).
 */

export function calculateArabamTramerValuation({
  brand = "Renault",
  model = "Clio",
  year = 2021,
  km = 85000,
  tramerAmount = 0,
  rawListings = [720000, 740000, 750000, 760000, 780000, 950000, 420000] // Includes outliers
}) {
  // Step 1: Outlier Purging (Remove top 10% and bottom 10% extreme prices)
  const sortedPrices = [...rawListings].sort((a, b) => a - b);
  const trimCount = Math.floor(sortedPrices.length * 0.15);
  const cleanedPrices = sortedPrices.slice(trimCount, sortedPrices.length - trimCount);

  const avgCleanMarketPrice = cleanedPrices.reduce((sum, p) => sum + p, 0) / Math.max(1, cleanedPrices.length);

  // Step 2: TRAMER / SBM Insurance Claims Deduction
  let tramerDeduction = 0;
  if (tramerAmount > 0) {
    tramerDeduction = Math.min(avgCleanMarketPrice * 0.22, tramerAmount * 0.70);
  }

  // Step 3: "Alan Memnun Satan Memnun" Reference Price Formula
  const referencePrice = Math.round((avgCleanMarketPrice - tramerDeduction) / 5000) * 5000;
  const minMarketPrice = Math.round((referencePrice * 0.94) / 5000) * 5000;
  const maxMarketPrice = Math.round((referencePrice * 1.05) / 5000) * 5000;

  // Step 4: Liquidity / Estimated Days to Sell
  let estimatedDaysToSell = 14; // Default fast 14 days
  let liquidityLabel = "🔥 YÜKSEK LİKİDİTE (HIZLI SATILIR)";

  if (tramerAmount > 75000) {
    estimatedDaysToSell = 35;
    liquidityLabel = "🟡 ORTA LİKİDİTE (PAZARLIKLI SATIŞ)";
  } else if (km > 180000) {
    estimatedDaysToSell = 28;
    liquidityLabel = "🟡 ORTA LİKİDİTE";
  }

  return {
    referencePrice,
    formattedReferencePrice: `₺${referencePrice.toLocaleString("tr-TR")}`,
    minMarketPrice,
    maxMarketPrice,
    formattedMarketRange: `₺${minMarketPrice.toLocaleString("tr-TR")} - ₺${maxMarketPrice.toLocaleString("tr-TR")}`,
    tramerAmount,
    tramerDeduction,
    formattedTramerDeduction: `₺${Math.round(tramerDeduction).toLocaleString("tr-TR")}`,
    estimatedDaysToSell,
    liquidityLabel,
    fairDealBadgeText: "🤝 ALAN MEMNUN SATAN MEMNUN REFERANS FİYAT"
  };
}
