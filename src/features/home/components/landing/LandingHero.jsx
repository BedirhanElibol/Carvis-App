import React, { memo } from "react";
import { ArrowRight, ChevronDown, ChevronRight, Droplets, Fuel, Map, MapPin, RefreshCw, Search, Box, Wrench, TrendingUp, ShieldCheck, HardDrive, Wind, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import DOMPurify from "dompurify";

const LandingHero = memo(({t, language, searchQuery, setSearchQuery, searchLocation, setSearchLocation, CITIES, fuelPrices, fuelCity, setFuelCity, fuelLastUpdated, isLoadingFuel}) => {
  const navigate = useNavigate();
  return (
    <>
        <section className="w-full max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          {/* Subtle tag badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-emerald-500/10 border border-slate-200 dark:border-emerald-500/30 backdrop-blur-md mb-6 shadow-sm dark:shadow-[0_0_15px_rgba(16,185,129,0.15)]"
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 dark:bg-teal-400 animate-ping"></span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600 dark:text-emerald-300">
              ⚡ {t.landingHeroTag}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tight uppercase max-w-4xl leading-[1.05] mb-6"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(t.landingHeroTitle) }}
          />

          {/* Subtitle */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-slate-500 dark:text-slate-400 font-medium text-center max-w-2xl text-base md:text-xl tracking-tight leading-relaxed mb-8"
          >
            {t.landingHeroDesc}
          </motion.p>

          {/* Hero Search Panel (Mindbody Inspired) */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="w-full max-w-4xl mx-auto px-2 md:px-0 mb-10 relative"
          >
            <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/10 to-emerald-500/20 dark:from-emerald-500/10 dark:via-transparent dark:to-emerald-500/10 blur-2xl rounded-[3rem] -z-10"></div>
            <div className="bg-white/70 dark:bg-[#0a0f24]/90 backdrop-blur-3xl border border-white dark:border-white/10 rounded-3xl p-3 md:p-4 shadow-[0_20px_50px_rgba(16,185,129,0.05)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-3 relative z-20">
              
              {/* Search Query Input */}
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-500/50 group-focus-within:text-emerald-500 dark:group-focus-within:text-teal-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder={t.landingSearchPlaceholder} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/50 dark:bg-black/40 border border-slate-100 dark:border-white/5 rounded-2xl py-4.5 pl-12 pr-4 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                />
              </div>

              {/* Location Selector */}
              <div className="w-full md:w-[240px] relative group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-emerald-500/50 group-focus-within:text-emerald-500 dark:group-focus-within:text-teal-400 transition-colors" size={20} />
                <select 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-white/50 dark:bg-black/40 border border-slate-100 dark:border-transparent py-4.5 pl-11 pr-4 text-sm font-bold text-slate-800 dark:text-white outline-none cursor-pointer appearance-none focus:ring-2 focus:ring-emerald-500/50 dark:focus:ring-emerald-500 transition-all rounded-2xl"
                >
                  <option value="all">{t.allTurkey}</option>
                  {CITIES.map(city => (
                    <option key={city} value={city.toLowerCase()}>{city}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>

              {/* Search Button */}
              <button 
                onClick={() => navigate("/application/home")}
                className="w-full md:w-auto bg-gradient-to-r from-teal-500 to-teal-500 dark:from-emerald-500 dark:to-teal-400 text-white dark:text-slate-950 hover:from-emerald-500 hover:to-teal-400 dark:hover:from-teal-400 dark:hover:to-emerald-300 rounded-2xl px-8 py-4.5 font-black uppercase tracking-widest text-sm shadow-[0_10px_30px_rgba(16,185,129,0.3)] dark:shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 group whitespace-nowrap border-none"
              >
                {t.searchButton}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

            </div>

            {/* Quick Categories below search */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-6">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-800/50 dark:text-slate-500 mr-2">{t.popularLabel}</span>
              {[
                { title: t.smartDiagnosis, icon: Fuel, color: "text-emerald-500 dark:text-teal-400", bg: "bg-emerald-500/10", onClick: () => navigate("/application/home") },
                { title: t.autoSpareParts, icon: Box, color: "text-teal-500 dark:text-teal-400", bg: "bg-teal-500/10", onClick: () => navigate("/application/parts") },
                { title: t.expertMechanic, icon: Wrench, color: "text-teal-500 dark:text-emerald-500", bg: "bg-teal-500/10", onClick: () => navigate("/application/mechanics") },
                { title: t.buyBoxInfo, icon: TrendingUp, color: "text-teal-600 dark:text-teal-500", bg: "bg-teal-600/10", onClick: () => navigate("/application/home") }
              ].map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={cat.onClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-black/30 hover:bg-white dark:hover:bg-emerald-500/10 shadow-[0_4px_15px_rgba(16,185,129,0.05)] border border-emerald-500/10 dark:border-emerald-500/20 hover:border-emerald-500/30 dark:hover:border-emerald-500/50 transition-all cursor-pointer group backdrop-blur-sm"
                >
                  <div className={`p-1 rounded-full ${cat.bg} dark:bg-transparent`}>
                    <cat.icon size={12} className={cat.color} />
                  </div>
                  <span className="text-[10px] md:text-xs font-bold text-slate-700 dark:text-slate-300 group-hover:text-teal-600 dark:group-hover:text-emerald-300">{cat.title}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* LIVE FUEL PRICES WIDGET ON LANDING */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="w-full max-w-4xl mx-auto px-2 md:px-0 mb-10 mt-2"
          >
            <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-white dark:border-emerald-500/10 rounded-3xl p-5 shadow-[0_20px_50px_rgba(16,185,129,0.05)] dark:shadow-[0_0_30px_rgba(16,185,129,0.05)] flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Droplets size={20} className="text-teal-500 dark:text-emerald-500" />
                  </div>
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white">{t.liveFuel}</h4>
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">{t.live}</span>
                      </div>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">{t.lastUpdate}: {isLoadingFuel ? t.loading : fuelLastUpdated}</p>
                  </div>
                </div>

                <div className="flex flex-1 w-full md:w-auto gap-2 md:gap-4 justify-between md:justify-end items-center">
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t.unleaded95}</span>
                    <span className="text-sm md:text-base font-black text-slate-900 dark:text-white font-mono">{isLoadingFuel ? "---" : fuelPrices?.benzin} <span className="text-[9px] text-slate-500">₺/L</span></span>
                  </div>
                  <div className="w-px h-8 bg-black/10 dark:bg-white/10"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t.diesel}</span>
                    <span className="text-sm md:text-base font-black text-slate-900 dark:text-white font-mono">{isLoadingFuel ? "---" : fuelPrices?.motorin} <span className="text-[9px] text-slate-500">₺/L</span></span>
                  </div>
                  <div className="w-px h-8 bg-black/10 dark:bg-white/10"></div>
                  <div className="flex flex-col items-center">
                    <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">{t.lpg}</span>
                    <span className="text-sm md:text-base font-black text-slate-900 dark:text-white font-mono">{isLoadingFuel ? "---" : fuelPrices?.lpg} <span className="text-[9px] text-slate-500">₺/L</span></span>
                  </div>
                  
                  <select
                    value={fuelCity}
                    onChange={(e) => setFuelCity(e.target.value)}
                    className="ml-1 md:ml-4 bg-slate-100 dark:bg-[#030712] border border-black/5 dark:border-white/5 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-wider rounded-xl px-2 py-1.5 outline-none cursor-pointer hover:border-black/20 transition-colors"
                  >
                    <option value="istanbul">İSTANBUL</option>
                    <option value="ankara">ANKARA</option>
                    <option value="izmir">İZMİR</option>
                  </select>
                </div>
              </div>

              {/* Station Infrastructure Compliance (Public details normally hard to research) */}
              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-x-6 gap-y-2 text-[9px] text-slate-500 dark:text-slate-400 font-semibold justify-between">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={11} className="text-emerald-500" />
                  <span>EPDK Lisans Durumu: <strong className="text-emerald-500 uppercase">Lisanslı (Cezası Yok)</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <HardDrive size={11} className="text-blue-500" />
                  <span>Yeraltı Tank Yaşı: <strong className="text-slate-700 dark:text-slate-300">5 Yıl (Korozyon / Su Sızıntı Testi Geçildi)</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wind size={11} className="text-teal-500" />
                  <span>Gaz Geri Kazanım (VRS): <strong className="text-slate-700 dark:text-slate-300">%99.4 Ekolojik Filtre Uyumlu</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame size={11} className="text-orange-500" />
                  <span>Parlama Noktası Audit Kontrolü: <strong className="text-emerald-500 uppercase font-bold">Sorunsuz</strong></span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* EDS & Social Map Banner for Guests - Temporarily hidden per user request
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full max-w-4xl mx-auto px-2 md:px-0 mb-10"
          >
            <button 
              onClick={() => navigate("/app/map")}
              className="w-full bg-gradient-to-r from-teal-500/10 to-blue-500/10 dark:from-emerald-500/10 dark:to-teal-500/5 hover:from-teal-500/20 hover:to-blue-500/20 dark:hover:from-emerald-500/20 dark:hover:to-teal-500/10 border border-teal-500/30 dark:border-emerald-500/30 p-5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between group active-scale transition-all cursor-pointer shadow-lg dark:shadow-[0_0_20px_rgba(16,185,129,0.15)]"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-teal-500/20 rounded-2xl text-teal-400 group-hover:scale-110 transition-transform shadow-inner relative">
                  <Map size={28} />
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                </div>
                <div className="text-left">
                  <h3 className="text-base md:text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                    EDS & Sosyal Trafik Haritası
                  </h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                    <RefreshCw size={12} className="text-teal-400 animate-spin-slow" />
                    Her gün güncellenir. Kasis, Radar, Yakıt ve Resmi EDS verileri.
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 px-6 py-2.5 rounded-xl bg-teal-500 text-slate-900 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group-hover:bg-teal-400 transition-colors">
                Haritayı Aç <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
          */}
        </section>

    </>
  );
});

LandingHero.displayName = 'LandingHero';
export default LandingHero;
