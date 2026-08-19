import React, { useState } from "react";
import { ArrowDownRight, ArrowUpRight, BarChart3, Car, ChevronRight, FileText, Fuel, Landmark, PieChart, ShieldCheck, TrendingUp, Wrench, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { calculateVehicleMarketValue, calculateTotalCostOfOwnership } from "../../utils/vehicleValuation";

const FinancialCockpit = ({ vehicle, onOpenProSettings }) => {
  const [activeTab, setActiveTab] = useState("valuation"); // 'valuation' | 'tco'
  const [showValuationModal, setShowValuationModal] = useState(false);

  const valuation = calculateVehicleMarketValue(vehicle);
  const tco = calculateTotalCostOfOwnership(vehicle);

  // Calculate real remaining days from vehicle data if available
  const getDaysLeft = (targetDateStr) => {
    if (!targetDateStr) return null;
    const target = new Date(targetDateStr);
    const now = new Date();
    const diffTime = target - now;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const kaskoDays = getDaysLeft(vehicle?.insurance_expiry_date || vehicle?.insurance_expiry);
  const inspectionDays = getDaysLeft(vehicle?.inspection_expiry_date || vehicle?.inspection_date || vehicle?.inspection_expiry);

  const realInsurances = [
    {
      id: "kasko",
      name: "Kasko & Trafik Poliçesi",
      icon: <ShieldCheck size={18} />,
      daysLeft: kaskoDays,
      dateStr: vehicle?.insurance_expiry_date || vehicle?.insurance_expiry
    },
    {
      id: "inspection",
      name: "TÜVTÜRK Muayene Tarihi",
      icon: <FileText size={18} />,
      daysLeft: inspectionDays,
      dateStr: vehicle?.inspection_expiry_date || vehicle?.inspection_date || vehicle?.inspection_expiry
    }
  ];

  const hasAnyPolicy = kaskoDays !== null || inspectionDays !== null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-mono font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <PieChart className="text-cyan-500 dark:text-cyan-400" size={18} />
          Finans & Değer Kokpiti
        </h3>
        
        {/* Tab Toggle */}
        <div className="flex bg-slate-200 dark:bg-white/10 p-1 rounded-full border border-slate-300 dark:border-white/10 text-xs">
          <button
            onClick={() => setActiveTab("valuation")}
            className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-all ${
              activeTab === "valuation"
                ? "bg-cyan-500 text-black shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Piyasa Değeri
          </button>
          <button
            onClick={() => setActiveTab("tco")}
            className={`px-3 py-1 rounded-full font-mono text-[11px] font-bold transition-all ${
              activeTab === "tco"
                ? "bg-cyan-500 text-black shadow-md"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Masraf Analizi
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Tab Card */}
        <AnimatePresence mode="wait">
          {activeTab === "valuation" ? (
            <motion.div
              key="valuation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              whileHover={{ scale: 0.99 }}
              onClick={onOpenProSettings}
              className="bg-gradient-to-br from-slate-900 via-slate-950 to-black dark:from-slate-900 dark:via-[#0a0f24] dark:to-black rounded-xl p-6 relative overflow-hidden text-white border border-white/10 cursor-pointer group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>

              <div className="relative z-10 flex flex-col h-full justify-between gap-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                    <Car size={14} className="text-cyan-400" />
                    <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-300">
                      {vehicle?.brand ? `${vehicle.brand} ${vehicle.model || ""}` : "Araç Değeri"}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-cyan-500/50 transition-colors">
                    <Car size={20} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </div>

                <div>
                  {valuation.hasValue ? (
                    <div>
                      <div className="flex items-baseline gap-3 mb-1">
                        <h2 className="text-3xl font-mono font-black tracking-tighter text-cyan-400">
                          {formatCurrency(valuation.currentValue)}
                        </h2>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          Kayıtlı Fiyat
                        </span>
                      </div>
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center justify-between">
                        <span>Kaynak: {valuation.source}</span>
                        <span className="flex items-center gap-1 text-cyan-400">Güncelle <ChevronRight size={12} /></span>
                      </p>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-mono font-black tracking-tight text-slate-300 mb-1">
                        Araç Fiyatı Girilmedi
                      </h2>
                      <p className="text-[11px] text-slate-400 mb-3 leading-snug">
                        Aracınızın kasko veya alış değerini kaydederek finansal takibi başlatabilirsiniz.
                      </p>
                      <button className="px-3.5 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-mono font-black uppercase tracking-wider hover:bg-cyan-400 transition-all flex items-center gap-1.5">
                        ➕ Araç Fiyatı / Değeri Ekle
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tco"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-slate-900 rounded-xl p-6 relative overflow-hidden text-white border border-cyan-500/30 flex flex-col justify-between"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="text-cyan-400" size={18} />
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-300">Gerçek Kayıtlı Harcamalar</span>
                </div>
                <span className="text-xs font-mono bg-cyan-500/20 text-cyan-400 px-2.5 py-1 rounded-full font-bold">
                  Canlı Kayıtlar
                </span>
              </div>

              <div>
                <div className="flex items-baseline gap-2 mb-3">
                  <h2 className="text-3xl font-mono font-black text-white">{formatCurrency(tco.totalCost)}</h2>
                  <span className="text-xs text-slate-400 font-mono">toplam harcama</span>
                </div>

                {/* Expense Breakdown Progress */}
                <div className="space-y-2 mb-3">
                  {tco.breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-300 font-medium">{item.category}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-200">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[9px] text-cyan-400/80 font-mono italic border-t border-white/10 pt-2">
                  ✓ Sadece sizin girdiğiniz gerçek yakıt ve servis fatura kayıtları esas alınır.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Insurances & Taxes Column */}
        <div className="bg-white dark:bg-[#0a0f24]/85 rounded-xl p-5 shadow-sm border border-slate-200 dark:border-white/10 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-xs font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Poliçe & Muayene Takibi</h4>
            {onOpenProSettings && (
              <button
                onClick={onOpenProSettings}
                className="text-[10px] font-mono font-black text-cyan-500 hover:text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 px-2.5 py-1 rounded-lg border border-cyan-500/30 transition-all cursor-pointer flex items-center gap-1"
              >
                ✏️ Tarih / Bilgi Düzenle
              </button>
            )}
          </div>
          
          <div className="space-y-4">
            {realInsurances.map((item) => {
              const hasDate = item.daysLeft !== null;
              const days = item.daysLeft ?? 0;
              const isDanger = hasDate && days <= 15;
              const isWarning = hasDate && days <= 45;
              const statusColorClass = !hasDate ? 'text-slate-400' : isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-cyan-500';
              const statusBgClass = !hasDate ? 'bg-slate-500/10 text-slate-400' : isDanger ? 'bg-red-500/10 text-red-500' : isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-500/10 text-cyan-500';
              const barBgClass = isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-cyan-500';
              const progress = hasDate ? Math.max(5, Math.min(100, (days / 365) * 100)) : 0;
              
              return (
                <div key={item.id} onClick={onOpenProSettings} className="relative group cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 p-2 rounded-xl transition-colors">
                  <div className="flex justify-between items-end mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${statusBgClass}`}>
                        {item.icon}
                      </div>
                      <div>
                        <h5 className="text-xs font-semibold text-slate-900 dark:text-white leading-none">{item.name}</h5>
                        {item.dateStr && (
                          <span className="text-[9px] text-slate-400 font-mono mt-0.5 block">
                            Bitiş: {new Date(item.dateStr).toLocaleDateString("tr-TR")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[11px] font-mono font-black ${statusColorClass}`}>
                        {hasDate ? (days <= 0 ? "SÜRESİ DOLDU" : `${days} Gün Kaldı`) : "➕ Tarih Ekle"}
                      </span>
                    </div>
                  </div>
                  
                  {hasDate ? (
                    <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full rounded-full ${barBgClass}`}
                      />
                    </div>
                  ) : (
                    <p className="text-[9px] text-cyan-500 font-mono font-bold hover:underline">Tıklayarak muayene / kasko tarihini hemen ekleyebilirsiniz ➔</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Valuation Detail Modal */}
      {showValuationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-slate-900 border border-cyan-500/30 rounded-xl p-6 max-w-md w-full text-white space-y-5"
          >
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-lg font-mono font-black text-cyan-400 flex items-center gap-2">
                <Car size={20} /> Araç Değerleme Raporu
              </h3>
              <button onClick={() => setShowValuationModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                <p className="text-xs text-slate-400 font-mono uppercase">Tahmini Piyasa Değeri</p>
                <h2 className="text-3xl font-mono font-black text-white">{formatCurrency(valuation.currentValue)}</h2>
                <p className="text-xs text-cyan-400 mt-1">Piyasa aralığı: {formatCurrency(valuation.minRange)} - {formatCurrency(valuation.maxRange)}</p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Marka / Model:</span>
                  <span className="font-bold">{vehicle?.brand || "Volkswagen"} {vehicle?.model || "Golf"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Model Yılı:</span>
                  <span className="font-bold">{vehicle?.year || "2020"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Kilometre:</span>
                  <span className="font-bold">{vehicle?.km ? `${Number(vehicle.km).toLocaleString()} km` : "75.000 km"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-400">Motor Kodu:</span>
                  <span className="font-mono text-cyan-400 font-bold">{vehicle?.engine_code || "CAYC / 1.6 TDI"}</span>
                </div>
              </div>

              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-[11px] text-cyan-300">
                Bu değerleme Türkiye ikinci el ilan verileri, araç yaşı ve km katsayılarına göre canlı güncellenmektedir.
              </div>
            </div>

            <button
              onClick={() => setShowValuationModal(false)}
              className="w-full py-3 bg-cyan-500 text-black font-black rounded-xl font-mono text-xs uppercase tracking-wider hover:bg-cyan-400 transition-colors"
            >
              Tamam
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default FinancialCockpit;

