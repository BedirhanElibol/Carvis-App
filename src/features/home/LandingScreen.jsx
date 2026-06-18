import React, { useEffect } from "react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";

const LandingScreen = () => {
  const { t, openModal } = useUI();
  const { currentUser, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  const handleGuestEntry = () => {
    loginAsGuest();
    navigate("/application/home");
  };

  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous) {
      if (currentUser.role === "admin") {
        navigate("/admin/dashboard");
      } else if (["parking", "valet", "mechanic", "parts"].includes(currentUser.role)) {
        navigate("/partner/dashboard");
      } else {
        navigate("/application/home");
      }
    }
  }, [currentUser, navigate]);

  return (
    <div className="h-[100dvh] w-full flex flex-col relative bg-[#020617] overflow-hidden font-sans">
      {/* Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] right-[15%] w-[400px] h-[400px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-[20%] left-[10%] w-[350px] h-[350px] bg-orange-600/15 rounded-full blur-[100px] animate-liquid"></div>
        <div className="absolute top-[40%] left-[30%] w-[500px] h-[500px] bg-teal-900/20 rounded-full blur-[120px] animate-pulse"></div>
      </div>

      <div className="flex-[1.5] flex flex-col items-center justify-center p-6 relative z-10">
        <div className="relative z-20 mb-4 flex flex-col items-center gap-4 animate-fade-in group">
          <img
            src={logo}
            alt="Rapidsy Logosu"
            className="w-32 md:w-48 h-auto object-contain drop-shadow-[0_0_50px_rgba(20,184,166,0.4)] transition-all duration-700 group-hover:scale-105"
          />
          <h2 className="text-white text-3xl font-black tracking-[0.2em] font-sans uppercase">
            RAPIDSY
          </h2>
        </div>
        <h1 className="text-white text-2xl md:text-4xl font-black text-center tracking-tighter leading-none mb-4 animate-slide-up uppercase mt-4">
          TÜRKİYE'NİN AKILLI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-orange-400">
            OTO PLATFORMU
          </span>
        </h1>
        <p className="text-slate-400 font-medium text-center max-w-[280px] text-sm md:text-lg tracking-tight animate-fade-in delay-200">
          Yedek parça, usta randevusu ve dijital servis takibi ile aracınızın kontrolü sizde olsun.
        </p>
      </div>

      <div className="glass-card rounded-t-[3.5rem] p-8 pb-12 z-30 relative border-t border-white/10 mx-1">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-8"></div>
        <div className="space-y-4 max-w-md mx-auto">
          <button
            onClick={() => openModal("login", "customer")}
            className="w-full group bg-teal-600 hover:bg-teal-500 text-white p-5 rounded-3xl shadow-2xl shadow-teal-900/20 transition-all duration-300 flex items-center active-scale"
            aria-label="Müşteri Girişi"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center mr-5 shrink-0 backdrop-blur-md border border-white/10">
              <Icons.User size={26} className="text-white" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-bold text-lg uppercase font-sans">
                {t.customerMode || "Müşteri Girişi"}
              </h4>
              <p className="text-xs text-teal-100/70 font-medium font-sans">
                Parça Ara & Usta Bul
              </p>
            </div>
            <Icons.ArrowRight size={22} className="text-teal-200" />
          </button>

          <button
            onClick={() => navigate("/partner-login")}
            className="w-full group glass-card text-white p-5 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300 flex items-center active-scale"
            aria-label="Kurumsal Giriş"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mr-5 shrink-0 border border-white/5">
              <Icons.Store size={26} className="text-orange-500" />
            </div>
            <div className="text-left flex-1">
              <h4 className="font-bold text-lg uppercase font-sans">
                {t.sellerMode || "Rapidsy Business"}
              </h4>
              <p className="text-xs text-slate-400 font-medium font-sans">
                İşletmenizi Yönetin
              </p>
            </div>
            <Icons.ChevronRight size={22} className="text-slate-500" />
          </button>

          <div className="text-center pt-4">
            <button
              onClick={handleGuestEntry}
              className="text-[10px] font-black text-slate-500 uppercase tracking-widest hover:text-white transition-colors font-sans"
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
