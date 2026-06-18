import React from "react";
import * as Icons from "lucide-react";

/**
 * PredictiveMaintenanceCard Component
 * Displays smart maintenance progress and suggestions based on vehicle state.
 */
const PredictiveMaintenanceCard = ({
  currentVehicle,
  t,
  setActiveTab,
  onShowHistory,
}) => {
  // Örnek mantık: KM'ye göre bakım yüzdesi hesaplama (15.000km periyodu baz alınır)
  const km = Number(currentVehicle?.km) || 0;
  const maintenanceInterval = 15000;
  const progress = Math.min(
    ((km % maintenanceInterval) / maintenanceInterval) * 100,
    100,
  );
  const isCritical = progress > 85;
  const isWarning = progress > 70;

  return (
    <div className="glass-card rounded-[2.5rem] p-6 border border-white/5 relative overflow-hidden group">
      {/* Background Glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 transition-colors duration-500 ${
          isCritical
            ? "bg-red-500"
            : isWarning
              ? "bg-amber-500"
              : "bg-primary-500"
        }`}
      ></div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-white/5 flex items-center justify-center shadow-inner">
            <Icons.Settings
              size={20}
              className="text-primary-400 group-hover:rotate-90 transition-transform duration-500"
            />
          </div>
          <div>
            <h4 className="text-sm font-black tracking-tighter text-white uppercase">
              Akıllı Bakım
            </h4>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
              {t?.predictiveTitle || "Arıza Tahmini"}
            </p>
          </div>
        </div>
        {isCritical && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full animate-pulse">
            <Icons.AlertCircle size={10} className="text-red-500" />
            <span className="text-[8px] font-black text-red-500 uppercase">
              Kritik
            </span>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-widest">
            <span>Servis Ömrü</span>
            <span className={isCritical ? "text-red-400" : "text-primary-400"}>
              %{Math.round(progress)}
            </span>
          </div>
          <div className="h-2.5 bg-slate-900 rounded-full overflow-hidden border border-white/5 p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${
                isCritical
                  ? "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                  : isWarning
                    ? "bg-amber-500"
                    : "bg-primary-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-900/40 rounded-2xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Icons.Clock size={12} className="text-primary-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase">
                KALAN KM
              </span>
            </div>
            <p className="text-lg font-black text-white">
              {Math.max(
                maintenanceInterval - (km % maintenanceInterval),
                0,
              ).toLocaleString()}
            </p>
          </div>
          <div className="bg-slate-900/40 rounded-2xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Icons.Activity size={12} className="text-accent-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase">
                SAĞLIK PUANI
              </span>
            </div>
            <p className="text-lg font-black text-white">A+</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("parts")}
            className="flex-1 py-3.5 bg-white text-black rounded-2xl font-black text-xs tracking-tighter hover:bg-slate-200 transition-all active-scale-95 uppercase flex items-center justify-center gap-2"
          >
            Parça Bak <Icons.ChevronRight size={14} />
          </button>
          <button
            onClick={onShowHistory}
            className="px-5 py-3.5 glass-card border border-white/10 text-white rounded-2xl font-black text-xs tracking-tighter hover:bg-white/5 transition-all active-scale-95 uppercase"
          >
            Geçmiş
          </button>
        </div>
      </div>
    </div>
  );
};

export default PredictiveMaintenanceCard;
