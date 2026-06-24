import React, { useState } from "react";
import * as Icons from "lucide-react";
import { cn } from "../../../lib/utils";

const ValetProfileForm = ({ data, onUpdate }) => {
  const [valetData, setValetData] = useState({
    base_price: data?.base_price || 0,
    service_radius_km: data?.service_radius_km || 10,
    experience_years: data?.experience_years || 1,
    license_type: data?.license_type || "B",
    bio: data?.bio || "",
    is_active_now: data?.is_active_now || false,
    insurance_verified: data?.insurance_verified || false,
    max_concurrent_cars: data?.max_concurrent_cars || 1,
  });

  const handleChange = (field, value) => {
    const updated = { ...valetData, [field]: value };
    setValetData(updated);
    onUpdate(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-primary-400">
          <Icons.Car size={20} />
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Vale Hizmet Bilgileri</h2>
          <p className="text-sm text-slate-500 font-sans">Vale operasyonuna özel çalışma parametreleri</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Taban Hizmet Bedeli</span>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3">
            <Icons.Banknote size={18} className="text-primary-400" />
            <input
              type="number"
              value={valetData.base_price}
              onChange={(e) => handleChange("base_price", Number(e.target.value))}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none font-sans"
            />
            <span className="text-xs text-slate-500 font-bold uppercase">TRY</span>
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Hizmet Yarıçapı</span>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3">
            <Icons.MapPin size={18} className="text-primary-400" />
            <input
              type="number"
              value={valetData.service_radius_km}
              onChange={(e) => handleChange("service_radius_km", Number(e.target.value))}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none font-sans"
            />
            <span className="text-xs text-slate-500 font-bold uppercase">KM</span>
          </div>
        </label>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Ehliyet Sınıfı</span>
          <select
            value={valetData.license_type}
            onChange={(e) => handleChange("license_type", e.target.value)}
            className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none font-sans appearance-none"
          >
            <option value="B">B - Otomobil</option>
            <option value="A2">A2 - Motosiklet</option>
            <option value="C">C - Kamyon</option>
            <option value="D">D - Otobüs</option>
          </select>
        </label>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => handleChange("is_active_now", !valetData.is_active_now)}
            className={cn(
              "w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between group",
              valetData.is_active_now 
                ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400" 
                : "bg-slate-100 dark:bg-slate-800 border-black/5 dark:border-white/5 text-slate-500 hover:border-black/10 dark:border-white/10"
            )}
          >
            <div className="flex items-center gap-2">
              <Icons.Power size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-left">Çalışma Durumu</span>
            </div>
            <div className={cn(
               "w-3 h-3 rounded-full animate-pulse",
               valetData.is_active_now ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.6)]" : "bg-slate-600"
            )} />
          </button>

          <div className={cn(
            "w-full p-4 rounded-2xl border flex items-center justify-between",
            valetData.insurance_verified ? "bg-blue-500/10 border-blue-500/20 text-blue-400" : "bg-slate-100 dark:bg-slate-800/50 border-black/5 dark:border-white/5 text-slate-500"
          )}>
            <div className="flex items-center gap-2">
              <Icons.ShieldCheck size={14} />
              <span className="text-[10px] font-black uppercase tracking-widest text-left">Sigorta Doğrulama</span>
            </div>
            {valetData.insurance_verified ? <Icons.CheckCircle2 size={16} /> : <Icons.AlertCircle size={16} className="opacity-50" />}
          </div>
        </div>

        <label className="space-y-2">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Aynı Anda Max Araç</span>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3">
            <Icons.Layers size={18} className="text-primary-400" />
            <input
              type="number"
              value={valetData.max_concurrent_cars}
              onChange={(e) => handleChange("max_concurrent_cars", Number(e.target.value))}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none font-sans"
              min="1"
              max="10"
            />
          </div>
        </label>
      </div>

      <label className="block space-y-2">
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Vale Tanıtım Yazısı / Bio</span>
        <textarea
          value={valetData.bio}
          onChange={(e) => handleChange("bio", e.target.value)}
          placeholder="Müşterilerin sizi neden tercih etmesi gerektiğini açıklayın..."
          className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-3xl px-6 py-4 text-sm text-slate-900 dark:text-white outline-none min-h-[100px] font-sans resize-none"
        />
      </label>
    </div>
  );
};

export default ValetProfileForm;
