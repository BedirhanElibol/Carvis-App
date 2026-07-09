import React, { useState } from "react";
import { CheckCircle2, Globe, Phone, Shield, Webhook } from "lucide-react";

const COMPANY_TYPES = [
  { id: "kasko", label: "Kasko", emoji: "🚗" },
  { id: "trafik", label: "Trafik Sigortası", emoji: "📋" },
  { id: "ferdi_kaza", label: "Ferdi Kaza", emoji: "🏥" },
  { id: "roadside", label: "Yol Yardım Sigortası", emoji: "🛣️" },
  { id: "green_card", label: "Yeşil Kart", emoji: "🌍" },
  { id: "konut", label: "Konut & İşyeri", emoji: "🏠" },
];

const InsuranceProfileForm = ({ data, onUpdate }) => {
  const [profileData, setProfileData] = useState({
    company_name: data?.company_name || "",
    license_number: data?.license_number || "",
    company_type: data?.company_type || [],
    monthly_premium_min: data?.monthly_premium_min || "",
    monthly_premium_max: data?.monthly_premium_max || "",
    claim_response_hours: data?.claim_response_hours || 24,
    is_digital_policy: data?.is_digital_policy ?? true,
    partner_garage_network_count: data?.partner_garage_network_count || 0,
    is_rapidsy_integrated: data?.is_rapidsy_integrated ?? false,
    api_webhook_url: data?.api_webhook_url || "",
    contact_phone: data?.contact_phone || "",
    is_24_7_support: data?.is_24_7_support ?? false,
  });

  const handleChange = (field, value) => {
    const updated = { ...profileData, [field]: value };
    setProfileData(updated);
    if (onUpdate) onUpdate(updated);
  };

  const toggleType = (typeId) => {
    const current = profileData.company_type;
    const updated = current.includes(typeId)
      ? current.filter((t) => t !== typeId)
      : [...current, typeId];
    handleChange("company_type", updated);
  };

  return (
    <div className="space-y-8">
      {/* Temel Firma Bilgileri */}
      <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-6 flex items-center gap-2">
          <Shield size={18} className="text-blue-500" /> Sigorta Şirketi Bilgileri
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <label className="space-y-2 md:col-span-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Şirket Adı</span>
            <input
              type="text"
              value={profileData.company_name}
              onChange={(e) => handleChange("company_name", e.target.value)}
              placeholder="Örn: Güvence Sigorta A.Ş."
              className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Sigortacılık Lisans No
            </span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5">
              <Shield size={16} className="text-blue-400 shrink-0" />
              <input
                type="text"
                value={profileData.license_number}
                onChange={(e) => handleChange("license_number", e.target.value)}
                placeholder="Hazine Müsteşarlığı lisans no"
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">İletişim Telefonu</span>
            <div className="flex items-center gap-2 bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2.5">
              <Phone size={16} className="text-blue-400 shrink-0" />
              <input
                type="tel"
                value={profileData.contact_phone}
                onChange={(e) => handleChange("contact_phone", e.target.value)}
                placeholder="0850 XXX XX XX"
                className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Aylık Prim Min (₺)</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
              <input
                type="number"
                value={profileData.monthly_premium_min}
                onChange={(e) => handleChange("monthly_premium_min", e.target.value)}
                placeholder="Örn: 500"
                className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 pl-10 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Aylık Prim Max (₺)</span>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
              <input
                type="number"
                value={profileData.monthly_premium_max}
                onChange={(e) => handleChange("monthly_premium_max", e.target.value)}
                placeholder="Örn: 5000"
                className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 pl-10 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors"
              />
            </div>
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Hasar Çözüm Süresi (Saat)</span>
            <input
              type="number"
              min="1"
              value={profileData.claim_response_hours}
              onChange={(e) => handleChange("claim_response_hours", parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </label>

          <label className="space-y-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">Anlaşmalı Servis Sayısı</span>
            <input
              type="number"
              min="0"
              value={profileData.partner_garage_network_count}
              onChange={(e) => handleChange("partner_garage_network_count", parseInt(e.target.value))}
              className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm outline-none focus:border-blue-500 transition-colors"
            />
          </label>
        </div>
      </div>

      {/* Sigorta Tipleri */}
      <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">
          Sunulan Ürünler / Poliçe Tipleri
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {COMPANY_TYPES.map((type) => {
            const isSelected = profileData.company_type.includes(type.id);
            return (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className={`p-3 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400"
                    : "bg-slate-50 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-600 dark:text-slate-400"
                }`}
              >
                <div className="text-lg mb-1">{type.emoji}</div>
                <div className="text-xs font-bold">{type.label}</div>
                {isSelected && <CheckCircle2 size={12} className="mt-1 text-blue-500" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Platform Entegrasyonu */}
      <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest mb-4">
          Dijital & Platform Özellikleri
        </h3>

        <button
          onClick={() => handleChange("is_digital_policy", !profileData.is_digital_policy)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
            profileData.is_digital_policy
              ? "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400"
              : "bg-slate-50 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${profileData.is_digital_policy ? "bg-blue-500/20" : "bg-black/10 dark:bg-white/10"}`}>
              <Globe size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Dijital Poliçe</div>
              <div className="text-xs opacity-70">Anlık online poliçe düzenliyorum</div>
            </div>
          </div>
          {profileData.is_digital_policy && <CheckCircle2 size={18} className="text-blue-500" />}
        </button>

        <button
          onClick={() => handleChange("is_24_7_support", !profileData.is_24_7_support)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
            profileData.is_24_7_support
              ? "bg-blue-500/10 border-blue-500 text-blue-700 dark:text-blue-400"
              : "bg-slate-50 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${profileData.is_24_7_support ? "bg-blue-500/20" : "bg-black/10 dark:bg-white/10"}`}>
              <Phone size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">7/24 Hasar Desteği</div>
              <div className="text-xs opacity-70">Gece ve acil durumlarda hasar bildirimi alıyorum</div>
            </div>
          </div>
          {profileData.is_24_7_support && <CheckCircle2 size={18} className="text-blue-500" />}
        </button>

        <button
          onClick={() => handleChange("is_rapidsy_integrated", !profileData.is_rapidsy_integrated)}
          className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
            profileData.is_rapidsy_integrated
              ? "bg-emerald-500/10 border-emerald-500 text-emerald-700 dark:text-emerald-400"
              : "bg-slate-50 dark:bg-black/20 border-black/10 dark:border-white/10 text-slate-700 dark:text-slate-300"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${profileData.is_rapidsy_integrated ? "bg-emerald-500/20" : "bg-black/10 dark:bg-white/10"}`}>
              <Webhook size={16} />
            </div>
            <div className="text-left">
              <div className="text-sm font-bold">Rapidsy Hasar Entegrasyonu</div>
              <div className="text-xs opacity-70">Müşteri hasar bildirdiğinde otomatik bildirim alırım</div>
            </div>
          </div>
          {profileData.is_rapidsy_integrated && <CheckCircle2 size={18} className="text-emerald-500" />}
        </button>

        {profileData.is_rapidsy_integrated && (
          <label className="space-y-2 pt-2">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500">
              Webhook URL (Hasar Bildirimi)
            </span>
            <input
              type="url"
              value={profileData.api_webhook_url}
              onChange={(e) => handleChange("api_webhook_url", e.target.value)}
              placeholder="https://api.sigorta.com.tr/webhook/rapidsy"
              className="w-full bg-slate-50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl p-3 text-slate-900 dark:text-white text-sm outline-none focus:border-emerald-500 transition-colors font-mono"
            />
          </label>
        )}
      </div>
    </div>
  );
};

export default InsuranceProfileForm;
