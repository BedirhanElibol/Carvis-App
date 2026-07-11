import React, { memo } from "react";
import { HardDrive, Zap, TrendingUp, CheckCircle2 } from "lucide-react";

const FeatureEnterprise = memo(({ language }) => {
  return (
    <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
      {/* Left: Graphic mockup of EV Battery SoH and Big Data Dashboard */}
      <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none"></div>

        <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
          <div>
            <span className="text-[8px] font-black text-blue-500 tracking-wider uppercase">{language === "tr" ? "BÜYÜK VERİ & FİLO YÖNETİMİ" : "BIG DATA & FLEET MANAGEMENT"}</span>
            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {language === "tr" ? "RAPIDSY ENTERPRISE & EV" : "RAPIDSY ENTERPRISE & EV"}
            </h4>
          </div>
          <HardDrive className="text-blue-500" size={18} />
        </div>

        {/* EV Battery Status Mockup */}
        <div className="bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-2xl p-5 mb-4 text-left">
          <div className="flex justify-between items-center mb-3">
            <span className="text-[8px] font-black text-slate-400 uppercase">
              {language === "tr" ? "EV BATARYA SAĞLIĞI (SoH)" : "EV BATTERY HEALTH (SoH)"}
            </span>
            <Zap size={14} className="text-blue-500" />
          </div>
          <div className="flex items-end gap-3 mb-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white leading-none">%94.2</span>
            <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">{language === "tr" ? "KUSURSUZ" : "PERFECT"}</span>
          </div>
          <div className="w-full h-2 bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-[94.2%]"></div>
          </div>
          <p className="text-[9px] text-slate-500 font-bold mt-2">
            {language === "tr" ? "Telemetri verisine göre hücresel degredasyon (kayıp) normal sınırlar içindedir." : "Cellular degradation is within normal limits based on telemetry data."}
          </p>
        </div>

        {/* Fleet & Big Data Prediction card */}
        <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 flex items-start justify-between text-left">
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
              <TrendingUp size={16} className="text-blue-500" />
            </div>
            <div>
              <h5 className="text-[10px] font-black text-slate-900 dark:text-white uppercase mb-1">
                {language === "tr" ? "ÖNLEYİCİ BAKIM TAHMİNİ (AI)" : "PREDICTIVE MAINTENANCE (AI)"}
              </h5>
              <p className="text-[9px] text-slate-500 font-medium">
                {language === "tr"
                  ? "Bölgenizdeki 14.200 Fiat Egea verisine dayanarak, 2.500 KM içinde triger seti değişimi öngörülmektedir."
                  : "Based on 14,200 fleet data points, a timing belt replacement is predicted within 2,500 KM."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Pitch copy */}
      <div className="w-full lg:w-1/2 space-y-6 text-left">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[9px] font-black text-blue-500 tracking-widest uppercase">
          {language === "tr" ? "OTOMOTİV VERİ EKOSİSTEMİ" : "AUTOMOTIVE DATA ECOSYSTEM"}
        </span>
        <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
          {language === "tr" ? "GELECEĞİN BÜYÜK VERİSİ VE EV ALTYAPISI" : "BIG DATA & EV INFRASTRUCTURE OF THE FUTURE"}
        </h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
          {language === "tr"
            ? "Rapidsy sadece bir tamir aracı değil, kasko firmaları ve kurumsal filolar için devasa bir veri analiz platformudur. Kullanıcıların kilometre, arıza ve lokasyon verileri kullanılarak 'Önleyici Bakım (Predictive Maintenance)' algoritmaları çalıştırılır. Üstelik elektrikli araçların (EV) yaygınlaşmasıyla birlikte, Batarya Sağlık (SoH) skorlarınızı canlı telemetri üzerinden takip edebileceğiniz ilk akıllı ekosistemdir."
            : "Rapidsy is not just a repair tool; it's a massive data analysis platform for insurance companies and corporate fleets. Using mileage, breakdown, and location data, 'Predictive Maintenance' algorithms are constantly running. Furthermore, as EVs take over, Rapidsy is the first smart ecosystem allowing you to monitor your Battery State of Health (SoH) scores via live telemetry."}
        </p>
        <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Sigorta ve Filolar için Veri API'leri" : "Data APIs for Insurance and Fleets"}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Elektrikli Araç (EV) Batarya Degredasyon Takibi" : "Electric Vehicle (EV) Battery Degradation Tracking"}</span>
          </li>
          <li className="flex items-center gap-2.5">
            <CheckCircle2 className="text-teal-400 shrink-0" size={16} />
            <span>{language === "tr" ? "Makine Öğrenimi (ML) ile Önleyici Bakım Uyarıları" : "Predictive Maintenance Alerts powered by ML"}</span>
          </li>
        </ul>
      </div>
    </div>
  );
});

FeatureEnterprise.displayName = 'FeatureEnterprise';
export default FeatureEnterprise;
