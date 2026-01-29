import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext'; // Fix import path if needed
import { supabase } from '../../../supabaseClient';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const PartnerAuthScreen = () => {
    const { role } = useParams(); // 'parking', 'valet', 'mechanic', 'parts'
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Theme Configuration based on Role
    const themes = {
        parking: {
            title: 'Otopark İşletmesi',
            color: 'cyan',
            bg: 'from-cyan-900/40 to-slate-950',
            btn: 'bg-cyan-500 hover:bg-cyan-400',
            border: 'border-cyan-500/30'
        },
        valet: {
            title: 'Vale Hizmeti',
            color: 'amber',
            bg: 'from-amber-900/40 to-slate-950',
            btn: 'bg-amber-500 hover:bg-amber-400',
            border: 'border-amber-500/30'
        },
        mechanic: {
            title: 'Usta & Servis',
            color: 'orange',
            bg: 'from-orange-900/40 to-slate-950',
            btn: 'bg-orange-500 hover:bg-orange-400',
            border: 'border-orange-500/30'
        },
        parts: {
            title: 'Parça Tedarikçisi',
            color: 'purple',
            bg: 'from-purple-900/40 to-slate-950',
            btn: 'bg-purple-500 hover:bg-purple-400',
            border: 'border-purple-500/30'
        },
    };

    const currentTheme = themes[role] || themes.parking;

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                // Redirect to Dashboard (The AuthContext will sync the role)
                navigate('/partner/dashboard');
            } else {
                // Register
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: `${currentTheme.title} Yetkilisi`,
                            role: role // Critical: Register with the selected Role
                        }
                    }
                });
                if (error) throw error;
                // If auto-confirm is on:
                navigate('/partner/dashboard');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center p-4 bg-gradient-to-br ${currentTheme.bg}`}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-md bg-slate-900/80 backdrop-blur-xl border ${currentTheme.border} p-8 rounded-2xl shadow-2xl relative overflow-hidden`}
            >
                {/* Glow Effect */}
                <div className={`absolute top-0 left-0 w-full h-2 bg-${currentTheme.color}-500`} />

                <button onClick={() => navigate('/partner-login')} className="text-slate-400 hover:text-white mb-6 flex items-center gap-2 text-sm">
                    <ArrowLeft size={16} /> Geri Dön
                </button>

                <h2 className="text-3xl font-bold text-white font-outfit mb-2">{currentTheme.title}</h2>
                <p className="text-slate-400 mb-8">{isLogin ? 'Yönetim Paneline Giriş Yap' : 'Yeni İş Ortağı Başvurusu'}</p>

                {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4 text-sm">{error}</div>}

                <form onSubmit={handleAuth} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">E-Posta Adresi</label>
                        <input
                            type="email"
                            required
                            className={`w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-${currentTheme.color}-500 outline-none transition-colors`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-1">Şifre</label>
                        <input
                            type="password"
                            required
                            className={`w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-${currentTheme.color}-500 outline-none transition-colors`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl text-black font-bold font-outfit mt-4 flex items-center justify-center gap-2 ${currentTheme.btn} transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {loading && <Loader2 className="animate-spin" size={20} />}
                        {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-slate-500 hover:text-white text-sm transition-colors"
                    >
                        {isLogin ? 'Hesabınız yok mu? Başvuru Yapın' : 'Zaten üye misiniz? Giriş Yapın'}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default PartnerAuthScreen;
