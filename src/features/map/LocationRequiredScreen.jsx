import React from "react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * LocationRequiredScreen Component
 * Full-screen overlay shown when location permissions are missing.
 */
const LocationRequiredScreen = ({ onRetry }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-8 text-center overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-900/40 via-slate-950 to-black pointer-events-none opacity-50"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      <div className="relative z-10 max-w-sm flex flex-col items-center animate-in fade-in zoom-in-95 duration-700">
        {/* Back Button Area - Top Left */}
        <button
          onClick={() => navigate(-1)}
          className="absolute -top-12 -left-4 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-white transition-colors group"
        >
          <Icons.ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Geri Dön
          </span>
        </button>

        {/* Icon Cluster */}
        <div className="relative mb-10">
          <div className="w-24 h-24 bg-gradient-to-tr from-primary-600 to-primary-600 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.4)] rotate-12 group-hover:rotate-0 transition-transform duration-500">
            <Icons.MapPin size={48} className="text-slate-900 dark:text-white -rotate-12" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-full flex items-center justify-center shadow-xl animate-bounce">
            <Icons.ShieldAlert size={20} className="text-red-500" />
          </div>
        </div>

        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-4 leading-none">
          Konum İzni <span className="text-primary-500">Gerekli</span>
        </h1>

        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-10 text-sm">
          Carvis piyasa fiyatlarını, yakındaki yedek parçacıları ve acil yol
          yardım ekiplerini bulmak için gerçek konumunuza ihtiyaç duyar. <br />
          <br />
          <span className="text-slate-700 dark:text-slate-200 font-bold">
            Lütfen tarayıcı ayarlarından konuma izin verin ve devam edin.
          </span>
        </p>

        <div className="w-full space-y-4">
          <button
            onClick={onRetry}
            className="w-full bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-2xl shadow-primary-900/50 transition-all active-scale-95 group"
          >
            <Icons.RefreshCw
              size={20}
              className="group-active-rotate-180 transition-transform duration-500"
            />
            İzni Tekrar İste
          </button>

          <button
            onClick={() => navigate(-1)}
            className="w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 hover:bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 transition-all active-scale-95"
          >
            Şimdi Değil, Geri Dön
          </button>
        </div>

        <div className="mt-12 flex items-center gap-3 opacity-20">
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
          <span className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.4em]">
            Carvis Global Privacy
          </span>
          <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default LocationRequiredScreen;
