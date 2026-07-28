import React, { useEffect, useState } from "react";
import { ArrowRight, Box, Car, CheckCircle, CheckCircle2, ChevronDown, ChevronRight, Clock, Droplets, FileText, Flame, Fuel, Globe, HardDrive, HeartHandshake, Instagram, Layers, Linkedin, Loader2, Lock, Map, MapPin, Maximize, Moon, Navigation, Package, RefreshCw, Search, SearchCheck, ShieldCheck, Star, Store, Sun, TrendingUp, Twitter, User, Video, Wind, Wrench, Youtube } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import logo from "../../assets/logo.png";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { getFuelPrices, getNearbyProviders, getCityMetadata, getEGMEDSMarkers } from "../../services/externalApis";
import LocationMap from "../../components/ui/LocationMap";
import LandingHero from "./components/landing/LandingHero";
import LandingTrustBanner from "./components/landing/LandingTrustBanner";
import LandingFeatures from "./components/landing/LandingFeatures";
import LandingHowItWorks from "./components/landing/LandingHowItWorks";
import LandingUseCases from "./components/landing/LandingUseCases";
import LandingInteractiveMap from "./components/landing/LandingInteractiveMap";
import LandingBusinessPortalCTA from "./components/landing/LandingBusinessPortalCTA";

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

  // Fetch Providers and EGM EDS Points across Turkey
  useEffect(() => {
    let isMounted = true;
    const fetchProvidersAndEDS = async () => {
      setIsLoadingProviders(true);
      // Türkiye geneli harita için merkez
      setMapCenter({ lat: 39.0, lng: 35.0 });
      
      try {
        const targetCities = ["istanbul", "ankara", "izmir", "adana", "trabzon", "diyarbakir", "erzurum"];
        let allProvs = [];
        let allEds = [];
        
        for(let city of targetCities) {
          const cityMeta = getCityMetadata(city);
          const providers = await getNearbyProviders(cityMeta.lat, cityMeta.lng, 10000);
          const eds = await getEGMEDSMarkers(city);
          
          allProvs.push(...providers.slice(0, 3)); // Her şehirden 3 usta
          allEds.push(...(eds || []).slice(0, 1)); // Her şehirden 1 EDS
        }
        
        if (isMounted) {
          setNearbyProviders(allProvs);
          setEdsMarkers(allEds);
        }
      } catch (err) {
        console.error("Providers fetch error:", err);
      } finally {
        if (isMounted) setIsLoadingProviders(false);
      }
    };
    fetchProvidersAndEDS();
    return () => { isMounted = false; };
  }, []);

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
          const b = data.results[0].price;
          const m = data.results[1].price;
          const l = data.results[2].price;

          const safeAdd = (val, add) => {
            if (!val || val === "-") return "-";
            const num = parseFloat(val);
            if (isNaN(num)) return "-";
            return (num + add).toFixed(2);
          };

          const stations = [
            { marka: "Opet", benzin: b, motorin: m, lpg: l },
            { marka: "Shell", benzin: safeAdd(b, 0.05), motorin: safeAdd(m, 0.04), lpg: l },
            { marka: "BP", benzin: safeAdd(b, -0.03), motorin: safeAdd(m, -0.02), lpg: l },
            { marka: "Petrol Ofisi", benzin: safeAdd(b, 0.02), motorin: m, lpg: safeAdd(l, 0.10) },
            { marka: "Total", benzin: b, motorin: safeAdd(m, -0.05), lpg: l }
          ];

          setFuelPrices(stations);
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

  const _handleGuestEntry = (query = "", city = "istanbul", targetPath = "/application/home") => {
    loginAsGuest();
    navigate(targetPath, { state: { searchQuery: query, selectedCity: city } });
  };

  // Removed automatic redirect to allow logged-in users to view the landing page


  return (
    <div className={`w-full min-h-screen relative overflow-x-hidden transition-colors duration-500 selection:bg-teal-500/30 ${theme === 'dark' ? 'dark bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Clean, Static SaaS Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-white dark:bg-[#060b14] transition-colors duration-500">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 dark:bg-white/[0.01] rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      {/* Floating Glass Navbar */}
      <nav className="fixed top-4 left-4 right-4 z-50 max-w-7xl mx-auto">
        <div className="w-full bg-white/70 dark:bg-[#060b14]/70 backdrop-blur-2xl border border-white/40 dark:border-cyan-500/20 px-4 md:px-8 py-3.5 rounded-[2rem] flex items-center justify-between shadow-xl dark:shadow-xl transition-all">
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
              <Globe size={18} />
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
                <Sun size={18} className="text-amber-400" />
              ) : (
                <Moon size={18} className="text-slate-600 dark:text-slate-400" />
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
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 dark:from-cyan-600 dark:to-sky-600 dark:hover:from-cyan-500 dark:hover:to-sky-500 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20 dark:shadow-xl active:scale-95 transition-all border border-cyan-400/30"
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
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-white dark:hover:bg-cyan-500/10 hover:border-cyan-200 dark:hover:border-cyan-500/30 active:scale-95 transition-all"
                >
                  <Store size={14} className="text-cyan-500" />
                  {t.becomePartner || "Partner Girişi"}
                </button>

                {/* Login button */}
                <button
                  onClick={() => openModal("login", "customer")}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 dark:from-cyan-600 dark:to-sky-600 dark:hover:from-cyan-500 dark:hover:to-sky-500 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20 dark:shadow-xl active:scale-95 transition-all border border-cyan-400/30"
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
        <LandingHero
          handleGuestEntry={_handleGuestEntry}
          t={t} 
          language={language}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchLocation={searchLocation}
          setSearchLocation={setSearchLocation}
          CITIES={CITIES}
          fuelPrices={fuelPrices}
          fuelCity={fuelCity}
          setFuelCity={setFuelCity}
          fuelLastUpdated={fuelLastUpdated}
          isLoadingFuel={isLoadingFuel}
        />

        <LandingTrustBanner language={language} />

        <LandingFeatures language={language} />

        <LandingHowItWorks language={language} />

        <LandingUseCases 
          language={language} 
          fuelPrices={fuelPrices} 
          fuelCity={fuelCity} 
          isLoadingFuel={isLoadingFuel} 
        />

        <LandingInteractiveMap 
          t={t} 
          language={language}
          isLoadingProviders={isLoadingProviders}
          nearbyProviders={nearbyProviders}
          edsMarkers={edsMarkers}
          mapCenter={mapCenter}
          hoveredPin={hoveredPin}
          setHoveredPin={setHoveredPin}
          openModal={openModal}
        />

        <LandingBusinessPortalCTA t={t} />

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
                    { icon: Instagram, url: "#" },
                    { icon: Twitter, url: "#" },
                    { icon: Youtube, url: "#" },
                    { icon: Linkedin, url: "#" }
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
                  <li><button onClick={() => _handleGuestEntry()} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.smartDiagnosis || "Yakıt & Gider Takibi"}</button></li>
                  <li><button onClick={() => _handleGuestEntry("", "istanbul", "/app/parts")} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.autoSpareParts || "Oto Yedek Parça"}</button></li>
                  <li><button onClick={() => _handleGuestEntry("", "istanbul", "/app/mechanics")} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.expertMechanic || "Uzman Usta & Servis"}</button></li>
                  <li><button onClick={() => _handleGuestEntry()} className="hover:text-teal-500 dark:hover:text-teal-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.sosValet || "SOS & Vale Hizmeti"}</button></li>
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
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 dark:hover:text-white transition-colors">{t.aboutUs || "Hakkımızda"}</a></li>
                  <li><a href="#" onClick={(e) => e.preventDefault()} className="hover:text-slate-900 dark:hover:text-white transition-colors">{t.contact || "İletişim"}</a></li>
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
