import React, { useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

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
  // isPrivacyAccepted removed 
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
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors"
          >
            <Icons.X size={20} className="text-slate-500" />
          </button>
          {isRegistered ? (
            <div className="py-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Icons.Mail size={40} className="text-emerald-600" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-4 font-sans">
                {t.verifyEmailTitle || "E-POSTANI ONAYLA"}
              </h2>
              <p className="text-slate-600 font-medium leading-relaxed mb-8">
                {formData.email} adresine bir doğrulama bağlantısı gönderdik.{" "}
                <br />
                <span className="text-sm text-slate-400">
                  Lütfen gelen kutunu (ve spam klasörünü) kontrol et.
                </span>
              </p>
              <button
                onClick={onClose}
                className="w-full bg-slate-900 text-white p-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all active-scale-95"
              >
                Tamam
              </button>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase font-sans">
                  {t.registerTitle}
                </h2>
                <p className="text-slate-500 text-sm font-medium mt-1 font-sans">
                  {loginIntent === "seller"
                    ? "Satıcı hesabı oluştur."
                    : "Rapidsy dünyasına katıl."}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    placeholder="Ad Soyad"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm font-sans"
                  />
                </div>

                <div className="relative group">
                  <Icons.Mail
                    className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary-500 transition-colors"
                    size={20}
                  />
                  <input
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm font-sans"
                  />
                </div>

                <div className="relative group">
                  <Icons.Lock
                    className="absolute left-4 top-4 text-slate-400 group-focus-within:text-primary-500 transition-colors"
                    size={20}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder={t.passwordPlaceholder}
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                    className="w-full bg-slate-50 border-2 border-slate-100 p-4 pl-12 pr-12 rounded-2xl outline-none focus:border-primary-500 transition-all font-bold text-sm font-sans"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <Icons.EyeOff size={20} />
                    ) : (
                      <Icons.Eye size={20} />
                    )}
                  </button>
                </div>

                {/* KVKK & Compliance Section */}
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative mt-0.5">
                      <input
                        type="checkbox"
                        checked={isKvkkAccepted}
                        onChange={(e) => setIsKvkkAccepted(e.target.checked)}
                        className="peer hidden"
                      />
                      <div className="w-5 h-5 border-2 border-slate-200 rounded-md bg-white peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all flex items-center justify-center">
                        <Icons.Check size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold leading-tight select-none">
                      <button 
                        type="button" 
                        onClick={() => openModal("kvkk")}
                        className="text-primary-600 underline hover:text-primary-700 decoration-primary-600/30"
                      >
                        KVKK Aydınlatma Metni
                      </button> 
                      {" ve "}
                      <button 
                        type="button" 
                        onClick={() => openModal("kvkk")}
                        className="text-primary-600 underline hover:text-primary-700 decoration-primary-600/30"
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
                      <div className="w-5 h-5 border-2 border-slate-200 rounded-md bg-white peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all flex items-center justify-center">
                        <Icons.Check size={12} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold leading-tight select-none">
                      Tarafıma bilgilendirme ve pazarlama içerikli e-iletiler gönderilmesine izin veriyorum (Opsiyonel).
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || !isKvkkAccepted}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-white p-5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-primary-900/20 flex items-center justify-center gap-3 active-scale h-16 disabled:opacity-50 disabled:grayscale font-sans"
                >
                  {loading ? (
                    <Icons.Loader2 className="animate-spin" size={24} />
                  ) : (
                    <>
                      <Icons.UserPlus size={20} /> {t.registerTitle}
                    </>
                  )}
                </button>
              </form>

              {/* Social Logic Divider */}
              <div className="flex items-center gap-4 my-6 opacity-70">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">
                  Veya
                </span>
                <div className="h-px bg-slate-200 flex-1"></div>
              </div>

              {/* Social Logins */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleSocialRegister("google")}
                  disabled={socialLoading !== null}
                  className="flex items-center justify-center gap-2 bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active-scale-[0.98] shadow-sm disabled:opacity-50 h-12 font-sans"
                >
                  {socialLoading === "google" ? (
                    <Icons.Loader2
                      size={18}
                      className="animate-spin text-slate-500"
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
                  className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl text-sm font-bold text-white hover:bg-slate-800 transition-all active-scale-[0.98] shadow-sm disabled:opacity-50 h-12 font-sans"
                >
                  {socialLoading === "apple" ? (
                    <Icons.Loader2
                      size={18}
                      className="animate-spin text-white"
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

              <div className="mt-8 text-center bg-slate-50 p-6 rounded-[2rem] border border-slate-100 flex flex-col items-center gap-2">
                <div>
                  <span className="text-xs text-slate-500 font-bold mr-2 font-sans">
                    {t.haveAccount || "Zaten hesabın var mı?"}
                  </span>
                  <button
                    onClick={onSwitchToLogin}
                    className="text-primary-600 font-black text-xs uppercase tracking-widest hover:underline font-sans"
                  >
                    {t.loginTitle}
                  </button>
                </div>
                <div className="w-full pt-3 mt-1 border-t border-slate-200/60">
                  <button
                    onClick={() => {
                      loginAsGuest();
                      onClose();
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-500 font-black px-8 py-2.5 rounded-xl transition-all active-scale-95 uppercase tracking-widest text-[9px] border border-slate-300/30"
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
