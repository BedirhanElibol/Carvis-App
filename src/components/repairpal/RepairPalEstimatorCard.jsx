import React from "react";
import { ShieldCheck, Wrench, Package, Clock, CheckCircle2, Award } from "lucide-react";
import { calculateRepairPalEstimate } from "../../utils/repairPalEngine";

/**
 * RepairPal 1:1 Official Fair Price Estimator & Labor Breakdown Component
 * Replicates RepairPal's signature breakdown:
 * 1. Fair Price Gauge Bar
 * 2. Labor Cost Calculation (OEM Hours * Hourly Rate)
 * 3. Genuine OEM vs Certified Aftermarket Parts Price Range
 * 4. RepairPal Certified 12-Month / 12,000-Mile Warranty Stamp
 */
const RepairPalEstimatorCard = ({
  serviceName = "Periyodik Bakım & Fren Onarımı",
  quotePrice = 0,
  laborPrice = 0,
  partsPrice = 0,
  city = "istanbul",
  shopTier = "independent",
  warrantyMonths = 12
}) => {
  const estimate = calculateRepairPalEstimate({
    serviceType: serviceName,
    city,
    shopTier,
    userPrice: quotePrice,
    partsCost: partsPrice
  });

  const { labor, parts, total } = estimate;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-white space-y-6">
      {/* RepairPal Official Header & Certified Stamp */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 flex items-center justify-center font-black text-xs text-center shadow-lg border border-amber-400/40 font-mono tracking-tight leading-none p-1">
            ADİL FİYAT
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-amber-400 tracking-widest bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                Şeffaf & Adil Fiyat Hesaplayıcı
              </span>
            </div>
            <h3 className="font-black text-lg uppercase tracking-tight text-slate-100 mt-0.5">
              {serviceName}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-2xl text-amber-400 text-xs font-black uppercase tracking-wider">
          <Award size={16} /> GÜVENİLİR SERTİFİKALI SERVİS
        </div>
      </div>

      {/* RepairPal Price Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* OEM Labor Calculation */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={16} /> STANDART USTA İŞÇİLİK SÜRESİ
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-bold">Fabrika Standartı</span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs text-slate-300">
              {estimate.standardHours} Saat x {estimate.formattedHourlyRate}
            </span>
            <span className="text-sm font-black font-mono text-white">
              {estimate.formattedLaborCost}
            </span>
          </div>
        </div>

        {/* Parts Range */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <Package size={16} /> ADİL PARÇA FİYAT ARALIĞI
            </span>
            <span className="text-[10px] font-mono text-slate-400 font-bold">Orijinal Parça</span>
          </div>
          <div className="flex justify-between items-baseline pt-1">
            <span className="text-xs text-slate-300">Sertifikalı Parçalar</span>
            <span className="text-sm font-black font-mono text-white">
              {estimate.formattedPartsRange}
            </span>
          </div>
        </div>
      </div>

      {/* RepairPal Certified Guarantee Banner */}
      <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="shrink-0" />
          <span>Sertifikalı {warrantyMonths} Ay / 20.000 KM Parça ve İşçilik Garantisi Kapsamındadır.</span>
        </div>
      </div>
    </div>
  );
};

export default RepairPalEstimatorCard;
