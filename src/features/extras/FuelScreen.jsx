import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { ModernCard } from "../../components/Core";
import { FUEL_STATIONS } from "../../constants/mockData";
import { useUI } from "../../context/UIContext";
import { useNavigate } from "react-router-dom";

const FuelScreen = () => {
  const { t, showAlert } = useUI();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setStations(FUEL_STATIONS);
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleSmartPay = () => {
    showAlert("Bilgi", "SmartPay özelliği çok yakında aktif olacak.", "info");
  };

  if (!t) return null;

  return (
    <div className="p-5 pb-32 space-y-6 min-h-screen bg-slate-50 dark:bg-slate-950 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 glass-card rounded-xl text-slate-900 dark:text-white active-scale border border-black/10 dark:border-white/10 hover:bg-black/5 dark:bg-white/5"
        >
          <Icons.ArrowLeft size={20} />
        </button>
        <h3 className="font-black text-2xl text-slate-900 dark:text-white">
          {t.fuelTitle || "Yakıt İstasyonları"}
        </h3>
      </div>

      {/* Simulation Banner */}
      <div className="glass-card border border-primary-500/20 bg-primary-500/5 p-4 rounded-2xl flex items-center gap-3">
        <div className="bg-primary-500/10 p-2 rounded-lg text-primary-400">
          <Icons.Info size={16} />
        </div>
        <div>
          <p className="text-[10px] text-primary-400 font-black uppercase tracking-widest font-sans">
            MOCK GÖRÜNÜM
          </p>
          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider font-sans mt-0.5">
            Bu ekrandaki veriler canlı simülasyon test ortamından alınmaktadır.
          </p>
        </div>
      </div>

      {/* SmartPay Card */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 text-slate-900 dark:text-white p-6 rounded-3xl shadow-2xl relative overflow-hidden group hover:shadow-red-600/50 transition duration-500">
        <Icons.Fuel
          size={120}
          className="absolute -right-6 -bottom-6 text-slate-900 dark:text-white/20 group-hover:text-slate-900 dark:text-white/30 transition"
        />
        <p className="font-bold text-slate-900 dark:text-white/80">{t.payInCar}</p>
        <h2 className="text-3xl font-black mt-1">SmartPay</h2>
        <button
          onClick={handleSmartPay}
          className="mt-6 bg-white text-red-600 px-6 py-3 rounded-xl font-bold shadow-md hover:bg-red-50 transition active-scale flex items-center gap-2"
        >
          <Icons.CreditCard size={18} /> {t.pay}
        </button>
      </div>

      <h4 className="font-bold text-slate-600 dark:text-slate-300 tracking-wider text-sm uppercase">{t.nearbyStations}</h4>

      {/* List */}
      {loading ? (
        <div className="flex justify-center items-center py-10">
          <Icons.RefreshCw className="animate-spin text-red-500" size={32} />
        </div>
      ) : (
        <div className="space-y-4">
          {stations.map((s, idx) => {
            const animationStyle = { animationDelay: `${idx * 100}ms` };
            return (
              <ModernCard
                key={s.id}
                className="flex justify-between items-center border-black/5 dark:border-white/5 bg-white dark:bg-slate-900 shadow-xl hover:shadow-2xl hover:border-red-600/50 transition-all cursor-pointer animate-in fade-in slide-in-from-bottom-4"
                style={animationStyle}
                onClick={() => showAlert("İstasyon Seçildi", `${s.name} istasyonuna yol tarifi başlatılıyor...`, "success")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 p-2.5 rounded-xl border border-red-500/20">
                    <Icons.Droplet size={20} className="text-red-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white tracking-tight">{s.name}</h4>
                    <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mt-1">
                      {s.distance} • {s.type}
                    </p>
                  </div>
                </div>
                <span className="font-black text-red-400 text-lg">
                  {s.price} ₺
                </span>
              </ModernCard>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FuelScreen;
