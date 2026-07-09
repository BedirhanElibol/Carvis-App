import React, { useState } from "react";
import { CheckCircle2, MapPin, Truck, Zap } from "lucide-react";

const SERVICE_TYPES = [
  { id: "towing", label: "Çekici Hizmeti", emoji: "🚛" },
  { id: "tire_change", label: "Lastik Değişimi", emoji: "🔧" },
  { id: "battery_boost", label: "Akü Takviyesi", emoji: "⚡" },
  { id: "fuel_delivery", label: "Yakıt İkmali", emoji: "⛽" },
  { id: "lockout", label: "Araç Açma", emoji: "🔑" },
  { id: "towing_only", label: "Sadece Nakliye", emoji: "🏗️" },
];

const TowTruckProfileForm = ({ data, onUpdate }) => {
  const [profileData, setProfileData] = useState({
    company_name: data?.company_name || "",
    service_types: data?.service_types || ["towing"],
    truck_capacity_tons: data?.truck_capacity_tons || 2.0,
    is_24_7: data?.is_24_7 ?? false,
    response_time_minutes: data?.response_time_minutes || 20,
    coverage_provinces: data?.coverage_provinces || [],
    has_flatbed: data?.has_flatbed ?? false,
    base_price: data?.base_price || "",
    price_per_km: data?.price_per_km || "",
  });

  const [newProvince, setNewProvince] = useState("");

  const handleChange = (field, value) => {
    const updated = { ...profileData, [field]: value };
    setProfileData(updated);
    if (onUpdate) onUpdate(updated);
  };

  const toggleService = (serviceId) => {
    const current = profileData.service_types;
    const updated = current.includes(serviceId)
      ? current.filter((s) => s !== serviceId)
      : [...current, serviceId];
    handleChange("service_types", updated);
  };

  const addProvince = () => {
    if (newProvince && !profileData.coverage_provinces.includes(newProvince)) {
      handleChange("coverage_provinces", [...profileData.coverage_provinces, newProvince]);
      setNewProvince("");
    }
  };

  const removeProvince = (province) => {
    handleChange("coverage_provinces", profileData.coverage_provinces.filter((p) => p !== province));
  };

  return (
    <div className="space-y-8">
      {/* Temel Bilgiler */}
      <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Truck size={18} className="text-orange-500" /> Çekici & Yol Yardım Bilgileri
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Firma Adı</span>
            <input
              type="text"
              value={profileData.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              placeholder="Örn: Hızlı Yol Yardım A.Ş."
              className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm outline-none focus:border-orange-500 transition-colors"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Temel Ücret (₺)</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
              <input
                type="number"
                placeholder="Örn: 500"
                value={profileData.base_price}
                onChange={(e) => handleChange("base_price", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 pl-10 text-slate-900 dark:text-white text-sm outline-none focus:border-orange-500 transition-colors font-bold"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">KM Başı Ücret (₺)</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
              <input
                type="number"
                placeholder="Örn: 15"
                value={profileData.price_per_km}
                onChange={(e) => handleChange("price_per_km", e.target.value)}
                className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 pl-10 text-slate-900 dark:text-white text-sm outline-none focus:border-orange-500 transition-colors font-bold"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Araç Kapasitesi (Ton)</span>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={profileData.truck_capacity_tons}
              onChange={(e) => handleChange("truck_capacity_tons", parseFloat(e.target.value))}
              className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm outline-none focus:border-orange-500 transition-colors"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Ortalama Müdahale (dk)</span>
            <input
              type="number"
              min="5"
              value={profileData.response_time_minutes}
              onChange={(e) => handleChange("response_time_minutes", parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm outline-none focus:border-orange-500 transition-colors"
            />
          </label>
        </div>
      </div>

      {/* Hizmet Tipleri */}
      <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">
          Sunulan Hizmetler
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SERVICE_TYPES.map((service) => {
            const isSelected = profileData.service_types.includes(service.id);
            return (
              <button
                key={service.id}
                onClick={() => toggleService(service.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "bg-orange-500/10 border-orange-500 text-orange-600 dark:text-orange-400"
                    : "bg-slate-50 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-lg mb-1">{service.emoji}</div>
                <div className="text-xs font-bold">{service.label}</div>
                {isSelected && <CheckCircle2 size={12} className="mt-1 text-orange-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kapasiteler */}
      <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <Zap size={16} className="text-orange-500" /> Operasyonel Özellikler
        </h3>

        <button
          onClick={() => handleChange("is_24_7", !profileData.is_24_7)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
            profileData.is_24_7
              ? "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400"
              : "bg-slate-50 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${profileData.is_24_7 ? "bg-orange-500/20" : "bg-black/10 dark:bg-white/10"}`}>
              <span className="text-sm">🌙</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">7/24 Hizmet</div>
              <div className="text-xs opacity-70">Gece ve hafta sonu da aktifim</div>
            </div>
          </div>
          {profileData.is_24_7 && <CheckCircle2 size={18} className="text-orange-500" />}
        </button>

        <button
          onClick={() => handleChange("has_flatbed", !profileData.has_flatbed)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
            profileData.has_flatbed
              ? "bg-orange-500/10 border-orange-500 text-orange-700 dark:text-orange-400"
              : "bg-slate-50 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${profileData.has_flatbed ? "bg-orange-500/20" : "bg-black/10 dark:bg-white/10"}`}>
              <span className="text-sm">🏗️</span>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Flatbed (Düz Platform) Var</div>
              <div className="text-xs opacity-70">Lüks ve spor araçları güvenli taşıyabilirim</div>
            </div>
          </div>
          {profileData.has_flatbed && <CheckCircle2 size={18} className="text-orange-500" />}
        </button>
      </div>

      {/* Kapsama Alanı */}
      <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
          <MapPin size={16} className="text-orange-500" /> Hizmet Verilen İller
        </h3>
        <div className="flex flex-wrap gap-2 mb-3">
          {profileData.coverage_provinces.map((province) => (
            <span
              key={province}
              className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800/40 px-3 py-1.5 rounded-lg text-xs font-bold text-orange-700 dark:text-orange-400"
            >
              {province}
              <button
                onClick={() => removeProvince(province)}
                className="text-orange-400 hover:text-red-500 transition-colors"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newProvince}
            onChange={(e) => setNewProvince(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addProvince()}
            placeholder="İl ekle (Örn: İstanbul)"
            className="flex-1 bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2 text-sm text-slate-900 dark:text-white outline-none focus:border-orange-500 transition-colors"
          />
          <button
            onClick={addProvince}
            className="bg-orange-500 hover:bg-orange-400 text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors"
          >
            Ekle
          </button>
        </div>
      </div>
    </div>
  );
};

export default TowTruckProfileForm;
