import React, { useState } from "react";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";

const UpdatePasswordModal = ({ show, onClose, t }) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [success, setSuccess] = useState(false);

  if (!show || !t) return null;

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Şifre en az 6 karakter olmalıdır.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Şifreler eşleşmiyor.");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (error) throw error;
      setSuccess(true);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[115] flex sm:items-center items-start justify-center backdrop-blur-md animate-in fade-in p-4 overflow-y-auto pt-10 sm:pt-4">
      <div className="bg-[#0a0f24]/90 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 my-auto text-white">
        
        {/* Decorative Background Glows */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {!success && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/5 p-2 rounded-full hover:bg-white/10 transition text-slate-400 hover:text-white border border-white/5 cursor-pointer"
          >
            <Icons.X size={20} />
          </button>
        )}

        {!success ? (
          <>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white mb-2 font-sans uppercase tracking-tight">
                Yeni Şifre Belirle
              </h2>
              <p className="text-sm text-slate-400 font-medium font-sans leading-relaxed">
                Hesabınız için yeni ve güvenli bir şifre girin.
              </p>
            </div>

            <div className="mb-6 flex items-center justify-center gap-2 text-teal-400 font-black uppercase tracking-widest text-xs font-sans">
              <Icons.ShieldAlert size={16} /> Şifre Yenileme
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 ml-1 font-sans">
                  Yeni Şifre
                </label>
                <div className="bg-black/40 border border-white/10 rounded-2xl flex items-center px-4 py-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all shadow-inner relative">
                  <Icons.Lock size={18} className="text-slate-400 mr-3 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="bg-transparent w-full outline-none text-sm font-medium text-white placeholder:text-slate-500 font-sans pr-10"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-slate-400 hover:text-white transition-all bg-transparent border-none cursor-pointer"
                  >
                    {showPassword ? <Icons.EyeOff size={18} /> : <Icons.Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 ml-1 font-sans">
                  Yeni Şifre (Tekrar)
                </label>
                <div className="bg-black/40 border border-white/10 rounded-2xl flex items-center px-4 py-3.5 focus-within:ring-2 focus-within:ring-teal-500/20 focus-within:border-teal-500 transition-all shadow-inner">
                  <Icons.Lock size={18} className="text-slate-400 mr-3 shrink-0" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    className="bg-transparent w-full outline-none text-sm font-medium text-white placeholder:text-slate-500 font-sans"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                className={`w-full py-4.5 rounded-2xl font-black text-white shadow-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] font-sans border-none cursor-pointer ${
                  loading ? "bg-teal-600/50 text-slate-300" : "bg-teal-500 hover:bg-teal-400 shadow-teal-500/20"
                }`}
              >
                {loading ? (
                  <Icons.Loader2 className="animate-spin" />
                ) : (
                  <Icons.Key size={20} />
                )}
                {loading ? "Güncelleniyor..." : "Şifremi Güncelle"}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/20 rounded-full flex items-center justify-center mx-auto text-teal-400 animate-bounce">
              <Icons.CheckCircle size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white mb-2 font-sans uppercase tracking-tight">
                Şifreniz Güncellendi!
              </h2>
              <p className="text-sm text-slate-400 font-medium font-sans leading-relaxed">
                Şifreniz başarıyla değiştirildi. Artık hesabınıza yeni şifrenizle giriş yapabilirsiniz.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onClose();
                // Clear fields
                setNewPassword("");
                setConfirmPassword("");
                setSuccess(false);
              }}
              className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-black shadow-xl shadow-teal-500/20 transition-all active:scale-[0.98] font-sans border-none cursor-pointer"
            >
              Uygulamaya Git
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdatePasswordModal;
