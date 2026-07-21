import React from 'react';
import { Zap, Target, BarChart3, TrendingUp, CheckCircle2 } from 'lucide-react';

const APP_FEATURES = [
  "Periyodik Bakım",
  "Orijinal Yedek Parça",
  "Yol Yardım & Akü",
  "Kasko & Sigorta",
  "Oto Kuaför",
  "Ekspertiz",
  "Hasar Onarımı",
  "Akaryakıt Asistanı"
];

const LandingTrustBanner = ({ language }) => {
  return (
    <section className="w-full bg-gradient-to-b from-transparent to-slate-100/50 dark:from-transparent dark:to-[#0a0f1c] pt-20 pb-12 relative z-20 overflow-hidden">
      
      {/* CSS for Marquee */}
      <style>
        {`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}
      </style>

      <div className="w-full max-w-7xl mx-auto px-6 md:px-12 mb-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12 md:gap-8 text-center md:text-left">
          
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-500/10 flex items-center justify-center mb-2">
              <Zap size={16} className="text-yellow-600 dark:text-yellow-500" />
            </div>
            <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">81 İlde</span>
            <span className="text-[15px] text-slate-700 dark:text-slate-300 font-medium mt-1">Kesintisiz Hizmet</span>
            <span className="text-[13px] text-slate-500 mt-0.5">Türkiye'nin her yerinde</span>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mb-2">
              <Target size={16} className="text-blue-600 dark:text-blue-500" />
            </div>
            <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">2,000+</span>
            <span className="text-[15px] text-slate-700 dark:text-slate-300 font-medium mt-1">Onaylı Usta</span>
            <span className="text-[13px] text-slate-500 mt-0.5">Referanslı iş ortakları</span>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mb-2">
              <BarChart3 size={16} className="text-emerald-600 dark:text-emerald-500" />
            </div>
            <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">%100</span>
            <span className="text-[15px] text-slate-700 dark:text-slate-300 font-medium mt-1">Havuz Ödeme</span>
            <span className="text-[13px] text-slate-500 mt-0.5">Paranız güvence altında</span>
          </div>

          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mb-2">
              <TrendingUp size={16} className="text-blue-600 dark:text-blue-500" />
            </div>
            <span className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">2.5x</span>
            <span className="text-[15px] text-slate-700 dark:text-slate-300 font-medium mt-1">Maliyet Avantajı</span>
            <span className="text-[13px] text-slate-500 mt-0.5">Piyasa rekabeti sayesinde</span>
          </div>

        </div>
      </div>

      {/* Features Marquee Section */}
      <div className="w-full border-y border-slate-200 dark:border-white/5 bg-slate-200/50 dark:bg-white/[0.02] py-4 relative">
        {/* Left/Right Fade Masks */}
        <div className="absolute left-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-r from-slate-100/50 dark:from-[#0a0f1c] to-transparent z-10"></div>
        <div className="absolute right-0 top-0 bottom-0 w-16 md:w-32 bg-gradient-to-l from-slate-100/50 dark:from-[#0a0f1c] to-transparent z-10"></div>
        
        <div className="animate-marquee flex gap-12 pl-12 items-center">
          {/* Double the array for seamless infinite scroll */}
          {[...APP_FEATURES, ...APP_FEATURES].map((feature, index) => (
            <div key={index} className="flex items-center gap-2 whitespace-nowrap">
              <CheckCircle2 size={14} className="text-blue-500" />
              <span className="text-slate-600 dark:text-slate-400 font-medium text-[14px]">{feature}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
};

export default LandingTrustBanner;
