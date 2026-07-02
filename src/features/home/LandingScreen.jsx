import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { getFuelPrices, getNearbyProviders, getCityMetadata, getEGMEDSMarkers } from "../../services/externalApis";
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
  const [edsMarkers, setEdsMarkers] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });

  // Fetch Providers and EGM EDS Points
  useEffect(() => {
    let isMounted = true;
    const fetchProvidersAndEDS = async () => {
      setIsLoadingProviders(true);
      const cityMeta = getCityMetadata(fuelCity);
      setMapCenter({ lat: cityMeta.lat, lng: cityMeta.lng });
      try {
        const providers = await getNearbyProviders(cityMeta.lat, cityMeta.lng, 8000); // 8km radius
        const eds = await getEGMEDSMarkers(fuelCity);
        if (isMounted) {
          setNearbyProviders(providers.slice(0, 10)); // Top 10
          setEdsMarkers(eds || []);
        }
      } catch (err) {
        console.error("Providers fetch error:", err);
      } finally {
        if (isMounted) setIsLoadingProviders(false);
      }
    };
    fetchProvidersAndEDS();
    return () => { isMounted = false; };
  }, [fuelCity]);

  // Fetch Fuel Prices
  useEffect(() => {
    let isMounted = true;
    const fetchFuel = async () => {
      setIsLoadingFuel(true);
      try {
        const now = new Date();
        const dateStr = now.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" });
        const timeStr = now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
        const updateTime = `${dateStr} ${timeStr}`;
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

  // Removed automatic redirect to allow logged-in users to view the landing page


  return (
    <div className="min-h-screen w-full bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white overflow-x-clip font-sans relative selection:bg-teal-500/30">
      
      {/* Dynamic Glow Backgrounds */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
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

            {currentUser && !currentUser.isAnonymous ? (
              <button
                onClick={() => {
                  if (currentUser.role === "admin") {
                    navigate("/admin/dashboard");
                  } else if (["parking", "valet", "mechanic", "parts", "partner"].includes(currentUser.role)) {
                    navigate("/partner/dashboard");
                  } else {
                    navigate("/application/home");
                  }
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
              >
                {currentUser.role === "admin"
                  ? (t.adminPanel || "Yönetici Paneli")
                  : ["parking", "valet", "mechanic", "parts", "partner"].includes(currentUser.role)
                  ? (t.partnerPanel || "Yönetim Paneli")
                  : (t.myGarage || "Garajım")}
              </button>
            ) : (
              <>
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
              </>
            )}
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
                { title: t.smartDiagnosis, icon: Icons.Fuel, color: "from-blue-400 to-indigo-500", onClick: () => navigate("/application/home") },
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
            <div className="bg-white/80 dark:bg-[#0a0f24]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-3xl p-5 shadow-[0_0_30px_rgba(0,0,0,0.05)] dark:shadow-[0_0_30px_rgba(0,0,0,0.3)] flex flex-col gap-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
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

              {/* Station Infrastructure Compliance (Public details normally hard to research) */}
              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-wrap gap-x-6 gap-y-2 text-[9px] text-slate-500 dark:text-slate-400 font-semibold justify-between">
                <div className="flex items-center gap-1.5">
                  <Icons.ShieldCheck size={11} className="text-emerald-500" />
                  <span>EPDK Lisans Durumu: <strong className="text-emerald-500 uppercase">Lisanslı (Cezası Yok)</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.HardDrive size={11} className="text-blue-500" />
                  <span>Yeraltı Tank Yaşı: <strong className="text-slate-700 dark:text-slate-300">5 Yıl (Korozyon / Su Sızıntı Testi Geçildi)</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.Wind size={11} className="text-teal-500" />
                  <span>Gaz Geri Kazanım (VRS): <strong className="text-slate-700 dark:text-slate-300">%99.4 Ekolojik Filtre Uyumlu</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icons.Flame size={11} className="text-orange-500" />
                  <span>Parlama Noktası Audit Kontrolü: <strong className="text-emerald-500 uppercase font-bold">Sorunsuz</strong></span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* EDS & Social Map Banner for Guests */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="w-full max-w-4xl mx-auto px-2 md:px-0 mb-10"
          >
            <button 
              onClick={() => navigate("/app/map")}
              className="w-full bg-gradient-to-r from-teal-500/10 to-blue-500/10 hover:from-teal-500/20 hover:to-blue-500/20 border border-teal-500/30 p-5 rounded-[2rem] flex flex-col md:flex-row items-center justify-between group active-scale transition-all cursor-pointer shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="p-4 bg-teal-500/20 rounded-2xl text-teal-400 group-hover:scale-110 transition-transform shadow-inner relative">
                  <Icons.Map size={28} />
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
                    <Icons.RefreshCw size={12} className="text-teal-400 animate-spin-slow" />
                    Her gün güncellenir. Kasis, Radar, Yakıt ve Resmi EDS verileri.
                  </p>
                </div>
              </div>
              <div className="mt-4 md:mt-0 px-6 py-2.5 rounded-xl bg-teal-500 text-slate-900 font-black uppercase tracking-widest text-[10px] flex items-center gap-2 group-hover:bg-teal-400 transition-colors">
                Haritayı Aç <Icons.ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </motion.div>
        </section>

        {/* INTERACTIVE APP SHOWCASE (Görsel Tanıtım Kokpiti) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-teal-500">
              {language === "tr" ? "BENZERSİZ TEKNOLOJİ" : "UNIQUE TECHNOLOGY"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
              {language === "tr" ? "ARACINIZIN TÜM YAŞAM DÖNGÜSÜ TEK BİR PANELDE" : "EVERYTHING ABOUT YOUR VEHICLE IN ONE PANEL"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-4 text-sm md:text-base font-semibold leading-relaxed">
              {language === "tr" 
                ? "Carvis, dükkan dükkan gezmeden arıza bildirimi yapıp teklifleri karşılaştırdığınız, yedek parçaları listelediğiniz ve servis sürecinizi yönettiğiniz dijital kokpitinizdir."
                : "Carvis is your digital cockpit where you report faults, compare quotes, list spare parts, and manage your service history without visiting shops."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: App Screen Mockup (Sanal Kokpit) */}
            <div className="lg:col-span-7 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              {/* Virtual App Header */}
              <div className="flex items-center justify-between pb-6 border-b border-black/5 dark:border-white/5 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg text-white font-black text-xs">
                    C
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight font-sans">CARVIS MOBİL KOKPİT</h4>
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      {language === "tr" ? "ARAÇ ASİSTANI AKTİF" : "VEHICLE ASSISTANT ACTIVE"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 px-2.5 py-1 rounded-xl text-slate-500">
                  v2.5
                </span>
              </div>

              {/* Grid inside Virtual App */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                
                {/* Panel 1: Akıllı Garaj / Araç Kartı */}
                <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-lg backdrop-blur-xl">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">GARAJIM / MEVCUT ARAÇ</span>
                    <Icons.Car className="text-teal-400" size={16} />
                  </div>
                  <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">FIAT EGEA 1.4 FIRE</h4>
                  <p className="text-[10px] text-slate-500 font-bold tracking-widest mt-0.5">34 ABC 123 • 42,500 KM</p>
                  
                  {/* Maintenance Progress Bar */}
                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-[10px] font-black">
                      <span className="text-slate-500">{language === "tr" ? "PERİYODİK BAKIMA KALAN" : "NEXT SERVICE IN"}</span>
                      <span className="text-orange-500">2,500 KM</span>
                    </div>
                    <div className="w-full h-1.5 bg-black/10 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                  </div>

                  {/* Vehicle Log Items */}
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold py-1 border-b border-black/5 dark:border-white/5">
                      <span className="text-slate-500">{language === "tr" ? "Tahmini Yakıt Ort." : "Est. Fuel Avg"}</span>
                      <span className="text-blue-500 font-black">6.8 L/100km</span>
                    </div>
                    <div className="flex items-center justify-between text-[10px] font-bold py-1">
                      <span className="text-slate-500">{language === "tr" ? "Sonraki Muayene" : "Next Inspection"}</span>
                      <span className="text-emerald-500 font-black">12 Ekim 2026</span>
                    </div>
                  </div>
                </div>

                {/* Panel 2: Aktif Servis Talepleri */}
                <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-lg backdrop-blur-xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 tracking-wider uppercase">
                        {language === "tr" ? "AKTİF TALEPLER / DURUM" : "ACTIVE REQUESTS / STATUS"}
                      </span>
                      <Icons.Clock className="text-amber-500" size={16} />
                    </div>
                    <div className="space-y-3.5 mt-2">
                      <div className="p-3 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl text-left">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {language === "tr" ? "Balata Değişimi" : "Brake Pad Replacement"}
                          </span>
                          <span className="text-[8px] font-black tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">
                            {language === "tr" ? "Teklifler Alındı" : "Quotes Received"}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold">{language === "tr" ? "Ön disk ve balata kontrolü/değişimi" : "Front disc & pad inspection"}</p>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl text-left opacity-75">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                            {language === "tr" ? "Yağ & Filtre Bakımı" : "Oil & Filter Change"}
                          </span>
                          <span className="text-[8px] font-black tracking-widest text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full uppercase">
                            {language === "tr" ? "Tamamlandı" : "Completed"}
                          </span>
                        </div>
                        <p className="text-[9px] text-slate-500 font-bold">{language === "tr" ? "10,000 km periyodik bakım seti" : "10,000 km periodic service kit"}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Mini action badge */}
                  <div className="mt-4 pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-[9px] font-black text-amber-500">
                    <span>{language === "tr" ? "TEKLİFLERİ KARŞILAŞTIR" : "COMPARE QUOTES"}</span>
                    <Icons.ChevronRight size={10} />
                  </div>
                </div>

                {/* Panel 3: Buy Box Yedek Parça */}
                <div className="md:col-span-2 bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-3xl p-5 shadow-lg backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
                      <Icons.Wrench size={24} className="text-amber-500" />
                    </div>
                    <div className="text-left">
                      <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
                        🏆 BUY BOX EN UYGUN TEKLİF
                      </span>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight mt-1">
                        {language === "tr" ? "Fren Disk & Balata Takımı" : "Brake Disc & Pad Kit"}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold">{language === "tr" ? "Orijinal Yedek Parça + Garantili Montaj Dahil" : "OEM Spare Parts + Guaranteed Installation"}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-3 md:pt-0 border-black/5 dark:border-white/5">
                    <div className="text-right">
                      <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">TOPLAM TUTAR</span>
                      <div className="text-base font-black text-slate-900 dark:text-white font-mono mt-0.5">₺2.450</div>
                    </div>
                    <button 
                      onClick={() => navigate("/application/home")}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest hover:shadow-lg transition-all active:scale-95 cursor-pointer border-none"
                    >
                      {language === "tr" ? "ONAYLA VE AL" : "CONFIRM & GET"}
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Right: Feature Highlights (Güzellemeler) */}
            <div className="lg:col-span-5 space-y-6 text-left">
              {[
                {
                  icon: Icons.SearchCheck,
                  title: language === "tr" ? "Teklif Karşılaştırın, Tasarruf Edin" : "Compare Quotes, Save Money",
                  desc: language === "tr" 
                    ? "Aracınızın hasarı veya periyodik bakımı için onlarca servise gitmeyin. Carvis, yakınınızdaki onaylı dükkanlardan anında fiyat teklifi toplar. Fiyatları, puanları ve garanti sürelerini tek ekrandan şeffafça karşılaştırın."
                    : "Don't visit dozens of mechanics for car repair. Carvis gathers instant price quotes from verified local shops. Compare prices, ratings, and warranty periods transparently from one single dashboard.",
                  color: "text-teal-400 bg-teal-400/10 border-teal-500/10",
                  highlight: language === "tr" ? "Yarı Yarıya Tasarruf" : "Save Up To 50%"
                },
                {
                  icon: Icons.FileText,
                  title: language === "tr" ? "Dijital Arıza Bildirimi ve Takibi" : "Digital Fault Reporting & Tracking",
                  desc: language === "tr" 
                    ? "Aracınızda oluşan hasar, arıza veya bakım ihtiyaçlarını sisteme girin. Parça veya detayları ekleyerek servislerin durumu doğrudan anlamasını sağlayın ve nokta atışı teklifler toplayın."
                    : "Report vehicle damage, faults, or service needs online. Add parts or notes to let local mechanics understand your issue immediately and send highly accurate quotes.",
                  color: "text-cyan-400 bg-cyan-400/10 border-cyan-500/10",
                  highlight: language === "tr" ? "Kolay Talep Takibi" : "Easy Request Tracking"
                },
                {
                  icon: Icons.Lock,
                  title: language === "tr" ? "Sürpriz Maliyet Yok, Carvis Güvencesi" : "No Surprise Costs, Carvis Guarantee",
                  desc: language === "tr" 
                    ? "Sanayi dükkanlarında sürpriz ek masraflarla veya fahiş fiyatlarla karşılaşmaya son. Hizmet bedeli siz işi onaylayana kadar güvenli havuz hesabımızda tutulur. İş bittiğinde, usta onaylandığında ödeme aktarılır."
                    : "No more unexpected extra costs or inflated bills at repair shops. The service fee is held securely in our escrow account until you approve the job. Payment is released only when you confirm satisfaction.",
                  color: "text-orange-400 bg-orange-400/10 border-orange-500/10",
                  highlight: language === "tr" ? "%100 Güvenli Havuz Ödemesi" : "100% Escrow Protection"
                }
              ].map((val, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/50 dark:bg-[#0a0f24]/50 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 rounded-3xl p-6 transition-all hover:translate-x-1 duration-300 flex items-start gap-4 relative overflow-hidden backdrop-blur-md"
                >
                  <div className={`w-12 h-12 rounded-2xl ${val.color} border flex items-center justify-center shrink-0`}>
                    <val.icon size={22} />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">{val.title}</h4>
                      <span className="text-[8px] font-black tracking-widest text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full uppercase">
                        {val.highlight}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                      {val.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
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
                    <div className="flex justify-between items-center mt-2 pb-2 border-b border-black/5 dark:border-white/5">
                      <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{prov.distance}</span>
                      <button className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors">
                        {t.inspectBtn} <Icons.ChevronRight size={10} />
                      </button>
                    </div>

                    {prov.compliance && (
                      <div className="pt-2 space-y-2 text-[9px] text-slate-500 dark:text-slate-400 leading-normal font-semibold">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                            <Icons.FileText size={10} className="text-teal-500" /> Resmi Sicil (MERSIS):
                          </span>
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{prov.compliance.mersis}</span>
                        </div>
                        
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 shrink-0 mt-0.5">
                            <Icons.Flame size={10} className={prov.compliance.isCompliant ? "text-emerald-500" : "text-amber-500"} /> İtfaiye Uygunluk:
                          </span>
                          <span className={`${prov.compliance.isCompliant ? "text-emerald-500 font-bold" : "text-amber-400 font-bold"} text-right`}>{prov.compliance.fireLicense}</span>
                        </div>
                        
                        {prov.type === "Oto Servis" ? (
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 shrink-0 mt-0.5">
                              <Icons.ShieldCheck size={10} className="text-blue-500" /> Atık Yağ Çevre Lisansı:
                            </span>
                            <span className={`${prov.compliance.isCompliant ? "text-emerald-500 font-bold" : "text-amber-400 font-bold"} text-right`}>{prov.compliance.wasteOilCert}</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                              <Icons.Maximize size={10} className="text-blue-500" /> Yükseklik Gabarisi:
                            </span>
                            <span className="text-blue-400 font-bold font-mono">{prov.compliance.clearanceHeight} Sınırı</span>
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                            <Icons.HeartHandshake size={10} className="text-orange-500" /> Sorumluluk Sigortası:
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 font-bold">Mesleki Sigortalı ({prov.compliance.insuranceLimit})</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                            <Icons.Video size={10} className="text-cyan-500" /> Aktif CCTV Kameralar:
                          </span>
                          <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">{prov.compliance.cameraCount} Adet Denetimli Kamera</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Right Column: Interactive Map Component */}
            <div className="flex-1 bg-slate-50 dark:bg-[#050814] border border-slate-200 dark:border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-2xl flex items-center justify-center p-2">
              <LocationMap 
                center={mapCenter} 
                markers={[...nearbyProviders, ...edsMarkers]} 
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

        {/* PREMIUM FEATURE SHOWCASE (Ürün Tanıtım Bölümleri) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28 space-y-32 z-10 relative">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-blue-500">
              {language === "tr" ? "KAPSAMLI ÇÖZÜMLER" : "COMPREHENSIVE SOLUTIONS"}
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
              {language === "tr" ? "ARACINIZIN İHTİYAÇ DUYDUĞU TÜM DİJİTAL KONTROLLER" : "ALL THE DIGITAL CONTROLS YOUR VEHICLE NEEDS"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base font-semibold leading-relaxed">
              {language === "tr" 
                ? "Yakıt ve gider takibinden yedek parça tedariğine, usta tekliflerinden servis randevularına kadar tüm ihtiyaçlarınızı tek bir panelden şeffafça yönetin."
                : "Manage all your needs from fuel & expense tracking to spare parts, mechanic quotes to service appointments transparently from a single dashboard."}
            </p>
          </div>

          {/* FEATURE 1: FUEL & EXPENSE TRACKING (Yakıt ve Gider Takip Sistemi) */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Graphic mockup of Fuel & Expenses */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-indigo-400 tracking-wider uppercase">CARVIS TELEMETRİ</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "YAKIT VE GİDER KOKPİTİ" : "FUEL & EXPENSE COCKPIT"}
                  </h4>
                </div>
                <Icons.TrendingUp className="text-indigo-400" size={18} />
              </div>

              {/* Monthly Stats Row */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-md text-left">
                  <span className="text-[8px] font-black text-slate-400 uppercase">{language === "tr" ? "AKARYAKIT" : "FUEL"}</span>
                  <div className="text-xs md:text-sm font-black text-slate-900 dark:text-white font-mono mt-1">₺4.250</div>
                </div>
                <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-md text-left">
                  <span className="text-[8px] font-black text-slate-400 uppercase">{language === "tr" ? "SERVİS / USTA" : "SERVICE"}</span>
                  <div className="text-xs md:text-sm font-black text-slate-900 dark:text-white font-mono mt-1">₺2.400</div>
                </div>
                <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-md text-left">
                  <span className="text-[8px] font-black text-slate-400 uppercase">{language === "tr" ? "TASARRUF" : "SAVINGS"}</span>
                  <div className="text-xs md:text-sm font-black text-teal-400 font-mono mt-1">₺1.120</div>
                </div>
              </div>

              {/* Chart Mockup */}
              <div className="bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-2xl p-4 mb-6 shadow-inner text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase mb-3 block">
                  {language === "tr" ? "AYLIK TÜKETİM TRENDİ (L/100KM)" : "MONTHLY CONSUMPTION TREND"}
                </span>
                <div className="flex items-end justify-between h-24 pt-4 gap-2">
                  {[45, 60, 30, 80, 50, 75, 40].map((h, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className={`w-full bg-gradient-to-t ${i === 3 ? 'from-indigo-600 to-indigo-400' : 'from-slate-300 to-slate-400 dark:from-slate-800 dark:to-slate-700'} rounded-t-md`} style={{ height: `${h}%` }}></div>
                      <span className="text-[8px] font-bold text-slate-400 font-mono">M{i+1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transaction Logs */}
              <div className="space-y-2 text-left">
                <div className="flex justify-between items-center p-2.5 bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Icons.Fuel className="text-slate-400" size={14} />
                    <span className="text-[10px] font-black text-slate-900 dark:text-white">Shell V-Power (Benzin)</span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white">₺2.150</span>
                </div>
                <div className="flex justify-between items-center p-2.5 bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Icons.Wrench className="text-slate-400" size={14} />
                    <span className="text-[10px] font-black text-slate-900 dark:text-white">
                      {language === "tr" ? "Rot Balans Hizmeti" : "Wheel Alignment Service"}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white">₺600</span>
                </div>
              </div>
            </div>

            {/* Right: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[9px] font-black text-indigo-400 tracking-widest uppercase">
                {language === "tr" ? "ÜCRETSİZ PREMIUM HİZMET" : "FREE PREMIUM SERVICE"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "DETAYLI YAKIT VE GİDER ANALİZ SİSTEMİ" : "ADVANCED FUEL & EXPENSE TRACKING"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "Piyasada aylık abonelikle satılan gider takip yazılımlarını unutun. Carvis ile tüm akaryakıt fişlerinizi, servis ödemelerinizi ve kasko/sigorta masraflarınızı kaydedin. Ortalama yakıt tüketiminizi (L/100km) otomatik hesaplayarak bütçenizi kontrol altına alın."
                  : "Forget expensive expense managers sold on subscriptions. Record fuel logs, service fees, and insurance costs in Carvis. Track real-time fuel efficiency (L/100km) automatically and take control of your budget."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Aylık/Yıllık Grafiksel Masraf Analiz Raporu" : "Monthly/Yearly Graphical Expense Analysis"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Plakaya Göre Tüketim ve Tasarruf Kıyaslaması" : "Consumption & Saving Benchmarks by Plate"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Trafik Sigortası ve Muayene Hatırlatma Bildirimleri" : "Insurance & Inspection Reminder Push Alerts"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* FEATURE 2: MECHANICS & PARTS (Usta Bulma, Teklif Karşılaştırma ve Yedek Parça) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            {/* Right: Graphic mockup of quotes and compatible parts */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-amber-500 tracking-wider uppercase">{language === "tr" ? "ŞEFFAF FİYATLANDIRMA" : "TRANSPARENT PRICING"}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "USTA TEKLİFLERİ & PARÇALAR" : "MECHANIC QUOTES & PARTS"}
                  </h4>
                </div>
                <Icons.Layers className="text-amber-500" size={18} />
              </div>

              {/* Service Request Card */}
              <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 mb-4 shadow-md text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest block mb-2">{language === "tr" ? "FİYAT TEKLİFİ ALINAN HİZMET" : "REQUESTED SERVICE"}</span>
                <div className="flex justify-between items-center">
                  <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase">Fiat Egea • 10.000 KM Bakımı</h5>
                  <span className="text-[8px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase">{language === "tr" ? "3 Teklif" : "3 Quotes"}</span>
                </div>
              </div>

              {/* Quotes Comparison list */}
              <div className="space-y-2 mb-4 text-left">
                <div className="flex justify-between items-center p-3 bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <div>
                    <span className="text-[9px] font-black text-slate-900 dark:text-white">Maslak Pro Servis</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icons.Star size={10} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[8px] font-bold text-slate-500">4.9 (124 yorum)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[8px] font-black text-emerald-500 bg-emerald-500/20 px-2 py-0.5 rounded-md uppercase tracking-wider block w-fit ml-auto mb-1">{language === "tr" ? "En İyi Teklif" : "Best Offer"}</span>
                    <span className="text-xs font-mono font-black text-emerald-400">₺2.100</span>
                  </div>
                </div>

                <div className="flex justify-between items-center p-3 bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-xl opacity-75">
                  <div>
                    <span className="text-[9px] font-black text-slate-900 dark:text-white">Ostim Yıldız Otomotiv</span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Icons.Star size={10} className="text-yellow-400 fill-yellow-400" />
                      <span className="text-[8px] font-bold text-slate-500">4.8 (82 yorum)</span>
                    </div>
                  </div>
                  <span className="text-xs font-mono font-black text-slate-900 dark:text-white">₺2.400</span>
                </div>
              </div>

              {/* Compatible Parts check */}
              <div className="p-3 bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-xl flex items-center justify-between text-left">
                <div className="flex items-center gap-2">
                  <Icons.Package className="text-slate-400" size={16} />
                  <div>
                    <span className="text-[9px] font-black text-slate-900 dark:text-white">{language === "tr" ? "Fil Filtre Bakım Seti" : "Fil Filter Service Kit"}</span>
                    <p className="text-[8px] text-slate-500 font-bold">{language === "tr" ? "Aracınızla %100 Uyumlu OEM Parça" : "100% Compatible OEM Part"}</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-black text-slate-900 dark:text-white">₺980</span>
              </div>
            </div>

            {/* Left: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] font-black text-amber-500 tracking-widest uppercase">
                {language === "tr" ? "AKILLI PAZARYERİ VE SEÇİM" : "SMART MARKETPLACE & MATCH"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "USTA TEKLİFLERİ VE GÜVENLİ FİYAT ANALİZİ" : "MECHANIC QUOTES & PRICE ANALYSIS"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "Aracınızın tamiri veya periyodik bakımı için sanayide dükkan dükkan gezmeye son verin. Carvis ile usta talebi oluşturarak yakınınızdaki doğrulanmış özel servislerden anında şeffaf fiyat teklifleri toplayın. Fiyatları, müşteri puanlarını ve yakınlığı karşılaştırıp en uygun seçimi yapın. Ayrıca aracınızın marka ve modeline %100 uyumlu orijinal/OEM yedek parçaları tek tıkla listeleyin."
                  : "Stop wandering around mechanic shops for car maintenance or repairs. Create a request in Carvis to receive instant, transparent quotes from verified local mechanics. Compare prices, ratings, and proximity. Plus, list original/OEM spare parts 100% compatible with your car brand and model with a single click."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Doğrulanmış Servislerden Rekabetçi Fiyat Teklifleri" : "Competitive Price Quotes from Verified Mechanics"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Araca Özel %100 Uyumlu Yedek Parça Listeleme" : "100% Compatible Spare Parts Listed per Vehicle"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Şeffaf Puan ve Yorumlarla Karşılaştırmalı Fiyat Analizi" : "Price Analysis with Transparent Ratings & Reviews"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* FEATURE 3: DIGITAL VEHICLE PASSPORT (Dijital Servis Defteri ve Pasaport) */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left: Graphic mockup of Digital Passport */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-teal-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-teal-400 tracking-wider uppercase">{language === "tr" ? "KRONOLOJİK GEÇMİŞ" : "CHRONOLOGICAL HISTORY"}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "ARAÇ SERVİS PASAPORTU" : "VEHICLE SERVICE PASSPORT"}
                  </h4>
                </div>
                <Icons.ShieldCheck className="text-teal-400" size={18} />
              </div>

              {/* Timeline Items */}
              <div className="relative border-l border-black/10 dark:border-white/10 ml-3 pl-6 space-y-6 text-left">
                
                {/* Timeline entry 1 */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-teal-400 border-4 border-white dark:border-[#040817] shadow-md"></span>
                  <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        42,500 KM • {language === "tr" ? "Disk & Balata Değişimi" : "Disc & Pad Replacement"}
                      </span>
                      <span className="text-[8px] font-black text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full uppercase">{language === "tr" ? "Faturalı" : "Invoiced"}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold">{language === "tr" ? "Güven Oto Özel Servisi • Rapidsy Onaylı Parça" : "Guven Auto Service • Rapidsy Verified Parts"}</p>
                  </div>
                </div>

                {/* Timeline entry 2 */}
                <div className="relative">
                  <span className="absolute -left-[30px] top-1.5 w-3.5 h-3.5 rounded-full bg-teal-400 border-4 border-white dark:border-[#040817] shadow-md"></span>
                  <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-3 shadow-md">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        35,000 KM • {language === "tr" ? "10k Periyodik Bakım" : "10k Periodic Service"}
                      </span>
                      <span className="text-[8px] font-black text-teal-400 bg-teal-400/10 px-2 py-0.5 rounded-full uppercase">{language === "tr" ? "Faturalı" : "Invoiced"}</span>
                    </div>
                    <p className="text-[9px] text-slate-500 font-bold">{language === "tr" ? "Mobil 1 Yetkili Servis • Castrol Edge Yağ" : "Mobil 1 Service • Castrol Edge Oil"}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Left: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-[9px] font-black text-teal-400 tracking-widest uppercase">
                {language === "tr" ? "KAYIT VE HİZMET ARŞİVİ" : "RECORD & SERVICE ARCHIVE"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "DİJİTAL ARAÇ PASAPORTU VE GEÇMİŞİ" : "DIGITAL VEHICLE PASSPORT & HISTORY"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "Aracınızın bakım geçmişini kaybolan kağıt faturalardan kurtarın. Rapidsy Dijital Araç Pasaportu, yapılan tüm servis işlemlerinizi, periyodik bakımlarınızı ve aldığınız parça değişimlerini kronolojik bir sırayla dijital arşivinizde tesciller. Aracınızın geçmişini tek ekrandan şeffafça kontrol edin."
                  : "Save your vehicle service history from lost paper receipts. Rapidsy Digital Vehicle Passport registers all completed repairs, periodic maintenance, and spare parts logs in a chronological digital archive. Check your vehicle's full logbook transparently from a single dashboard."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Araç Kilometresine Bağlı Gider Grafikleri" : "Mileage & KM-Based Expense Distribution Graphs"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Geçmiş Servis ve Bakım Detayları Kaydı" : "Completed Service & Maintenance History Logging"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Tek Tıkla Dijital Araç Pasaportu Özeti" : "One-Click Digital Vehicle Passport Summary"}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* FEATURE 4: TOW & VALET (Yol Yardım, Çekici ve Kapıdan Kapıya Vale) */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            {/* Left: Graphic mockup of Valet Stepper */}
            <div className="w-full lg:w-1/2 bg-gradient-to-tr from-slate-100 to-slate-200 dark:from-[#0a0f24] dark:to-[#040817] border border-slate-200 dark:border-white/10 rounded-[3rem] p-6 md:p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-[200px] h-[200px] bg-orange-500/10 rounded-full blur-[80px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center pb-4 border-b border-black/5 dark:border-white/5 mb-6 text-left">
                <div>
                  <span className="text-[8px] font-black text-orange-400 tracking-wider uppercase">{language === "tr" ? "ADIM ADIM DURUM" : "STEP BY STEP STATUS"}</span>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {language === "tr" ? "VALE HİZMET SÜREÇLERİ" : "VALET SERVICE PROGRESS"}
                  </h4>
                </div>
                <Icons.Navigation className="text-orange-400 animate-pulse" size={18} />
              </div>

              {/* Status Stepper Mockup */}
              <div className="bg-white/50 dark:bg-[#070b18]/50 border border-black/5 dark:border-white/10 rounded-2xl p-5 mb-4 text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase mb-3.5 block">
                  {language === "tr" ? "VALE HİZMET ADIMLARI" : "VALET STATUS STEPS"}
                </span>
                <div className="space-y-4">
                  {[
                    { step: "1", title: language === "tr" ? "Talep oluşturuldu" : "Request created", active: true },
                    { step: "2", title: language === "tr" ? "Vale yönlendirildi (Ahmet Y.)" : "Valet dispatched (Ahmet Y.)", active: true, badge: "#4890" },
                    { step: "3", title: language === "tr" ? "Araç teslim alındı" : "Vehicle picked up", active: false },
                    { step: "4", title: language === "tr" ? "Güvenli alana park edildi" : "Parked in secure area", active: false }
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black ${s.active ? 'bg-orange-500 text-white' : 'bg-slate-200 dark:bg-white/5 text-slate-400'}`}>
                        {s.step}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className={`text-[10px] font-bold ${s.active ? 'text-slate-900 dark:text-white font-black' : 'text-slate-400'}`}>{s.title}</span>
                        {s.badge && <span className="text-[8px] font-mono font-black bg-orange-500/10 text-orange-500 px-1.5 py-0.5 rounded-md">{s.badge}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tracking card info */}
              <div className="bg-white/80 dark:bg-[#070b18]/80 border border-black/5 dark:border-white/10 rounded-2xl p-4 flex items-center justify-between text-left">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400">
                    <Icons.User size={16} />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-black text-slate-900 dark:text-white">Ahmet Y.</h5>
                    <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{language === "tr" ? "Rapidsy Vale Görevlisi" : "Rapidsy Valet Agent"}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/5 text-[9px] font-black uppercase rounded-lg text-slate-600 dark:text-slate-300">
                    {language === "tr" ? "ARA" : "CALL"}
                  </button>
                </div>
              </div>
            </div>

            {/* Right: Pitch copy */}
            <div className="w-full lg:w-1/2 space-y-6 text-left">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] font-black text-orange-400 tracking-widest uppercase">
                {language === "tr" ? "KONFOR VE GÜVENLİK" : "COMFORT & EMERGENCY"}
              </span>
              <h3 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight uppercase">
                {language === "tr" ? "GÜVENLİ VALE TALEBİ VE ACİL YOL YARDIM" : "SECURE VALET REQUEST & ROAD ASSISTANCE"}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base font-semibold leading-relaxed">
                {language === "tr"
                  ? "İş günlerinizde veya acil durumlarda Rapidsy yanınızda. Aracınızın bakımı, muayenesi veya park ihtiyacı mı var? İstediğiniz paketi (Standart, VIP veya Gece Modu) seçerek anında vale talebi oluşturun. Valeniz atandığında benzersiz doğrulama kodunuz ile anahtarınızı güvenle teslim edin ve süreci adım adım takip edin. Yolda kaldığınızda ise acil çekici yol yardım butonunu kullanın."
                  : "In busy workdays or emergencies, Rapidsy is by your side. Select your preferred package (Standard, VIP, or Night mode) to book a valet for periodic maintenance, inspection, or parking. Get a unique verification code to safely hand over your key, and track each milestone step by step. Use the emergency road assistance button if you break down."}
              </p>
              <ul className="space-y-3 text-xs font-black text-slate-700 dark:text-slate-300">
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Doğrulama Kodu ile Güvenli Anahtar Teslimi" : "Secure Key Handover via Verification Code"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Adım Adım Vale Durum Takibi ve İptal Edebilme" : "Step-by-Step Valet Status Tracking & Cancellation"}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Icons.CheckCircle2 className="text-teal-400 shrink-0" size={16} />
                  <span>{language === "tr" ? "Acil Durumlarda SOS Çekici Çağrı Butonu" : "SOS Towing Dispatch for Roadside Emergencies"}</span>
                </li>
              </ul>
            </div>
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

        {/* PREMIUM FOOTER */}
        <footer className="w-full border-t border-black/5 dark:border-white/5 pt-16 pb-12 bg-white dark:bg-[#02050c] relative z-10 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              
              {/* Brand Section */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="Rapidsy Logo" className="h-7 md:h-9 w-auto object-contain" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm">
                  {t.footerDesc || "Otomotiv sektörünün dijital dönüşümüne öncülük eden akıllı otomobil platformu."}
                </p>
                <div className="flex items-center gap-3 pt-2">
                  {[
                    { icon: Icons.Instagram, url: "#" },
                    { icon: Icons.Twitter, url: "#" },
                    { icon: Icons.Youtube, url: "#" },
                    { icon: Icons.Linkedin, url: "#" }
                  ].map((soc, idx) => (
                    <a 
                      key={idx} 
                      href={soc.url}
                      className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-white/10 active:scale-90 transition-all"
                    >
                      <soc.icon size={16} />
                    </a>
                  ))}
                </div>
              </div>

              {/* Column 2: Hizmetler */}
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t.allServices || "Hizmetler"}</h4>
                <ul className="space-y-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <li><button onClick={() => navigate("/application/home")} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.smartDiagnosis || "Yakıt & Gider Takibi"}</button></li>
                  <li><button onClick={() => navigate("/application/parts")} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.autoSpareParts || "Oto Yedek Parça"}</button></li>
                  <li><button onClick={() => navigate("/application/mechanics")} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.expertMechanic || "Uzman Usta & Servis"}</button></li>
                  <li><button onClick={() => navigate("/application/home")} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.sosValet || "SOS & Vale Hizmeti"}</button></li>
                </ul>
              </div>

              {/* Column 3: İş Ortakları */}
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t.partners || "Partnerler"}</h4>
                <ul className="space-y-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <li><button onClick={() => navigate("/partner-login")} className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.becomePartner || "Rapidsy Partner Ol"}</button></li>
                  <li><button onClick={() => navigate("/partner-login")} className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.valetLogin || "Vale/Çekici Girişi"}</button></li>
                  <li><button onClick={() => navigate("/partner-login")} className="hover:text-orange-500 dark:hover:text-orange-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.goToSellerPanel || "Satıcı Paneline Git"}</button></li>
                </ul>
              </div>

              {/* Column 4: Kurumsal & Yasal */}
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t.company || "Şirket"}</h4>
                <ul className="space-y-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t.aboutUs || "Hakkımızda"}</a></li>
                  <li><a href="#" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t.contact || "İletişim"}</a></li>
                  <li><a href="#" onClick={(e) => { e.preventDefault(); openModal("kvkk"); }} className="hover:text-slate-900 dark:hover:text-white transition-colors">{t.kvkkText || "KVKK Aydınlatma Metni"}</a></li>
                  <li><a href="/privacy-policy" className="hover:text-slate-900 dark:hover:text-white transition-colors">{t.privacy || "Gizlilik Politikası"}</a></li>
                </ul>
              </div>

            </div>

            {/* Bottom Row */}
            <div className="border-t border-black/5 dark:border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                {t.copyright || "© 2026 Rapidsy. Tüm hakları saklıdır."}
              </span>
              <div className="flex items-center gap-4 text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-wider">
                <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-600 dark:text-slate-400">
                  v2.5.0-premium
                </span>
              </div>
            </div>
          </div>
        </footer>

      </div>

    </div>
  );
};

export default LandingScreen;
