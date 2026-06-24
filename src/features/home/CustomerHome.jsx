import React, { useState, useMemo, useEffect } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
import GuidedDiagnostics from "./components/GuidedDiagnostics";
import { triggerHaptic } from "../../utils/haptics";
import Footer from "../../components/layout/Footer";

// Service Categories for Search panel
const serviceCategories = [
  { name: "Periyodik Bakım", icon: Icons.Wrench, color: "text-teal-400", bg: "bg-teal-500/10", border: "hover:border-teal-500/30", route: "/app/mechanics" },
  { name: "Fren Sistemi", icon: Icons.Activity, color: "text-rose-400", bg: "bg-rose-500/10", border: "hover:border-rose-500/30", route: "/app/mechanics" },
  { name: "Lastik & Rot", icon: Icons.Disc, color: "text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/30", route: "/app/mechanics" },
  { name: "Akıllı Vale", icon: Icons.Key, color: "text-amber-400", bg: "bg-amber-500/10", border: "hover:border-amber-500/30", route: "/app/valet" },
  { name: "Yedek Parça", icon: Icons.Package, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30", route: "/app/parts" },
  { name: "Detaylı Temizlik", icon: Icons.Sparkles, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "hover:border-cyan-500/30", route: "/app/mechanics" },
];

// Featured Deals (Mindbody Special Deals)
const featuredDeals = [
  {
    id: "deal-1",
    title: "Mobil 1 Yağ Değişim & Check-up Paketi",
    originalPrice: 2200,
    price: 1690,
    rating: 4.9,
    reviewsCount: 124,
    provider: "Maslak Pro Servis",
    image: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&q=80&w=300",
    badge: "%23 İNDİRİM"
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
    badge: "ÜCRETSİZ"
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
    badge: "UYUM GARANTİLİ"
  }
];

// Popular Nearby Service Providers
const popularProviders = [
  {
    id: "prov-1",
    name: "Maslak Pro Servis",
    distance: "1.2 km",
    rating: 4.9,
    specialty: "BMW, Audi, Mercedes, VW Group",
    address: "Atatürk Oto Sanayi Sitesi 2. Kısım, Maslak",
    features: ["Vale Hizmeti", "Garantili Parça", "7/24 SOS"]
  },
  {
    id: "prov-2",
    name: "Ostim Yıldız Otomotiv",
    distance: "3.1 km",
    rating: 4.8,
    specialty: "Fiat, Renault, Toyota, General Maintenance",
    address: "Ostim Organize Sanayi Bölgesi, Ankara",
    features: ["Hızlı Servis", "Orijinal Yedek Parça"]
  }
];

const CustomerHome = () => {
  const { showAlert, openModal, selectedLocation, setSelectedLocation } = useUI();
  const { currentVehicle, addVehicle } = useGarage();
  const { currentUser } = useAuth();
  const { quotes } = useQuote();
  const { appointments } = useAppointment();
  const navigate = useNavigate();
  const location = useLocation();

  // States
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [showVehiclePassport, setShowVehiclePassport] = useState(false);
  const [showGuidedDiagnostics, setShowGuidedDiagnostics] = useState(false);
  const [selectedCity, setSelectedCity] = useState("istanbul");
  
  // Scanning simulator states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

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

  const [fuelPrices, setFuelPrices] = useState({
    istanbul: { benzin: 65.02, motorin: 67.46, lpg: 35.02 },
    ankara: { benzin: 65.99, motorin: 68.58, lpg: 35.56 },
    izmir: { benzin: 66.27, motorin: 68.85, lpg: 34.98 }
  });
  const [lastUpdated, setLastUpdated] = useState("Bugün, 12:00");

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
                  const motorinObj = edgeData.results.find(r => r.name.includes("Dizel") || r.name.includes("Motorin"));
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
        const formattedDate = `Bugün, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setLastUpdated(formattedDate);
      } catch (err) {
        console.error("Live prices fetch failed:", err);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

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

  const handleRequestCreated = (data) => {
    showAlert(
      "Arıza Bildirildi",
      `${data.symptom.possibleFault} teşhisiyle usta teklif talebiniz oluşturuldu!`,
      "success"
    );
  };

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
          Hizmet & Parça Arama
        </h3>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
          Aracınız için en iyi usta, vale ve yedek parçayı hemen bulun
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
        <Icons.Search className="absolute left-4.5 text-slate-500 dark:text-slate-400" size={18} />
        <input
          type="text"
          placeholder="Ne aramıştınız? (Örn: fren balatası, periyodik bakım, oto çekici...)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-slate-50 dark:bg-[#030712] border border-slate-200 dark:border-white/10 rounded-2xl py-4.5 pl-12 pr-28 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-teal-500 transition-all placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="absolute right-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-[10px] font-black uppercase tracking-wider text-slate-900 dark:text-white shadow-lg active-scale transition-all border-none cursor-pointer"
        >
          ARA
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
            <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors uppercase tracking-tight text-center leading-none">
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
            Özel Fırsatlar & Kampanyalar
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Carvis üyelerine özel en uygun fiyat garantili paketler
          </p>
        </div>
        <span className="text-[10px] font-black text-teal-400 uppercase tracking-wider">
          Fırsatları Yakala
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
                  showAlert("Fırsat Seçildi", `${deal.title} için teklif talebiniz hazırlandı!`, "success");
                  navigate("/app/mechanics");
                }}
                className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                RANDEVU AL <Icons.ChevronRight size={10} />
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
            Yakındaki Popüler Servis & Ustalar
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            Bulunduğunuz konuma en yakın onaylı servis noktaları
          </p>
        </div>
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
          HİZMET NOKTALARI
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {popularProviders.map((prov) => (
          <div 
            key={prov.id}
            className="bg-white dark:bg-[#0a0f24]/80 border border-black/5 dark:border-white/5 hover:border-slate-200 dark:border-white/10 p-5 rounded-[2.2rem] flex flex-col justify-between gap-4 transition-all relative overflow-hidden group shadow-xl backdrop-blur-md"
          >
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center text-teal-400 shadow-inner shrink-0 group-hover:scale-105 transition-transform">
                  <Icons.MapPin size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-snug">
                    {prov.name}
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                    {prov.specialty}
                  </p>
                  <p className="text-[9px] text-slate-500 font-medium mt-1 truncate max-w-[200px]">
                    {prov.address}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-[9px] font-mono font-black text-teal-400 uppercase tracking-wider">
                  {prov.distance}
                </span>
                <div className="flex items-center gap-1 mt-1 justify-end text-[9px] font-bold text-slate-500 dark:text-slate-400">
                  <Icons.Star size={10} className="text-yellow-400 fill-yellow-400" />
                  {prov.rating}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {prov.features.map((feat, fIdx) => (
                <span 
                  key={fIdx} 
                  className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400"
                >
                  {feat}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 border-t border-black/5 dark:border-white/5 pt-3">
              <button
                onClick={() => {
                  triggerHaptic("selection");
                  navigate("/app/mechanics");
                }}
                className="flex-1 py-3.5 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white text-[9px] font-black uppercase tracking-widest transition-all active-scale cursor-pointer"
              >
                TEKLİF TALEBİ GÖNDER
              </button>
              <button
                onClick={() => {
                  triggerHaptic("impact");
                  showAlert("Haritada Göster", `${prov.name} konumu haritada açıldı.`, "success");
                  navigate("/app/map");
                }}
                className="w-11 h-11 rounded-xl bg-black/40 border border-slate-200 dark:border-white/10 hover:bg-white dark:bg-white/5 shadow-sm flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all active-scale cursor-pointer"
                title="Haritada Göster"
              >
                <Icons.Navigation size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // 4. How Rapidsy Works Stepper
  const howItWorksPanel = (
    <div className="bg-white dark:bg-[#0a0f24]/60 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-6.5 space-y-6 relative overflow-hidden backdrop-blur-md shadow-xl">
      <div className="text-center max-w-sm mx-auto">
        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-teal-400">NASIL ÇALIŞIR?</span>
        <h3 className="text-base font-black text-slate-900 dark:text-white mt-1 uppercase tracking-tight">3 Adımda Kokpitinizi Yönetin</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        <div className="hidden md:block absolute top-7 left-[15%] right-[15%] h-0.5 bg-white dark:bg-white/5 shadow-sm pointer-events-none z-0"></div>
        {[
          { step: "01", title: "Arıza & Belirti Bildir", desc: "Arızanızı bildirin veya değişecek parçanızı seçin.", icon: Icons.Activity, color: "from-teal-500 to-blue-500" },
          { step: "02", title: "Teklifleri Topla", desc: "Onaylı usta ve servislerimiz arasından size en uygun fiyatı karşılaştırın.", icon: Icons.FileText, color: "from-blue-500 to-cyan-500" },
          { step: "03", title: "Randevu Al & Öde", desc: "Rezervasyonu onaylayıp ödemeyi tamamlayın, paranızı koruma altına alalım.", icon: Icons.ShieldCheck, color: "from-cyan-500 to-emerald-500" }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center relative z-10 space-y-3 group">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-slate-900 dark:text-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
              <item.icon size={24} />
            </div>
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-black text-teal-400 tracking-widest block uppercase">ADIM {item.step}</span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.title}</h4>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium max-w-[200px] mx-auto">{item.desc}</p>
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
      title: "Fren Sistemi Bildirimi",
      desc: "Son iki servis kaydınızda ön fren balatası aşınması gözlemlendi. Bu servis talebinize fren kontrolünü de eklemek ister misiniz?",
      actionText: "Talep Oluştur",
      action: () => navigate("/app/mechanics"),
    });

    const maintenanceInterval = 15000;
    const remainingKm = maintenanceInterval - (km % maintenanceInterval);

    if (remainingKm < 3000) {
      alerts.push({
        id: "alert-oil",
        type: "danger",
        icon: Icons.AlertTriangle,
        title: "Periyodik Bakım Yaklaşıyor",
        desc: `Motor yağı ve filtre değişimine tahmini ${remainingKm.toLocaleString()} km kaldı. Şimdiden randevunuzu planlayın.`,
        actionText: "Randevu Al",
        action: () => navigate("/appointments"),
      });
    }

    if (activeQuotes.length > 0) {
      alerts.push({
        id: "alert-quote",
        type: "info",
        icon: Icons.TrendingDown,
        title: "Fiyat Analizi",
        desc: "Mevcut usta teklifleriniz şehir ortalamasının (₺4.200) %8 altındadır. Kaçırmamak için hemen inceleyin.",
        actionText: "Teklifleri Gör",
        action: () => navigate("/quotes"),
      });
    }

    return alerts.slice(0, 2);
  }, [activeVehicle, activeQuotes, navigate]);

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
      showAlert("Başarılı", "Yeni araç garajınıza eklendi.", "success");
    } else {
      showAlert("Hata", "Araç eklenirken bir sorun oluştu.", "error");
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
      badge: "Süper Fiyat"
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
      badge: "En Popüler"
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
            <Icons.RefreshCw size={11} className="text-slate-500 dark:text-slate-400" /> ARAÇ DEĞİŞTİR
          </button>
        )}
      </div>

      {/* Floating Warning Banner for Demo Mode was removed */}

      {/* SCANNING SIMULATION OVERLAY */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-50 dark:bg-[#030712]/95 z-[100] flex flex-col items-center justify-center p-6 backdrop-blur-lg"
          >
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
              {/* Animated outer circles */}
              <div className="absolute inset-0 border-4 border-dashed border-teal-500/30 rounded-full animate-spin [animation-duration:15s]"></div>
              <div className="absolute inset-4 border-2 border-dotted border-blue-500/40 rounded-full animate-spin [animation-duration:8s] [animation-direction:reverse]"></div>
              <div className="absolute inset-8 border border-slate-200 dark:border-white/10 rounded-full flex items-center justify-center">
                <Icons.Cpu size={44} className="text-teal-400 animate-pulse" />
              </div>
              {/* Scanning glowing line */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent top-0 animate-scan shadow-[0_0_15px_rgba(20,184,166,0.8)] pointer-events-none"></div>
            </div>

            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-[0.2em] mb-4">
              SİSTEM TARANIYOR
            </h3>
            
            <div className="space-y-2.5 max-w-xs w-full text-center">
              <div className="flex justify-between text-[10px] font-black tracking-widest">
                <span className="text-slate-500">ECU KONTROLÜ</span>
                <span className={scanStep >= 1 ? "text-emerald-400" : "text-slate-600"}>
                  {scanStep >= 1 ? "✓ AKTİF / OK" : "Taranıyor..."}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-black tracking-widest">
                <span className="text-slate-500">ELEKTRİK / TELEMETRİ</span>
                <span className={scanStep >= 2 ? "text-emerald-400" : "text-slate-600"}>
                  {scanStep >= 2 ? "✓ BAĞLANTI OK" : "Bekliyor..."}
                </span>
              </div>
              <div className="flex justify-between text-[10px] font-black tracking-widest">
                <span className="text-slate-500">FREN SİSTEMLERİ</span>
                <span className={scanStep >= 3 ? "text-amber-400 font-extrabold" : "text-slate-600"}>
                  {scanStep >= 3 ? "⚠ BALATA UYARISI" : "Bekliyor..."}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
                    <Icons.UserCheck size={28} className="animate-pulse-slow" />
                  </div>
                  
                  <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Carvis'e Hoş Geldiniz</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-6 font-medium">
                    Aracınızı eklemek, sağlık durumunu takip etmek ve teklifleri yönetmek için hemen oturum açın.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-sm mx-auto">
                    <button
                      onClick={() => openModal("login")}
                      className="w-full bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-slate-900 dark:text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest active-scale transition-all shadow-lg shadow-teal-500/15 border-none cursor-pointer"
                    >
                      GİRİŞ YAP / ÜYE OL
                    </button>
                  </div>
                </div>

                {featuredDealsPanel}

                {popularProvidersPanel}

                {howItWorksPanel}
              </>
            )}

            {/* VEHICLE COCKPIT MASTER MODULE */}
            {activeVehicle && (
              <div className="bg-white dark:bg-[#0a0f24]/85 rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      {isGuest && (
                        <span className="inline-block text-[8px] font-black tracking-[0.2em] text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-md uppercase mb-2">
                          Önizleme Modu
                        </span>
                      )}
                      <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white">
                        {activeVehicle.brand}{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">{activeVehicle.model}</span>
                      </h1>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono tracking-widest uppercase mt-1.5">
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
                      className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 shadow-sm border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all active-scale cursor-pointer"
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
                          Mükemmel Düzeyde
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                          Tüm kritik motor, elektrik ve fren mekanik sistemleri aktif.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/30 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                          SON YAĞ DEĞİŞİMİ
                        </p>
                        <p className="text-xs font-black text-slate-900 dark:text-white font-mono leading-none">
                          {activeVehicle.last_oil_change ? new Date(activeVehicle.last_oil_change).toLocaleDateString("tr-TR") : "Belirtilmedi"}
                        </p>
                        <p className="text-[9px] text-teal-500 mt-2.5 uppercase font-black tracking-wide">
                          10k km korumalı
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
                          DİJİTAL PASAPORT
                        </p>
                        <p className="text-xs font-black text-slate-900 dark:text-white leading-none flex items-center gap-1">
                          GEÇMİŞ <Icons.ChevronRight size={12} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                        </p>
                        <p className="text-[9px] text-teal-500 mt-2.5 uppercase font-black tracking-wide">
                          Tüm geçmiş
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeVehicle && searchAndCategoriesPanel}

            {/* REHBERLİ AI TEŞHİS ASİSTANI BANNER */}
            {activeVehicle && (
              <div 
                onClick={() => {
                  triggerHaptic("impact");
                  setShowGuidedDiagnostics(true);
                }}
                className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 p-5 rounded-[2.5rem] border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer active-scale relative overflow-hidden group shadow-lg"
              >
                <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
                
                <div className="flex items-start gap-4.5 relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                    <Icons.BrainCircuit size={22} className="text-amber-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/25">
                        CANLI TELEMETRİ
                      </span>
                      <span className="text-[9px] font-black text-amber-400 flex items-center gap-1 group-hover:text-slate-900 dark:text-white transition-colors uppercase">
                        Teşhisi Başlat <Icons.ChevronRight size={12} />
                      </span>
                    </div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Belirti & Ses Teşhisi</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Aracınızdaki ses, titreme veya arıza durumlarını seçip usta tekliflerini şeffafça alın.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CHRONOLOGICAL MAINTENANCE TIMELINE */}
            {activeVehicle && (
              <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 space-y-4 backdrop-blur-md shadow-2xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Icons.Calendar size={18} className="text-slate-500 dark:text-slate-400" /> Yaklaşan İşler
                  </h3>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    TAKVİM DURUMU
                  </span>
                </div>

                <div className="relative pl-5 border-l border-slate-200 dark:border-white/10 space-y-5 py-2">
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">TÜVTÜRK Muayenesi</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Araç muayene bitiş tarihi yaklaşıyor.</p>
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
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">Zorunlu Trafik Sigortası</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Poliçe yenileme dönemi.</p>
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
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">Mevsimlik Lastik Kontrolü</h4>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">Lastik diş derinliği ve basınç analizi.</p>
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
                      <Icons.ShoppingBag size={18} className="text-teal-400" /> Aracınızla Uyumlu Parçalar
                    </h3>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
                      {activeVehicle.brand} {activeVehicle.model} İÇİN ÖNERİLENLER
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate("/app/parts")}
                    className="text-[10px] font-black text-teal-400 hover:text-teal-300 transition-colors uppercase flex items-center gap-0.5 bg-transparent border-none cursor-pointer"
                  >
                    Tümünü Gör <Icons.ChevronRight size={12} />
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
                            showAlert("Sepete Eklendi", `${part.name} sepetinize eklendi.`, "success");
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
                  Bugünkü İşleriniz ve Araç Durumunuz
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
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">{a.company_name} • {new Date(a.appointment_date).toLocaleDateString("tr-TR")}</p>
                      </div>
                    </div>
                    <Badge type="success">ONAYLANDI</Badge>
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
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1.5">{q.company_name} • {q.total_amount ? `₺${q.total_amount.toLocaleString()}` : "Teklif Bekliyor"}</p>
                      </div>
                    </div>
                    <Badge type="warning">TEKLİF AL</Badge>
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
                      Maliyet Zekası
                    </h3>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
                      AYLIK MASRAF GÖRSELLEŞTİRME
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
                      <span className="text-[8px] font-black text-slate-500 tracking-wider">BU AY</span>
                      <span className="text-[10px] font-mono font-black text-slate-900 dark:text-white">%100</span>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Akaryakıt</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">₺3.200</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Servis</span>
                      <span className="font-bold text-slate-900 dark:text-white font-mono">₺1.150</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-slate-500"></span> Diğer</span>
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
                      <Icons.Droplets size={18} className="text-blue-500" /> Güncel Akaryakıt
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-emerald-500">Canlı</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">
                    {selectedCity.toUpperCase()} • SON GÜNCELLEME: {lastUpdated}
                  </p>
                </div>
                
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-slate-100 dark:bg-[#030712] border border-black/5 dark:border-white/5 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-wider rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-black/20 dark:hover:border-white/20 transition-colors"
                >
                  <option value="istanbul">İSTANBUL</option>
                  <option value="ankara">ANKARA</option>
                  <option value="izmir">İZMİR</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-black/5 dark:border-white/5">
                <div className="bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Kurşunsuz 95</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono group-hover:scale-110 transition-transform">
                    {fuelPrices[selectedCity]?.benzin || "-"} <span className="text-[10px] text-slate-500">₺/L</span>
                  </span>
                </div>
                <div className="bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent pointer-events-none"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Motorin</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white font-mono group-hover:scale-110 transition-transform">
                    {fuelPrices[selectedCity]?.motorin || "-"} <span className="text-[10px] text-slate-500">₺/L</span>
                  </span>
                </div>
                <div className="bg-white dark:bg-white/5 shadow-sm border border-black/5 dark:border-white/5 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 mb-1">Otogaz (LPG)</span>
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
                  <Icons.ShieldAlert size={16} className="text-slate-500 dark:text-slate-400" />
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    KOKPİT KARAR DESTEĞİ
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
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
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
                HIZLI İŞLEMLER
              </h4>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { icon: Icons.Wrench, label: "Servis Al", route: "/app/mechanics" },
                  { icon: Icons.AlertCircle, label: "Acil SOS", route: "/app/map" },
                  { icon: Icons.Package, label: "Oto Parça", route: "/app/parts" },
                  { icon: Icons.Key, label: "Vale Çağır", route: "/app/valet" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(item.route)}
                    className="bg-white dark:bg-[#0a0f24]/80 border border-black/5 dark:border-white/5 hover:border-white/15 p-3 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 active-scale cursor-pointer group transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-white dark:bg-[#0f172a] transition-all shadow-inner">
                      <item.icon size={18} className="text-slate-500 dark:text-slate-400 group-hover:text-teal-400 transition-colors" />
                    </div>
                    <span className="text-[8px] font-black text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors uppercase tracking-tighter leading-none text-center block">
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
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Doğru Servis Eşleşmesi</h4>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">Tüm usta ve servislerimizin belgeleri Carvis tarafından onaylıdır.</p>
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

      {showGuidedDiagnostics && activeVehicle && (
        <GuidedDiagnostics
          show={showGuidedDiagnostics}
          onClose={() => setShowGuidedDiagnostics(false)}
          vehicle={activeVehicle}
          onRequestCreated={handleRequestCreated}
        />
      )}

      <Footer />
    </div>
  );
};

export default CustomerHome;
