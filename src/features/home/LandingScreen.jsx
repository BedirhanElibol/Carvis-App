import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { getFuelPrices, getNearbyProviders, getCityMetadata } from "../../services/externalApis";
import LocationMap from "../../components/ui/LocationMap";

const CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir", "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

const LandingScreen = () => {
  const { t, openModal, language, toggleLanguage, theme, toggleTheme } = useUI();
  const { currentUser, loginAsGuest } = useAuth();
  const navigate = useNavigate();

  // Search, Location & Map Interaction States
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("all");
  const [hoveredPin, setHoveredPin] = useState(null);

  // Fuel Prices State
  const [fuelPrices, setFuelPrices] = useState(null);
  const [fuelCity, setFuelCity] = useState("istanbul");
  const [fuelLastUpdated, setFuelLastUpdated] = useState("");
  const [isLoadingFuel, setIsLoadingFuel] = useState(true);

  // Fetch Fuel Prices
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });

  // Fetch Providers
  useEffect(() => {
    let isMounted = true;
    const fetchProviders = async () => {
      setIsLoadingProviders(true);
      const cityMeta = getCityMetadata(fuelCity);
      setMapCenter({ lat: cityMeta.lat, lng: cityMeta.lng });
      try {
        const data = await getNearbyProviders(cityMeta.lat, cityMeta.lng, 8000); // 8km radius
        if (isMounted) {
          setNearbyProviders(data.slice(0, 10)); // Top 10
        }
      } catch (err) {
        console.error("Providers fetch error:", err);
      } finally {
        if (isMounted) setIsLoadingProviders(false);
      }
    };
    fetchProviders();
    return () => { isMounted = false; };
  }, [fuelCity]);

  // Fetch Fuel Prices
  useEffect(() => {
    let isMounted = true;
    const fetchFuel = async () => {
      setIsLoadingFuel(true);
      try {
        const updateTime = new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        const data = await getFuelPrices(fuelCity);
        
        if (isMounted && data && data.results) {
          setFuelPrices({
            benzin: data.results[0].price,
            motorin: data.results[1].price,
            lpg: data.results[2].price
          });
          setFuelLastUpdated(updateTime);
        }
      } catch (err) {
        console.error("Akaryakıt güncellenemedi:", err);
      } finally {
        if (isMounted) setIsLoadingFuel(false);
      }
    };
    fetchFuel();
    
    const interval = setInterval(fetchFuel, 30 * 60 * 1000);
    return () => { 
      isMounted = false; 
      clearInterval(interval);
    };
  }, [fuelCity]);

  const _handleGuestEntry = (query = "", city = "istanbul") => {
    loginAsGuest();
    navigate("/application/home", { state: { searchQuery: query, selectedCity: city } });
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
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white overflow-x-clip font-sans relative selection:bg-teal-500/30">
      
      {/* Dynamic Glow Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[5%] right-[10%] w-[450px] h-[450px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[15%] left-[5%] w-[400px] h-[400px] bg-teal-500/10 rounded-full blur-[130px] animate-liquid"></div>
        <div className="absolute top-[40%] left-[25%] w-[550px] h-[550px] bg-orange-500/5 rounded-full blur-[140px] animate-pulse"></div>
      </div>

      {/* Grid Pattern overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }}
      ></div>

      {/* Floating Glass Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto">
        <div className="w-full bg-white/75 dark:bg-[#0a0f1d]/75 backdrop-blur-xl border border-slate-200 dark:border-white/10 px-4 md:px-8 py-3.5 rounded-[2rem] flex items-center justify-between shadow-2xl shadow-black/50 dark:shadow-black/50">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate("/")}>
            <img
              src={logo}
              alt="Rapidsy Logo"
              className="h-6 md:h-8 w-auto p-1 md:p-1.5 object-contain transition-transform duration-500 hover:scale-105"
            />
          </div>

          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
            >
              <Icons.Globe size={18} />
              <span className="absolute bottom-1.5 text-[6px] font-black tracking-widest text-teal-400">
                {language?.toUpperCase()}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              title={theme === "dark" ? t.lightMode : t.darkMode}
            >
              {theme === "dark" ? (
                <Icons.Sun size={18} className="text-amber-400" />
              ) : (
                <Icons.Moon size={18} className="text-slate-600 dark:text-slate-400" />
              )}
            </button>

            {/* Seller/Partner Page link */}
            <button
              onClick={() => navigate("/partner-login")}
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 transition-all"
            >
              <Icons.Store size={14} className="text-orange-400" />
              {t.becomePartner || "Partner Girişi"}
            </button>

            {/* Login button */}
            <button
              onClick={() => openModal("login", "customer")}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
            >
              {t.loginTitle || "Giriş Yap"}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Scrollable Area */}
      <div className="relative z-10 pt-28 md:pt-36 flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-7xl mx-auto px-6 text-center flex flex-col items-center">
          {/* Subtle tag badge */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 backdrop-blur-md mb-6 shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></span>
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
              ⚡ {t.landingHeroTag}
            </span>
          </motion.div>

          {/* Heading */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black tracking-tight uppercase max-w-4xl leading-[1.05] mb-6"
            dangerouslySetInnerHTML={{ __html: t.landingHeroTitle }}
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
            className="w-full max-w-4xl mx-auto px-2 md:px-0 mb-10"
          >
            <div className="bg-white/90 dark:bg-[#0a0f24]/90 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-3xl p-3 md:p-4 shadow-[0_0_40px_rgba(0,0,0,0.1)] dark:shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col md:flex-row gap-3 relative z-20">
              
              {/* Search Query Input */}
              <div className="flex-1 relative group">
                <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-teal-400 transition-colors" size={20} />
                <input 
                  type="text" 
                  placeholder={t.landingSearchPlaceholder} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-2xl py-4.5 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-500"
                />
              </div>

              {/* Location Selector */}
              <div className="w-full md:w-[240px] relative group">
                <Icons.MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 group-focus-within:text-orange-400 transition-colors" size={20} />
                <select 
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-[#030712] border-none py-4.5 pl-11 pr-4 text-sm font-bold text-slate-900 dark:text-white outline-none cursor-pointer appearance-none"
                >
                  <option value="all">{t.allTurkey}</option>
                  {CITIES.map(city => (
                    <option key={city} value={city.toLowerCase()}>{city}</option>
                  ))}
                </select>
                <Icons.ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
              </div>

              {/* Search Button */}
              <button 
                onClick={() => navigate("/application/home")}
                className="w-full md:w-auto bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-2xl px-8 py-4.5 font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 group whitespace-nowrap"
              >
                {t.searchButton}
                <Icons.ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

            </div>

            {/* Quick Categories below search */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 mt-6">
              <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-slate-500 mr-2">{t.popularLabel}</span>
              {[
                { title: t.smartDiagnosis, icon: Icons.Cpu, color: "from-blue-400 to-indigo-500", onClick: () => navigate("/application/home") },
                { title: t.autoSpareParts, icon: Icons.Box, color: "from-orange-400 to-red-500", onClick: () => navigate("/application/parts") },
                { title: t.expertMechanic, icon: Icons.Wrench, color: "from-teal-400 to-emerald-500", onClick: () => navigate("/application/mechanics") },
                { title: t.buyBoxInfo, icon: Icons.TrendingUp, color: "from-pink-400 to-rose-500", onClick: () => navigate("/application/home") }
              ].map((cat, idx) => (
                <button 
                  key={idx}
                  onClick={cat.onClick}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20 transition-all cursor-pointer group"
                >
                  <cat.icon size={12} className={cat.color} />
                  <span className="text-[10px] md:text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:text-white">{cat.title}</span>
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
            <div className="bg-white/80 dark:bg-[#0a0f24]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-4 shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
                  <Icons.Droplets size={20} className="text-blue-500" />
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
          </motion.div>
        </section>

        {/* INTERACTIVE MAP PREVIEW (Nearby Providers with Hover Pins) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-24 relative">
          <div className="text-center mb-12">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-orange-400">{t.rapidsyNetwork}</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
              {t.nearbyPoints}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base leading-relaxed">
              {t.nearbyPointsDesc}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 h-[600px] w-full">
            {/* Left Column: Provider Cards */}
            <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingProviders ? (
                <div className="flex justify-center items-center h-full text-slate-500">
                  <Icons.Loader2 className="animate-spin w-8 h-8" />
                </div>
              ) : nearbyProviders.length === 0 ? (
                <div className="flex justify-center items-center h-full text-slate-500 text-sm font-bold">
                  {t.noServiceFound}
                </div>
              ) : (
                nearbyProviders.map((prov) => (
                  <div 
                    key={prov.id}
                    onMouseEnter={() => setHoveredPin(prov.id)}
                    onMouseLeave={() => setHoveredPin(null)}
                    onClick={() => openModal("login", "customer")}
                    className={`bg-white/80 dark:bg-[#0a0f24]/80 border ${hoveredPin === prov.id ? 'border-orange-500/50 bg-black/10 dark:bg-white/10' : 'border-black/5 dark:border-white/5 hover:border-black/20 dark:border-white/20'} p-5 rounded-3xl transition-all cursor-pointer group flex flex-col gap-3 shadow-xl backdrop-blur-md`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-sm group-hover:text-orange-400 transition-colors">{prov.name}</h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">{prov.type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 shadow-sm px-2 py-1 rounded-lg border border-black/5 dark:border-white/5">
                        <Icons.Star size={10} className="text-yellow-400 fill-yellow-400" />
                        {prov.rating}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{prov.distance}</span>
                      <button className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors">
                        {t.inspectBtn} <Icons.ChevronRight size={10} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Right Column: Interactive Map Component */}
            <div className="flex-1 bg-slate-50 dark:bg-[#050814] border border-slate-200 dark:border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-2xl flex items-center justify-center p-2">
              <LocationMap 
                center={mapCenter} 
                markers={nearbyProviders} 
                hoveredPin={hoveredPin} 
                zoom={13} 
              />
            </div>
          </div>
        </section>

        {/* HOW RAPIDSY WORKS (3-Step Stepper) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28">
          <div className="bg-white/60 dark:bg-[#0a0f24]/60 border border-black/5 dark:border-white/5 rounded-[3rem] p-10 md:p-16 space-y-12 relative overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="text-center max-w-2xl mx-auto">
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-teal-400">{t.howItWorks}</span>
              <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-3 uppercase tracking-tight">{t.howItWorks3Steps}</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative mt-12">
              <div className="hidden md:block absolute top-10 left-[15%] right-[15%] h-0.5 bg-black/10 dark:bg-white/10 pointer-events-none z-0"></div>
              {[
                { step: "01", title: t.step1Title, desc: t.step1Desc, icon: Icons.Search, color: "from-teal-500 to-blue-500" },
                { step: "02", title: t.step2Title, desc: t.step2Desc, icon: Icons.FileText, color: "from-orange-500 to-red-500" },
                { step: "03", title: t.step3Title, desc: t.step3Desc, icon: Icons.CheckCircle, color: "from-blue-500 to-indigo-500" }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col items-center text-center relative z-10 group">
                  <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${item.color} text-slate-900 dark:text-white flex items-center justify-center shadow-2xl group-hover:-translate-y-2 transition-transform duration-300 mb-6 border border-slate-200 dark:border-white/10`}>
                    <item.icon size={32} />
                  </div>
                  <div className="space-y-3">
                    <span className="inline-block px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm text-[9px] font-mono font-black text-slate-600 dark:text-slate-300 tracking-widest uppercase">{t.stepLabel} {item.step}</span>
                    <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-[260px] mx-auto">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* APP FEATURES (ÖZELLİKLER) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-blue-500">{t.appFeatures}</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
              {t.whatCanYouDoWithCarvis}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base leading-relaxed">
              {t.everythingDesc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Icons.Car,
                title: t.smartGarage,
                desc: t.smartGarageDesc,
                color: "text-blue-500",
                bg: "bg-blue-500/10",
                border: "group-hover:border-blue-500/50"
              },
              {
                title: t.fuelAndExpenseTracking,
                desc: t.fuelAndExpenseTrackingDesc,
                icon: Icons.Fuel,
                color: "text-indigo-500",
                bg: "bg-indigo-500/10",
                border: "group-hover:border-indigo-500/50"
              },
              {
                title: t.collectQuotesTitle,
                desc: t.collectQuotesDesc2,
                icon: Icons.FileText,
                color: "text-amber-500",
                bg: "bg-amber-500/10",
                border: "group-hover:border-amber-500/50"
              },
              {
                icon: Icons.Box,
                title: t.fastParts,
                desc: t.fastPartsDesc,
                color: "text-orange-500",
                bg: "bg-orange-500/10",
                border: "group-hover:border-orange-500/50"
              },
              {
                icon: Icons.ShieldAlert,
                title: t.sosValet,
                desc: t.sosValetDesc,
                color: "text-red-500",
                bg: "bg-red-500/10",
                border: "group-hover:border-red-500/50"
              },
              {
                title: t.securePayment,
                desc: t.securePaymentDesc,
                icon: Icons.ShieldCheck,
                color: "text-emerald-500",
                bg: "bg-emerald-500/10",
                border: "group-hover:border-emerald-500/50"
              },
              {
                title: t.appointmentCalendar,
                desc: t.appointmentCalendarDesc,
                icon: Icons.Calendar,
                color: "text-cyan-500",
                bg: "bg-cyan-500/10",
                border: "group-hover:border-cyan-500/50"
              }
            ].map((feat, idx) => (
              <div key={idx} className={`bg-white/60 dark:bg-[#0a0f24]/60 border border-black/5 dark:border-white/5 rounded-3xl p-6 transition-all hover:-translate-y-1 cursor-default group relative overflow-hidden backdrop-blur-xl shadow-lg hover:shadow-2xl ${feat.border}`}>
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-gradient-to-br from-white/5 to-white/0 dark:from-white/5 dark:to-transparent rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-500"></div>
                <div className={`w-12 h-12 rounded-2xl ${feat.bg} flex items-center justify-center mb-5`}>
                  <feat.icon size={24} className={feat.color} />
                </div>
                <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">{feat.title}</h4>
                <p className="text-[11px] md:text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* STATS / TRUST SIGNALS */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-24">
          <div className="bg-gradient-to-r from-white to-slate-50 dark:from-[#070b19] dark:to-[#0a1024] border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center relative z-10">
              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">
                  10k+
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Aktif Araç</p>
              </div>
              
              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-orange-400">
                  500+
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Onaylı Usta & Servis</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-rose-500">
                  %99.8
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Güvenli Ödeme</p>
              </div>

              <div className="space-y-1">
                <span className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-500">
                  24/7
                </span>
                <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 tracking-widest uppercase mt-2">Kesintisiz Destek</p>
              </div>
            </div>
          </div>
        </section>

        {/* BOTTOM BUSINESS PORTAL CTA */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28 text-center relative">
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-white to-slate-50 dark:from-[#090e21] dark:to-[#040713] border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl">
            {/* Background elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center">
              <span className="text-orange-400 text-xs font-black uppercase tracking-widest mb-4">
                {t.rapidsyForBusiness}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                {t.digitizeYourShop}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed mb-8">
                {t.businessPortalDesc}
              </p>
              
              <button
                onClick={() => navigate("/partner-login")}
                className="group px-8 py-4.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-none"
              >
                <Icons.Store size={18} className="text-orange-100 group-hover:rotate-6 transition-transform" />
                {t.registerBusiness}
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="w-full border-t border-black/5 dark:border-white/5 py-12 bg-slate-100 dark:bg-[#02050c]">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Rapidsy Logo" className="h-6 md:h-8 w-auto object-contain" />
              <span className="text-slate-400 text-sm font-medium ml-2">© 2026</span>
            </div>
            
            <div className="flex items-center gap-6 text-xs text-slate-500 font-medium">
              <a href="/privacy-policy" className="hover:text-slate-900 dark:text-white transition-colors">{t.privacy}</a>
              <span>•</span>
              <a href="#" onClick={(e) => { e.preventDefault(); openModal("kvkk"); }} className="hover:text-slate-900 dark:text-white transition-colors">{t.kvkkText}</a>
              <span>•</span>
              <span className="text-slate-600">v2.5.0-premium</span>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
};

export default LandingScreen;
