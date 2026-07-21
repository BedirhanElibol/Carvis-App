import React, { memo } from "react";
import { ArrowRight, Search, MapPin, Gauge, ShieldCheck, Banknote, Car, Wrench, Truck, Package, Shield, Fuel } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import logo from "../../../../assets/logo.png";

const LandingHero = memo(({ t, language, fuelPrices, fuelCity, isLoadingFuel }) => {
  const navigate = useNavigate();

  return (
    <section className="relative w-full pt-20 pb-20 md:pt-28 md:pb-24 bg-transparent overflow-hidden">
      
      {/* Background glow matching Adspirer */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 dark:bg-[#1e3a8a] rounded-full blur-[150px] opacity-40 dark:opacity-20 pointer-events-none"></div>

      <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Text & CTA */}
        <div className="flex flex-col items-start text-left">
          
          {/* Adspirer style gradient headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-6xl lg:text-[76px] font-bold text-slate-900 dark:text-white tracking-tight leading-[1.05] mb-6"
          >
            {language === "tr" ? "Aracınızı yönetin, " : "Manage your car, "} <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-500">
              {language === "tr" ? "Şeffaf " : "Transparent "}
            </span>
            <span className="text-slate-900 dark:text-white">
              {language === "tr" ? "ve" : "and"}
            </span> <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500 dark:from-blue-400 dark:to-cyan-400">
              {language === "tr" ? "Güvenilir." : "Secure."}
            </span>
          </motion.h1>

          {/* Supporting Text */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-[19px] text-slate-600 dark:text-slate-300 max-w-lg mb-10 leading-relaxed font-normal"
          >
            {language === "tr" 
              ? "Sanayi sürprizlerini unutun. Aracınızın arıza, bakım veya parça ihtiyaçları için çevrenizdeki en iyi ustalardan anında teklif alın ve havuz ödeme sistemiyle paranızı güvenceye alın." 
              : "Forget garage surprises. Get instant quotes from the best local mechanics for repairs, maintenance, or parts needs, and secure your money."}
          </motion.p>

          {/* Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mb-10"
          >
            <button 
              onClick={() => navigate("/application/home")}
              className="bg-[#2563eb] hover:bg-blue-600 text-white rounded-full px-8 py-3.5 font-medium transition-colors flex items-center justify-center gap-2 text-[15px] shadow-lg shadow-blue-500/20"
            >
              {language === "tr" ? "Hemen Başla" : "Start Now"}
              <ArrowRight size={16} />
            </button>
            <button 
              onClick={() => navigate("/partner-login")}
              className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-[#1f2937] text-slate-700 dark:text-white rounded-full px-8 py-3.5 font-medium transition-colors flex items-center justify-center gap-2 text-[15px]"
            >
              <Wrench size={16} className="text-slate-500 dark:text-slate-400" />
              {language === "tr" ? "Usta / İş Ortakları" : "Mechanics & Partners"}
            </button>
          </motion.div>
          
          {/* Concrete App Capabilities (Why they should stay) */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center gap-3 text-[13px] font-medium"
          >
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400"><Wrench size={14} /> Oto Servis & Tamir</span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 text-yellow-700 dark:text-yellow-400"><Fuel size={14} /> Akaryakıt & Şarj</span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400"><MapPin size={14} /> Akıllı Otopark</span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400"><Package size={14} /> Yedek Parça</span>
            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 text-pink-600 dark:text-pink-400"><Shield size={14} /> Sigorta & Kasko</span>
          </motion.div>

        </div>

        {/* Right Column: Orbiting Graphics matching Adspirer right side */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hidden lg:flex relative h-[500px] w-full items-center justify-center"
        >
          {/* Orbit Rings */}
          <div className="absolute w-[450px] h-[450px] rounded-full border border-slate-200 dark:border-white/5"></div>
          <div className="absolute w-[300px] h-[300px] rounded-full border border-slate-300 dark:border-white/10"></div>
          
          {/* Center Logo - Sleek Glass Pill for wide logos */}
          <div className="absolute px-8 py-5 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-2xl flex items-center justify-center shadow-[0_0_50px_rgba(37,99,235,0.1)] dark:shadow-[0_0_50px_rgba(37,99,235,0.2)] z-10">
            <img src={logo} alt="Rapidsy" className="h-7 md:h-9 w-auto object-contain block dark:hidden brightness-0" />
            <img src={logo} alt="Rapidsy" className="h-7 md:h-9 w-auto object-contain hidden dark:block" />
          </div>

          {/* Floating UI Elements (Simulating App Value) */}
          
          {/* Top Floating Card (Bidding) */}
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[8%] left-[65%] -translate-x-1/2 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border border-blue-200 dark:border-blue-500/20 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl dark:shadow-2xl z-20"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Wrench size={18} />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-bold text-sm">Periyodik Bakım</div>
              <div className="text-blue-600 dark:text-blue-400 text-xs font-medium">5 Servisten Teklif Geldi</div>
            </div>
          </motion.div>

          {/* Bottom Right Floating Card (Spare Parts) */}
          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-[15%] right-[0%] bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border border-indigo-200 dark:border-indigo-500/20 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl dark:shadow-2xl z-20"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Package size={18} />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-bold text-sm">Yedek Parça Siparişi</div>
              <div className="text-indigo-600 dark:text-indigo-400 text-xs font-medium">Uyum garantili gönderim</div>
            </div>
          </motion.div>

          {/* Bottom Left Floating Card (Insurance) */}
          <motion.div 
            animate={{ y: [0, -8, 0] }} 
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute bottom-[25%] left-[5%] bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border border-blue-200 dark:border-blue-500/20 px-4 py-3 rounded-2xl flex items-center gap-3 shadow-xl dark:shadow-2xl z-20"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <ShieldCheck size={18} />
            </div>
            <div>
              <div className="text-slate-900 dark:text-white font-bold text-sm">Kasko Teklifleri</div>
              <div className="text-blue-600 dark:text-blue-400 text-xs font-medium">%30 Özel İndirim</div>
            </div>
          </motion.div>

        </motion.div>

      </div>

      {/* Fuel Prices Marquee */}
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

          <div className="w-full overflow-hidden ml-24 md:ml-40 flex">
            <motion.div 
              animate={{ x: [0, -1000] }} 
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              className="flex items-center whitespace-nowrap"
            >
              {[...fuelPrices, ...fuelPrices, ...fuelPrices].map((station, index) => (
                <div key={index} className="flex items-center gap-3 mx-6 text-[13px]">
                  <span className="font-bold text-slate-800 dark:text-white">{station.marka || "İstasyon"}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Benzin:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{station.benzin || "-"}₺</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">Motorin:</span>
                    <span className="text-blue-600 dark:text-blue-400 font-semibold">{station.motorin || "-"}₺</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-500 dark:text-slate-400">LPG:</span>
                    <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{station.lpg || "-"}₺</span>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
          
        </div>
      )}

    </section>
  );
});

LandingHero.displayName = 'LandingHero';
export default LandingHero;
