import React, { memo } from "react";
import { ArrowRight, Search, MapPin, Gauge, ShieldCheck, Banknote, Car, Wrench, Package, Shield, Fuel } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../../../../assets/logo.png";

const LandingHero = memo(({ t, language, fuelPrices, fuelCity, isLoadingFuel, onStart }) => {
  const navigate = useNavigate();

  const handleStartAction = () => {
    if (onStart) {
      onStart();
    } else {
      navigate("/application/home");
    }
  };

  return (
    <section className="relative w-full pt-12 pb-20 md:pt-20 md:pb-24 bg-transparent overflow-hidden">
      
      {/* Glow Effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-tr from-blue-500/15 via-cyan-500/10 to-transparent rounded-full blur-[140px] pointer-events-none -z-10"></div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        
        {/* Left / Top Column: Typography & CTAs */}
        <div className="lg:col-span-7 flex flex-col items-center text-center lg:items-start lg:text-left">
          
          {/* Main Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl sm:text-5xl lg:text-[66px] font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-4 sm:mb-6 font-sans"
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
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-lg mb-6 sm:mb-8 leading-relaxed font-normal"
          >
            {language === "tr" 
              ? "Sanayi sürprizlerini unutun. Bakım, yedek parça ve ekspertiz ihtiyaçlarınız için çevrenizdeki en iyi ustalardan anında teklif toplayın." 
              : "Forget garage surprises. Get instant quotes from top local mechanics for maintenance, spare parts, and mobile inspection."}
          </motion.p>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col xs:flex-row gap-3 w-full xs:w-auto mb-6 sm:mb-8 justify-center lg:justify-start"
          >
            <button 
              onClick={handleStartAction}
              className="bg-[#2563eb] hover:bg-blue-600 text-white rounded-full px-7 py-3.5 font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-[15px] shadow-lg shadow-blue-500/25 cursor-pointer border-none active:scale-95"
            >
              <span>{language === "tr" ? "Hemen Başla" : "Start Now"}</span>
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => navigate("/partner-login")}
              className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#1f2937] text-slate-700 dark:text-white rounded-full px-7 py-3.5 font-bold transition-all flex items-center justify-center gap-2 text-sm sm:text-[15px] cursor-pointer active:scale-95"
            >
              <Wrench size={16} className="text-slate-500 dark:text-slate-400" />
              <span>{language === "tr" ? "Usta / İş Ortakları" : "Partners"}</span>
            </button>
          </motion.div>
          
          {/* Capability Badges */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-medium"
          >
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"><Wrench size={13} /> Oto Servis</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400"><Fuel size={13} /> Akaryakıt</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"><Search size={13} /> Ekspertiz</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"><Package size={13} /> Yedek Parça</span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 text-teal-600 dark:text-teal-400"><ShieldCheck size={13} /> Araç Pasaportu</span>
          </motion.div>

        </div>

        {/* Right / Bottom Column: Authentic Orbital System (Optimized & Beautifully Positioned on Mobile & Desktop) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="lg:col-span-5 relative w-full h-[320px] xs:h-[360px] sm:h-[430px] md:h-[480px] flex items-center justify-center my-2 lg:my-0 select-none"
        >
          {/* Orbital Concentric Rings */}
          <div className="absolute w-[260px] xs:w-[310px] sm:w-[380px] md:w-[440px] h-[260px] xs:h-[310px] sm:h-[380px] md:h-[440px] rounded-full border border-slate-200/90 dark:border-white/10 shadow-[0_0_40px_rgba(59,130,246,0.05)]"></div>
          <div className="absolute w-[180px] xs:w-[210px] sm:w-[260px] md:w-[300px] h-[180px] xs:h-[210px] sm:h-[260px] md:h-[300px] rounded-full border border-slate-300/80 dark:border-white/15"></div>
          <div className="absolute w-[100px] xs:w-[120px] sm:w-[150px] md:w-[170px] h-[100px] xs:h-[120px] sm:h-[150px] md:h-[170px] rounded-full border border-dashed border-blue-500/40 animate-spin" style={{ animationDuration: '40s' }}></div>
          
          {/* Center Brand Logo Pill */}
          <div className="absolute px-5 py-3 xs:px-6 xs:py-3.5 sm:px-8 sm:py-4 bg-white/95 dark:bg-[#080e1e]/95 backdrop-blur-2xl border-2 border-blue-500/30 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20 z-10">
            <img src={logo} alt="Rapidsy" className="h-6 xs:h-7 sm:h-8 w-auto object-contain block dark:hidden brightness-0" />
            <img src={logo} alt="Rapidsy" className="h-6 xs:h-7 sm:h-8 w-auto object-contain hidden dark:block" />
          </div>

          {/* Real Orbit Nodes (Positioned Exactly Along the Circle Boundary) */}
          
          {/* Node 1: Top Center (12 o'clock on Orbit Ring) */}
          <motion.div 
            animate={{ y: [0, -6, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            onClick={handleStartAction}
            className="absolute top-[2%] sm:top-[4%] left-1/2 -translate-x-1/2 bg-white/95 dark:bg-[#0c1429]/95 backdrop-blur-xl border border-blue-300/80 dark:border-blue-500/40 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2 sm:gap-2.5 shadow-xl z-20 hover:scale-105 cursor-pointer transition-transform"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 shrink-0">
              <Wrench size={15} className="sm:hidden" />
              <Wrench size={18} className="hidden sm:block" />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-bold text-[11px] sm:text-xs font-sans leading-tight">
                {language === "tr" ? "Periyodik Bakım" : "Maintenance"}
              </div>
              <div className="text-blue-600 dark:text-blue-400 text-[9px] sm:text-[10px] font-semibold mt-0.5 whitespace-nowrap">
                {language === "tr" ? "5 Servisten Teklif Geldi" : "5 Bids Received"}
              </div>
            </div>
          </motion.div>

          {/* Node 2: Bottom Right (4 o'clock on Orbit Ring) */}
          <motion.div 
            animate={{ y: [0, 6, 0] }} 
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            onClick={handleStartAction}
            className="absolute bottom-[4%] sm:bottom-[8%] right-[0%] sm:right-[2%] bg-white/95 dark:bg-[#0c1429]/95 backdrop-blur-xl border border-indigo-300/80 dark:border-indigo-500/40 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2 sm:gap-2.5 shadow-xl z-20 hover:scale-105 cursor-pointer transition-transform"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold border border-indigo-500/30 shrink-0">
              <Package size={15} className="sm:hidden" />
              <Package size={18} className="hidden sm:block" />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-bold text-[11px] sm:text-xs font-sans leading-tight">
                {language === "tr" ? "Yedek Parça Siparişi" : "Spare Parts"}
              </div>
              <div className="text-indigo-600 dark:text-indigo-400 text-[9px] sm:text-[10px] font-semibold mt-0.5 whitespace-nowrap">
                {language === "tr" ? "Şaseye Uyum Garantili" : "Guaranteed Fit"}
              </div>
            </div>
          </motion.div>

          {/* Node 3: Bottom Left (8 o'clock on Orbit Ring) */}
          <motion.div 
            animate={{ y: [0, 5, 0] }} 
            transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
            onClick={handleStartAction}
            className="absolute bottom-[4%] sm:bottom-[8%] left-[0%] sm:left-[2%] bg-white/95 dark:bg-[#0c1429]/95 backdrop-blur-xl border border-emerald-300/80 dark:border-emerald-500/40 px-3 py-2 sm:px-4 sm:py-2.5 rounded-2xl flex items-center gap-2 sm:gap-2.5 shadow-xl z-20 hover:scale-105 cursor-pointer transition-transform"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 shrink-0">
              <ShieldCheck size={15} className="sm:hidden" />
              <ShieldCheck size={18} className="hidden sm:block" />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-bold text-[11px] sm:text-xs font-sans leading-tight">
                {language === "tr" ? "Araç Pasaportu" : "Car Passport"}
              </div>
              <div className="text-emerald-600 dark:text-emerald-400 text-[9px] sm:text-[10px] font-semibold mt-0.5 whitespace-nowrap">
                {language === "tr" ? "Resmi Kayıt & Rapor" : "Official Record"}
              </div>
            </div>
          </motion.div>

        </motion.div>

      </div>

      {/* Fuel Prices Marquee Footer */}
      {fuelPrices && fuelPrices.length > 0 && !isLoadingFuel && (
        <div className="absolute bottom-0 left-0 w-full bg-slate-100 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 py-2.5 flex items-center z-30">
          
          {/* Static Label Left */}
          <div className="absolute left-0 top-0 bottom-0 z-40 bg-slate-100 dark:bg-[#080d19] px-3.5 md:px-8 flex items-center border-r border-slate-200 dark:border-white/10 shadow-[10px_0_15px_rgba(0,0,0,0.05)] dark:shadow-[10px_0_15px_rgba(0,0,0,0.5)]">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1">
                <Fuel size={13} className="text-emerald-500" />
                {fuelCity?.toUpperCase() || "İSTANBUL"}
              </span>
            </div>
          </div>

          <div className="w-full overflow-hidden ml-28 md:ml-40 flex relative">
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
                <div key={index} className="flex items-center gap-3 mx-4 md:mx-6 text-[11px] md:text-[13px] shrink-0 transform-gpu">
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
