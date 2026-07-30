import React, { useState } from "react";
import { Check, Eye, EyeOff, Loader2, Lock, Mail, User, UserPlus, X } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { useNavigate } from "react-router-dom";

const RegisterModal = ({
  show,
  onClose,
  t,
  onSwitchToLogin,
  showAlert: showAlertProp,
  loginIntent,
}) => {
  const { loginAsGuest } = useAuth();
  const { showAlert: showAlertContext, openModal } = useUI();
  const navigate = useNavigate();
  
  // Safe showAlert fallback
  const showAlert = showAlertProp || showAlertContext;
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
  });
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialLoading, setSocialLoading] = useState(null);
  const [isKvkkAccepted, setIsKvkkAccepted] = useState(false);
  const [isMarketingAccepted, setIsMarketingAccepted] = useState(false);

  if (!show || !t) return null;

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!isKvkkAccepted) {
      showAlert(
        "Zorunlu Onay",
        "Devam etmek için yasal metinleri onaylamanız gerekmektedir.",
        "warning",
      );
      return;
    }

    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: "customer", // Enforce strict default to prevent injection
            applied_role: loginIntent || "customer",
            kvkk_consent: true,
            privacy_consent: true,
            marketing_consent: isMarketingAccepted,
          },
          emailRedirectTo: `${window.location.origin}/application/home`,
        },
      });

      if (error) {
        // Handle "Email already in use" specifically (422 error from Supabase)
        if (error.message.includes("Email already registered") || error.status === 422 || error.code === "user_already_exists") {
          showAlert(
            "Zaten Bir Hesabınız Var",
            "Bu e-posta adresiyle daha önce kayıt olunmuş. Lütfen giriş yapmayı deneyin.",
            "info"
          );
          onSwitchToLogin(); // Automatically switch to login tab
          return;
        }
        throw error;
      }
      setIsRegistered(true);
    } catch (error) {
      console.error("Signup error:", error);
      let msg = error.message || "Kayıt işlemi sırasında bir hata oluştu.";
      if (error.status === 422 || error.message.includes("registered")) {
        msg = "Bu e-posta adresiyle zaten bir hesap bulunuyor. Lütfen Giriş Yap menüsünü kullanın.";
      }
      showAlert("Kayıt Hatası", msg, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialRegister = async (provider) => {
    if (!isKvkkAccepted) {
      showAlert(
        "Zorunlu Onay",
        "Devam etmek için yasal metinleri onaylamanız gerekmektedir.",
        "warning",
      );
      return;
    }
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: `${window.location.origin}/application/home` },
      });
      if (error) throw error;
    } catch (error) {
      showAlert("Hata", error.message, "error");
      setSocialLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[110] flex sm:items-center items-start justify-center backdrop-blur-md animate-in fade-in p-4 overflow-y-auto pt-10 sm:pt-4">
      <div className="bg-white dark:bg-[#0a0f24]/90 border border-black/10 dark:border-white/10 w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 my-auto text-slate-900 dark:text-white">
        
        {/* Decorative Background Glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="p-2 sm:p-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/5 dark:bg-white/5 p-2 rounded-full hover:bg-black/10 dark:bg-white/10 transition text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-black/5 dark:border-white/5 cursor-pointer"
          >
            <X size={20} />
          </button>
          
          {isRegistered ? (
            <div className="py-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Mail size={40} className="text-teal-400" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-4 font-sans">
                {t.verifyEmailTitle || "E-POSTANI ONAYLA"}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed mb-8">
                {formData.email} adresine bir doğrulama bağlantısı gönderdik.{" "}
                <br />
                <span className="text-sm text-slate-500">
                  Lütfen gelen kutunu (ve spam klasörünü) kontrol et.
                </span>
              </p>
              <button
                onClick={onClose}
                className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 dark:text-white p-4.5 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all active:scale-95 cursor-pointer border-none"
              >
                Tamam
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase font-sans">
                  {t.registerTitle}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-1 font-sans">
                  {loginIntent === "seller"
                    ? "Satıcı hesabı oluştur."
                    : "Rapidsy dünyasına katıl."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <div className="bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl flex items-center px-4 py-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all shadow-inner">
                    <User size={18} className="text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                    <input
                      type="text"
                      autoComplete="name"
                      placeholder="Ad Soyad"
                      value={formData.fullName}
                      onChange={(e) =>
                        setFormData({ ...formData, fullName: e.target.value })
                      }
                      required
                      className="bg-transparent w-full outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 font-sans"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl flex items-center px-4 py-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all shadow-inner">
                    <Mail size={18} className="text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder={t.emailPlaceholder || "E-posta Adresi"}
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                      className="bg-transparent w-full outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 font-sans"
                    />
                  </div>
                </div>

                <div className="relative group">
                  <div className="bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl flex items-center px-4 py-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all shadow-inner">
                    <Lock size={18} className="text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder={t.passwordPlaceholder || "Şifre"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="bg-transparent w-full outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-colors border-none bg-transparent cursor-pointer ml-2 shrink-0"
                    >
                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}
                    </button>
                  </div>
                </div>

                {/* KVKK & Compliance Section */}
                <div className="bg-black/30 p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={isKvkkAccepted}
                        onChange={(e) => setIsKvkkAccepted(e.target.checked)}
                        className="peer hidden"
                      />
                      <div className="w-5 h-5 border-2 border-black/10 dark:border-white/10 rounded-md bg-transparent peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all flex items-center justify-center">
                        <Check size={12} className="text-slate-900 dark:text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight select-none">
                      <button 
                        type="button" 
                        onClick={() => openModal("kvkk")}
                        className="text-teal-400 underline hover:text-teal-300 decoration-teal-400/30 bg-transparent border-none cursor-pointer p-0"
                      >
                        KVKK Aydınlatma Metni
                      </button> 
                      {" ve "}
                      <button 
                        type="button" 
                        onClick={() => openModal("kvkk")}
                        className="text-teal-400 underline hover:text-teal-300 decoration-teal-400/30 bg-transparent border-none cursor-pointer p-0"
                      >
                        Kullanıcı Sözleşmesi
                      </button>
                      'ni okudum, onaylıyorum.
                    </span>
                  </label>

                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={isMarketingAccepted}
                        onChange={(e) => setIsMarketingAccepted(e.target.checked)}
                        className="peer hidden"
                      />
                      <div className="w-5 h-5 border-2 border-black/10 dark:border-white/10 rounded-md bg-transparent peer-checked:bg-teal-500 peer-checked:border-teal-500 transition-all flex items-center justify-center">
                        <Check size={12} className="text-slate-900 dark:text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold leading-tight select-none">
                      Tarafıma bilgilendirme ve pazarlama içerikli e-iletiler gönderilmesine izin veriyorum (Opsiyonel).
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isKvkkAccepted}
                  className="w-full bg-teal-500 hover:bg-teal-400 text-slate-900 dark:text-white py-4.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 active:scale-95 h-14 disabled:opacity-50 disabled:grayscale font-sans border-none cursor-pointer"
                >
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <UserPlus size={20} /> {t.registerTitle}
                    </>
                  )}
                </button>
              </form>

              {/* Social Logic Divider */}
              <div className="flex items-center gap-4 my-6 opacity-50">
                <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
                  Veya
                </span>
                <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleSocialRegister("google")}
                  disabled={socialLoading !== null}
                  className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 h-12 font-sans cursor-pointer"
                >
                  {socialLoading === "google" ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-slate-500 dark:text-slate-400"
                    />
                  ) : (
                    <img
                      src="https://www.svgrepo.com/show/475656/google-color.svg"
                      alt="Google"
                      className="w-5 h-5"
                    />
                  )}
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => handleSocialRegister("apple")}
                  disabled={socialLoading !== null}
                  className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3 rounded-xl text-sm font-bold text-slate-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 h-12 font-sans cursor-pointer"
                >
                  {socialLoading === "apple" ? (
                    <Loader2
                      size={18}
                      className="animate-spin text-slate-500 dark:text-slate-400"
                    />
                  ) : (
                    <img
                      src="https://www.svgrepo.com/show/511330/apple-173.svg"
                      alt="Apple"
                      className="w-5 h-5 invert"
                    />
                  )}
                  Apple
                </button>
              </div>

              <div className="mt-8 text-center bg-black/20 p-6 rounded-[2rem] border border-black/5 dark:border-white/5 flex flex-col items-center gap-2">
                <div>
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-bold mr-2 font-sans">
                    {t.haveAccount || "Zaten hesabın var mı?"}
                  </span>
                  <button
                    onClick={onSwitchToLogin}
                    className="text-teal-400 font-black text-xs uppercase tracking-widest hover:underline font-sans bg-transparent border-none cursor-pointer"
                  >
                    {t.loginTitle}
                  </button>
                </div>
                <div className="w-full pt-3 mt-1 border-t border-black/5 dark:border-white/5">
                  <button
                    onClick={() => {
                      loginAsGuest();
                      onClose();
                      navigate("/application/home");
                    }}
                    className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-black px-8 py-2.5 rounded-xl transition-all active:scale-95 uppercase tracking-widest text-[9px] border border-black/10 dark:border-white/10 hover:text-slate-900 dark:text-white cursor-pointer"
                  >
                    Hızlı Keşfet &rarr;
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterModal;
