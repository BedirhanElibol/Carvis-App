import React, { useState, useEffect, useMemo } from "react";
import { Building2, Loader2, MapPinned, ShieldCheck } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { supabase } from "../../supabaseClient";

// Optimized Imports for Specialized Profiles

import MechanicProfileForm from "./components/MechanicProfileForm";
import ProductProfileForm from "./components/ProductProfileForm";
import CarwashProfileForm from "./components/CarwashProfileForm";

const PartnerSettingsScreen = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [profile, setProfile] = useState({
    businessName:
      currentUser?.company_name || currentUser?.full_name || "Carvis Partner",
    contactPhone: currentUser?.phone_number || currentUser?.phone || "",
    serviceRadius: 12,
    payoutIban: "TR00 0000 0000 0000 0000 0000 00",
  });
  const [preferences, setPreferences] = useState({
    notifications: true,
    autoApproveQuotes: false,
    onlineStatus: true,
    weekendMode: true,
  });

  const [specializedData, setSpecializedData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch specialized data based on role
  useEffect(() => {
    const fetchSpecializedData = async () => {
      if (!currentUser?.id) return;

      let tableName = "";
      switch (currentUser.role) {

        case "mechanic":
          tableName = "mechanic_shops";
          break;
        case "parts":
          tableName = "parts_profiles";
          break;
        case "carwash":
          tableName = "carwash_profiles";
          break;
        default:
          return;
      }

      const { data } = await supabase
        .from(tableName)
        .select("*")
        .eq(tableName === "mechanic_shops" ? "seller_id" : "id", currentUser.id)
        .maybeSingle();

      if (data) setSpecializedData(data);
    };

    fetchSpecializedData();
  }, [currentUser]);

  const completionRate = useMemo(() => {
    const enabledCount = Object.values(preferences).filter(Boolean).length;
    return Math.round((enabledCount / Object.keys(preferences).length) * 100);
  }, [preferences]);

  const updatePreference = (key) => {
    setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Pre-flight check: Is phone number already in use?
      if (profile.contactPhone !== (currentUser?.phone_number || "")) {
        const { data: existing } = await supabase
          .from("profiles")
          .select("id")
          .eq("phone_number", profile.contactPhone)
          .maybeSingle();

        if (existing && existing.id !== currentUser.id) {
          throw new Error("Bu telefon numarası zaten başka bir hesap tarafından kullanılıyor.");
        }
      }

      // 2. Update Base Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          company_name: profile.businessName,
          phone_number: profile.contactPhone,
        })
        .eq("id", currentUser.id);

      if (profileError) {
        if (profileError.code === "23505") { // Unique violation
          throw new Error("Bu telefon numarası veya işletme bilgisi sistemde kayıtlı.");
        }
        throw profileError;
      }

      // 3. Update Specialized Profile
      if (specializedData) {
        let tableName = "";
        let filterField = "id";
        
        switch (currentUser.role) {

          case "mechanic": 
            tableName = "mechanic_shops"; 
            filterField = "seller_id";
            break;
          case "parts": tableName = "parts_profiles"; break;
          case "carwash": tableName = "carwash_profiles"; break;
          default: break;
        }

        if (tableName) {
          const { error: specError } = await supabase
            .from(tableName)
            .upsert({
              ...specializedData,
              [filterField]: currentUser.id
            }, { onConflict: filterField });
          
          if (specError) throw specError;
        }
      }

      showAlert(
        "Ayarlar Kaydedildi",
        "İşletme ve operasyon tercihleriniz başarıyla güncellendi.",
        "success"
      );
    } catch (err) {
      console.error("Save error:", err);
      showAlert("Hata Oluştu", err.message || "Ayarlar kaydedilirken bir sorun oluştu.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const renderSpecializedForm = () => {
    const props = {
      data: specializedData,
      onUpdate: (newData) => setSpecializedData(newData)
    };

    switch (currentUser?.role) {

      case "mechanic": return <MechanicProfileForm {...props} />;
      case "parts": return <ProductProfileForm {...props} />;
      case "carwash": return <CarwashProfileForm {...props} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8 pb-24">
      <section className="glass-card rounded-[2.5rem] border border-black/5 dark:border-white/5 p-8 relative overflow-hidden">
        <div className="absolute top-[-60px] right-[-60px] w-48 h-48 bg-primary-500/15 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <p className="text-[10px] text-primary-400 uppercase tracking-[0.35em] font-black mb-3">
              Partner Settings
            </p>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-3">
              Operasyon ayarlarını tek merkezden yönet
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-2xl leading-relaxed">
              Hizmet görünürlüğü, teklif akışı, ödeme hesabı ve çalışma
              tercihlerini düzenleyerek partner panelini aktif kullanım için
              tamamla.
            </p>
          </div>
          <div className="rounded-[2rem] border border-primary-500/20 bg-primary-500/10 px-6 py-5 min-w-[220px]">
            <p className="text-[10px] uppercase tracking-[0.25em] text-primary-300 font-black mb-2">
              Hazırlık Seviyesi
            </p>
            <p className="text-4xl font-black text-slate-900 dark:text-white">%{completionRate}</p>
            <p className="text-xs text-primary-200 mt-2">
              Temel operasyon tercihleri yapılandırıldı.
            </p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="glass-card rounded-[2rem] border border-black/5 dark:border-white/5 p-6 space-y-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-primary-400">
              <Building2 size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">İşletme Profili</h2>
              <p className="text-sm text-slate-500">
                Müşterilere görünen temel operasyon bilgileri
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                İşletme Adı
              </span>
              <input
                value={profile.businessName}
                onChange={(event) =>
                  setProfile((prev) => ({
                    ...prev,
                    businessName: event.target.value,
                  }))
                }
                className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                İletişim Telefonu
              </span>
              <input
                value={profile.contactPhone}
                onChange={(event) =>
                  setProfile((prev) => ({
                    ...prev,
                    contactPhone: event.target.value,
                  }))
                }
                className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none"
              />
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Hizmet Yarıçapı
              </span>
              <div className="flex items-center gap-3 bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3">
                <MapPinned size={18} className="text-primary-400" />
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={profile.serviceRadius}
                  onChange={(event) =>
                    setProfile((prev) => ({
                      ...prev,
                      serviceRadius: Number(event.target.value),
                    }))
                  }
                  className="w-full bg-transparent text-sm text-slate-900 dark:text-white outline-none"
                />
                <span className="text-xs text-slate-500 font-bold">km</span>
              </div>
            </label>
            <label className="space-y-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                Ödeme IBAN
              </span>
              <input
                value={profile.payoutIban}
                onChange={(event) =>
                  setProfile((prev) => ({
                    ...prev,
                    payoutIban: event.target.value,
                  }))
                }
                className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white outline-none"
              />
            </label>
          </div>
        </div>

        {/* Specialized Profile Form Section */}
        {renderSpecializedForm() && (
          <div className="glass-card rounded-[2rem] border border-black/5 dark:border-white/5 p-8 space-y-6">
            {renderSpecializedForm()}
          </div>
        )}

        <div className="glass-card rounded-[2rem] border border-black/5 dark:border-white/5 p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 flex items-center justify-center text-teal-400">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Operasyon Tercihleri
              </h2>
              <p className="text-sm text-slate-500">
                Yeni eşleşme ve görünürlük ayarları
              </p>
            </div>
          </div>

          {[
            [
              "notifications",
              "Anlık bildirimler",
              "Yeni sipariş, teklif ve ödeme hareketlerinde push / panel uyarısı al.",
            ],
            [
              "autoApproveQuotes",
              "Otomatik teklif taslağı",
              "Hazır fiyat şablonları ile teklif ekranını tek adım hızlandır.",
            ],
            [
              "onlineStatus",
              "Çevrimiçi görünürlük",
              "Harita ve partner listesinde aktif durumda görün.",
            ],
            [
              "weekendMode",
              "Hafta sonu çalışma",
              "Cumartesi ve Pazar günü müşteri eşleşmelerine açık ol.",
            ],
          ].map(([key, title, description]) => (
            <button
              key={key}
              type="button"
              onClick={() => updatePreference(key)}
              className="w-full text-left rounded-2xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 px-4 py-4 hover:border-black/10 dark:border-white/10 transition-all"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-900 dark:text-white mb-1">{title}</p>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {description}
                  </p>
                </div>
                <div
                  className={`w-12 h-7 rounded-full flex items-center px-1 transition-all ${preferences[key] ? "bg-emerald-500/80 justify-end" : "bg-slate-700 justify-start"}`}
                >
                  <span className="w-5 h-5 rounded-full bg-white shadow" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="glass-card rounded-[2rem] border border-black/5 dark:border-white/5 p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mb-2">
            Kaydetmeden önce
          </p>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            Operasyon verilerini güncel tut
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Servis yarıçapı ve IBAN alanları ödeme ve eşleşme akışlarını
            doğrudan etkiler.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-8 py-4 rounded-2xl bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 dark:text-white font-black uppercase tracking-[0.25em] transition-all active-scale min-w-[200px] flex items-center justify-center gap-3"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              Kaydediliyor...
            </>
          ) : (
            "Ayarları Kaydet"
          )}
        </button>
      </section>
    </div>
  );
};

export default PartnerSettingsScreen;
