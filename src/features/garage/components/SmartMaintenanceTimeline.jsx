import React from "react";
import { CheckCircle2, Clock, Calendar, AlertTriangle, ShieldCheck, Wrench, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

const SmartMaintenanceTimeline = ({ vehicle, onBookMaintenance }) => {
  const km = Number(vehicle?.km) || 45000;
  const maintenanceInterval = 15000;
  const nextMaintenanceKm = Math.ceil((km + 1) / maintenanceInterval) * maintenanceInterval;
  const remainingKm = nextMaintenanceKm - km;

  // Periodic Maintenance Plan Items based on manufacturer standards
  const timelineItems = [
    {
      km: 15000,
      title: "1. Periyodik Bakım",
      parts: ["Motor Yağı", "Yağ Filtresi", "Polen Filtresi", "Genel Kontrol"],
      status: km >= 15000 ? "completed" : km >= 12000 ? "due_soon" : "upcoming"
    },
    {
      km: 30000,
      title: "2. Periyodik Bakım",
      parts: ["Motor Yağı", "Yağ Filtresi", "Hava Filtresi", "Buji / Kızdırma", "Fren Sıvısı"],
      status: km >= 30000 ? "completed" : km >= 27000 ? "due_soon" : "upcoming"
    },
    {
      km: 45000,
      title: "3. Periyodik Bakım",
      parts: ["Motor Yağı", "Yağ Filtresi", "Polen Filtresi", "Fren Balataları", "Yakıt Filtresi"],
      status: km >= 45000 ? "completed" : km >= 42000 ? "due_soon" : "upcoming"
    },
    {
      km: 60000,
      title: "4. Ağır Bakım (Triger / Şanzıman)",
      parts: ["Triger Seti / V-Kayışı", "Şanzıman Yağı", "Buji Seti", "Tüm Filtreler", "Antifriz"],
      status: km >= 60000 ? "completed" : km >= 57000 ? "due_soon" : "upcoming"
    },
    {
      km: 75000,
      title: "5. Periyodik Bakım",
      parts: ["Motor Yağı", "Yağ Filtresi", "Hava Filtresi", "Polen Filtresi", "Süspansiyon Kontrolü"],
      status: km >= 75000 ? "completed" : km >= 72000 ? "due_soon" : "upcoming"
    }
  ];

  return (
    <div className="bg-[#0a0f24]/80 rounded-[2.5rem] p-6 border border-white/10 shadow-xl backdrop-blur-2xl mb-8">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Calendar size={18} />
            </span>
            <div>
              <h3 className="text-lg font-mono font-black text-white uppercase tracking-tight">
                Üretici Uyumlu Akıllı Bakım Takvimi
              </h3>
              <p className="text-xs text-slate-400">
                {vehicle?.brand ? `${vehicle.brand} ${vehicle.model}` : "Aracınız"} için KM bazlı fabrika bakım periyotları
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-cyan-500/20">
          <Clock size={16} className="text-cyan-400 animate-pulse" />
          <div className="text-right">
            <p className="text-[10px] font-mono text-slate-400 uppercase">Sonraki Bakıma</p>
            <p className="text-sm font-mono font-black text-cyan-400">{remainingKm.toLocaleString()} KM kaldı</p>
          </div>
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-white/10">
        {timelineItems.map((item, idx) => {
          const isCompleted = item.status === "completed";
          const isDueSoon = item.status === "due_soon";

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`relative flex items-start gap-4 p-4 rounded-2xl border transition-all ${
                isCompleted
                  ? "bg-white/5 border-white/10 opacity-75"
                  : isDueSoon
                  ? "bg-amber-500/10 border-amber-500/30 shadow-lg shadow-amber-500/5"
                  : "bg-black/30 border-white/5"
              }`}
            >
              {/* Bullet Node */}
              <div className={`absolute -left-6 top-5 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-bold ${
                isCompleted
                  ? "bg-emerald-500 border-emerald-400 text-black"
                  : isDueSoon
                  ? "bg-amber-500 border-amber-400 text-black animate-ping-slow"
                  : "bg-slate-800 border-slate-600 text-slate-400"
              }`}>
                {isCompleted ? "✓" : "•"}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                    {item.title}
                    {isCompleted && <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-md">Tamamlandı</span>}
                    {isDueSoon && <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-md animate-pulse">Zamanı Geldi</span>}
                  </h4>
                  <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg">
                    {item.km.toLocaleString()} KM
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {item.parts.map((part, pIdx) => (
                    <span
                      key={pIdx}
                      className="text-[11px] bg-white/5 border border-white/10 text-slate-300 px-2.5 py-1 rounded-lg"
                    >
                      {part}
                    </span>
                  ))}
                </div>
              </div>

              {isDueSoon && (
                <button
                  onClick={onBookMaintenance}
                  className="shrink-0 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-black font-mono font-black text-xs rounded-xl hover:brightness-110 transition-all flex items-center gap-1 shadow-md"
                >
                  <Wrench size={14} /> Randevu Al
                </button>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartMaintenanceTimeline;
