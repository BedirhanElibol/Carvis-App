import React, { useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";

const AuthLoginModal = ({
  show,
  onClose,
  t,
  onSwitchToRegister,
  handleAuthSuccess,
}) => {
  const { loginAsGuest } = useAuth();
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
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
      setErrorMsg(
        error.message === "Invalid login credentials"
          ? "E-posta veya şifre hatalı."
          : error.message,
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    try {
      // 1. E-postanın kayıtlı olup olmadığını veritabanından sorgula (RPC)
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

      // 2. Sıfırlama bağlantısını gönder
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
      } else if (msg.includes("network") || msg.includes("Failed to fetch")) {
        setErrorMsg("Ağ bağlantı hatası. Lütfen internetinizi kontrol edin.");
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: window.location.origin },
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message);
      setSocialLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[110] flex sm:items-center items-start justify-center backdrop-blur-md animate-in fade-in p-4 overflow-y-auto pt-10 sm:pt-4">
      <div className="bg-white dark:bg-[#0a0f24]/90 border border-black/10 dark:border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 my-auto text-slate-900 dark:text-white">
        
        {/* Decorative Background Glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/5 dark:bg-white/5 p-2 rounded-full hover:bg-black/10 dark:bg-white/10 transition text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white border border-black/5 dark:border-white/5 cursor-pointer"
        >
          <Icons.X size={20} />
        </button>

        {view === "login" && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-sans uppercase tracking-tight">
                {t.loginTitle || "Giriş Yap"}
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium font-sans leading-relaxed">
                Hesabınıza erişmek için bilgilerinizi girin.
              </p>
            </div>

            <div className="mb-6 flex items-center justify-center gap-2 text-teal-400 font-black uppercase tracking-widest text-xs font-sans">
              <Icons.User size={16} /> Müşteri Girişi
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1 font-sans">
                  {t.email}
                </label>
                <div className="bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl flex items-center px-4 py-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all shadow-inner">
                  <Icons.Mail size={18} className="text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                  <input
                    type="email"
                    required
                    className="bg-transparent w-full outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 font-sans"
                    placeholder="ornek@email.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-300 font-sans">
                    {t.password}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setView("forgot");
                      setErrorMsg("");
                    }}
                    className="text-xs font-semibold text-teal-400 hover:underline bg-transparent border-none cursor-pointer"
                  >
                    Şifremi Unuttum
                  </button>
                </div>
                <div className="bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl flex items-center px-4 py-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all shadow-inner">
                  <Icons.Lock size={18} className="text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                  <input
                    type="password"
                    required
                    className="bg-transparent w-full outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 font-sans"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-2xl flex items-center justify-center -rotate-1 origin-center shadow-sm">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4.5 rounded-2xl font-black text-slate-900 dark:text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-sans border-none cursor-pointer ${
                  loading ? "bg-teal-600/50 text-slate-600 dark:text-slate-300" : "bg-teal-500 hover:bg-teal-400 shadow-teal-500/20"
                }`}
              >
                {loading ? (
                  <Icons.Loader2 className="animate-spin" />
                ) : (
                  <Icons.LogIn size={20} />
                )}
                {loading ? "Bağlanıyor..." : t.loginButton || "Giriş Yap"}
              </button>
            </form>

            {/* Social Login Divider */}
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
                onClick={() => handleSocialLogin("google")}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3.5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 font-sans cursor-pointer"
              >
                {socialLoading === "google" ? (
                  <Icons.Loader2 size={18} className="animate-spin text-slate-500 dark:text-slate-400" />
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
                onClick={() => handleSocialLogin("apple")}
                disabled={socialLoading !== null}
                className="flex items-center justify-center gap-2 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 p-3.5 rounded-2xl text-sm font-bold text-slate-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 font-sans cursor-pointer"
              >
                {socialLoading === "apple" ? (
                  <Icons.Loader2 size={18} className="animate-spin text-slate-500 dark:text-slate-400" />
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

            <div className="text-center space-y-4">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
                Hesabınız yok mu?{" "}
                <button
                  onClick={onSwitchToRegister}
                  className="text-teal-400 font-bold hover:underline font-sans bg-transparent border-none cursor-pointer"
                >
                  Hemen Kayıt Ol
                </button>
              </p>
              <div className="pt-4 border-t border-black/5 dark:border-white/5">
                <button
                  onClick={() => {
                    loginAsGuest();
                    onClose();
                  }}
                  className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-black px-6 py-3 rounded-2xl transition-all active:scale-95 uppercase tracking-widest text-[9px] border border-black/10 dark:border-white/10 hover:text-slate-900 dark:text-white shadow-inner cursor-pointer"
                >
                  Misafir Olarak Devam Et &rarr;
                </button>
              </div>
            </div>
          </>
        )}

        {view === "forgot" && (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-sans uppercase tracking-tight">
                Şifremi Unuttum
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium font-sans leading-relaxed">
                Hesabınızın e-posta adresini girin. Şifre sıfırlama bağlantısını e-postanıza göndereceğiz.
              </p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1 font-sans">
                  E-posta Adresi
                </label>
                <div className="bg-black/40 border border-black/10 dark:border-white/10 rounded-2xl flex items-center px-4 py-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all shadow-inner">
                  <Icons.Mail size={18} className="text-slate-500 dark:text-slate-400 mr-3 shrink-0" />
                  <input
                    type="email"
                    required
                    className="bg-transparent w-full outline-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-500 font-sans"
                    placeholder="ornek@email.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 p-3 rounded-2xl flex items-center justify-center -rotate-1 origin-center shadow-sm">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4.5 rounded-2xl font-black text-slate-900 dark:text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-sans border-none cursor-pointer ${
                  loading ? "bg-teal-600/50 text-slate-600 dark:text-slate-300" : "bg-teal-500 hover:bg-teal-400 shadow-teal-500/20"
                }`}
              >
                {loading ? (
                  <Icons.Loader2 className="animate-spin" />
                ) : (
                  <Icons.Send size={20} />
                )}
                {loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setErrorMsg("");
                }}
                className="w-full py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-black/10 dark:border-white/10 rounded-2xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white transition-all active:scale-[0.98] font-sans cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Icons.ArrowLeft size={14} /> Giriş Ekranına Dön
              </button>
            </form>
          </>
        )}

        {view === "success" && (
          <>
            <div className="text-center py-6 space-y-6">
              <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center mx-auto text-teal-400 animate-bounce">
                <Icons.CheckCircle size={32} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 font-sans uppercase tracking-tight">
                  Talep Alındı!
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium font-sans leading-relaxed px-2">
                  Eğer <strong className="text-teal-400">{forgotEmail}</strong> adresi sistemimizde kayıtlı ise, şifre sıfırlama bağlantısı gönderilecektir. Lütfen gelen kutunuzu ve spam/gereksiz klasörünü kontrol edin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setForgotEmail("");
                  setErrorMsg("");
                }}
                className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-slate-900 dark:text-white rounded-2xl font-black shadow-xl shadow-teal-500/20 transition-all active:scale-[0.98] font-sans border-none cursor-pointer"
              >
                Giriş Ekranına Dön
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthLoginModal;
