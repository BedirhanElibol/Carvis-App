import React, { useState, useMemo, useEffect } from "react";
import * as Icons from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Badge } from "../../components/Core";
import { useUI } from "../../context/UIContext";
import { supabase } from "../../supabaseClient";
import { useGarage } from "../../context/GarageContext";
import { useAuth } from "../../context/AuthContext";
import { useQuote } from "../../context/QuoteContext";
import { useAppointment } from "../../context/AppointmentContext";
import { useNavigate, useLocation } from "react-router-dom";
import VehicleSearch from "../garage/VehicleSearch";
import ServiceHistoryModal from "../../components/modals/ServiceHistoryModal";
import OnboardingSlides from "../../components/onboarding/OnboardingSlides";
import VehiclePassport from "./components/VehiclePassport";
import ProactiveAlerts from "../../components/home/ProactiveAlerts";
import FinancialCockpit from "../../components/home/FinancialCockpit";
import { triggerHaptic } from "../../utils/haptics";
import Footer from "../../components/layout/Footer";
import { getNearbyProviders, getCityMetadata } from "../../services/externalApis";
import LocationMap from "../../components/ui/LocationMap";

// Service Categories and Featured Deals moved inside the component to use t

// Replaced popularProviders with dynamic state

const CustomerHome = () => {
  const { t, showAlert, openModal, selectedLocation, setSelectedLocation } = useUI();
  const { currentVehicle, addVehicle } = useGarage();
  const { currentUser } = useAuth();
  const { quotes } = useQuote();
  const { appointments } = useAppointment();
  const navigate = useNavigate();
  const location = useLocation();

  // States
  const serviceCategories = useMemo(() => [
    { name: t.periodicMaintenance, icon: Icons.Wrench, color: "text-teal-400", bg: "bg-teal-500/10", border: "hover:border-teal-500/30", route: "/app/mechanics" },
    { name: t.brakeSystem, icon: Icons.Activity, color: "text-rose-400", bg: "bg-rose-500/10", border: "hover:border-rose-500/30", route: "/app/mechanics" },
    { name: t.tireAndAlignment, icon: Icons.Disc, color: "text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/30", route: "/app/mechanics" },
    { name: t.smartValet, icon: Icons.Key, color: "text-amber-400", bg: "bg-amber-500/10", border: "hover:border-amber-500/30", route: "/app/valet" },
    { name: t.spareParts, icon: Icons.Package, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30", route: "/app/parts" },
    { name: t.detailing, icon: Icons.Sparkles, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "hover:border-cyan-500/30", route: "/app/mechanics" },
  ], [t]);

  const featuredDeals = useMemo(() => [
    {
      id: "deal-1",
      title: "Mobil 1 Yağ Değişim & Check-up Paketi",
      originalPrice: 2200,
      price: 1690,
      rating: 4.9,
      reviewsCount: 124,
      provider: "Maslak Pro Servis",
      image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300",
      badge: t.discount23
    },
    {
      id: "deal-2",
      title: "Kış Muayenesi & Detaylı Kontrol",
      originalPrice: 950,
      price: 0,
      rating: 4.8,
      reviewsCount: 82,
      provider: "Borusan Oto Maslak",
      image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=300",
      badge: t.free
    },
    {
      id: "deal-3",
      title: "Ön Disk & Brembo Balata Değişimi",
      originalPrice: 3800,
      price: 3190,
      rating: 5.0,
      reviewsCount: 46,
      provider: "Ostim Yıldız Otomotiv",
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=300",
      badge: t.compatibilityGuaranteed
    }
  ], [t]);

  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [showVehiclePassport, setShowVehiclePassport] = useState(false);
    const [selectedCity, setSelectedCity] = useState("istanbul");
  
  const [searchQuery, setSearchQuery] = useState("");

  // Map and Nearby Providers States
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });
  const [hoveredPin, setHoveredPin] = useState(null);

  // Extract initial state from router location (e.g. from LandingScreen search)
  useEffect(() => {
    if (location.state) {
      if (location.state.searchQuery) setSearchQuery(location.state.searchQuery);
      if (location.state.selectedCity) {
        setSelectedCity(location.state.selectedCity);
        if (setSelectedLocation) setSelectedLocation(location.state.selectedCity);
      }
    }
  }, [location.state, setSelectedLocation]);

  // Fetch Nearby Providers when selectedCity changes
  useEffect(() => {
    let isMounted = true;
    const fetchProviders = async () => {
      setIsLoadingProviders(true);
      const cityMeta = getCityMetadata(selectedCity);
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
  }, [selectedCity]);

  const [fuelPrices, setFuelPrices] = useState({
    istanbul: { benzin: 65.02, motorin: 67.46, lpg: 35.02 },
    ankara: { benzin: 65.99, motorin: 68.58, lpg: 35.56 },
    izmir: { benzin: 66.27, motorin: 68.85, lpg: 34.98 }
  });
  const [lastUpdated, setLastUpdated] = useState(t.today + ", 12:00");

  // Load live fuel prices from Opet API
  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const citiesConfig = [
          { name: "istanbul", code: 34, lpgRatio: 0.5386 },
          { name: "ankara", code: 6, lpgRatio: 0.5388 },
          { name: "izmir", code: 35, lpgRatio: 0.5278 }
        ];

        const updatedPrices = {
          istanbul: { benzin: 65.02, motorin: 67.46, lpg: 35.02 },
          ankara: { benzin: 65.99, motorin: 68.58, lpg: 35.56 },
          izmir: { benzin: 66.27, motorin: 68.85, lpg: 34.98 }
        };

        const fetchWithProxy = async (targetUrl) => {
          const proxies = [
            (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
            (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
            (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
          ];

          for (const getProxyUrl of proxies) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);
              
              const res = await fetch(getProxyUrl(targetUrl), { signal: controller.signal });
              clearTimeout(timeoutId);
              
              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                  return data;
                }
              }
            } catch {
              // Fail silently, try next proxy
            }
          }
          throw new Error("All proxies failed to fetch");
        };

        for (const city of citiesConfig) {
          try {
            let data = null;

            // Tier 1: Local development proxy (Vite dev server)
            if (import.meta.env.DEV) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                const localUrl = `/api/opet/fuelprices/prices?provinceCode=${city.code}&nocache=${Date.now()}`;
                const res = await fetch(localUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) {
                  const jsonData = await res.json();
                  if (Array.isArray(jsonData) && jsonData.length > 0) {
                    data = jsonData;
                  }
                }
              } catch {
                // Fallback to next tier
              }
            }

            // Tier 2: Supabase Edge Function (Server-side fetch to bypass CORS)
            if (!data) {
              try {
                const { data: edgeData, error: edgeError } = await supabase.functions.invoke('fuel-prices', {
                  method: 'GET',
                  queryParams: { city: city.name }
                });

                if (!edgeError && edgeData && edgeData.results) {
                  const benzinObj = edgeData.results.find(r => r.name.includes("Benzin"));
                  const motorinObj = edgeData.results.find(r => r.name.includes("Dizel") || r.name.includes("{t.diesel}"));
                  const lpgObj = edgeData.results.find(r => r.name.includes("LPG") || r.name.includes("Otogaz"));

                  if (benzinObj && motorinObj) {
                    updatedPrices[city.name] = {
                      benzin: benzinObj.price,
                      motorin: motorinObj.price,
                      lpg: lpgObj ? lpgObj.price : Math.round((benzinObj.price * city.lpgRatio) * 100) / 100
                    };
                    continue; // Successfully retrieved and parsed from Edge Function, move to next city
                  }
                }
              } catch {
                // Fallback to next tier
              }
            }

            // Tier 3: Client-side proxies (Fallback)
            if (!data) {
              const targetUrl = `https://api.opet.com.tr/api/fuelprices/prices?provinceCode=${city.code}&nocache=${Date.now()}`;
              data = await fetchWithProxy(targetUrl);
            }

            if (data) {
              let targetDistrict = data.find(d => 
                d.districtName === "ALTINDAĞ" || 
                d.districtName === "KADIKÖY" || 
                d.districtName === "MERKEZ" || 
                d.districtName === "KONAK"
              ) || data[0];

              if (targetDistrict && targetDistrict.prices) {
                const benzinObj = targetDistrict.prices.find(p => p.productShortName === "KURS");
                const motorinObj = targetDistrict.prices.find(p => p.productShortName === "MT_ULT");
                
                if (benzinObj && motorinObj) {
                  const benzin = benzinObj.amount;
                  const motorin = motorinObj.amount;
                  const lpg = Math.round((benzin * city.lpgRatio) * 100) / 100;
                  
                  updatedPrices[city.name] = { benzin, motorin, lpg };
                }
              }
            }
          } catch {
            // Fail silently to avoid console flooding
          }
        }

        setFuelPrices(updatedPrices);
        const now = new Date();
        const formattedDate = `${t.today}, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setLastUpdated(formattedDate);
      } catch (err) {
        console.error("Live prices fetch failed:", err);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [t]);

  // Sync selectedCity with global selectedLocation
  useEffect(() => {
    if (selectedLocation) {
      const lowerLoc = selectedLocation.toLowerCase();
      if (lowerLoc.includes("ankara")) {
        setSelectedCity("ankara");
      } else if (lowerLoc.includes("izmir")) {
        setSelectedCity("izmir");
      } else {
        setSelectedCity("istanbul");
      }
    }
  }, [selectedLocation]);



  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem("__SAFE_TOKEN_6__carvis_onboarding__END_TOKEN_6___seen");
    } catch (err) {
      console.error("Storage access error:", err);
      return false;
    }
  });

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem("__SAFE_TOKEN_6__carvis_onboarding__END_TOKEN_6___seen", "true");
    } catch (err) {
      console.error("Storage write error:", err);
    }
    setShowOnboarding(false);
    triggerHaptic("success");
  };

  const isGuest = !currentUser || currentUser.isAnonymous;

  // activeVehicle resolution
  const activeVehicle = useMemo(() => {
    if (currentVehicle) return currentVehicle;
    return null;
  }, [currentVehicle]);

  // 1. Search & Categories Panel
  const searchAndCategoriesPanel = (
    <div className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 shadow-2xl backdrop-blur-md space-y-6">
      <div>
        <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
          {t.serviceSearch}
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          {t.serviceSearchDesc}
        </p>
      </div>

      {/* Search Input */}
      <form 
        onSubmit={(e) => {
          e.preventDefault();
          if (searchQuery.trim()) {
            navigate("/app/mechanics", { state: { search: searchQuery } });
          }
        }}
        className="relative flex items-center"
      >
        <Icons.Search className="absolute left-4.5 text-slate-600 dark:text-slate-400" size={18} />
        <input
          type="text"
          placeholder={t.serviceSearchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-2xl py-4.5 pl-12 pr-28 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white shadow-lg active-scale transition-all border-none cursor-pointer"
        >
          {t.search}
        </button>
      </form>

      {/* Quick Categories Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {serviceCategories.map((cat, idx) => (
          <div
            key={idx}
            onClick={() => navigate(cat.route)}
            className={`bg-slate-50 dark:bg-[#030712]/40 border border-black/5 dark:border-white/5 ${cat.border} p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 active-scale cursor-pointer group transition-all duration-300 relative overflow-hidden`}
          >
            <div className="absolute inset-0 bg-white/[0.01] group-hover:bg-white/[0.03] transition-colors pointer-events-none"></div>
            <div className={`p-3 rounded-xl ${cat.bg} ${cat.color} group-hover:scale-110 transition-transform shadow-inner`}>
              <cat.icon size={20} />
            </div>
            <span className="text-[9px] font-black text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors uppercase tracking-tight text-center leading-none">
              {cat.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  // 2. Featured Deals & Campaigns Carousel
  const featuredDealsPanel = (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {t.specialDeals}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            {t.specialDealsDesc}
          </p>
        </div>
        <span className="text-[10px] font-black text-teal-400 uppercase tracking-wider">
          {t.catchDeals}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featuredDeals.map((deal) => (
          <div 
            key={deal.id}
            className="bg-white dark:bg-[#0a0f24]/80 border border-black/5 dark:border-white/5 rounded-[2.2rem] p-4.5 flex flex-col justify-between hover:border-slate-200 dark:border-white/10 transition-all shadow-xl group relative overflow-hidden backdrop-blur-md"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-white dark:bg-slate-900 mb-4 border border-black/5 dark:border-white/5">
              <img 
                src={deal.image} 
                alt={deal.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-teal-500/80 backdrop-blur-sm text-[8px] font-black uppercase text-slate-900 dark:text-white tracking-widest shadow-md">
                {deal.badge}
              </span>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[8px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Icons.Star size={10} className="text-yellow-400 fill-yellow-400" />
                {deal.rating} ({deal.reviewsCount})
              </div>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                {deal.provider}
              </span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {deal.title}
              </h4>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
              <div>
                {deal.originalPrice > 0 && (
                  <span className="text-[9px] text-slate-500 line-through font-mono">
                    ₺{deal.originalPrice.toLocaleString("tr-TR")}
                  </span>
                )}
                <p className="text-sm font-black text-teal-400 font-mono">
                  {deal.price === 0 ? "Ücretsiz" : `₺${deal.price.toLocaleString("tr-TR")}`}
                </p>
              </div>
              <button
                onClick={() => {
                  triggerHaptic("success");
                  showAlert(t.dealSelected, `${deal.title} ${t.dealSelectedDesc}`, "success");
                  navigate("/app/mechanics");
                }}
                className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                {t.bookAppointment} <Icons.ChevronRight size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 3. Popular Nearby Service Providers
  const popularProvidersPanel = (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {t.nearbyServices}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            {t.nearbyServicesDesc}
          </p>
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          {t.servicePoints}
        </span>
      </div>

      {isLoadingProviders ? (
        <div className="flex justify-center items-center h-48 text-slate-500">
          <Icons.Loader2 className="animate-spin w-8 h-8" />
        </div>
      ) : nearbyProviders.length === 0 ? (
        <div className="flex justify-center items-center h-48 text-slate-500 text-sm font-bold">
          {t.noServiceFound}
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-4 h-[400px]">
          {/* List View */}
          <div className="w-full lg:w-1/2 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
            {nearbyProviders.map((prov) => (
              <div 
                key={prov.id}
                onMouseEnter={() => setHoveredPin(prov.id)}
                onMouseLeave={() => setHoveredPin(null)}
                className={`bg-white dark:bg-[#0a0f24]/80 border ${hoveredPin === prov.id ? 'border-teal-500/50 bg-teal-50/50 dark:bg-white/10' : 'border-black/5 dark:border-white/5 hover:border-slate-200 dark:border-white/10'} p-5 rounded-[2.2rem] flex flex-col justify-between gap-4 transition-all relative overflow-hidden group shadow-xl backdrop-blur-md cursor-pointer`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center text-teal-500 dark:text-teal-400 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                      <Icons.MapPin size={22} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm group-hover:text-teal-500 dark:group-hover:text-teal-400 transition-colors">
                        {prov.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {prov.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/40 px-2 py-1 rounded-xl shadow-inner border border-black/5 dark:border-white/5">
                    <Icons.Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{prov.rating}</span>
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {prov.features && prov.features.map((feat, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full font-bold tracking-widest uppercase border border-black/5 dark:border-white/5">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400">
                    <Icons.Navigation size={12} />
                    <span className="font-black text-[10px] uppercase tracking-widest">{prov.distance}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate("/app/mechanics"); }} className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 flex items-center gap-1 transition-colors bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-xl">
                    DETAY <Icons.ChevronRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Map View */}
          <div className="w-full lg:w-1/2 bg-slate-100 dark:bg-[#050814] border border-slate-200 dark:border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-inner flex items-center justify-center p-2">
            <LocationMap 
              center={mapCenter} 
              markers={nearbyProviders} 
              hoveredPin={hoveredPin} 
              zoom={13} 
            />
          </div>
        </div>
      )}
    </div>
  );

  // 4. How Rapidsy Works Stepper
  const howItWorksPanel = (
    <div className="bg-white dark:bg-[#0a0f24]/60 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-6.5 space-y-6 relative overflow-hidden backdrop-blur-md shadow-xl">
      <div className="text-center max-w-sm mx-auto">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-teal-400">{t.howItWorks}</span>
        <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">{t.howItWorks3Steps}</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-0.5 bg-white dark:bg-white/5 shadow-sm pointer-events-none z-0"></div>
        {[
          { step: "01", title: t.reportIssue, desc: t.reportIssueDesc, icon: Icons.Activity, color: "from-teal-500 to-blue-500" },
          { step: "02", title: t.collectQuotes, desc: t.collectQuotesDesc, icon: Icons.FileText, color: "from-blue-500 to-cyan-500" },
          { step: "03", title: t.bookAndPay, desc: t.bookAndPayDesc, icon: Icons.ShieldCheck, color: "from-cyan-500 to-emerald-500" }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center relative z-10 space-y-3 group">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-slate-900 dark:text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
              <item.icon size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-black text-teal-400 tracking-widest block uppercase">ADIM {item.step}</span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
              <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium max-w-[200px] mx-auto">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );


  // Quotes list
  const activeQuotes = useMemo(() => {
    if (isGuest) {
      return [];
    }
    return Array.isArray(quotes)
      ? quotes
          .filter((q) => q.status === "pending" || q.status === "accepted")
          .slice(0, 2)
      : [];
  }, [quotes, isGuest]);

  // Appointments list
  const upcomingAppointments = useMemo(() => {
    if (isGuest) {
      return [];
    }
    return Array.isArray(appointments)
      ? appointments
          .filter(
            (a) =>
              new Date(a.appointment_date) > new Date() &&
              a.status !== "cancelled",
          )
          .sort(
            (a, b) => new Date(a.appointment_date) - new Date(b.appointment_date),
          )
          .slice(0, 1)
      : [];
  }, [appointments, isGuest]);

  // Decision helper warnings
  const decisionAlerts = useMemo(() => {
    if (!activeVehicle) return [];
    const alerts = [];
    const km = Number(activeVehicle.km) || 0;

    alerts.push({
      id: "alert-brake",
      type: "warning",
      icon: Icons.Activity,
      title: t.brakeSystemNotice,
      desc: t.brakeSystemDesc,
      actionText: t.createRequest,
      action: () => navigate("/app/mechanics"),
    });

    const maintenanceInterval = 15000;
    const remainingKm = maintenanceInterval - (km % maintenanceInterval);

    if (remainingKm < 3000) {
      alerts.push({
        id: "alert-oil",
        type: "danger",
        icon: Icons.AlertTriangle,
        title: t.maintenanceApproaching,
        desc: `Motor yağı ve filtre değişimine tahmini ${remainingKm.toLocaleString()} km kaldı. Şimdiden randevunuzu planlayın.`,
        actionText: t.bookAppointment,
        action: () => navigate("/appointments"),
      });
    }

    if (activeQuotes.length > 0) {
      alerts.push({
        id: "alert-quote",
        type: "info",
        icon: Icons.TrendingDown,
        title: t.priceAnalysis,
        desc: t.priceAnalysisDesc,
        actionText: t.viewQuotes,
        action: () => navigate("/quotes"),
      });
    }

    return alerts.slice(0, 2);
  }, [activeVehicle, activeQuotes, navigate, t]);

  const handleVehicleFound = async (data) => {
    const { error } = await addVehicle({
      brand: data.brand,
      model: data.model,
      plate: data.plate || "34RPD" + Math.floor(100 + Math.random() * 900),
      km: data.km || "0",
      engine_code: data.engine_code || data.engine || "",
      year: data.year ? parseInt(data.year, 10) : null,
      chassis_number: data.vin || null,
    });
    if (!error) {
      setShowVehicleSelector(false);
      showAlert(t.success, t.vehicleAdded, "success");
    } else {
      showAlert(t.error, t.vehicleAddError, "error");
    }
  };

  // Mock compatible parts for Golf 1.4 TSI
  const compatibleParts = [
    {
      id: "part-1",
      name: "Castrol EDGE 5W-30 Motor Yağı (4L)",
      brand: "Castrol",
      price: 1620,
      oldPrice: 1850,
      image: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&q=80&w=200",
      badge: t.superPrice
    },
    {
      id: "part-2",
      name: "Bosch Ön Fren Balata Seti (Golf Uyumlu)",
      brand: "Bosch",
      price: 1980,
      oldPrice: 2200,
      image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=200",
      badge: "Uyum Garantili"
    },
    {
      id: "part-3",
      name: "Fil Filtre Periyodik Filtre Seti (Hava/Yağ)",
      brand: "Fil Filtre",
      price: 980,
      oldPrice: 1100,
      image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=200",
      badge: t.mostPopular
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white font-sans pb-32 relative selection:bg-teal-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.08]">
        <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-blue-600 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-teal-500 rounded-full blur-[120px]"></div>
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.02] fixed"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: "24px 24px"
        }}
      ></div>

      {/* TOP COMPACT HEADER */}
      <div className="px-6 py-4.5 flex items-center justify-between border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0f24]/80 backdrop-blur-xl sticky top-0 z-30 shadow-lg shadow-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-inner">
            <Icons.Layers size={18} className="text-teal-400" />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold leading-none">
              Carvis
            </p>
            <h2 className="text-sm font-black tracking-tight mt-1 text-slate-900 dark:text-white">
              KOKPİT PANELİ
            </h2>
          </div>
        </div>

        {activeVehicle && (
          <button
            onClick={() => {
              if (isGuest) {
                openModal("login");
              } else {
                setShowVehicleSelector(true);
              }
            }}
            className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 shadow-sm text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-white/10 hover:text-slate-900 dark:text-white transition-all flex items-center gap-1.5 active-scale cursor-pointer"
          >
            <Icons.RefreshCw size={11} className="text-slate-600 dark:text-slate-400" /> {t.changeVehicle}
          </button>
        )}
      </div>

      {/* Floating Warning Banner for Demo Mode was removed */}



      {/* CORE CONTAINER: Responsive 3-Column Layout on Desktop */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT AREA: 2 Columns equivalent (Main Actions & Details) */}
          <div className="flex-1 w-full space-y-6">
            
            {/* GUEST MODE CONTENT */}
            {!activeVehicle && (
              <>
                {searchAndCategoriesPanel}
                
                {/* GUEST MODE ONBOARDING CARD */}
                <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 text-center relative overflow-hidden group shadow-2xl backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-teal-500 to-blue-600 text-slate-900 dark:text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-500/10">
                    {isGuest ? (
                      <Icons.UserCheck size={28} className="animate-pulse-slow" />
                    ) : (
                      <Icons.Car size={28} className="animate-pulse-slow" />
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">{t.welcomeToCarvis}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-6 font-medium">
                    {isGuest ? t.guestModeDesc : t.addCarToGarageDesc}
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                    <button
                      onClick={() => {
                        if (isGuest) {
                          openModal("login");
                        } else {
                          setShowVehicleSelector(true);
                        }
                      }}
                      className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-900 dark:text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest active-scale transition-all shadow-lg shadow-teal-500/15 border-none cursor-pointer"
                    >
                      {isGuest ? t.loginOrRegister : t.addNewCar}
                    </button>
                  </div>
                </div>

                {featuredDealsPanel}

                {popularProvidersPanel}

                {howItWorksPanel}
              </>
            )}

            {/* PROACTIVE ALERTS */}
            {activeVehicle && <ProactiveAlerts vehicle={activeVehicle} />}

            {/* VEHICLE COCKPIT MASTER MODULE */}
            {activeVehicle && (
              <div className="bg-white dark:bg-[#0a0f24]/85 rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      {isGuest && (
                        <span className="inline-block text-[8px] font-black tracking-[0.2em] text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md uppercase mb-2">
                          {t.previewMode}
                        </span>
                      )}
                      <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white">
                        {activeVehicle.brand}{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">{activeVehicle.model}</span>
                      </h1>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 font-mono tracking-widest uppercase mt-1.5">
                        {activeVehicle.plate} • {activeVehicle.km?.toLocaleString()} KM
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        if (isGuest) {
                          openModal("login");
                        } else {
                          navigate("/app/profile");
                        }
                      }}
                      className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all active-scale cursor-pointer"
                    >
                      <Icons.User size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-t border-black/5 dark:border-white/5 pt-6">
                    <div className="flex items-center gap-5 bg-black/30 p-4 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-inner">
                      <div className="relative w-20 h-20 shrink-0">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-800"
                            strokeWidth="3"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-teal-400"
                            strokeWidth="3"
                            strokeDasharray={`${activeVehicle.health_score || 96}, 100`}
                            strokeLinecap="round"
                            stroke="currentColor"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-lg font-black text-slate-900 dark:text-white leading-none font-mono">
                            %{activeVehicle.health_score || 96}
                          </span>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-teal-400 animate-ping"></div>
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                            ARACIN SAĞLIK DURUMU
                          </h4>
                        </div>
                        <p className="text-sm font-black text-teal-400 mt-1 uppercase">
                          {t.perfectCondition}
                        </p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {t.allSystemsActive}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/30 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                          {t.lastOilChange}
                        </p>
                        <p className="text-xs font-black text-slate-900 dark:text-white font-mono leading-none">
                          {activeVehicle.last_oil_change ? new Date(activeVehicle.last_oil_change).toLocaleDateString("tr-TR") : t.notSpecified}
                        </p>
                        <p className="text-[9px] text-teal-500 mt-2.5 uppercase font-black tracking-wide">
                          {t.protected10k}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          triggerHaptic("impact");
                          setShowVehiclePassport(true);
                        }}
                        className="bg-black/30 p-4 rounded-2xl border border-black/5 dark:border-white/5 text-left hover:bg-white dark:bg-white/5 shadow-sm transition-all active-scale group cursor-pointer"
                      >
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                          {t.digitalPassport}
                        </p>
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none flex items-center gap-1">
                          {t.history} <Icons.ChevronRight size={12} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                        </p>
                        <p className="text-[9px] text-teal-500 mt-2.5 uppercase font-black tracking-wide">
                          {t.allHistory}
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FINANCIAL COCKPIT */}
            {activeVehicle && <FinancialCockpit vehicle={activeVehicle} />}

            {activeVehicle && searchAndCategoriesPanel}



            {/* CHRONOLOGICAL MAINTENANCE TIMELINE */}
            {activeVehicle && (
              <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 space-y-4 backdrop-blur-md shadow-2xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Icons.Calendar size={18} className="text-slate-600 dark:text-slate-400" /> {t.upcomingTasks}
                  </h3>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    {t.calendarStatus}
                  </span>
                </div>

                <div className="relative pl-5 border-l border-slate-200 dark:border-white/10 space-y-5 py-2">
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">{t.tuvturkInspection}</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">{t.inspectionApproaching}</p>
                      </div>
                      <span className="text-[10px] font-mono font-black text-emerald-400 uppercase">
                        15 HAZ 2026
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-slate-900"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">{t.trafficInsurance}</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">{t.policyRenewal}</p>
                      </div>
                      <span className="text-[10px] font-mono font-black text-amber-400 uppercase">
                        30 MAY 2026
                      </span>
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-slate-600 border-2 border-slate-900"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">{t.seasonalTireCheck}</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1">{t.tireAnalysis}</p>
                      </div>
                      <span className="text-[10px] font-mono font-black text-slate-500 uppercase">
                        12 AĞU 2026
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeVehicle && featuredDealsPanel}

            {activeVehicle && popularProvidersPanel}

            {/* COMPATIBLE SPARE PARTS RECOMMENDED DEALS */}
            {activeVehicle && (
              <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 space-y-5 backdrop-blur-md shadow-2xl">
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <Icons.ShoppingBag size={18} className="text-teal-400" /> {t.compatibleParts}
                    </h3>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
                      {activeVehicle.brand} {activeVehicle.model} {t.recommendedFor}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate("/app/parts")}
                    className="text-[10px] font-black text-teal-400 hover:text-teal-300 transition-colors uppercase flex items-center gap-0.5 bg-transparent border-none cursor-pointer"
                  >
                    {t.seeAll} <Icons.ChevronRight size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {compatibleParts.map((part) => (
                    <div key={part.id} className="bg-black/30 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-200 dark:border-white/10 transition-all shadow-inner group">
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-white dark:bg-slate-900 mb-3 border border-black/5 dark:border-white/5">
                        <img src={part.image} alt={part.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-teal-500/80 backdrop-blur-sm text-[8px] font-black uppercase text-slate-900 dark:text-white tracking-widest">
                          {part.badge}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">{part.brand}</span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 mt-0.5 leading-snug">{part.name}</h4>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-500 line-through font-mono">₺{part.oldPrice}</span>
                          <p className="text-sm font-black text-teal-400 font-mono">₺{part.price}</p>
                        </div>
                        <button
                          onClick={() => {
                            triggerHaptic("success");
                            showAlert(t.addedToCart, `${part.name} ${t.addedToCartDesc}`, "success");
                          }}
                          className="w-8 h-8 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-900 dark:text-white flex items-center justify-center transition-all cursor-pointer border-none active:scale-90"
                        >
                          <Icons.Plus size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT SIDEBAR AREA (1/3 width on desktop) */}
          <div className="w-full lg:w-[380px] shrink-0 space-y-6">
            
            {/* ACTIVE FEED: APPOINTMENTS & TENDERS */}
            {(upcomingAppointments.length > 0 || activeQuotes.length > 0) && (
              <div className="space-y-4">
                <h3 className="font-black text-base uppercase tracking-tight px-1 text-slate-900 dark:text-white">
                  {t.todaysTasks}
                </h3>

                {/* Upcoming Appointment */}
                {upcomingAppointments.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      if (isGuest) {
                        openModal("login");
                      } else {
                        navigate("/appointments");
                      }
                    }}
                    className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 p-4.5 rounded-[1.8rem] flex justify-between items-center cursor-pointer active-scale shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="bg-black/30 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-teal-400">
                        <Icons.Calendar size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">{a.service_type}</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1.5">{a.company_name} • {new Date(a.appointment_date).toLocaleDateString("tr-TR")}</p>
                      </div>
                    </div>
                    <Badge type="success">{t.approved}</Badge>
                  </div>
                ))}

                {/* Active Quotes */}
                {activeQuotes.map((q) => (
                  <div
                    key={q.id}
                    onClick={() => {
                      if (isGuest) {
                        openModal("login");
                      } else {
                        navigate("/quotes");
                      }
                    }}
                    className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 p-4.5 rounded-[1.8rem] flex justify-between items-center cursor-pointer active-scale shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="bg-black/30 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-orange-400">
                        <Icons.FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none line-clamp-1">{q.description}</h4>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1.5">{q.company_name} • {q.total_amount ? `₺${q.total_amount.toLocaleString()}` : t.waitingForQuote}</p>
                      </div>
                    </div>
                    <Badge type="warning">{t.getQuote}</Badge>
                  </div>
                ))}
              </div>
            )}


            {/* COST INTELLIGENCE PANEL (Enhanced with circular donut SVG chart) */}
            {activeVehicle && (
              <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 backdrop-blur-md shadow-2xl">
                <div className="flex justify-between items-center mb-5 border-b border-black/5 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white">
                      {t.costIntelligence}
                    </h3>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
                      {t.monthlyCostViz}
                    </p>
                  </div>
                  <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter font-mono">₺4.850</p>
                </div>

                <div className="flex items-center gap-6">
                  {/* Circular SVG Donut Chart */}
                  <div className="relative w-24 h-24 shrink-0 flex items-center justify-center bg-black/20 rounded-full border border-black/5 dark:border-white/5">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      {/* Donut slice 1: Fuel (66%) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#10b981"
                        strokeWidth="3.5"
                        strokeDasharray="66 100"
                        strokeDashoffset="0"
                      />
                      {/* Donut slice 2: Service (24%) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#3b82f6"
                        strokeWidth="3.5"
                        strokeDasharray="24 100"
                        strokeDashoffset="-66"
                      />
                      {/* Donut slice 3: Other (10%) */}
                      <circle
                        cx="18"
                        cy="18"
                        r="15.915"
                        fill="transparent"
                        stroke="#64748b"
                        strokeWidth="3.5"
                        strokeDasharray="10 100"
                        strokeDashoffset="-90"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className="text-[8px] font-black text-slate-500 tracking-wider">{t.thisMonth}</span>
                      <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white">%100</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> {t.fuelLabel}</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">₺3.200</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> {t.serviceLabel}</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">₺1.150</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500"></span> {t.otherLabel}</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">₺500</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* REAL-TIME FUEL PRICES WIDGET */}
            <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 backdrop-blur-md shadow-2xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <Icons.Droplets size={18} className="text-blue-500" /> {t.liveFuelPrices}
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">{t.live}</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">
                    {selectedCity.toUpperCase()} • {t.lastUpdate}: {lastUpdated}
                  </p>
                </div>
                
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-slate-100 dark:bg-[#030712] border border-black/5 dark:border-white/5 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-wider rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-black/20 dark:hover:border-white/20 transition-colors"
                >
                  <option value="istanbul">{t.istanbul}</option>
                  <option value="ankara">{t.ankara}</option>
                  <option value="izmir">{t.izmir}</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                <div className="bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.unleaded95}</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono group-hover:scale-110 transition-transform">
                    {fuelPrices[selectedCity]?.benzin || "-"} <span className="text-[10px] text-slate-500">₺/L</span>
                  </span>
                </div>
                <div className="bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.diesel}</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono group-hover:scale-110 transition-transform">
                    {fuelPrices[selectedCity]?.motorin || "-"} <span className="text-[10px] text-slate-500">₺/L</span>
                  </span>
                </div>
                <div className="bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">{t.lpg}</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono group-hover:scale-110 transition-transform">
                    {fuelPrices[selectedCity]?.lpg || "-"} <span className="text-[10px] text-slate-500">₺/L</span>
                  </span>
                </div>
              </div>
            </div>

            {/* BEHAVIORAL AI DECISION HELPER CARDS */}
            {activeVehicle && decisionAlerts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <Icons.ShieldAlert size={16} className="text-slate-600 dark:text-slate-400" />
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {t.cockpitDecisionSupport}
                  </h4>
                </div>

                {decisionAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={alert.action}
                    className="bg-white dark:bg-[#0a0f24]/85 border border-black/5 dark:border-white/5 hover:border-white/15 p-4.5 rounded-[1.8rem] transition-all cursor-pointer active-scale relative overflow-hidden group shadow-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-inner">
                        <alert.icon size={18} className="text-teal-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{alert.title}</h4>
                          <span className="text-[8px] font-black text-teal-400 uppercase flex items-center gap-1 group-hover:text-slate-900 dark:text-white transition-colors">
                            {alert.actionText} <Icons.ChevronRight size={10} />
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                          {alert.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FOUR COLUMN CORE ACTIONS COCKPIT */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">
                {t.quickActions}
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Icons.Wrench, label: t.getService, route: "/app/mechanics" },
                  { icon: Icons.AlertCircle, label: t.emergencySOS, route: "/app/map" },
                  { icon: Icons.Package, label: t.autoParts, route: "/app/parts" },
                  { icon: Icons.Key, label: t.callValet, route: "/app/valet" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(item.route)}
                    className="bg-white dark:bg-[#0a0f24]/80 border border-black/5 dark:border-white/5 hover:border-white/15 p-3 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 active-scale cursor-pointer group transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-white dark:bg-[#0f172a] transition-all shadow-inner">
                      <item.icon size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-teal-400 transition-colors" />
                    </div>
                    <span className="text-[8px] font-black text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors uppercase tracking-tighter leading-none text-center block">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* EXPERT AUDIT ASSURANCE */}
            <div className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 p-5 rounded-[2.5rem] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-teal-400 shrink-0">
                  <Icons.ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.rightServiceMatch}</h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{t.carvisApproved}</p>
                </div>
              </div>
              <Icons.CheckCircle className="text-emerald-400 shrink-0" size={18} />
            </div>

          </div>

        </div>
      </div>

      {/* MODALS & TOUR */}
      {showVehicleSelector && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowVehicleSelector(false)}
              className="absolute -top-12 right-0 text-slate-900 dark:text-white hover:text-red-500 transition"
            >
              <Icons.X size={24} />
            </button>
            <VehicleSearch onVehicleFound={handleVehicleFound} />
          </div>
        </div>
      )}

      <ServiceHistoryModal
        show={showServiceHistory}
        onClose={() => setShowServiceHistory(false)}
      />
      
      {showOnboarding && (
        <OnboardingSlides onComplete={handleOnboardingComplete} />
      )}

      {showVehiclePassport && activeVehicle && (
        <VehiclePassport
          show={showVehiclePassport}
          onClose={() => setShowVehiclePassport(false)}
          vehicle={activeVehicle}
        />
      )}

      <Footer />
    </div>
  );
};

export default CustomerHome;
