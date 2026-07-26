/**
 * Carvana & TR Independent 501-Point DVI (Digital Vehicle Inspection) Engine
 * Features:
 * 1. Paint Thickness Micron Categorization:
 *    - 80 - 150 µ (Microns): Original Factory Paint (🟢 Orijinal Fabrika Boyası)
 *    - 200 - 450 µ (Microns): Repainted Panel (🟡 Boyalı Kaporta Parçası)
 *    - 500+ µ (Microns): Putty / Body Filler Repair (🔴 Macun Dolgulu Hasarlı Bölge)
 * 2. OBD-II ECU DTC Fault Code Scan
 * 3. Dyno Power & Lateral Slip (Yanal Kayma) Percentage Score
 */

export function evaluatePaintMicrons(microns = 110) {
  const m = parseInt(microns, 10) || 110;

  if (m >= 500) {
    return {
      status: "putty_filler",
      microns: m,
      label: "🔴 MACUN DOLGULU HASARLI BÖLGE",
      badgeStyle: "bg-rose-500/10 text-rose-500 border-rose-500/30",
      priceDeduction: 0.12 // 12% Penalty
    };
  } else if (m >= 180) {
    return {
      status: "repainted",
      microns: m,
      label: "🟡 BOYALI KAPORTA PARÇASI",
      badgeStyle: "bg-amber-500/10 text-amber-400 border-amber-500/30",
      priceDeduction: 0.04 // 4% Penalty
    };
  }

  return {
    status: "original",
    microns: m,
    label: "🟢 ORİJİNAL FABRİKA BOYASI",
    badgeStyle: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    priceDeduction: 0.00
  };
}

export function evaluate501PointInspection({
  paintMicrons = 120,
  ecuTroubleCodes = [], // e.g. ['P0300', 'P0171']
  dynoHpRating = 110,
  factoryHpRating = 115,
  lateralSlipMm = 0.8 // mm/m
}) {
  const paintEvaluation = evaluatePaintMicrons(paintMicrons);

  // OBD-II ECU DTC Status
  const hasDtcCodes = ecuTroubleCodes.length > 0;
  const obdStatus = hasDtcCodes
    ? { isClean: false, codeCount: ecuTroubleCodes.length, label: `⚠️ ${ecuTroubleCodes.length} ADET AKTİF ECU HATA KODU TESPİT EDİLDİ` }
    : { isClean: true, codeCount: 0, label: "🟢 OBD-II ECU TEMİZ (HİÇBİR ARIZA KODU YOK)" };

  // Dyno Efficiency Score
  const dynoEfficiencyPercent = Math.round((dynoHpRating / Math.max(1, factoryHpRating)) * 100);

  // Lateral Slip Assessment (Standard: < 2.0 mm/m)
  const isLateralSlipNormal = lateralSlipMm <= 2.0;

  // Overall Condition Score (0 - 100)
  let conditionScore = 100;
  if (paintEvaluation.status === "putty_filler") conditionScore -= 18;
  if (paintEvaluation.status === "repainted") conditionScore -= 6;
  if (hasDtcCodes) conditionScore -= (ecuTroubleCodes.length * 8);
  if (dynoEfficiencyPercent < 85) conditionScore -= 12;

  conditionScore = Math.max(30, Math.min(100, conditionScore));

  return {
    conditionScore,
    paintEvaluation,
    obdStatus,
    dynoHpRating,
    factoryHpRating,
    dynoEfficiencyPercent: `${dynoEfficiencyPercent}%`,
    lateralSlipMm,
    isLateralSlipNormal,
    inspectionCertificate: "CARVANA / TR 501-NOKTA FOTOĞRAFLI DVI SERTİFİKASI"
  };
}
