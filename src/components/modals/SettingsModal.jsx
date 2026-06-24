import React, { useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";

const SettingsModal = ({ show, onClose, t, currentUser, showAlert }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: currentUser?.user_metadata?.full_name || "",
    phone: currentUser?.user_metadata?.phone || "",
    company_name: currentUser?.user_metadata?.company_name || "",
  });

  if (!show || !t) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.full_name,
          phone: formData.phone,
          company_name: formData.company_name,
        },
      });
      if (error) throw error;

      // Profile tablosunu da güncelle (opsiyonel ama iyi olur)
      await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name,
          phone: formData.phone,
          company_name: formData.company_name,
        })
        .eq("id", currentUser.id);

      showAlert("Başarılı", "Profiliniz güncellendi.", "success");
      onClose();
    } catch (error) {
      console.error(error);
      showAlert("Hata", "Güncelleme sırasında bir sorun oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleBecomePartner = () => {
    onClose();
    window.location.href = "/partner-login";
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] p-8 animate-in zoom-in-95 duration-200 border border-black/10 dark:border-white/10 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-8">
          <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter flex items-center gap-3 font-sans">
            <Icons.Settings size={28} className="text-primary-500" />
            {t.settings}
          </h3>
          <button
            onClick={onClose}
            className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl hover:bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 transition-all"
          >
            <Icons.X size={20} className="text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Profil Bilgileri */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 font-sans">
                Ad Soyad
              </label>
              <div className="relative group">
                <Icons.User
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) =>
                    setFormData({ ...formData, full_name: e.target.value })
                  }
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-primary-500 transition-all outline-none font-sans"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2 font-sans">
                Telefon
              </label>
              <div className="relative group">
                <Icons.Phone
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 text-slate-900 dark:text-white focus:border-primary-500 transition-all outline-none font-sans"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 space-y-3">
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-primary-600 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-primary-600/20 active-scale disabled:opacity-50 font-sans"
            >
              <Icons.Save size={18} />
              {loading ? "Yükleniyor..." : "Bilgileri Kaydet"}
            </button>

            {currentUser?.user_metadata?.role !== "seller" && currentUser?.user_metadata?.role !== "partner" && currentUser?.user_metadata?.role !== "admin" && (
              <button
                onClick={handleBecomePartner}
                disabled={loading}
                className="w-full bg-black/5 dark:bg-white/5 text-accent-500 border border-accent-500/20 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-accent-500/10 transition-all active-scale font-sans"
              >
                <Icons.Briefcase size={18} />
                Kurumsal Partner Ol
              </button>
            )}
          </div>

          {/* AI Info */}
          <div className="bg-primary-500/5 border border-primary-500/10 p-5 rounded-2xl">
            <div className="flex gap-4">
              <div className="bg-primary-500/10 w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icons.CreditCard size={20} className="text-primary-500" />
              </div>
              <div className="text-[10px] leading-relaxed">
                <p className="text-slate-700 dark:text-slate-200 font-black uppercase tracking-widest mb-1 font-sans">
                  AI API Status
                </p>
                <p className="text-slate-500 font-medium font-sans">
                  Yapay Zeka (AI) API anahtarı bu ortamda otomatik olarak
                  sağlanmaktadır. Carvis AI asistanınız her zaman aktif.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
