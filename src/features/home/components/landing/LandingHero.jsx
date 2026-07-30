import React, { memo } from "react";
import { 
  ArrowRight, Search, MapPin, Gauge, ShieldCheck, Banknote, 
  Car, Wrench, Package, Shield, Fuel, Sparkles, CheckCircle2, 
  Clock, Activity, Star, ChevronRight 
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../../../../assets/logo.png";

const LandingHero = memo(({ t, language, fuelPrices, fuelCity, isLoadingFuel }) => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full pt-16 pb-24 md:pt-24 md:pb-28 bg-transparent overflow-hidden">
      
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 rounded-full blur-[140px] pointer-events-none -z-10 animate-pulse"></div>
      <div className="absolute top-1/3 left-1/10 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        
        {/* Left Column: Text & Hero Content (7 Columns on LG) */}
        <div className="lg:col-span-7 flex flex-col items-start text-left">
          
          {/* Top Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/5 dark:bg-white/10 border border-slate-900/10 dark:border-white/15 backdrop-blur-md mb-6"
          >
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
            <span className="text-xs font-bold tracking-wide uppercase text-slate-800 dark:text-cyan-300 font-mono">
              ⚡ YENİ NESİL DİJİTAL OTO PLATFORMU
            </span>
          </motion.div>
          
          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[68px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-6 font-sans"
          >
            {language === "tr" ? "Aracınızı yönetin, " : "Manage your car, "} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-emerald-400">
              {language === "tr" ? "Şeffaf " : "Transparent "}
            </span>
            <span className="text-slate-900 dark:text-white">
              {language === "tr" ? "ve" : "and"}
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              {language === "tr" ? "Güvenilir." : "Secure."}
            </span>
          </motion.h1>

          {/* Supporting Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-xl mb-8 leading-relaxed font-normal"
          >
            {language === "tr" 
              ? "Sanayi sürprizlerini unutun. Bakım, yedek parça ve ekspertiz ihtiyaçlarınız için çevrenizdeki en iyi ustalardan anında teklif toplayın; paranızı havuz güvencesiyle koruyun." 
              : "Forget garage surprises. Get instant quotes from top local mechanics for maintenance, spare parts, and mobile inspection. Keep your money safe in escrow."}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-auto mb-10"
          >
            <button 
              onClick={() => navigate("/application/home")}
              className="group bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-600 hover:opacity-95 text-white rounded-2xl px-8 py-4 font-bold transition-all flex items-center justify-center gap-3 text-base shadow-xl shadow-blue-500/25 active:scale-95 cursor-pointer border-none"
            >
              <span>{language === "tr" ? "Hemen Başla" : "Start Now"}</span>
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>

            <button 
              onClick={() => navigate("/partner-login")}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white rounded-2xl px-7 py-4 font-bold transition-all flex items-center justify-center gap-2.5 text-base active:scale-95 cursor-pointer shadow-lg shadow-black/5"
            >
              <Wrench size={18} className="text-cyan-500" />
              <span>{language === "tr" ? "Usta / İş Ortakları" : "Mechanics & Partners"}</span>
            </button>
          </motion.div>
          
          {/* Feature Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-2.5 text-xs font-semibold"
          >
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400">
              <Wrench size={14} /> Oto Bakım & Tamir
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck size={14} /> Dijital Araç Pasaportu
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Package size={14} /> Şase Uyumlu Parça
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400">
              <Fuel size={14} /> Canlı Akaryakıt
            </span>
          </motion.div>

        </div>

        {/* Right Column: Premium Vehicle Telemetry & Live Interactive Hub (5 Columns on LG) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="lg:col-span-5 relative w-full flex flex-col items-center justify-center my-4 lg:my-0"
        >
          {/* Interactive Modern Vehicle Card Container */}
          <div className="relative w-full max-w-md mx-auto bg-gradient-to-b from-white/90 via-slate-50/80 to-white/90 dark:from-slate-900/90 dark:via-[#0c1329]/90 dark:to-slate-900/90 backdrop-blur-2xl border-2 border-slate-200/90 dark:border-cyan-500/30 rounded-[2.5rem] p-6 shadow-2xl shadow-cyan-500/10 overflow-hidden">
            
            {/* Background Decorative Grid */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.07] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>

            {/* Header: Live Telemetry Status */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-500">
                  <Car size={22} />
                </div>
                <div>
                  <h3 className="font-mono font-black text-slate-900 dark:text-white text-base leading-tight uppercase tracking-tight">
                    BMW 320i Sedan
                  </h3>
                  <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    CANLI TELEMETRİ • 34 BJK 019
                  </span>
                </div>
              </div>

              <div className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-black text-[10px] uppercase">
                %98 MÜKEMMEL
              </div>
            </div>

            {/* Live Interactive Action Cards inside Control Hub */}
            <div className="space-y-3.5 relative z-10">

              {/* Action 1: Periyodik Bakım Bids */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate("/application/home")}
                className="bg-white dark:bg-slate-900/90 border border-blue-200 dark:border-blue-500/30 hover:border-blue-400 rounded-2xl p-3.5 shadow-md flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/30 shrink-0">
                    <Wrench size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 dark:text-white text-sm font-sans">Periyodik Bakım</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-mono font-black text-[9px]">
                        5 USTA
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                      Ostim Garaj: <strong className="text-blue-600 dark:text-blue-400">1.850 ₺ En Uygun Teklif</strong>
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-blue-500 transition-all shrink-0" />
              </motion.div>

              {/* Action 2: Şase Uyumlu Parça */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate("/application/home")}
                className="bg-white dark:bg-slate-900/90 border border-indigo-200 dark:border-indigo-500/30 hover:border-indigo-400 rounded-2xl p-3.5 shadow-md flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/30 shrink-0">
                    <Package size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 dark:text-white text-sm font-sans">Şase Uyumlu Parça</span>
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-mono font-black text-[9px] flex items-center gap-0.5">
                        <CheckCircle2 size={10} /> ONAYLI
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                      Bosch Yağ & Hava Filtre Seti (Orijinal)
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-500 transition-all shrink-0" />
              </motion.div>

              {/* Action 3: Dijital Araç Pasaportu */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate("/application/home")}
                className="bg-white dark:bg-slate-900/90 border border-emerald-200 dark:border-emerald-500/30 hover:border-emerald-400 rounded-2xl p-3.5 shadow-md flex items-center justify-between cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-500/30 shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900 dark:text-white text-sm font-sans">Dijital Araç Pasaportu</span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-300 font-medium">
                      EGM Servis Geçmişi & Tramer QR Doğrulama
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-slate-400 group-hover:translate-x-1 group-hover:text-emerald-500 transition-all shrink-0" />
              </motion.div>

            </div>

            {/* Bottom Footer Inside Hub */}
            <div className="mt-5 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
                <Shield size={14} className="text-cyan-500" />
                <span>Havuz Ödeme & 1.000.000₺ Güvence</span>
              </div>
              <span className="text-cyan-600 dark:text-cyan-400 font-mono font-bold hover:underline cursor-pointer" onClick={() => navigate("/application/home")}>
                İncele →
              </span>
            </div>

          </div>
        </motion.div>

      </div>

      {/* Fuel Prices Marquee Footer */}
      {fuelPrices && fuelPrices.length > 0 && !isLoadingFuel && (
        <div className="absolute bottom-0 left-0 w-full bg-slate-100 dark:bg-[#090e1a] border-t border-slate-200 dark:border-white/10 py-3 flex items-center z-30">
          
          {/* Static Label Left */}
          <div className="absolute left-0 top-0 bottom-0 z-40 bg-slate-100 dark:bg-[#080d19] px-4 md:px-8 flex items-center border-r border-slate-200 dark:border-white/10 shadow-[10px_0_15px_rgba(0,0,0,0.05)] dark:shadow-[10px_0_15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Fuel size={14} className="text-emerald-500" />
                {fuelCity?.toUpperCase() || "İSTANBUL"}
              </span>
            </div>
          </div>

          <div className="w-full overflow-hidden ml-24 md:ml-40 flex relative">
            <div 
              className="flex items-center whitespace-nowrap animate-marquee"
              style={{
                willChange: "transform",
                transform: "translate3d(0,0,0)",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden"
              }}
            >
              {[...fuelPrices, ...fuelPrices].map((station, index) => (
                <div key={index} className="flex items-center gap-3 mx-4 md:mx-6 text-[12px] md:text-[13px] shrink-0 transform-gpu">
                  <span className="font-bold text-slate-800 dark:text-white">{station.marka || "İstasyon"}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 dark:text-slate-400">Benzin:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{station.benzin || "-"}₺</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 dark:text-slate-400">Motorin:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{station.motorin || "-"}₺</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500 dark:text-slate-400">LPG:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{station.lpg || "-"}₺</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      )}

    </section>
  );
});

LandingHero.displayName = 'LandingHero';
export default LandingHero;
