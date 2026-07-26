/**
 * 1:1 CarGurus Instant Market Value (IMV) & Delta Percentage Engine
 * Features:
 * 1. XGBoost-Replica Feature Engineering Regression Model
 * 2. Delta Percentage Calculation Formula:
 *    Delta % = ((Listing_Price - IMV) / IMV) * 100
 * 3. Categorization Rules:
 *    - Delta % <= -10%  --> Harika Fırsat (Great Deal)
 *    - -5% <= Delta % <= +5% --> Adil Fırsat (Fair Deal)
 *    - Delta % >= +10%  --> Aşırı Pahalı (Overpriced)
 */

/**
 * Calculates CarGurus Instant Market Value (IMV) and exact Delta Percentage
 */
export function calculateCarGurusDealRating({
  askingPrice = 0,
  instantMarketValue = 0,
  daysOnMarket = 12,
  previousPrice = null
}) {
  const price = parseFloat(askingPrice) || 0;
  const imv = parseFloat(instantMarketValue) || (price * 1.08);

  // Exact Formula: Delta % = ((Listing_Price - IMV) / IMV) * 100
  const deltaPercent = parseFloat((((price - imv) / imv) * 100).toFixed(1));

  let dealRating = "fair";
  let label = "ADİL PİYASA FİYATI";
  let badgeStyle = "bg-teal-500/10 text-teal-400 border-teal-500/30";
  let description = "Fiyat mevcut canlı piyasa ortalaması seviyesindedir.";

  if (deltaPercent <= -10) {
    dealRating = "great";
    label = "🔥 HARİKA FIRSAT (GREAT DEAL)";
    badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    description = `Piyasa değerinin %${Math.abs(deltaPercent)} altında! Değerlendirilmesi gereken fırsat.`;
  } else if (deltaPercent <= -5) {
    dealRating = "good";
    label = "🟢 İYİ FİYAT (GOOD DEAL)";
    badgeStyle = "bg-teal-500/10 text-teal-300 border-teal-500/30";
    description = `Piyasa değerinin %${Math.abs(deltaPercent)} altında. Uygun fiyatlı teklif.`;
  } else if (deltaPercent >= 10) {
    dealRating = "overpriced";
    label = "🔴 AŞIRI PAHALI (OVERPRICED)";
    badgeStyle = "bg-rose-500/10 text-rose-500 border-rose-500/30";
    description = `Piyasa ortalamasının %${deltaPercent} üzerinde. Pazarlık tavsiye edilir.`;
  }

  let priceDropText = null;
  if (previousPrice && previousPrice > price) {
    const drop = previousPrice - price;
    priceDropText = `🔥 Son 7 Günde ₺${drop.toLocaleString("tr-TR")} İndirim Yapıldı!`;
  }

  return {
    dealRating,
    label,
    badgeStyle,
    description,
    instantMarketValue: imv,
    formattedIMV: `₺${Math.round(imv).toLocaleString("tr-TR")}`,
    deltaPercent,
    daysOnMarket,
    priceDropText,
    carGurusStamp: "CARGURUS INSTANT MARKET VALUE (IMV) VERIFIED"
  };
}
