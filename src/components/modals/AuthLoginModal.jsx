import React, { useState } from 'react';
import { X, Mail, Lock, LogIn, Store, User, Loader2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const AuthLoginModal = ({ show, onClose, t, onSwitchToRegister, handleAuthSuccess }) => {
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [loginType, setLoginType] = useState('customer'); // 'customer' or 'seller'
    const [errorMsg, setErrorMsg] = useState('');

    if (!show || !t) return null;

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

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
            setErrorMsg(error.message === "Invalid login credentials" ? "E-posta veya şifre hatalı." : error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[90] flex items-center justify-center backdrop-blur-sm animate-in fade-in p-4">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Decorative Background */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>

                <button onClick={onClose} className="absolute top-4 right-4 bg-slate-50 p-2 rounded-full hover:bg-slate-100 transition">
                    <X size={20} className="text-slate-500" />
                </button>

                <div className="text-center mb-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">{t.loginTitle || "Giriş Yap"}</h2>
                    <p className="text-sm text-slate-500 font-medium">Hesabınıza erişmek için bilgilerinizi girin.</p>
                </div>

                {/* Login Type Selector - REMOVED (Request: Kurumsal giriş sekme olarak görülmemeli) */}
                {/* 
                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6 relative">
                    ...
                </div> 
                */}
                <div className="mb-6 flex items-center justify-center gap-2 text-blue-600 font-black uppercase tracking-widest text-xs">
                    <User size={16} /> Müşteri Girişi
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 ml-1">{t.email}</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center px-3 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                            <Mail size={18} className="text-slate-400 mr-3" />
                            <input
                                type="email"
                                required
                                className="bg-transparent w-full outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
                                placeholder="ornek@email.com"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 ml-1">{t.password}</label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl flex items-center px-3 py-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 transition-all">
                            <Lock size={18} className="text-slate-400 mr-3" />
                            <input
                                type="password"
                                required
                                className="bg-transparent w-full outline-none text-sm font-medium text-slate-900 placeholder:text-slate-400"
                                placeholder="••••••••"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {errorMsg && (
                        <div className="text-red-500 text-xs font-bold bg-red-50 p-3 rounded-xl flex items-center justify-center animate-shake">
                            {errorMsg}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-black text-white shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${loginType === 'seller' ? 'bg-orange-600 hover:bg-orange-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <LogIn size={20} />}
                        {loading ? "Giriş Yapılıyor..." : t.loginButton}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-xs text-slate-500 font-medium">
                        Hesabınız yok mu?{' '}
                        <button onClick={onSwitchToRegister} className="text-blue-600 font-bold hover:underline">
                            Hemen Kayıt Ol
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthLoginModal;
