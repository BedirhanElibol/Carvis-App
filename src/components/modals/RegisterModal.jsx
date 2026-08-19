import React, { useState } from "react";
import { Eye, EyeOff, Loader2, Lock, Mail, Phone, User, X, ShieldCheck } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const RegisterModal = ({
  show,
  onClose,
  t,
  onSwitchToLogin,
  handleAuthSuccess,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [socialLoading, setSocialLoading] = useState(null);

  if (!show || !t) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      let emailExists = false;
      try {
        const { data: exists, error: rpcError } = await supabase.rpc("check_email_exists", {
          email_to_check: formData.email,
        });
        if (!rpcError && typeof exists === "boolean") {
          emailExists = exists;
        }
      } catch {
        // Fallback
      }

      if (emailExists) {
        setErrorMsg("Bu e-posta adresiyle zaten kayıtlı bir hesap var. Lütfen giriş yapın.");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            phone: formData.phone,
            role: "customer",
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        if (handleAuthSuccess) handleAuthSuccess(data.user);
        onClose();
        navigate("/application/home");
      }
    } catch (error) {
      const msg = error.message || "";
      if (msg.includes("already registered")) {
        setErrorMsg("Bu e-posta adresiyle zaten bir hesap bulunuyor.");
      } else if (msg.includes("Password should be at least")) {
        setErrorMsg("Şifreniz en az 6 karakter olmalıdır.");
      } else if (msg.includes("network") || msg.includes("fetch")) {
        setErrorMsg("Sunucuya bağlanılamadı. Lütfen internet bağlantınızı kontrol edin.");
      } else {
        setErrorMsg(msg || "Kayıt olurken bir hata oluştu.");
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
      setErrorMsg(`${provider === "google" ? "Google" : "Apple"} ile kayıt olurken bir hata oluştu.`);
      setSocialLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      
      {/* Clerk / Resend Style Register Card */}
      <div className="w-full max-w-[440px] bg-white dark:bg-[#080d1a] border border-slate-200 dark:border-white/10 rounded-xl p-7 sm:p-9 relative overflow-hidden text-slate-900 dark:text-white my-auto">
        
        {/* Subtle Neon Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl pointer-events-none rounded-full"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-200 dark:border-white/10 transition-all cursor-pointer z-10"
        >
          <X size={18} />
        </button>

        {/* Header: Logo & Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-sky-500/20 border border-cyan-500/30 p-2 flex items-center justify-center shadow-lg shadow-cyan-500/10 mb-3">
            <img src={logo} alt="Rapidsy" className="h-8 w-auto object-contain" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white font-sans uppercase">
            Hesap Oluşturun
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            Ücretsiz Rapidsy Dünyasına Anında Katılın
          </p>
        </div>

        {/* Clerk-Style Google Register */}
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
          <span>Google ile Tek Tıkla Kayıt Ol</span>
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">
            veya bilgilerinizle
          </span>
          <div className="h-px bg-slate-200 dark:bg-white/10 flex-1"></div>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="space-y-3.5">
          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 font-sans">
              Ad Soyad
            </label>
            <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center px-3.5 py-3 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
              <User size={16} className="text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                name="fullName"
                required
                className="bg-transparent w-full outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
                placeholder="Ahmet Yılmaz"
                value={formData.fullName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 font-sans">
              E-Posta Adresi
            </label>
            <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center px-3.5 py-3 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
              <Mail size={16} className="text-slate-400 mr-2.5 shrink-0" />
              <input
                type="email"
                name="email"
                required
                className="bg-transparent w-full outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
                placeholder="ornek@email.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 font-sans">
              Telefon Numarası
            </label>
            <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center px-3.5 py-3 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
              <Phone size={16} className="text-slate-400 mr-2.5 shrink-0" />
              <input
                type="tel"
                name="phone"
                required
                className="bg-transparent w-full outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 font-sans font-mono"
                placeholder="05XX XXX XX XX"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-black uppercase tracking-wider text-slate-600 dark:text-slate-400 font-sans">
              Şifre Oluşturun
            </label>
            <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-white/10 rounded-2xl flex items-center px-3.5 py-3 focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
              <Lock size={16} className="text-slate-400 mr-2.5 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                className="bg-transparent w-full outline-none text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 font-sans"
                placeholder="En az 6 karakter"
                value={formData.password}
                onChange={handleChange}
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
            className="w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-950 bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50 mt-2"
          >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
            <span>{loading ? "KAYIT YAPILIYOR..." : "HESAP OLUŞTUR"}</span>
          </button>
        </form>

        {/* Footer Switch */}
        <div className="text-center mt-6 pt-4 border-t border-slate-200 dark:border-white/10">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium font-sans">
            Zaten hesabınız var mı?{" "}
            <button
              onClick={onSwitchToLogin}
              className="text-cyan-600 dark:text-cyan-400 font-black hover:underline font-sans bg-transparent border-none cursor-pointer"
            >
              Giriş Yap
            </button>
          </p>
        </div>

      </div>
    </div>
  );
};

export default RegisterModal;
