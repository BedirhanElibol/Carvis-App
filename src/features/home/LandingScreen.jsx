import React from 'react';
import { User, Store, ArrowRight, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';

const LandingScreen = () => {
    const { t, openModal } = useUI();
    const { loginAsGuest } = useAuth();
    const navigate = useNavigate();

    const handleGuestEntry = () => {
        loginAsGuest();
        navigate('/application/home');
    };

    return (
        <div className="h-[100dvh] w-full flex flex-col relative bg-[#020617] overflow-hidden font-sans">
            <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-orange-600/15 rounded-full blur-[100px] animate-liquid"></div>
                <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse"></div>
            </div>

            <div className="flex-[1.5] flex flex-col items-center justify-center p-6 relative z-10">
                <div className="relative z-20 mb-8 flex justify-center w-full px-2 animate-fade-in">
                    <img
                        src={logo}
                        alt="Rapidsy Logo"
                        className="w-[85%] md:w-[600px] h-auto object-contain drop-shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-all duration-700"
                    />
                </div>

                <h1 className="text-white text-3xl md:text-5xl font-black text-center tracking-tighter leading-none mb-4 animate-slide-up">
                    TÜRKİYE'NİN AKILLI <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">OTO PLATFORMU</span>
                </h1>

                <p className="text-slate-400 font-medium text-center max-w-[280px] text-sm md:text-lg tracking-tight animate-fade-in delay-200">
                    {t.welcomeSubtitle || "Hızlı parça ve profesyonel usta çözümleri."}
                </p>
            </div>

            <div className="glass-card rounded-t-[3.5rem] p-8 pb-12 z-30 relative border-t border-white/10 mx-1">
                <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8"></div>

                <div className="space-y-4 max-w-md mx-auto">
                    <button
                        onClick={() => openModal('login', 'customer')}
                        className="w-full group bg-blue-600 hover:bg-blue-500 text-white p-5 rounded-3xl shadow-2xl shadow-blue-900/20 transition-all duration-300 flex items-center active-scale"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mr-5 shrink-0 backdrop-blur-md border border-white/10">
                            <User size={26} className="text-white" />
                        </div>
                        <div className="text-left flex-1">
                            <h4 className="font-bold text-lg">{t.customerMode || "Müşteri Girişi"}</h4>
                            <p className="text-xs text-blue-100/70 font-medium italic">Parça Ara & Usta Bul</p>
                        </div>
                        <ArrowRight size={22} className="text-blue-200" />
                    </button>

                    <button
                        onClick={() => navigate('/partner-login')}
                        className="w-full group glass-card text-white p-5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center active-scale"
                    >
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mr-5 shrink-0 border border-white/5">
                            <Store size={26} className="text-orange-500" />
                        </div>
                        <div className="text-left flex-1">
                            <h4 className="font-bold text-lg">{t.sellerMode || "Carvis Business"}</h4>
                            <p className="text-xs text-slate-400 font-medium">İşletmenizi Yönetin</p>
                        </div>
                        <ChevronRight size={22} className="text-slate-500" />
                    </button>

                    <div className="text-center pt-4">
                        <button
                            onClick={handleGuestEntry}
                            className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
                        >
                            Üye Olmadan Devam Et
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingScreen;
