import React, { useState, useMemo, useEffect } from "react";
import { Activity, Zap, AlertCircle, AlertTriangle, Calendar, CalendarDays, Car, CheckCircle, ChevronRight, ClipboardList, Disc, Droplets, FileText, Flame, Fuel, HardDrive, Heart, HeartHandshake, Key, Layers, Loader2, Map, MapPin, Maximize, Navigation, Package, Plus, RefreshCw, Search, ShieldAlert, ShieldCheck, ShoppingBag, Star, TrendingDown, Truck, User, UserCheck, Video, Wind, Wrench, X, Clock, Lightbulb, TrendingUp } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { Badge } from "../../components/Core";
import { useUI } from "../../context/UIContext";
import { supabase } from "../../supabaseClient";
import { useGarage } from "../../context/GarageContext";
import { useAuth } from "../../context/AuthContext";
import { useQuote } from "../../context/QuoteContext";
import { useAppointment } from "../../context/AppointmentContext";
import { useNavigate, useLocation } from "react-router-dom";
const VehicleSearch = React.lazy(() => import("../garage/VehicleSearch"));
import ServiceHistoryModal from "../../components/modals/ServiceHistoryModal";
import OnboardingSlides from "../../components/onboarding/OnboardingSlides";
import VehiclePassport from "./components/VehiclePassport";
import ProactiveAlerts from "../../components/home/ProactiveAlerts";
import FinancialCockpit from "../../components/home/FinancialCockpit";
import SmartMaintenanceTimeline from "../garage/components/SmartMaintenanceTimeline";
import { triggerHaptic } from "../../utils/haptics";
import Footer from "../../components/layout/Footer";
import { getNearbyProviders, getCityMetadata, getEGMEDSMarkers } from "../../services/externalApis";
import LocationMap from "../../components/ui/LocationMap";
import SearchAndCategoriesPanel from "./components/SearchAndCategoriesPanel";
import PopularProvidersPanel from "./components/PopularProvidersPanel";
import FeaturedDealsPanel from "./components/FeaturedDealsPanel";
import HowItWorksPanel from "./components/HowItWorksPanel";
import IssueReportingModal from "../../components/home/IssueReportingModal";
import OBDSearchModal from "../../components/modals/OBDSearchModal";
import Obd2DictionaryModal from "../../components/ui/Obd2DictionaryModal";
import { useFuelPrices } from "../../hooks/useFuelPrices";

// Service Categories and Featured Deals moved inside the component to use t

// Replaced popularProviders with dynamic state

