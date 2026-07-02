import React, { useState } from "react";
import * as Icons from "lucide-react";

const CarwashProfileForm = ({ data, onUpdate }) => {
  const [profileData, setProfileData] = useState({
    company_name: data?.company_name || "",
    base_price: data?.base_price || "",
    service_radius_km: data?.service_radius_km || 10,
    has_own_water_tank: data?.has_own_water_tank || false,
    has_generator: data?.has_generator || false,
    is_eco_friendly: data?.is_eco_friendly || false,
  });

  const handleChange = (field, value) => {
    const updated = { ...profileData, [field]: value };
    setProfileData(updated);
    if (onUpdate) onUpdate(updated);
  };

  return (
    <div className="space-y-8">
      {/* Şirket Adı & Temel Bilgiler */}
      <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Icons.Droplet size={18} className="text-cyan-500" /> Temel İşletme Bilgileri
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Şirket / Ünvan Adı</label>
            <input 
              type="text"
              value={profileData.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Standart İç-Dış Yıkama Fiyatı (₺)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
              <input 
                type="number"
                placeholder="Örn: 400"
                value={profileData.base_price}
                onChange={(e) => handleChange("base_price", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 pl-10 text-slate-900 dark:text-white text-sm outline-none focus:border-cyan-500 transition-colors font-bold"
              />
            </div>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Hizmet Yarıçapı (KM)</label>
            <div className="flex items-center gap-3">
              <input 
                type="range" 
                min="1" 
                max="100" 
                value={profileData.service_radius_km}
                onChange={(e) => handleChange("service_radius_km", parseInt(e.target.value))}
                className="flex-1 accent-cyan-500"
              />
              <span className="text-sm font-bold text-slate-900 dark:text-white min-w-[3rem] text-center bg-black/5 dark:bg-white/5 py-1 px-2 rounded-lg">
                {profileData.service_radius_km} km
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Ekipman & Teknik Kapasite */}
      <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Icons.Tool size={18} className="text-cyan-500" /> Ekipman ve Teknik Altyapı
        </h3>
        
        <div className="space-y-4">
          <button 
            onClick={() => handleChange("has_own_water_tank", !profileData.has_own_water_tank)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              profileData.has_own_water_tank 
                ? "bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-400" 
                : "bg-slate-50 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-black/20 dark:hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${profileData.has_own_water_tank ? "bg-cyan-500/20" : "bg-black/10 dark:bg-white/10"}`}>
                <Icons.Database size={16} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Kendi Su Tankım Var</div>
                <div className="text-xs opacity-70">Müşterinin su hattına ihtiyaç duymadan yıkama yapabilirim.</div>
              </div>
            </div>
            {profileData.has_own_water_tank && <Icons.CheckCircle2 size={20} className="text-cyan-500" />}
          </button>

          <button 
            onClick={() => handleChange("has_generator", !profileData.has_generator)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              profileData.has_generator 
                ? "bg-cyan-500/10 border-cyan-500 text-cyan-700 dark:text-cyan-400" 
                : "bg-slate-50 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-black/20 dark:hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${profileData.has_generator ? "bg-cyan-500/20" : "bg-black/10 dark:bg-white/10"}`}>
                <Icons.Zap size={16} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Jeneratörüm Var</div>
                <div className="text-xs opacity-70">Müşterinin elektriğine ihtiyaç duymadan cihazlarımı çalıştırabilirim.</div>
              </div>
            </div>
            {profileData.has_generator && <Icons.CheckCircle2 size={20} className="text-cyan-500" />}
          </button>

          <button 
            onClick={() => handleChange("is_eco_friendly", !profileData.is_eco_friendly)}
            className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
              profileData.is_eco_friendly 
                ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400" 
                : "bg-slate-50 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:border-black/20 dark:hover:border-white/20"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${profileData.is_eco_friendly ? "bg-emerald-500/20" : "bg-black/10 dark:bg-white/10"}`}>
                <Icons.Leaf size={16} />
              </div>
              <div className="text-left">
                <div className="text-sm font-bold">Çevre Dostu Ürünler Kullanıyorum</div>
                <div className="text-xs opacity-70">Doğaya zarar vermeyen, bio-çözünür yıkama kimyasalları kullanıyorum.</div>
              </div>
            </div>
            {profileData.is_eco_friendly && <Icons.CheckCircle2 size={20} className="text-emerald-500" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CarwashProfileForm;
