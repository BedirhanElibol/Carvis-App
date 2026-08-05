import React, { useEffect, useState } from "react";
import { 
  ArrowRight, Box, Car, CheckCircle, CheckCircle2, ChevronDown, ChevronRight, 
  Clock, Droplets, FileText, Flame, Fuel, Globe, HardDrive, HeartHandshake, 
  Instagram, Layers, Linkedin, Loader2, Lock, Map, MapPin, Maximize, Moon, 
  Navigation, Package, RefreshCw, Search, SearchCheck, ShieldCheck, Star, 
  Store, Sun, TrendingUp, Twitter, User, Video, Wind, Wrench, Youtube 
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { getFuelPrices, getNearbyProviders, getCityMetadata, getEGMEDSMarkers } from "../../services/externalApis";
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
      setMapCenter({ lat: 39.0, lng: 35.0 });
      
      try {
        const targetCities = ["istanbul", "ankara", "izmir", "adana", "trabzon", "diyarbakir", "erzurum"];
        let allProvs = [];
        let allEds = [];
        
        for(let city of targetCities) {
          const cityMeta = getCityMetadata(city);
          const providers = await getNearbyProviders(cityMeta.lat, cityMeta.lng, 10000);
          const eds = await getEGMEDSMarkers(city);
          
          allProvs.push(...providers.slice(0, 3));
          allEds.push(...(eds || []).slice(0, 1));
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

  const _handleGuestEntry = () => {
    openModal("login", "customer");
  };

  return (
    <div className={`w-full min-h-screen relative overflow-x-hidden transition-colors duration-500 selection:bg-teal-500/30 ${theme === 'dark' ? 'dark bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-white dark:bg-[#060b14] transition-colors duration-500">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/5 dark:bg-white/[0.01] rounded-full blur-[120px] pointer-events-none"></div>
      </div>

      {/* Floating Glass Navbar */}
      <nav className="fixed top-[calc(1rem+env(safe-area-inset-top))] left-4 right-4 z-50 max-w-7xl mx-auto">
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
              className="w-10 h-10 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white cursor-pointer"
            >
              <Globe size={18} />
              <span className="absolute bottom-1.5 text-[6px] font-black tracking-widest text-teal-400">
                {language?.toUpperCase()}
              </span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/10 active:scale-95 transition-all text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white cursor-pointer"
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
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all border border-cyan-400/30 cursor-pointer"
              >
                {currentUser.role === "admin"
                  ? (t.adminPanel || "Yönetici Paneli")
                  : ["parking", "valet", "mechanic", "parts", "partner"].includes(currentUser.role)
                  ? (t.partnerPanel || "Yönetim Paneli")
                  : (t.myGarage || "Garajım")}
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate("/partner-login")}
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-sm text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-cyan-600 dark:hover:text-cyan-300 hover:bg-white dark:hover:bg-cyan-500/10 active:scale-95 transition-all cursor-pointer"
                >
                  <Store size={14} className="text-cyan-500" />
                  {t.becomePartner || "Partner Girişi"}
                </button>

                <button
                  onClick={() => openModal("login", "customer")}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-cyan-500/20 active:scale-95 transition-all border border-cyan-400/30 cursor-pointer"
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
          t={t} 
          language={language}
          fuelPrices={fuelPrices}
          fuelCity={fuelCity}
          isLoadingFuel={isLoadingFuel}
          onStart={_handleGuestEntry}
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

        {/* FOOTER */}
        <footer className="w-full border-t border-black/5 dark:border-white/5 pt-16 pb-12 bg-white dark:bg-[#02050c] relative z-10 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
              
              {/* Brand Section */}
              <div className="space-y-4 text-left">
                <div className="flex items-center gap-3">
                  <img src={logo} alt="Rapidsy Logo" className="h-7 md:h-9 w-auto object-contain" />
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm leading-relaxed max-w-sm font-sans">
                  {t.footerDesc || "Otomotiv sektörünün dijital dönüşümüne öncülük eden akıllı otomobil platformu."}
                </p>
              </div>

              {/* Column 2: Hizmetler */}
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t.allServices || "Hizmetler"}</h4>
                <ul className="space-y-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
                  <li><button onClick={() => currentUser ? navigate("/app/mechanics") : _handleGuestEntry()} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors bg-transparent border-none p-0 cursor-pointer">Oto Servis & Tamir</button></li>
                  <li><button onClick={() => currentUser ? navigate("/app/parts") : _handleGuestEntry()} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors bg-transparent border-none p-0 cursor-pointer">Yedek Parça</button></li>
                  <li><button onClick={() => currentUser ? navigate("/app/expert") : _handleGuestEntry()} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors bg-transparent border-none p-0 cursor-pointer">Mobil Ekspertiz</button></li>
                  <li><button onClick={() => currentUser ? navigate("/application/home") : _handleGuestEntry()} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors bg-transparent border-none p-0 cursor-pointer">Dijital Araç Pasaportu</button></li>
                </ul>
              </div>

              {/* Column 3: İş Ortakları */}
              <div className="space-y-4 text-left">
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{t.partners || "Partnerler"}</h4>
                <ul className="space-y-2.5 text-xs font-semibold text-slate-500 dark:text-slate-400 font-sans">
                  <li><button onClick={() => navigate("/partner-login")} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors bg-transparent border-none p-0 cursor-pointer">{t.becomePartner || "Rapidsy Partner Ol"}</button></li>
                  <li><button onClick={() => navigate("/partner-login/mechanic")} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors bg-transparent border-none p-0 cursor-pointer">Usta & Servis Girişi</button></li>
                  <li><button onClick={() => navigate("/partner-login/parts")} className="hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors bg-transparent border-none p-0 cursor-pointer">Satıcı Paneli</button></li>
                </ul>
              </div>

            </div>

            {/* Bottom Bar */}
            <div className="pt-8 border-t border-slate-200 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 dark:text-slate-400 font-sans">
              <p>&copy; {new Date().getFullYear()} Rapidsy Teknoloji A.Ş. Tüm hakları saklıdır.</p>
              <div className="flex gap-6">
                <button onClick={() => navigate("/privacy-policy")} className="hover:text-slate-900 dark:hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer">Gizlilik Politikası</button>
                <button onClick={() => navigate("/terms-of-service")} className="hover:text-slate-900 dark:hover:text-white transition-colors bg-transparent border-none p-0 cursor-pointer">Kullanım Koşulları</button>
              </div>
            </div>

          </div>
        </footer>

      </div>

    </div>
  );
};

export default LandingScreen;
