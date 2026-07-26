/**
 * CARFAX-Style Odometer Audit & Rollback Detection Engine
 * Analyzes chronological maintenance history to detect mileage rollbacks, anomalies, or verify odometer authenticity.
 */

export function auditOdometerHistory(records = []) {
  if (!records || records.length === 0) {
    return {
      status: "insufficient_data", // 'authentic', 'rollback_detected', 'anomaly_warning', 'insufficient_data'
      title: "Kilometre Verisi Henüz Yetersiz",
      message: "Kilometre orijinallik ve sayaç tutarlılık analizi için en az 1 servis kaydı gereklidir.",
      badgeColor: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      confidenceScore: 50,
      rollbacksFound: 0
    };
  }

  // Sort records chronologically by changed_date ascending
  const sortedRecords = [...records].sort((a, b) => new Date(a.changed_date) - new Date(b.changed_date));

  let rollbackDetected = false;
  let rollbackDetails = [];
  let maxKmSeen = 0;

  for (let i = 0; i < sortedRecords.length; i++) {
    const currentKm = parseInt(sortedRecords[i].changed_km || sortedRecords[i].mileage || 0, 10);
    const currentDate = new Date(sortedRecords[i].changed_date).toLocaleDateString("tr-TR");

    if (i > 0 && currentKm < maxKmSeen) {
      rollbackDetected = true;
      rollbackDetails.push({
        date: currentDate,
        recordedKm: currentKm,
        previousMaxKm: maxKmSeen,
        diff: maxKmSeen - currentKm
      });
    }

    if (currentKm > maxKmSeen) {
      maxKmSeen = currentKm;
    }
  }

  if (rollbackDetected) {
    const mainDiff = rollbackDetails[0]?.diff || 0;
    return {
      status: "rollback_detected",
      title: "🔴 ŞÜPHELİ KİLOMETRE DÜŞÜRME TESPİT EDİLDİ",
      message: `Sayaç kayıtlarında geriye düşme saptandı! Önceden ${rollbackDetails[0].previousMaxKm.toLocaleString()} KM olan araç kaydı daha sonra ${rollbackDetails[0].recordedKm.toLocaleString()} KM olarak işlenmiş (${mainDiff.toLocaleString()} KM fark).`,
      badgeColor: "bg-rose-500/10 text-rose-500 border-rose-500/30",
      confidenceScore: 98,
      rollbacksFound: rollbackDetails.length,
      details: rollbackDetails
    };
  }

  return {
    status: "authentic",
    title: "🟢 KİLOMETRE ORİJİNAL (SAYAÇ DÜZENLİ)",
    message: `${sortedRecords.length} adet tarihsel servis ve bakım kaydı incelendi. Kilometre artışı kronolojik olarak tamamen tutarlı.`,
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    confidenceScore: 95,
    rollbacksFound: 0,
    maxKmRecorded: maxKmSeen
  };
}
