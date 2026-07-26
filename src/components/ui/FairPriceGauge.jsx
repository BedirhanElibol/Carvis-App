import React from "react";
import { Sparkles, TrendingDown, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

/**
 * CarGurus-Style Fair Price & Deal Rating Gauge
 * Evaluates offer prices against market benchmarks and provides visual deal rating badges.
 */
const FairPriceGauge = ({ offeredPrice = 0, fairMin = 0, fairMax = 0, categoryName = "Tamir / Servis" }) => {
  const price = parseFloat(offeredPrice) || 0;
  const min = parseFloat(fairMin) || (price * 0.85);
  const max = parseFloat(fairMax) || (price * 1.15);
  const avg = (min + max) / 2;

  let rating = "fair"; // 'great', 'fair', 'high'
  let label = "Adil Piyasa Fiyatı";
  let badgeStyle = "bg-teal-500/10 text-teal-400 border-teal-500/30";
  let GaugeIcon = ShieldCheck;
  let subText = "Teklif piyasa ortalamaları seviyesinde.";

  if (price < min) {
    rating = "great";
    label = "🔥 HARİKA FİYAT (FIRSAT)";
    badgeStyle = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
    GaugeIcon = Sparkles;
    const discount = Math.round(((avg - price) / avg) * 100);
    subText = `Piyasa ortalamasının %${discount} altında! Fırsat teklifi.`;
  } else if (price > max) {
    rating = "high";
    label = "⚠️ PİYASA TAVANI ÜZERİNDE";
    badgeStyle = "bg-rose-500/10 text-rose-500 border-rose-500/30";
    GaugeIcon = AlertTriangle;
    const diff = Math.round(((price - max) / max) * 100);
    subText = `Piyasa tavanının %${diff} üzerinde. Ustayla pazarlık yapabilirsiniz.`;
  }

  // Calculate percentage position for gauge pointer (0% to 100%)
  const gaugePercent = Math.min(100, Math.max(0, ((price - (min * 0.7)) / ((max * 1.3) - (min * 0.7))) * 100));

  return (
    <div className="p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3 text-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${badgeStyle}`}>
            <GaugeIcon size={12} />
            {label}
          </span>
        </div>
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest">{categoryName}</span>
      </div>

      <div className="flex items-baseline justify-between pt-1">
        <div>
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Verilen Teklif</span>
          <span className="text-xl font-black font-mono text-white">₺{price.toLocaleString("tr-TR")}</span>
        </div>
        <div className="text-right">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block">Adil Piyasa Aralığı</span>
          <span className="text-xs font-mono font-bold text-slate-300">
            ₺{Math.round(min).toLocaleString("tr-TR")} - ₺{Math.round(max).toLocaleString("tr-TR")}
          </span>
        </div>
      </div>

      {/* Visual Gauge Bar */}
      <div className="relative pt-2 pb-1">
        <div className="h-2 w-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-rose-500 opacity-80" />
        <div
          className="absolute top-1 -ml-1.5 w-3 h-4 bg-white rounded-full shadow-lg border-2 border-slate-900 transition-all duration-300"
          style={{ left: `${gaugePercent}%` }}
          title={`Teklif Konumu: %${Math.round(gaugePercent)}`}
        />
      </div>

      <p className="text-[10px] text-slate-400 font-semibold italic">
        {subText}
      </p>
    </div>
  );
};

export default FairPriceGauge;
