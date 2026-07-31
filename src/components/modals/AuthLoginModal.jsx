import React, { useState } from "react";
import { ArrowLeft, CheckCircle, Eye, EyeOff, Loader2, Lock, LogIn, Mail, Send, User, X, Sparkles } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const AuthLoginModal = ({
  show,
  onClose,
  t,
  onSwitchToRegister,
  handleAuthSuccess,
}) => {
  const navigate = useNavigate();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [view, setView] = useState("login"); // 'login' | 'forgot' | 'success'
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [socialLoading, setSocialLoading] = useState(null);

  if (!show || !t) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });
      if (error) throw error;
      if (data.user) {
        if (handleAuthSuccess) handleAuthSuccess(data.user);
        onClose();
      }
    } catch (error) {
      const msg = error.message || "";
      if (msg === "Invalid login credentials") {
        setErrorMsg("E-posta veya şifre hatalı.");
      } else if (msg.includes("Email not confirmed")) {
        setErrorMsg("E-posta adresiniz henüz doğrulanmamış. Lütfen gelen kutunuzu kontrol edin.");
      } else if (msg.includes("network") || msg.includes("Failed to fetch") || msg.includes("fetch")) {
        setErrorMsg("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
      } else if (msg.includes("rate limit") || msg.includes("too many")) {
        setErrorMsg("Çok fazla deneme yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.");
      } else {
        setErrorMsg(msg || "Giriş yapılırken bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      let emailExists = true;
      try {
        const { data: exists, error: rpcError } = await supabase.rpc("check_email_exists", {
          email_to_check: forgotEmail,
        });
        if (!rpcError && typeof exists === "boolean") {
          emailExists = exists;
        }
      } catch {
        // SQL fonksiyonu veritabanına henüz eklenmemişse varsayılan olarak var kabul et
      }

      if (!emailExists) {
        setErrorMsg("Bu e-posta adresiyle kayıtlı bir hesap bulunamadı.");
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setView("success");
    } catch (error) {
      const msg = error.message || "";
      if (msg.includes("rate limit")) {
        setErrorMsg("Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin.");
      } else if (msg.includes("Invalid email")) {
        setErrorMsg("Geçersiz e-posta adresi girdiniz.");
      } else if (msg.includes("network") || msg.includes("Failed to fetch") || msg.includes("fetch")) {
        setErrorMsg("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        setErrorMsg(msg || "Bir hata oluştu.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    setErrorMsg("");
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: `${window.location.origin}/application/home` },
      });
      if (error) throw error;
    } catch (error) {
      const msg = error.message || "";
      if (msg.includes("network") || msg.includes("Failed to fetch") || msg.includes("fetch")) {
        setErrorMsg("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.");
      } else if (msg.includes("provider") || msg.includes("not enabled")) {
        setErrorMsg(`${provider === "google" ? "Google" : "Apple"} ile giriş şu anda kullanılamıyor. Lütfen e-posta ile giriş yapın.`);
      } else {
        setErrorMsg(msg || `${provider === "google" ? "Google" : "Apple"} ile giriş yapılırken bir hata oluştu.`);
      }
      setSocialLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xl z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      
      {/* Clerk.com / Resend.com Style Auth Card */}
      <div className="w-full max-w-[420px] bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-7 sm:p-9 shadow-2xl relative overflow-hidden text-slate-900 dark:text-white my-auto">
        
        {/* Subtle Neon Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl pointer-events-none rounded-full"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-200 dark:border-white/10 transition-all cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {view === "login" && (
          <>
            {/* Header: Logo & Branding */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-sky-500/20 border border-cyan-500/30 p-2 flex items-center justify-center shadow-lg shadow-cyan-500/10 mb-3">
                <img src={logo} alt="Rapidsy" className="h-8 w-auto object-contain" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans uppercase">
                Rapidsy'ye Hoş Geldiniz
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                Akıllı Otomobil Platformunuza Erişin
              </p>
            </div>

            {/* Clerk-Style One-Click Google OAuth */}
            <button
              onClick={() => handleSocialLogin("google")}
              disabled={socialLoading !== null}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/15 py-3.5 px-4 rounded-2xl text-xs sm:text-sm font-bold text-slate-800 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 font-sans cursor-pointer mb-5"
            >
              {socialLoading === "google" ? (
                <Loader2 size={18} className="animate-spin text-cyan-500" />
              ) : (
                <img
                  src="https://www.svgrepo.com/show/475656/google-color.svg"
                  alt="Google"
                  className="w-5 h-5"
                />
              )}
              <span>Google ile Devam Et</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
                veya e-posta ile
              </span>
              <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
            </div>

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 font-sans">
                  E-Posta Adresi
                </label>
                <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center px-3.5 py-3 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                  <Mail size={16} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    className="bg-transparent w-full outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
                    placeholder="ornek@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-0.5">
                  <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 font-sans">
                    Şifre
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setErrorMsg("");
                    }}
                    className="text-[10px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Şifremi Unuttum?
                  </button>
                </div>
                <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center px-3.5 py-3 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                  <Lock size={16} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="bg-transparent w-full outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="text-rose-500 text-xs font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl text-center">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <LogIn size={16} />}
                <span>{loading ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"}</span>
              </button>
            </form>

            {/* Footer switch */}
            <div className="text-center mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                Henüz bir hesabınız yok mu?{" "}
                <button
                  onClick={onSwitchToRegister}
                  className="text-cyan-600 dark:text-cyan-400 font-black hover:underline font-sans bg-transparent border-none cursor-pointer"
                >
                  Hemen Kayıt Ol
                </button>
              </p>
            </div>
          </>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === "forgot" && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setView("login");
                setErrorMsg("");
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-transparent border-none cursor-pointer p-0"
            >
              <ArrowLeft size={16} /> Giriş Ekranına Dön
            </button>

            <div className="text-center my-4">
              <h3 className="text-lg font-black text-slate-900 dark:text-white font-sans uppercase">
                Şifre Sıfırlama
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
                E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 font-sans">
                  Kayıtlı E-Posta Adresiniz
                </label>
                <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center px-3.5 py-3 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                  <Mail size={16} className="text-slate-400 mr-2.5 shrink-0" />
                  <input
                    type="email"
                    required
                    className="bg-transparent w-full outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
                    placeholder="ornek@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-rose-500 text-xs font-bold bg-rose-500/10 border border-rose-500/20 p-3 rounded-2xl text-center">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                <span>{loading ? "GÖNDERİLİYOR..." : "SIFIRLAMA BAĞLANTISI GÖNDER"}</span>
              </button>
            </form>
          </div>
        )}

        {/* SUCCESS VIEW */}
        {view === "success" && (
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white font-sans uppercase">
              Bağlantı Gönderildi!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto font-sans">
              <strong>{forgotEmail}</strong> adresine şifre sıfırlama bağlantısı gönderildi. Lütfen e-postanızı ve gereksiz kutusunu kontrol edin.
            </p>
            <button
              onClick={() => {
                setView("login");
                setForgotEmail("");
              }}
              className="px-6 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/10 text-slate-800 dark:text-white font-bold text-xs hover:bg-slate-200 dark:hover:bg-white/20 transition-all border border-slate-200 dark:border-white/10 cursor-pointer"
            >
              Giriş Ekranına Dön
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default AuthLoginModal;