const CustomerHome = () => {
  const { t, showAlert, openModal, selectedLocation, setSelectedLocation, theme } = useUI();
  const { currentVehicle, addVehicle } = useGarage();
  const { currentUser } = useAuth();
  const { quotes } = useQuote();
  const { appointments } = useAppointment();
  const navigate = useNavigate();
  const location = useLocation();

  const [selectedCity, setSelectedCity] = useState("istanbul");

  // States
  const serviceCategories = useMemo(() => [
    { name: t.periodicMaintenance, icon: Wrench, color: "text-cyan-500 dark:text-cyan-400", bg: "bg-white/5", border: "hover:border-white/10", route: "/app/mechanics" },
    { name: "EV Şarj", icon: Zap, color: "text-emerald-500 dark:text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30", route: "/app/ev-charging" },
    { name: t.brakeSystem, icon: Activity, color: "text-sky-500 dark:text-sky-400", bg: "bg-sky-500/10", border: "hover:border-sky-500/30", route: "/app/mechanics" },
    { name: t.tireAndAlignment, icon: Disc, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/30", route: "/app/mechanics" },
    { name: "Kasko & Sigorta", icon: ShieldCheck, color: "text-cyan-500 dark:text-cyan-400", bg: "bg-white/5", border: "hover:border-white/10", route: "/app/insurance" },
    { name: t.spareParts, icon: Package, color: "text-sky-500 dark:text-sky-400", bg: "bg-sky-500/10", border: "hover:border-sky-500/30", route: "/app/parts" },
    { name: t.detailing, icon: Droplets, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/30", route: "/app/carwash" },
  ], [t]);

  const featuredDeals = useMemo(() => [], []);
  const compatibleParts = useMemo(() => [], []);

  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [showVehiclePassport, setShowVehiclePassport] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");

  // Map and Nearby Providers States
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [edsMarkers, setEdsMarkers] = useState([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [mapCenter, setMapCenter] = useState({ lat: 41.0082, lng: 28.9784 });

  const { fuelPrices, lastUpdated } = useFuelPrices(t);

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
    const fetchProvidersAndEDS = async () => {
      setIsLoadingProviders(true);
      const cityMeta = getCityMetadata(selectedCity);
      setMapCenter({ lat: cityMeta.lat, lng: cityMeta.lng });
      try {
        const providers = await getNearbyProviders(cityMeta.lat, cityMeta.lng, 8000); // 8km radius
        const eds = await getEGMEDSMarkers(selectedCity);
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
  }, [selectedCity]);

  // Sync selectedCity with global selectedLocation
  useEffect(() => {
    if (selectedLocation) {
      const lowerLoc = selectedLocation.toLowerCase();
      setSelectedCity(lowerLoc);
    }
  }, [selectedLocation]);

  // AUTOMATIC GEOLOCATION PROMPT & REVERSE GEOCODING CITY FINDER
  useEffect(() => {
    if (!navigator.geolocation) return;

    const detectLocation = () => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`
            );
            if (res.ok) {
              const data = await res.json();
              const foundCity = data.address?.province || data.address?.city || data.address?.state || data.address?.town || "";
              if (foundCity) {
                const cleanCity = foundCity.toLowerCase().replace(/i̇/g, "i").trim();
                setSelectedCity(cleanCity);
                if (setSelectedLocation) {
                  setSelectedLocation(foundCity);
                }
              }
            }
          } catch (err) {
            console.log("Auto location discovery error:", err);
          }
        },
        (error) => {
          console.log("Location permission declined or unavailable:", error.message);
        },
        { timeout: 10000, enableHighAccuracy: true }
      );
    };

    detectLocation();
  }, []);



  const [showOBDModal, setShowOBDModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return !localStorage.getItem("__SAFE_TOKEN_6__rapidsy_onboarding__END_TOKEN_6___seen");
    } catch (err) {
      console.error("Storage access error:", err);
      return false;
    }
  });

  const handleOnboardingComplete = () => {
    try {
      localStorage.setItem("__SAFE_TOKEN_6__rapidsy_onboarding__END_TOKEN_6___seen", "true");
    } catch (err) {
      console.error("Storage write error:", err);
    }
    setShowOnboarding(false);
    triggerHaptic("success");
  };

  const isGuest = !currentUser || currentUser.isAnonymous;

  const handleProtectedAction = (actionCallback) => {
    if (isGuest) {
      triggerHaptic("warning");
      openModal("login", "customer");
      showAlert(
        "Giriş Yapmanız Gerekiyor",
        "Teklif almak, sorun bildirmek veya araç pasaportunu yönetmek için lütfen hesabınıza giriş yapın.",
        "info"
      );
      return;
    }
    if (actionCallback) actionCallback();
  };

  // activeVehicle resolution
  const activeVehicle = useMemo(() => {
    if (currentVehicle) return currentVehicle;
    return null;
  }, [currentVehicle]);

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

  // Decision helper warnings (based on user-entered KM data, not fake sensors)
  const decisionAlerts = useMemo(() => {
    if (!activeVehicle) return [];
    const alerts = [];
    const km = Number(activeVehicle.km) || 0;

    // KM-based periodic maintenance reminder (every 15,000 km)
    const maintenanceInterval = 15000;
    const remainingKm = maintenanceInterval - (km % maintenanceInterval);

    if (remainingKm < 3000) {
      alerts.push({
        id: "alert-oil",
        type: "danger",
        icon: AlertTriangle,
        title: t.maintenanceApproaching,
        desc: `Periyodik bakıma tahmini ${remainingKm.toLocaleString()} km kaldı. Şimdiden randevunuzu planlayın.`,
        actionText: t.bookAppointment,
        action: () => navigate("/app/mechanics"),
      });
    }

    if (activeQuotes.length > 0) {
      alerts.push({
        id: "alert-quote",
        type: "info",
        icon: TrendingDown,
        title: t.priceAnalysis,
        desc: t.priceAnalysisDesc,
        actionText: t.viewQuotes,
        action: () => navigate("/quotes"),
      });
    }

    return alerts.slice(0, 2);
  }, [activeVehicle, activeQuotes, navigate, t]);

  const isCommercialVehicle = useMemo(() => {
    if (!activeVehicle) return false;
    return (
      activeVehicle.is_commercial === true ||
      activeVehicle.vehicle_type === "commercial" ||
      (activeVehicle.type && String(activeVehicle.type).toLowerCase().includes("commercial")) ||
      ["doblo", "fiorino", "caddy", "transit", "transporter", "kangoo", "ducato", "crafter", "sprinter", "kamyonet", "taksi", "minibus"].some(m =>
        String(activeVehicle.model || "").toLowerCase().includes(m)
      )
    );
  }, [activeVehicle]);

  const nextInspectionDateFormatted = useMemo(() => {
    const baseDateStr = activeVehicle?.last_inspection_date || activeVehicle?.inspection_date;
    if (!baseDateStr) return null;
    const date = new Date(baseDateStr);
    // Ticari araçlar her 1 yılda bir (Yıllık muayene zorunlu), Hususi araçlar 2 yılda bir muayeneye girer!
    const addYears = isCommercialVehicle ? 1 : 2;
    date.setFullYear(date.getFullYear() + addYears);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  }, [activeVehicle, isCommercialVehicle]);

  const daysUntilInspection = useMemo(() => {
    const baseDateStr = activeVehicle?.last_inspection_date || activeVehicle?.inspection_date;
    if (!baseDateStr) return null;
    const date = new Date(baseDateStr);
    const addYears = isCommercialVehicle ? 1 : 2;
    date.setFullYear(date.getFullYear() + addYears);
    const diffMs = date - new Date();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [activeVehicle, isCommercialVehicle]);

  const nextInsuranceDateFormatted = useMemo(() => {
    const baseDateStr = activeVehicle?.last_insurance_date || activeVehicle?.insurance_expiry_date;
    if (!baseDateStr) return null;
    const date = new Date(baseDateStr);
    date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  }, [activeVehicle]);

  const daysUntilInsurance = useMemo(() => {
    const baseDateStr = activeVehicle?.last_insurance_date || activeVehicle?.insurance_expiry_date;
    if (!baseDateStr) return null;
    const date = new Date(baseDateStr);
    date.setFullYear(date.getFullYear() + 1);
    const diffMs = date - new Date();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  }, [activeVehicle]);

  const nextMaintenanceKm = useMemo(() => {
    const km = Number(activeVehicle?.km) || 0;
    // Ticari araçlar için 10.000 KM, Hususi araçlar için 15.000 KM periyodu
    const maintenanceInterval = isCommercialVehicle ? 10000 : 15000;
    return (Math.floor(km / maintenanceInterval) + 1) * maintenanceInterval;
  }, [activeVehicle, isCommercialVehicle]);

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

  // Compatible parts data will be fetched dynamically

  return (
    <div className={`min-h-screen font-sans pb-32 relative selection:bg-cyan-500/30 transition-colors duration-300 ${theme === 'dark' ? 'dark bg-[#030712] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-0 dark:opacity-20">
        <div className="absolute top-[5%] right-[-5%] w-[700px] h-[700px] bg-sky-600/30 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Grid overlay */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 opacity-0 dark:opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px"
        }}
      ></div>

      {/* TOP COMPACT HEADER */}
      <div className="px-4 sm:px-6 py-3 sm:py-4.5 flex items-center justify-between border-b border-slate-200 dark:border-white/10 bg-white/80 dark:bg-[#030712]/70 backdrop-blur-2xl sticky top-0 z-30 shadow-sm dark:shadow-lg dark:shadow-cyan-500/5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-white/5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center">
            <Layers size={18} className="text-cyan-500 dark:text-cyan-400" />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-600 dark:text-cyan-400 font-black leading-none font-mono">
              Rapidsy
            </p>
            <h2 className="text-xs sm:text-sm font-mono font-black tracking-tight mt-1 text-slate-900 dark:text-white uppercase">
              ANA SAYFA
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Location Auto Finder Button */}
          <button
            onClick={() => {
              if (navigator.geolocation) {
                showAlert("Konum Aranıyor...", "Geçerli GPS konumunuz taranıyor...", "info");
                navigator.geolocation.getCurrentPosition(
                  async (pos) => {
                    try {
                      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10&addressdetails=1`);
                      if (res.ok) {
                        const d = await res.json();
                        const city = d.address?.province || d.address?.city || d.address?.state || d.address?.town || "";
                        if (city) {
                          setSelectedCity(city.toLowerCase().replace(/i̇/g, "i").trim());
                          if (setSelectedLocation) setSelectedLocation(city);
                          showAlert("Konum Bulundu 📍", `${city} konumu başarıyla ayarlandı.`, "success");
                        }
                      }
                    } catch (err) {
                      showAlert("Konum Hatası", "Konum bilgisi alınamadı.", "error");
                    }
                  },
                  () => showAlert("Konum İzni Gerekli", "Lütfen tarayıcınızdan konum iznini veriniz.", "warning")
                );
              }
            }}
            className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-[9px] sm:text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 active-scale cursor-pointer"
            title="Otomatik Konumumu Bul"
          >
            <Navigation size={12} className="animate-pulse text-cyan-400" />
            <span className="truncate max-w-[80px] sm:max-w-[120px]">{selectedCity ? selectedCity.toUpperCase() : "KONUM BUL"}</span>
          </button>

          {activeVehicle && (
            <button
              onClick={() => {
                if (isGuest) {
                  openModal("login");
                } else {
                  setShowVehicleSelector(true);
                }
              }}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-slate-200 dark:border-white/10 bg-cyan-500/5 shadow-sm dark:shadow-xl text-[9px] sm:text-[10px] font-black uppercase tracking-wider hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-600 dark:text-cyan-300 transition-all flex items-center gap-1.5 active-scale cursor-pointer"
            >
              <RefreshCw size={11} className="text-cyan-500 dark:text-cyan-400" /> {t.changeVehicle}
            </button>
          )}

          <button
            onClick={() => {
              if (isGuest) {
                openModal("login");
              } else {
                navigate("/app/profile");
              }
            }}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-white/5 shadow-sm dark:shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 dark:hover:text-cyan-300 hover:border-cyan-400 transition-all active-scale cursor-pointer"
            title="Profil & Kokpit"
          >
            <User size={18} />
          </button>
        </div>
      </div>

      {/* Floating Warning Banner for Demo Mode was removed */}



      {/* CORE CONTAINER: Responsive 3-Column Layout on Desktop */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 relative z-10 space-y-6">
        
        {/* 1. TOP MOST PRIMARY CARD: VEHICLE COCKPIT OR WELCOME BANNER */}
        {activeVehicle ? (
          <div className="bg-white dark:bg-[#0a0f24]/80 rounded-[2.5rem] p-6 sm:p-7 border border-slate-200 dark:border-white/10 shadow-xl relative overflow-hidden backdrop-blur-2xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 dark:bg-white/5 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl sm:text-4xl font-mono font-black tracking-tighter uppercase leading-none text-slate-900 dark:text-white">
                    {activeVehicle.brand}{" "}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-sky-500 dark:from-cyan-400 dark:to-sky-400">{activeVehicle.model}</span>
                  </h1>
                  <p className="text-[10px] sm:text-xs text-slate-500 dark:text-cyan-200/60 font-mono tracking-widest uppercase mt-2 flex items-center gap-2 flex-wrap">
                    <span className="bg-slate-100 dark:bg-white/5 px-2.5 py-0.5 rounded-md border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-bold">{activeVehicle.plate}</span> 
                    <span className="text-sky-600 dark:text-sky-400 font-black">{activeVehicle.km?.toLocaleString()} KM</span>
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (isGuest) {
                        openModal("login");
                      } else {
                        setShowVehicleSelector(true);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-black uppercase tracking-wider border border-cyan-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Plus size={14} /> Araç Değiştir / Ekle
                  </button>

                  <button
                    onClick={() => {
                      if (isGuest) {
                        openModal("login");
                      } else {
                        navigate("/app/profile");
                      }
                    }}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-white hover:text-cyan-400 transition-all cursor-pointer shrink-0"
                  >
                    <User size={18} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center border-t border-slate-200 dark:border-cyan-500/10 pt-6">
                <div className="flex items-center gap-4 bg-slate-50 dark:bg-black/40 p-4.5 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[10px] font-black text-cyan-600 dark:text-cyan-500 uppercase tracking-widest leading-none">
                        KİLOMETRE DURUMU
                      </h4>
                    </div>
                    <p className="text-base font-black text-slate-900 dark:text-cyan-300 mt-1 font-mono">
                      {activeVehicle.km?.toLocaleString() || "—"} KM
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 dark:bg-black/40 p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm dark:shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-12 h-12 bg-sky-500/10 blur-xl"></div>
                    <p className="text-[9px] font-black text-sky-600 dark:text-sky-400/80 uppercase tracking-widest mb-1.5 font-mono">
                      {t.lastOilChange}
                    </p>
                    <p className="text-xs font-black text-slate-900 dark:text-white font-mono leading-none">
                      {activeVehicle.last_oil_change ? new Date(activeVehicle.last_oil_change).toLocaleDateString("tr-TR") : t.notSpecified}
                    </p>
                    <p className="text-[9px] text-cyan-600 dark:text-cyan-400 mt-2.5 uppercase font-mono font-black tracking-wide">
                      {t.protected10k}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic("impact");
                      setShowVehiclePassport(true);
                    }}
                    className="bg-cyan-500/5 p-4 rounded-2xl border border-slate-200 dark:border-white/10 text-left hover:bg-slate-100 dark:hover:bg-white/5 shadow-sm dark:shadow-xl transition-all active-scale group cursor-pointer relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent"></div>
                    <p className="text-[9px] font-black text-cyan-600 dark:text-cyan-400 uppercase tracking-widest mb-1.5 font-mono">
                      {t.digitalPassport}
                    </p>
                    <p className="text-xs font-black text-slate-900 dark:text-white leading-none flex items-center gap-1 font-sans">
                      {t.history} <ChevronRight size={12} className="text-cyan-500 dark:text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                    </p>
                    <p className="text-[9px] text-sky-600 dark:text-sky-400 mt-2.5 uppercase font-mono font-black tracking-wide">
                      {t.allHistory}
                    </p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* WELCOME & ADD VEHICLE BANNER (TOP #1 POSITION - CLASSY LEFT-ALIGNED) */
          <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-[#0a0f24] text-white border border-cyan-500/20 rounded-[2.5rem] p-7 sm:p-9 text-left relative overflow-hidden group shadow-2xl backdrop-blur-md">
            <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -ml-16 -mb-16"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <p className="text-[10px] sm:text-xs font-mono font-bold text-cyan-400/90 uppercase tracking-[0.2em]">
                  RAPIDSY DİJİTAL GARAJ
                </p>
                <h2 className="text-2xl sm:text-3xl font-mono font-black tracking-tighter uppercase text-white leading-tight">
                  {t.welcomeToRapidsy}
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed font-medium pt-1">
                  {isGuest ? t.guestModeDesc : "Garajınıza aracınızı ekleyin; bakım, parça ve dijital pasaport geçmişinizi anında yönetin."}
                </p>
              </div>

              <button
                onClick={() => {
                  if (isGuest) {
                    openModal("login");
                  } else {
                    setShowVehicleSelector(true);
                  }
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 text-slate-950 px-8 py-4.5 rounded-2xl text-xs font-mono font-black uppercase tracking-widest active-scale transition-all shadow-xl shadow-cyan-500/20 cursor-pointer flex items-center justify-center gap-2 shrink-0 border border-cyan-300/30"
              >
                <Plus size={16} /> {isGuest ? t.loginOrRegister : "GARAJA ARAÇ EKLE"}
              </button>
            </div>
          </div>
        )}

        {/* HIGH-PRIORITY ACTION LAUNCHPAD & URGENT STATUS BAR */}
        <div className="mb-8 space-y-4">
          
          {/* TOP QUICK ACTION GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <button
              onClick={() => {
                handleProtectedAction(() => {
                  triggerHaptic("impact");
                  setShowIssueModal(true);
                });
              }}
              className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-cyan-500/30 via-sky-500/20 to-teal-500/30 border-2 border-cyan-400 text-left transition-all active-scale group cursor-pointer shadow-xl shadow-cyan-500/20 relative overflow-hidden ring-2 ring-cyan-400/30"
            >
              <div className="absolute top-1 right-1.5 px-1.5 py-0.5 rounded-full bg-cyan-400 text-slate-950 text-[7px] font-black uppercase tracking-wider">Öne Çıkan</div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-cyan-400 text-slate-950 flex items-center justify-center mb-2 sm:mb-2.5 font-bold shadow-md shadow-cyan-400/30">
                <Wrench size={16} className="sm:hidden" />
                <Wrench size={18} className="hidden sm:block" />
              </div>
              <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-900 dark:text-white font-mono leading-tight">Sorun Bildir / Usta Bul</h4>
              <p className="text-[9px] sm:text-[10px] text-cyan-700 dark:text-cyan-300 font-bold mt-0.5">Anında Teklif Al</p>
            </button>

            <button
              onClick={() => handleProtectedAction(() => navigate("/app/extras/fuel"))}
              className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-500/25 to-orange-500/15 border-2 border-amber-400/80 text-left transition-all active-scale group cursor-pointer shadow-lg shadow-amber-500/15 relative overflow-hidden"
            >
              <div className="absolute top-1 right-1.5 px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[7px] font-black uppercase tracking-wider">Yeni</div>
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-amber-500/30 text-amber-600 dark:text-amber-300 flex items-center justify-center mb-2 sm:mb-2.5 border border-amber-400/40">
                <Fuel size={16} className="sm:hidden" />
                <Fuel size={18} className="hidden sm:block" />
              </div>
              <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-900 dark:text-white font-mono leading-tight">Yakıt Takibi & Fiş</h4>
              <p className="text-[9px] sm:text-[10px] text-amber-700 dark:text-amber-300 font-bold mt-0.5">Tüketim & Kayıt</p>
            </button>

            <button
              onClick={() => handleProtectedAction(() => navigate("/app/mechanics"))}
              className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-sky-500/25 to-blue-500/15 border-2 border-sky-400/80 text-left transition-all active-scale group cursor-pointer shadow-lg shadow-sky-500/15 relative overflow-hidden"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-sky-500/30 text-sky-600 dark:text-sky-300 flex items-center justify-center mb-2 sm:mb-2.5 border border-sky-400/40">
                <Wrench size={16} className="sm:hidden" />
                <Wrench size={18} className="hidden sm:block" />
              </div>
              <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-900 dark:text-white font-mono leading-tight">Periyodik Bakım</h4>
              <p className="text-[9px] sm:text-[10px] text-sky-700 dark:text-sky-300 font-bold mt-0.5">Servis & Parça Hizmeti</p>
            </button>

            <button
              onClick={() => {
                handleProtectedAction(() => {
                  triggerHaptic("impact");
                  setShowVehiclePassport(true);
                });
              }}
              className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-indigo-500/10 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all active-scale group cursor-pointer shadow-lg relative overflow-hidden"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 flex items-center justify-center mb-2 sm:mb-2.5 border border-indigo-500/30">
                <FileText size={16} className="sm:hidden" />
                <FileText size={18} className="hidden sm:block" />
              </div>
              <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-900 dark:text-white font-mono leading-tight">Dijital Araç Pasaportu</h4>
              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-indigo-200/70 font-semibold mt-0.5">Resmi Hasar & Km Kaydı</p>
            </button>

            <button
              onClick={() => {
                handleProtectedAction(() => {
                  triggerHaptic("impact");
                  setShowOBDModal(true);
                });
              }}
              className="p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-teal-500/10 border border-teal-500/30 hover:border-teal-400 text-left transition-all active-scale group cursor-pointer shadow-lg relative overflow-hidden"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-teal-500/20 text-teal-500 dark:text-teal-400 flex items-center justify-center mb-2 sm:mb-2.5 border border-teal-500/30">
                <Activity size={16} className="sm:hidden" />
                <Activity size={18} className="hidden sm:block" />
              </div>
              <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-900 dark:text-white font-mono leading-tight">OBD-II Arıza Sözlüğü</h4>
              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-teal-200/70 font-semibold mt-0.5">Arıza Kod Rehberi</p>
            </button>

            <button
              onClick={() => handleProtectedAction(() => navigate("/quotes"))}
              className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-400 text-left transition-all active-scale group cursor-pointer shadow-lg relative overflow-hidden"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-emerald-500/20 text-emerald-500 dark:text-emerald-400 flex items-center justify-center mb-2 sm:mb-2.5 border border-emerald-500/30">
                <TrendingUp size={16} className="sm:hidden" />
                <TrendingUp size={18} className="hidden sm:block" />
              </div>
              <h4 className="text-[10px] sm:text-xs font-black uppercase text-slate-900 dark:text-white font-mono leading-tight">Gelen Tekliflerim</h4>
              <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-emerald-200/70 font-semibold mt-0.5">{quotes.length} Aktif Teklif</p>
            </button>
          </div>

          {/* Proactive Urgent Vehicle Status Alert */}
          {activeVehicle && daysUntilInspection !== null && (
            <div className="p-3 sm:p-4 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900/90 border border-cyan-200 dark:border-cyan-500/30 shadow-sm dark:shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 flex items-center justify-center font-black text-sm shrink-0 border border-cyan-500/30 font-mono">
                  <CalendarDays size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[8px] sm:text-[9px] font-black uppercase text-cyan-600 dark:text-cyan-400 tracking-widest bg-cyan-500/10 px-2 sm:px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                      TÜVTÜRK Muayene ({activeVehicle.plate})
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-600 dark:text-slate-200 mt-1 leading-snug">
                    Sonraki Muayene: <strong className="text-slate-900 dark:text-white font-mono">{nextInspectionDateFormatted}</strong> ({daysUntilInspection} gün kaldı)
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleProtectedAction(() => navigate("/app/appointments"))}
                className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white dark:text-slate-950 font-black text-[10px] sm:text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 text-center"
              >
                Muayene Randevusu Al
              </button>
            </div>
          )}
        </div>
        


        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT AREA: 2 Columns equivalent (Main Actions & Details) */}
          <div className="flex-1 w-full space-y-6">
            
            {/* GUEST MODE CONTENT */}
            {!activeVehicle && (
              <>
                <SearchAndCategoriesPanel 
                  t={t} 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery} 
                  serviceCategories={serviceCategories} 
                />
                
                <FeaturedDealsPanel t={t} featuredDeals={featuredDeals} showAlert={showAlert} />

                <PopularProvidersPanel 
                  t={t} 
                  isLoadingProviders={isLoadingProviders} 
                  nearbyProviders={nearbyProviders} 
                  edsMarkers={edsMarkers} 
                  mapCenter={mapCenter} 
                />

                <HowItWorksPanel t={t} />
              </>
            )}

            {/* FEATURED PRIMARY CTA: DİJİTAL ARAÇ PASAPORTU */}
            {activeVehicle && (
              <div className="space-y-4">
                {/* 1. FEATURED DIGITAL PASSPORT BANNER */}
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-400 rounded-[2.5rem] blur opacity-50 group-hover:opacity-80 transition duration-500 animate-pulse"></div>
                  <button
                    onClick={() => {
                      handleProtectedAction(() => {
                        triggerHaptic("impact");
                        setShowVehiclePassport(true);
                      });
                    }}
                    className="relative w-full bg-white dark:bg-[#07131e] border-2 border-emerald-400 dark:border-emerald-400/90 hover:border-emerald-300 rounded-[2.5rem] p-5 sm:p-7 shadow-2xl shadow-emerald-500/25 cursor-pointer text-left overflow-hidden active-scale transition-all"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-cyan-500/10 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-400/20 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8 group-hover:bg-emerald-400/30 transition-colors"></div>
                    <div className="absolute top-3.5 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-950 font-mono font-black text-[9px] uppercase tracking-widest shadow-md hidden sm:block">
                      🛡️ EGM & TRAMER ONAYLI KAYIT
                    </div>
                    
                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-emerald-400 to-teal-400 text-slate-950 rounded-2xl flex items-center justify-center backdrop-blur-md border border-emerald-300 shrink-0 shadow-lg shadow-emerald-400/30">
                          <ShieldCheck size={30} className="sm:hidden" />
                          <ShieldCheck size={36} className="hidden sm:block" />
                        </div>
                        <div className="font-sans">
                          <span className="inline-block sm:hidden text-[8px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-0.5">
                            🛡️ EGM & TRAMER ONAYLI KAYIT
                          </span>
                          <h2 className="text-xl sm:text-3xl font-mono font-black tracking-tighter uppercase mb-1 text-slate-900 dark:text-white leading-none">
                            Dijital Araç Pasaportu
                          </h2>
                          <p className="text-xs font-bold text-slate-600 dark:text-emerald-100/90 leading-snug">
                            {activeVehicle.brand} {activeVehicle.model} resmi servis geçmişi, ekspertiz ve QR doğrulaması.
                          </p>
                        </div>
                      </div>
                      <ChevronRight size={32} className="text-emerald-500 group-hover:translate-x-1 group-hover:text-emerald-300 transition-all hidden sm:block shrink-0" />
                    </div>
                  </button>
                </div>

                {/* 2. SECONDARY CTA: SORUN BİLDİR / USTA BUL */}
                <button
                  onClick={() => {
                    handleProtectedAction(() => {
                      triggerHaptic("impact");
                      setShowIssueModal(true);
                    });
                  }}
                  className="w-full bg-white dark:bg-[#0a0f24]/90 border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 rounded-[2.5rem] p-5 sm:p-6 shadow-xl dark:shadow-2xl shadow-cyan-500/10 cursor-pointer text-left overflow-hidden active-scale transition-all group relative"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-cyan-500/10 dark:bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-cyan-400/30 shrink-0">
                        <Wrench size={24} className="text-cyan-500 dark:text-cyan-400" />
                      </div>
                      <div className="font-sans">
                        <h3 className="text-lg sm:text-xl font-mono font-black tracking-tighter uppercase mb-0.5 text-slate-900 dark:text-white">
                          Sorun Bildir / Usta Bul
                        </h3>
                        <p className="text-xs font-semibold text-slate-600 dark:text-cyan-100/70">
                          Arıza veya bakım ihtiyacınız için anında teklif toplayın.
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={24} className="text-cyan-500/70 group-hover:translate-x-1 transition-all hidden sm:block" />
                  </div>
                </button>
              </div>
            )}

            {/* FINANCIAL COCKPIT & SMART MAINTENANCE TIMELINE */}
            {activeVehicle && (
              <>
                <FinancialCockpit vehicle={activeVehicle} />
                <SmartMaintenanceTimeline
                  vehicle={activeVehicle}
                  onBookMaintenance={() => navigate("/app/mechanics")}
                />
              </>
            )}

            {/* UNIFIED CUSTOMER MANAGEMENT COCKPIT GRID */}
            {activeVehicle && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                <button
                  onClick={() => setShowVehicleSelector(true)}
                  className="bg-white dark:bg-[#0a0f24]/80 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 transition-all text-left group shadow-sm dark:shadow-xl active-scale relative overflow-hidden backdrop-blur-xl cursor-pointer"
                >
                  <div className="bg-cyan-500/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400">
                    <Car size={20} className="sm:hidden" />
                    <Car size={24} className="hidden sm:block" />
                  </div>
                  <h4 className="font-mono font-black text-slate-900 dark:text-white text-[11px] sm:text-xs uppercase tracking-wider leading-tight">
                    GARAJIM
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-cyan-200/50 mt-0.5 sm:mt-1 font-sans">
                    Araç Yönetimi
                  </p>
                </button>

                <button
                  onClick={() => setShowServiceHistory(true)}
                  className="bg-white dark:bg-[#0a0f24]/80 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 transition-all text-left group shadow-sm dark:shadow-xl active-scale relative overflow-hidden backdrop-blur-xl cursor-pointer"
                >
                  <div className="bg-sky-500/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 border border-sky-500/20 text-sky-600 dark:text-sky-400">
                    <ClipboardList size={20} className="sm:hidden" />
                    <ClipboardList size={24} className="hidden sm:block" />
                  </div>
                  <h4 className="font-mono font-black text-slate-900 dark:text-white text-[11px] sm:text-xs uppercase tracking-wider leading-tight">
                    SERVİS GEÇMİŞİ
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-cyan-200/50 mt-0.5 sm:mt-1 font-sans">
                    Dijital Pasaport
                  </p>
                </button>

                <button
                  onClick={() => navigate("/quotes")}
                  className="bg-white dark:bg-[#0a0f24]/80 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all text-left group shadow-sm dark:shadow-xl active-scale relative overflow-hidden backdrop-blur-xl cursor-pointer"
                >
                  <div className="bg-blue-500/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 border border-blue-500/20 text-blue-600 dark:text-blue-400">
                    <Package size={20} className="sm:hidden" />
                    <Package size={24} className="hidden sm:block" />
                  </div>
                  <h4 className="font-mono font-black text-slate-900 dark:text-white text-[11px] sm:text-xs uppercase tracking-wider leading-tight">
                    TALEPLERİM
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-blue-200/50 mt-0.5 sm:mt-1 font-sans">
                    Teklifleri Gör
                  </p>
                </button>

                <button
                  onClick={() => navigate("/appointments")}
                  className="bg-white dark:bg-[#0a0f24]/80 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all text-left group shadow-sm dark:shadow-xl active-scale relative overflow-hidden backdrop-blur-xl cursor-pointer"
                >
                  <div className="bg-emerald-500/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                    <CalendarDays size={20} className="sm:hidden" />
                    <CalendarDays size={24} className="hidden sm:block" />
                  </div>
                  <h4 className="font-mono font-black text-slate-900 dark:text-white text-[11px] sm:text-xs uppercase tracking-wider leading-tight">
                    RANDEVULARIM
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-emerald-200/50 mt-0.5 sm:mt-1 font-sans">
                    Takip Et
                  </p>
                </button>

                <button
                  onClick={() => setShowOBDModal(true)}
                  className="bg-white dark:bg-[#0a0f24]/80 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-cyan-500/30 hover:border-cyan-400 transition-all text-left group shadow-sm dark:shadow-xl active-scale relative overflow-hidden backdrop-blur-xl cursor-pointer"
                >
                  <div className="bg-cyan-500/20 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 border border-cyan-500/40 text-cyan-600 dark:text-cyan-400">
                    <Activity size={20} className="animate-pulse sm:hidden" />
                    <Activity size={24} className="animate-pulse hidden sm:block" />
                  </div>
                  <h4 className="font-mono font-black text-slate-900 dark:text-white text-[11px] sm:text-xs uppercase tracking-wider leading-tight">
                    OBD-II KODU ARAMA
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-cyan-200/50 mt-0.5 sm:mt-1 font-sans">
                    Arıza Kodu Sorgula
                  </p>
                </button>

                <button
                  onClick={() => navigate("/orders")}
                  className="bg-white dark:bg-[#0a0f24]/80 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-amber-500/50 transition-all text-left group shadow-sm dark:shadow-xl active-scale relative overflow-hidden backdrop-blur-xl cursor-pointer"
                >
                  <div className="bg-amber-500/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 border border-amber-500/20 text-amber-600 dark:text-amber-400">
                    <ShoppingBag size={20} className="sm:hidden" />
                    <ShoppingBag size={24} className="hidden sm:block" />
                  </div>
                  <h4 className="font-mono font-black text-slate-900 dark:text-white text-[11px] sm:text-xs uppercase tracking-wider leading-tight">
                    SİPARİŞLERİM
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-slate-500 dark:text-amber-200/50 mt-0.5 sm:mt-1 font-sans">
                    Sipariş Takibi
                  </p>
                </button>

                <button
                  onClick={() => navigate("/app/favorites")}
                  className="col-span-2 sm:col-span-1 bg-white dark:bg-[#0a0f24]/80 p-4 sm:p-5 rounded-2xl sm:rounded-[2rem] border border-slate-200 dark:border-white/10 hover:border-rose-500/50 transition-all text-left group shadow-sm dark:shadow-xl active-scale relative overflow-hidden backdrop-blur-xl cursor-pointer"
                >
                  <div className="bg-rose-500/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center mb-2.5 sm:mb-3 border border-rose-500/20 text-rose-600 dark:text-rose-400">
                    <Heart size={20} className="sm:hidden" />
                    <Heart size={24} className="hidden sm:block" />
                  </div>
                  <h4 className="font-mono font-black text-slate-900 dark:text-white text-[11px] sm:text-xs uppercase tracking-wider leading-tight">
                    FAVORİLERİM
                  </h4>
                  <p className="text-[10px] text-slate-500 dark:text-rose-200/50 mt-1 font-sans">
                    Kaydedilenler
                  </p>
                </button>
              </div>
            )}

            {activeVehicle && (
              <SearchAndCategoriesPanel 
                t={t} 
                searchQuery={searchQuery} 
                setSearchQuery={setSearchQuery} 
                serviceCategories={serviceCategories} 
              />
            )}

            {/* CHRONOLOGICAL MAINTENANCE TIMELINE */}
            {activeVehicle && (
              <div className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 space-y-4 backdrop-blur-xl shadow-sm dark:shadow-xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-mono font-black text-base uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar size={18} className="text-cyan-500 dark:text-cyan-400" /> {t.upcomingTasks}
                  </h3>
                  <span className="text-[9px] font-mono font-black text-cyan-600 dark:text-cyan-500/80 uppercase tracking-widest border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-md bg-cyan-500/10 dark:bg-cyan-500/5">
                    {t.calendarStatus}
                  </span>
                </div>

                <div className="relative pl-5 border-l border-slate-200 dark:border-white/10 space-y-5 py-2">
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-500 dark:bg-cyan-400 border-2 border-white dark:border-[#0a0f24] shadow-md"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase leading-none">{t.periodicMaintenance}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-cyan-100/50 mt-1">Sıradaki periyodik bakım takvimi</p>
                      </div>
                      <span className="text-[10px] font-mono font-black text-cyan-600 dark:text-cyan-400 uppercase">
                        {nextMaintenanceKm.toLocaleString()} KM
                      </span>
                    </div>
                  </div>

                  {nextInspectionDateFormatted && (
                    <div className="relative">
                      <div className={`absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0a0f24] shadow-md ${
                        daysUntilInspection !== null && daysUntilInspection <= 30 ? "bg-red-500 animate-ping" : "bg-sky-500 dark:bg-sky-400"
                      }`}></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase leading-none">{t.tuvturkInspection}</h4>
                            {daysUntilInspection !== null && (
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                daysUntilInspection <= 0 ? "bg-red-500 text-white" :
                                daysUntilInspection <= 30 ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                                "bg-sky-500/20 text-sky-600 dark:text-sky-400"
                              }`}>
                                {daysUntilInspection <= 0 ? "GÜNÜ GEÇTİ!" : `${daysUntilInspection} GÜN KALDI`}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-cyan-100/50 mt-1">{t.inspectionApproaching}</p>
                        </div>
                        <span className="text-[10px] font-mono font-black text-sky-600 dark:text-sky-400 uppercase">
                          {nextInspectionDateFormatted}
                        </span>
                      </div>
                    </div>
                  )}

                  {nextInsuranceDateFormatted && (
                    <div className="relative">
                      <div className={`absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#0a0f24] shadow-md ${
                        daysUntilInsurance !== null && daysUntilInsurance <= 30 ? "bg-amber-500 animate-ping" : "bg-slate-400"
                      }`}></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-sans font-black text-slate-900 dark:text-white uppercase leading-none">{t.trafficInsurance}</h4>
                            {daysUntilInsurance !== null && (
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${
                                daysUntilInsurance <= 0 ? "bg-red-500 text-white" :
                                daysUntilInsurance <= 30 ? "bg-amber-500/20 text-amber-500 border border-amber-500/30" :
                                "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              }`}>
                                {daysUntilInsurance <= 0 ? "YENİLEME GEREKİKLİ" : `${daysUntilInsurance} GÜN KALDI`}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-cyan-100/50 mt-1">{t.policyRenewal}</p>
                        </div>
                        <span className="text-[10px] font-mono font-black text-slate-500 dark:text-slate-400 uppercase">
                          {nextInsuranceDateFormatted}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeVehicle && (
              <FeaturedDealsPanel t={t} featuredDeals={featuredDeals} showAlert={showAlert} />
            )}

            {activeVehicle && (
              <PopularProvidersPanel 
                t={t} 
                isLoadingProviders={isLoadingProviders} 
                nearbyProviders={nearbyProviders} 
                edsMarkers={edsMarkers} 
                mapCenter={mapCenter} 
              />
            )}

            {/* COMPATIBLE SPARE PARTS RECOMMENDED DEALS */}
            {activeVehicle && (compatibleParts || []).length > 0 && (
              <div className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 space-y-5 backdrop-blur-md shadow-sm dark:shadow-xl">
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-cyan-500/10 pb-4">
                  <div>
                    <h3 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <ShoppingBag size={18} className="text-cyan-500 dark:text-cyan-400" /> {t.compatibleParts}
                    </h3>
                    <p className="text-[9px] text-slate-500 dark:text-cyan-500/80 uppercase font-black tracking-widest mt-0.5">
                      {activeVehicle.brand} {activeVehicle.model} {t.recommendedFor}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate("/app/parts")}
                    className="text-[10px] font-black text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 transition-colors uppercase flex items-center gap-0.5 bg-transparent border-none cursor-pointer"
                  >
                    {t.seeAll} <ChevronRight size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(compatibleParts || []).map((part) => (
                    <div key={part.id} className="bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-cyan-500/10 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 dark:hover:border-white/10 transition-all shadow-sm dark:shadow-xl group">
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 dark:bg-[#0a0f24] mb-3 border border-slate-200 dark:border-cyan-500/10">
                        <img src={part.image} alt={part.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 dark:opacity-80 group-hover:opacity-100" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-cyan-500 text-[8px] font-black uppercase text-white dark:text-[#0a0f24] tracking-widest shadow-md">
                          {part.badge}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-sky-600 dark:text-sky-500/80 tracking-wider">{part.brand}</span>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 mt-0.5 leading-snug">{part.name}</h4>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-400 line-through font-mono">₺{part.oldPrice}</span>
                          <p className="text-sm font-black text-cyan-600 dark:text-cyan-400 font-mono">₺{part.price}</p>
                        </div>
                        <button
                          onClick={() => {
                            triggerHaptic("success");
                            showAlert(t.addedToCart, `${part.name} ${t.addedToCartDesc}`, "success");
                          }}
                          className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-90"
                        >
                          <Plus size={16} />
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
                    className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 p-4.5 rounded-[1.8rem] flex justify-between items-center cursor-pointer active-scale shadow-sm dark:shadow-xl hover:border-cyan-400/50 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="bg-slate-100 dark:bg-white/5 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 shadow-sm">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none">{a.service_type}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-cyan-100/50 mt-1.5">{a.company_name} • {new Date(a.appointment_date).toLocaleDateString("tr-TR")}</p>
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
                    className="bg-white dark:bg-[#0a0f24]/80 border border-orange-500/30 p-4.5 rounded-[1.8rem] flex justify-between items-center cursor-pointer active-scale shadow-sm dark:shadow-xl hover:border-orange-400/50 transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/30 text-orange-500 shadow-sm">
                        <FileText size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase leading-none line-clamp-1">{q.description}</h4>
                        <p className="text-[10px] text-slate-500 dark:text-orange-200/50 mt-1.5">{q.company_name} • {q.total_amount ? `₺${q.total_amount.toLocaleString()}` : t.waitingForQuote}</p>
                      </div>
                    </div>
                    <Badge type="warning">{t.getQuote}</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* REAL-TIME FUEL PRICES WIDGET */}
            <div className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 backdrop-blur-xl shadow-sm dark:shadow-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-mono font-black text-base uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <Droplets size={18} className="text-cyan-500 dark:text-cyan-400" /> {t.liveFuelPrices}
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-500/10 dark:bg-white/5 border border-cyan-500/20 dark:border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 dark:bg-cyan-400 animate-pulse shadow-sm"></span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-400">{t.live}</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-500 dark:text-cyan-100/50 uppercase font-black tracking-widest mt-1">
                    {selectedCity.toUpperCase()} • {t.lastUpdate}: {lastUpdated}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleProtectedAction(() => navigate("/app/extras/fuel"))}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-mono font-black uppercase tracking-wider hover:bg-amber-400 active-scale transition-all shadow-lg shadow-amber-500/20 cursor-pointer flex items-center gap-1"
                  >
                    <Plus size={12} /> YAKIT EKLE / TAKİP
                  </button>
                  <select
                    id="city-select"
                    name="city"
                    aria-label="Şehir Seçimi"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-slate-100 dark:bg-[#0a0f24] border border-slate-300 dark:border-white/10 text-slate-900 dark:text-cyan-50 text-[10px] font-black uppercase tracking-wider rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-cyan-400/50 transition-colors shadow-sm focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 appearance-none"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2322d3ee' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2rem' }}
                  >
                    <option value="istanbul">{t.istanbul}</option>
                    <option value="ankara">{t.ankara}</option>
                    <option value="izmir">{t.izmir}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-200 dark:border-cyan-500/10">
                <div className="bg-slate-50 dark:bg-black/40 shadow-sm dark:shadow-xl border border-slate-200 dark:border-cyan-500/10 hover:border-slate-300 dark:hover:border-white/10 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-500/60 mb-1">{t.unleaded95}</span>
                  <span className="text-lg font-mono font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    {(fuelPrices[selectedCity]?.benzin && fuelPrices[selectedCity]?.benzin !== "-") ? fuelPrices[selectedCity].benzin : (fuelPrices.istanbul?.benzin || "44.95")} <span className="text-[10px] text-cyan-500/60 dark:text-cyan-500/40">₺/L</span>
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-black/40 shadow-sm dark:shadow-xl border border-slate-200 dark:border-cyan-500/10 hover:border-slate-300 dark:hover:border-white/10 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-500/60 mb-1">{t.diesel}</span>
                  <span className="text-lg font-mono font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    {(fuelPrices[selectedCity]?.motorin && fuelPrices[selectedCity]?.motorin !== "-") ? fuelPrices[selectedCity].motorin : (fuelPrices.istanbul?.motorin || "45.40")} <span className="text-[10px] text-cyan-500/60 dark:text-cyan-500/40">₺/L</span>
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-black/40 shadow-sm dark:shadow-xl border border-slate-200 dark:border-cyan-500/10 hover:border-slate-300 dark:hover:border-white/10 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-600 dark:text-cyan-500/60 mb-1">{t.lpg}</span>
                  <span className="text-lg font-mono font-black text-slate-900 dark:text-white group-hover:scale-110 transition-transform group-hover:text-cyan-600 dark:group-hover:text-cyan-400">
                    {(fuelPrices[selectedCity]?.lpg && fuelPrices[selectedCity]?.lpg !== "-") ? fuelPrices[selectedCity].lpg : (fuelPrices.istanbul?.lpg || "22.85")} <span className="text-[10px] text-cyan-500/60 dark:text-cyan-500/40">₺/L</span>
                  </span>
                </div>
              </div>

              {/* Station Infrastructure Compliance */}
              <div className="pt-3 border-t border-slate-200 dark:border-cyan-500/10 flex flex-col gap-2 text-[9px] text-slate-500 dark:text-cyan-100/50 font-semibold">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={11} className="text-cyan-500/80" /> EPDK Lisans Durumu:</span>
                  <span className="text-cyan-600 dark:text-cyan-400 uppercase font-mono font-black">Lisanslı (Cezası Yok)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><HardDrive size={11} className="text-cyan-500/80" /> Yeraltı Tank Yaşı:</span>
                  <span className="text-slate-900 dark:text-white font-mono font-black">5 Yıl (Korozyon & Sızıntı Testi Geçildi)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Wind size={11} className="text-cyan-500/80" /> Gaz Geri Kazanım (VRS):</span>
                  <span className="text-slate-900 dark:text-white font-mono font-black">%99.4 Ekolojik Filtre Uyumlu</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Flame size={11} className="text-cyan-500/80" /> Parlama Noktası Audit:</span>
                  <span className="text-cyan-600 dark:text-cyan-400 uppercase font-mono font-black font-bold">Sorunsuz</span>
                </div>
              </div>
            </div>

            {/* BEHAVIORAL AI DECISION HELPER CARDS */}
            {activeVehicle && decisionAlerts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <ShieldAlert size={16} className="text-cyan-600 dark:text-cyan-500/80" />
                  <h4 className="text-[10px] font-black text-cyan-600 dark:text-cyan-500/80 uppercase tracking-widest">
                    {t.cockpitDecisionSupport}
                  </h4>
                </div>

                {decisionAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={alert.action}
                    className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 hover:border-cyan-400/50 p-4.5 rounded-[1.8rem] transition-all cursor-pointer active-scale relative overflow-hidden group shadow-sm dark:shadow-xl backdrop-blur-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center shrink-0 shadow-sm">
                        <alert.icon size={18} className="text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{alert.title}</h4>
                          <span className="text-[8px] font-black text-cyan-600 dark:text-cyan-400/80 uppercase flex items-center gap-1 group-hover:text-cyan-500 transition-colors">
                            {alert.actionText} <ChevronRight size={10} />
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-cyan-100/60 leading-relaxed font-medium">
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {[
                  { icon: Wrench, label: t.getService, route: "/app/mechanics" },
                  { icon: Package, label: t.autoParts, route: "/app/parts" },
                  { icon: Droplets, label: t.detailing || "Oto Yıkama", route: "/app/carwash" },
                  { icon: ShieldCheck, label: "Sigorta & Kasko", route: "/app/insurance" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(item.route)}
                    className="bg-white dark:bg-[#0a0f24]/80 border border-black/5 dark:border-white/5 hover:border-white/15 p-3 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 active-scale cursor-pointer group transition-all"
                  >
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-cyan-50 dark:group-hover:bg-[#0f172a] transition-all shadow-sm dark:shadow-inner">
                      <item.icon size={18} className="text-slate-600 dark:text-slate-400 group-hover:text-cyan-400 transition-colors" />
                    </div>
                    <span className="text-[8px] font-black text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:text-white transition-colors uppercase tracking-tighter leading-none text-center block">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* EXPERT AUDIT ASSURANCE */}
            <div className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 p-4 sm:p-5 rounded-[2rem] sm:rounded-[2.5rem] flex items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 sm:p-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-cyan-500 dark:text-cyan-400 shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{t.rightServiceMatch}</h4>
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{t.rapidsyApproved}</p>
                </div>
              </div>
              <CheckCircle className="text-cyan-400 shrink-0" size={18} />
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
              <X size={24} />
            </button>
            <React.Suspense fallback={<div className="p-10 flex justify-center"><Loader2 className="animate-spin text-cyan-500" size={32}/></div>}>
              <VehicleSearch onVehicleFound={handleVehicleFound} />
            </React.Suspense>
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

      <IssueReportingModal 
        isOpen={showIssueModal} 
        onClose={() => setShowIssueModal(false)}
        t={t}
      />

      <Obd2DictionaryModal
        isOpen={showOBDModal}
        onClose={() => setShowOBDModal(false)}
        onRequestService={(codeItem) => {
          triggerHaptic("impact");
          setShowIssueModal(true);
        }}
      />

      <Footer />
    </div>
  );
};

export default CustomerHome;
