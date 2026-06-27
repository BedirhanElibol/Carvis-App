import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../../../supabaseClient";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PartnerAuthScreen = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    companyName: "",
    taxNumber: "",
    taxOffice: "",
    registryNumber: "",
    mersisNumber: "",
    kepAddress: "",
    officeAddress: "",
    ibanNumber: "",
  });

  const themes = {
    parking: { title: "Otopark İşletmesi", color: "cyan", bg: "from-cyan-900/40 to-slate-950", btn: "bg-cyan-500 hover:bg-cyan-400", border: "border-cyan-500/30", text: "text-cyan-400" },
    valet: { title: "Vale Hizmeti", color: "amber", bg: "from-amber-900/40 to-slate-950", btn: "bg-amber-500 hover:bg-amber-400", border: "border-amber-500/30", text: "text-amber-400" },
    mechanic: { title: "Usta & Servis", color: "orange", bg: "from-orange-900/40 to-slate-950", btn: "bg-orange-500 hover:bg-orange-400", border: "border-orange-500/30", text: "text-orange-400" },
    parts: { title: "Parça Tedarikçisi", color: "emerald", bg: "from-emerald-900/40 to-slate-950", btn: "bg-emerald-500 hover:bg-emerald-400", border: "border-emerald-500/30", text: "text-emerald-400" },
  };

  const currentTheme = themes[role] || themes.parking;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      setLoading(true);
      try {
        const { data: { user }, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) throw error;

        // Dynamic Redirect based on ACTUAL role from DB
        const { data: profile } = await supabase
          .from("profiles")
          .select("role, application_status")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          navigate("/admin/dashboard");
        } else if (profile?.role === "partner" || profile?.application_status === "approved") {
          navigate("/partner/dashboard");
        } else if (profile?.application_status === "pending") {
          // Prevent the redirection bounce loop
          await supabase.auth.signOut();
          setError("Başvurunuz inceleniyor. Lütfen yönetici onayını bekleyin.");
        } else {
          // If they are a normal customer without an application
          navigate("/application/home");
        }
      } catch (err) {
        setError(err.message || "Giriş başarısız.");
      } finally {
        setLoading(false);
      }
    } else {
      if (step < 3) {
        setStep(step + 1);
      } else {
        submitApplication();
      }
    }
  };

  const submitApplication = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create Auth User
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.companyName,
            role: "customer", // Strict default security assignment
            applied_role: role // Save intended parameter without granting privilege
          },
        },
      });

      if (authError) throw authError;

      // 2. Submit Partner Application
      const { error: appError } = await supabase.from("partner_applications").insert({
        user_id: authData.user.id,
        company_name: formData.companyName,
        tax_number: formData.taxNumber,
        tax_office: formData.taxOffice,
        trade_registry_number: formData.registryNumber,
        mersis_number: formData.mersisNumber,
        kep_address: formData.kepAddress,
        office_address: formData.officeAddress,
        iban_number: formData.ibanNumber,
        status: "pending",
      });

      if (appError) throw appError;

      // Update Profile Status (Optional/Defensive)
      await supabase.from("profiles").upsert({
        id: authData.user.id,
        application_status: "pending"
      });

      setStep(4); // Success Step
    } catch (err) {
      console.error("Application error:", err);
      if (err.message && err.message.includes("User already registered")) {
        setError("Bu e-posta adresi sisteme zaten kayıtlı. Lütfen giriş yapın.");
      } else {
        setError(err.message || "Başvuru sırasında bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = async (provider) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: `${window.location.origin}/partner/dashboard?role=${role}` },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full ${currentTheme.btn} text-black flex items-center justify-center text-[10px]`}>1</span>
              Hesap Bilgileri
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">E-Posta Adresi</label>
                <input name="email" type="email" required className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-primary-500 outline-none" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Şifre</label>
                <input name="password" type="password" required className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-primary-500 outline-none" value={formData.password} onChange={handleChange} />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full ${currentTheme.btn} text-black flex items-center justify-center text-[10px]`}>2</span>
              Ticari Bilgiler (Trendyol Standardı)
            </div>
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Ticari Ünvan / Şirket Adı</label>
                <input name="companyName" required className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-primary-500 outline-none" value={formData.companyName} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Vergi Numarası</label>
                  <input name="taxNumber" className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-primary-500 outline-none" value={formData.taxNumber} onChange={handleChange} />
                </div>
                <div>
                  <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Vergi Dairesi</label>
                  <input name="taxOffice" className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-primary-500 outline-none" value={formData.taxOffice} onChange={handleChange} />
                </div>
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">MERSİS Numarası</label>
                <input name="mersisNumber" className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-primary-500 outline-none" placeholder="16 haneli" value={formData.mersisNumber} onChange={handleChange} />
              </div>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className={`w-6 h-6 rounded-full ${currentTheme.btn} text-black flex items-center justify-center text-[10px]`}>3</span>
              Finansal & İletişim
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">IBAN Numarası</label>
                <input name="ibanNumber" placeholder="TR..." className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-primary-500 outline-none" value={formData.ibanNumber} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">KEP Adresi (Kayıtlı E-Posta)</label>
                <input name="kepAddress" placeholder="hs01.kep.tr" className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-primary-500 outline-none" value={formData.kepAddress} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1">Resmi İşyeri Adresi</label>
                <textarea name="officeAddress" rows="2" className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-lg p-3 text-slate-900 dark:text-white focus:border-primary-500 outline-none resize-none" value={formData.officeAddress} onChange={handleChange} />
              </div>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.CheckCircle size={40} className="text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Başvuru Alındı!</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              İş ortağı başvurunuz Trendyol standartlarında başarıyla sisteme kaydedildi. <br />
              Belgeleriniz inceleme aşamasındadır. Onaylandığında size bilgilendirme mesajı gönderilecektir.
            </p>
            <button onClick={() => navigate("/")} className="mt-8 text-primary-500 font-bold hover:underline">Ana Sayfaya Dön</button>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${currentTheme.bg}`}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-lg bg-white dark:bg-slate-900/90 backdrop-blur-2xl border ${currentTheme.border} p-8 rounded-3xl shadow-2xl relative overflow-hidden`}>
        <div className={`absolute top-0 left-0 w-full h-1.5 bg-${currentTheme.color}-500/50`} />
        
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => isLogin ? navigate("/partner-login") : setStep(Math.max(1, step - 1))} className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors">
            <Icons.ArrowLeft size={20} />
          </button>
          <div className={`px-4 py-1.5 rounded-full bg-${currentTheme.color}-500/10 ${currentTheme.text} text-[10px] font-black uppercase tracking-widest`}>
            {currentTheme.title}
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
            {isLogin ? "Kurumsal Giriş" : "İş Ortağı Başvurusu"}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            {isLogin ? "Yönetim paneline güvenli erişim." : "Şeffaf ve profesyonel onboarding süreci."}
          </p>
        </div>

        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl mb-6 text-sm flex items-center gap-3">
          <Icons.AlertCircle size={18} /> {error}
        </div>}

        <form onSubmit={handleAuth} className="space-y-6">
          {isLogin ? (
            <div className="space-y-4">
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1 uppercase tracking-widest font-bold">E-Posta</label>
                <input name="email" type="email" required className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:border-primary-500 outline-none transition-all" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <label className="block text-slate-500 dark:text-slate-400 text-xs mb-1 uppercase tracking-widest font-bold">Şifre</label>
                <input name="password" type="password" required className="w-full bg-slate-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl p-4 text-slate-900 dark:text-white focus:border-primary-500 outline-none transition-all" value={formData.password} onChange={handleChange} />
              </div>
            </div>
          ) : renderStep()}

          {step < 4 && (
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-2xl text-black text-lg font-black font-sans shadow-xl shadow-${currentTheme.color}-500/10 ${currentTheme.btn} transition-all active:scale-[0.97] flex items-center justify-center gap-3`}
            >
              {loading ? <Icons.Loader2 className="animate-spin" size={24} /> : (isLogin ? "Sisteme Gir" : (step === 3 ? "Başvuruyu Tamamla" : "Sonraki Adım"))}
            </button>
          )}
        </form>

        {step < 4 && (
          <div className="mt-8 space-y-6">
            <div className="text-center">
              <button onClick={() => { setIsLogin(!isLogin); setStep(1); }} className="text-slate-500 hover:text-slate-900 dark:text-white text-sm transition-colors font-medium">
                {isLogin ? "Henüz iş ortağımız değil misiniz? Şimdi Başvurun" : "Zaten hesabınız var mı? Giriş Yapın"}
              </button>
            </div>

            {isLogin && (
              <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-px bg-black/5 dark:bg-white/5 flex-1" />
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Hızlı Giriş</span>
                  <div className="h-px bg-black/5 dark:bg-white/5 flex-1" />
                </div>
                <button
                  type="button"
                  onClick={() => handleSocialAuth("google")}
                  className="w-full py-4 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 hover:bg-black/10 dark:bg-white/10 rounded-xl text-slate-900 dark:text-white flex items-center justify-center gap-3 transition-all"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="G" />
                  <span className="font-bold">Google ile Devam Et</span>
                </button>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PartnerAuthScreen;
