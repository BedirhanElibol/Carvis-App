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

  const handleSocialLogin = async (provider) => {
    setSocialLoading(provider);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: { redirectTo: `${window.location.origin}/application/home` },
      });
      if (error) throw error;
    } catch (error) {
      setErrorMsg(error.message);
      setSocialLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[90] flex sm:items-center items-start justify-center backdrop-blur-sm animate-in fade-in p-4 overflow-y-auto pt-10 sm:pt-4">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        {/* Decorative Background */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-slate-50 p-2 rounded-full hover:bg-slate-100 transition"
        >
          <Icons.X size={20} className="text-slate-500" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-slate-900 mb-2 font-sans">
            {t.loginTitle || "Giriş Yap"}
          </h2>
          <p className="text-sm text-slate-500 font-medium font-sans">
            Hesabınıza erişmek için bilgilerinizi girin.
          </p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs font-sans">
          <Icons.User size={16} /> Müşteri Girişi
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1 font-sans">
              {t.email}
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center px-3 py-3 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all shadow-sm">
              <Icons.Mail size={18} className="text-slate-400 mr-3" />
              <input
                type="email"
                required
                className="bg-transparent w-full outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 font-sans"
                placeholder="ornek@email.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 ml-1 font-sans">
              {t.password}
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center px-3 py-3 focus-within:ring-2 focus-within:ring-primary-500/20 focus-within:border-primary-500 transition-all shadow-sm">
              <Icons.Lock size={18} className="text-slate-400 mr-3" />
              <input
                type="password"
                required
                className="bg-transparent w-full outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400 font-sans"
                placeholder="••••••••"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
          </div>

          {errorMsg && (
            <div className="text-red-600 text-sm font-bold bg-red-50 border border-red-100 p-3 rounded-xl flex items-center justify-center -rotate-1 origin-center shadow-sm">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl font-black text-white shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-sans ${
              loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
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
            onClick={() => handleSocialLogin("google")}
            disabled={socialLoading !== null}
            className="flex items-center justify-center gap-2 bg-white border border-slate-200 p-3 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 font-sans"
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
            onClick={() => handleSocialLogin("apple")}
            disabled={socialLoading !== null}
            className="flex items-center justify-center gap-2 bg-slate-900 border border-slate-800 p-3 rounded-xl text-sm font-bold text-white hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50 font-sans"
          >
            {socialLoading === "apple" ? (
              <Icons.Loader2 size={18} className="animate-spin text-white" />
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

        <div className="text-center space-y-3">
          <p className="text-xs text-slate-500 font-medium font-sans">
            Hesabınız yok mu?{" "}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-600 font-bold hover:underline font-sans"
            >
              Hemen Kayıt Ol
            </button>
          </p>
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => {
                loginAsGuest();
                onClose();
              }}
              className="bg-slate-50 hover:bg-slate-100 text-slate-500 font-black px-6 py-2.5 rounded-xl transition-all active:scale-95 uppercase tracking-widest text-[9px] border border-slate-200/50 shadow-sm"
            >
              Misafir Olarak Devam Et &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoginModal;
