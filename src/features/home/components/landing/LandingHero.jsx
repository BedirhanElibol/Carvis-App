import React, { memo } from "react";
import { ArrowRight, Search, MapPin, Gauge, ShieldCheck, Banknote, Car, Wrench, Package, Shield, Fuel } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../../../../assets/logo.png";

const LandingHero = memo(({ t, language, fuelPrices, fuelCity, isLoadingFuel }) => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full pt-16 pb-20 md:pt-24 md:pb-28 bg-transparent overflow-hidden">
      
      {/* Background glow matching brand colors */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/10 dark:bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-10"></div>
      <div className="absolute top-1/3 left-1/10 w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        
        {/* Left Column: Text & Hero Content */}
        <div className="flex flex-col items-start text-left">
          
          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-[70px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.08] mb-6 font-sans"
          >
            {language === "tr" ? "Aracınızı yönetin, " : "Manage your car, "} <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 dark:from-blue-400 dark:to-cyan-400">
              {language === "tr" ? "Şeffaf " : "Transparent "}
            </span>
            <span className="text-slate-900 dark:text-white">
              {language === "tr" ? "ve" : "and"}
            </span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-emerald-400">
              {language === "tr" ? "Güvenilir." : "Secure."}
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-lg mb-8 leading-relaxed font-normal"
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
              className="bg-[#2563eb] hover:bg-blue-600 text-white rounded-full px-8 py-3.5 font-medium transition-colors flex items-center justify-center gap-2 text-[15px] shadow-lg shadow-blue-500/20 cursor-pointer border-none"
            >
              <span>{language === "tr" ? "Hemen Başla" : "Start Now"}</span>
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => navigate("/partner-login")}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#1f2937] text-slate-700 dark:text-white rounded-full px-8 py-3.5 font-medium transition-colors flex items-center justify-center gap-2 text-[15px] cursor-pointer"
            >
              <Wrench size={16} className="text-slate-500 dark:text-slate-400" />
              <span>{language === "tr" ? "Usta / İş Ortakları" : "Mechanics & Partners"}</span>
            </button>
          </motion.div>
          
          {/* Concrete App Capabilities */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-2.5 text-[12px] sm:text-[13px] font-medium"
          >
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"><Wrench size={14} /> Oto Servis & Tamir</span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400"><Fuel size={14} /> Akaryakıt & Şarj</span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"><Search size={14} /> Mobil Ekspertiz</span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"><Package size={14} /> Yedek Parça</span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-600 dark:text-teal-400"><ShieldCheck size={14} /> Dijital Araç Pasaportu</span>
          </motion.div>

        </div>

        {/* Right Column: Beautiful Orbiting Graphics (Optimized & Perfectly Scaled for Mobile & Desktop) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="relative h-[320px] xs:h-[370px] sm:h-[440px] md:h-[500px] w-full flex items-center justify-center my-4 lg:my-0 select-none"
        >
          {/* Concentric Orbit Rings */}
          <div className="absolute w-[270px] xs:w-[330px] sm:w-[420px] md:w-[460px] h-[270px] xs:h-[330px] sm:h-[420px] md:h-[460px] rounded-full border border-slate-200/80 dark:border-white/10"></div>
          <div className="absolute w-[190px] xs:w-[230px] sm:w-[290px] md:w-[320px] h-[190px] xs:h-[230px] sm:h-[290px] md:h-[320px] rounded-full border border-slate-300/80 dark:border-white/15"></div>
          <div className="absolute w-[110px] xs:w-[130px] sm:w-[170px] md:w-[190px] h-[110px] xs:h-[130px] sm:h-[170px] md:h-[190px] rounded-full border border-dashed border-blue-500/30"></div>
          
          {/* Center Logo Glass Pill */}
          <div className="absolute px-5 py-3.5 xs:px-7 xs:py-4 sm:px-8 sm:py-5 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-xl border border-slate-200 dark:border-white/15 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/15 z-10">
            <img src={logo} alt="Rapidsy" className="h-6 xs:h-7 sm:h-9 w-auto object-contain block dark:hidden brightness-0" />
            <img src={logo} alt="Rapidsy" className="h-6 xs:h-7 sm:h-9 w-auto object-contain hidden dark:block" />
          </div>

          {/* Floating UI Feature Cards (Positioned & Scaled proportionally for Mobile) */}
          
          {/* 1. Top Card: Periyodik Bakım */}
          <motion.div 
            animate={{ y: [0, -7, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[0%] xs:top-[2%] sm:top-[6%] left-[50%] -translate-x-1/2 bg-white/95 dark:bg-[#0c1327]/95 backdrop-blur-md border border-blue-200 dark:border-blue-500/30 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl flex items-center gap-2.5 sm:gap-3 shadow-xl z-20 hover:scale-105 transition-transform"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-500/20 shrink-0">
              <Wrench size={16} className="sm:hidden" />
              <Wrench size={20} className="hidden sm:block" />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm font-sans leading-tight">
                {language === "tr" ? "Periyodik Bakım" : "Periodic Maintenance"}
              </div>
              <div className="text-blue-600 dark:text-blue-400 text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap">
                {language === "tr" ? "5 Servisten Teklif Geldi" : "5 Bids Received"}
              </div>
            </div>
          </motion.div>

          {/* 2. Bottom Right Card: Yedek Parça Siparişi */}
          <motion.div 
            animate={{ y: [0, 7, 0] }} 
            transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[2%] xs:bottom-[4%] sm:bottom-[12%] right-[1%] xs:right-[2%] bg-white/95 dark:bg-[#0c1327]/95 backdrop-blur-md border border-indigo-200 dark:border-indigo-500/30 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl flex items-center gap-2.5 sm:gap-3 shadow-xl z-20 hover:scale-105 transition-transform"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/20 shrink-0">
              <Package size={16} className="sm:hidden" />
              <Package size={20} className="hidden sm:block" />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm font-sans leading-tight">
                {language === "tr" ? "Yedek Parça Siparişi" : "Spare Parts Order"}
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap">
                {language === "tr" ? "Şaseye Uyum Garantili" : "Guaranteed Fit Delivery"}
              </div>
            </div>
          </motion.div>

          {/* 3. Bottom Left Card: Dijital Araç Pasaportu */}
          <motion.div 
            animate={{ y: [0, 6, 0] }} 
            transition={{ duration: 4.4, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            className="absolute bottom-[4%] xs:bottom-[6%] sm:bottom-[14%] left-[1%] xs:left-[2%] bg-white/95 dark:bg-[#0c1327]/95 backdrop-blur-md border border-emerald-200 dark:border-emerald-500/30 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl flex items-center gap-2.5 sm:gap-3 shadow-xl z-20 hover:scale-105 transition-transform"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20 shrink-0">
              <ShieldCheck size={16} className="sm:hidden" />
              <ShieldCheck size={20} className="hidden sm:block" />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-bold text-xs sm:text-sm font-sans leading-tight">
                {language === "tr" ? "Dijital Araç Pasaportu" : "Digital Car Passport"}
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 text-[10px] sm:text-xs font-semibold mt-0.5 whitespace-nowrap">
                {language === "tr" ? "Resmi Kayıt & Ekspertiz" : "Official Record & Report"}
              </div>
            </div>
          </motion.div>

        </motion.div>

      </div>

      {/* Fuel Prices Marquee Footer */}
      {fuelPrices && fuelPrices.length > 0 && !isLoadingFuel && (
        <div className="absolute bottom-0 left-0 w-full bg-slate-100 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 py-3 flex items-center z-30">
          
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
