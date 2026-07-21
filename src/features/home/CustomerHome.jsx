import React, { useState, useMemo, useEffect } from "react";
import { Activity, Zap, AlertCircle, AlertTriangle, Calendar, Car, CheckCircle, ChevronRight, Disc, Droplets, FileText, Flame, HardDrive, HeartHandshake, Key, Layers, Loader2, Map, MapPin, Maximize, Navigation, Package, Plus, RefreshCw, Search, ShieldAlert, ShieldCheck, ShoppingBag, Star, TrendingDown, User, UserCheck, Video, Wind, Wrench, X, Clock, Lightbulb, TrendingUp } from "lucide-react";
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
import { triggerHaptic } from "../../utils/haptics";
import Footer from "../../components/layout/Footer";
import { getNearbyProviders, getCityMetadata, getEGMEDSMarkers } from "../../services/externalApis";
import LocationMap from "../../components/ui/LocationMap";
import SearchAndCategoriesPanel from "./components/SearchAndCategoriesPanel";
import PopularProvidersPanel from "./components/PopularProvidersPanel";
import FeaturedDealsPanel from "./components/FeaturedDealsPanel";
import HowItWorksPanel from "./components/HowItWorksPanel";
import IssueReportingModal from "../../components/home/IssueReportingModal";
import { useFuelPrices } from "../../hooks/useFuelPrices";

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
    { name: t.periodicMaintenance, icon: Wrench, color: "text-cyan-500 dark:text-cyan-400", bg: "bg-white/5", border: "hover:border-white/10", route: "/app/mechanics" },
    { name: t.brakeSystem, icon: Activity, color: "text-sky-500 dark:text-sky-400", bg: "bg-sky-500/10", border: "hover:border-sky-500/30", route: "/app/mechanics" },
    { name: t.tireAndAlignment, icon: Disc, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/30", route: "/app/mechanics" },
    { name: t.smartValet, icon: ShieldCheck, color: "text-cyan-500 dark:text-cyan-400", bg: "bg-white/5", border: "hover:border-white/10", route: "/app/insurance" },
    { name: t.spareParts, icon: Package, color: "text-sky-500 dark:text-sky-400", bg: "bg-sky-500/10", border: "hover:border-sky-500/30", route: "/app/parts" },
    { name: t.detailing, icon: Droplets, color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/30", route: "/app/carwash" },
  ], [t]);

  const featuredDeals = useMemo(() => [], []);

  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [showVehiclePassport, setShowVehiclePassport] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [selectedCity, setSelectedCity] = useState("istanbul");
  
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

  const nextInspectionDateFormatted = useMemo(() => {
    if (!activeVehicle?.last_inspection_date) return null;
    const date = new Date(activeVehicle.last_inspection_date);
    date.setFullYear(date.getFullYear() + 2);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  }, [activeVehicle]);

  const nextInsuranceDateFormatted = useMemo(() => {
    if (!activeVehicle?.last_insurance_date) return null;
    const date = new Date(activeVehicle.last_insurance_date);
    date.setFullYear(date.getFullYear() + 1);
    return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" }).toUpperCase();
  }, [activeVehicle]);

  const nextMaintenanceKm = useMemo(() => {
    if (!activeVehicle?.km) return 15000;
    const km = Number(activeVehicle.km) || 0;
    const maintenanceInterval = 15000;
    return (Math.floor(km / maintenanceInterval) + 1) * maintenanceInterval;
  }, [activeVehicle]);

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
  const compatibleParts = [];

  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans pb-32 relative selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-20">
        <div className="absolute top-[5%] right-[-5%] w-[700px] h-[700px] bg-sky-600/30 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Grid overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-10 fixed"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(6, 182, 212, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(6, 182, 212, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: "32px 32px"
        }}
      ></div>

      {/* TOP COMPACT HEADER */}
      <div className="px-6 py-4.5 flex items-center justify-between border-b border-white/10 bg-[#030712]/70 backdrop-blur-2xl sticky top-0 z-30 shadow-lg shadow-cyan-500/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 shadow-xl border border-white/10 flex items-center justify-center">
            <Layers size={18} className="text-cyan-400 " />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-cyan-400 font-black leading-none font-mono">
              Rapidsy
            </p>
            <h2 className="text-sm font-mono font-black tracking-tight mt-1 text-white uppercase ">
              KÖKPİT PANELİ
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
            className="px-3.5 py-2 rounded-xl border border-white/10 bg-cyan-500/5 shadow-xl text-[10px] font-black uppercase tracking-wider hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-300 transition-all flex items-center gap-1.5 active-scale cursor-pointer"
          >
            <RefreshCw size={11} className="text-cyan-400" /> {t.changeVehicle}
          </button>
        )}
      </div>

      {/* Floating Warning Banner for Demo Mode was removed */}



      {/* CORE CONTAINER: Responsive 3-Column Layout on Desktop */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">
        
        {/* SOS EMERGENCY BUTTON */}
        <div className="mb-6 relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
          <button 
            onClick={() => navigate("/app/sos")}
            className="relative w-full bg-[#0a0f24]/90 border border-red-500/30 hover:border-red-500/50 p-4 rounded-3xl flex items-center justify-between transition-all cursor-pointer active-scale overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/20 to-rose-600/10 pointer-events-none"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-red-500/20 border border-red-500/50 rounded-2xl flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition-transform shadow-xl">
                <ShieldAlert size={24} className="text-red-400" />
              </div>
              <div className="text-left font-sans">
                <h3 className="font-mono font-black text-lg uppercase tracking-wider text-white ">ACİL YOL YARDIM & AKÜ</h3>
                <p className="text-red-200/80 text-xs font-semibold mt-0.5">Yolda mı kaldınız? Hemen acil yardım veya akü takviyesi çağırın.</p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center relative z-10">
              <ChevronRight size={20} className="text-red-400" />
            </div>
          </button>
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
                
                {/* GUEST MODE ONBOARDING CARD */}
                <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 text-center relative overflow-hidden group shadow-2xl backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-cyan-500 to-sky-500 text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/20">
                    {isGuest ? (
                      <UserCheck size={28} className="animate-pulse-slow" />
                    ) : (
                      <Car size={28} className="animate-pulse-slow" />
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-mono font-black tracking-tighter uppercase mb-2 text-slate-900 dark:text-white">{t.welcomeToRapidsy}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed mb-6 font-semibold">
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
                      className="w-full bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-400 hover:to-sky-400 text-white px-6 py-4 rounded-2xl text-xs font-mono font-black uppercase tracking-widest active-scale transition-all shadow-lg shadow-cyan-500/15 border-none cursor-pointer"
                    >
                      {isGuest ? t.loginOrRegister : t.addNewCar}
                    </button>
                  </div>
                </div>

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

            {/* PROACTIVE ALERTS */}
            {activeVehicle && <ProactiveAlerts vehicle={activeVehicle} mapCenter={mapCenter} />}

            {/* DIRECT ACTION CTA (LINEAR UX) */}
            {activeVehicle && (
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-sky-500 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                <button
                  onClick={() => {
                    triggerHaptic("impact");
                    setShowIssueModal(true);
                  }}
                  className="relative w-full bg-[#0a0f24]/90 border border-white/10 hover:border-cyan-400/50 rounded-[2.5rem] p-6 shadow-2xl shadow-cyan-500/10 cursor-pointer text-left overflow-hidden active-scale transition-all"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-sky-500/5 pointer-events-none"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-400/10 rounded-full blur-2xl pointer-events-none -mr-8 -mt-8 group-hover:bg-cyan-400/20 transition-colors"></div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-cyan-400/30 shrink-0 shadow-xl">
                        <Wrench size={32} className="text-cyan-400 " />
                      </div>
                      <div className="font-sans">
                        <h2 className="text-2xl sm:text-3xl font-mono font-black tracking-tighter uppercase mb-1 text-white ">
                          Sorun Bildir / Usta Bul
                        </h2>
                        <p className="text-xs font-semibold text-cyan-100/70">
                          Arıza, bakım veya diğer servis ihtiyaçlarınız için doğrudan randevu alın.
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={28} className="text-cyan-500/70 group-hover:translate-x-1 group-hover:text-cyan-400 transition-all hidden sm:block " />
                  </div>
                </button>
              </div>
            )}

            {/* VEHICLE COCKPIT MASTER MODULE */}
            {activeVehicle && (
              <div className="bg-[#0a0f24]/80 rounded-[2.5rem] p-6 border border-white/10 shadow-xl relative overflow-hidden backdrop-blur-2xl">
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      {isGuest && (
                        <span className="inline-block text-[8px] font-black tracking-[0.2em] text-cyan-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-md uppercase mb-2 shadow-xl">
                          {t.previewMode}
                        </span>
                      )}
                      <h1 className="text-3xl font-mono font-black tracking-tighter uppercase leading-none text-white ">
                        {activeVehicle.brand}{" "}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-sky-400 ">{activeVehicle.model}</span>
                      </h1>
                      <p className="text-[10px] text-cyan-200/60 font-mono tracking-widest uppercase mt-1.5 flex items-center gap-2">
                        <span className="bg-white/5 px-2 py-0.5 rounded-md border border-white/10">{activeVehicle.plate}</span> 
                        <span className="text-sky-400">{activeVehicle.km?.toLocaleString()} KM</span>
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
                      className="w-10 h-10 rounded-xl bg-cyan-500/5 shadow-xl border border-white/10 flex items-center justify-center text-cyan-400 hover:text-cyan-300 hover:border-cyan-400 hover:shadow-xl transition-all active-scale cursor-pointer"
                    >
                      <User size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-t border-cyan-500/10 pt-6">
                    <div className="flex items-center gap-5 bg-black/40 p-4 rounded-[2rem] border border-white/10 shadow-xl">
                      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500/20 to-sky-500/10 border-2 border-cyan-400/50 flex items-center justify-center shadow-xl">
                          <Car size={28} className="text-cyan-400 " />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[10px] font-black text-cyan-500 uppercase tracking-widest leading-none ">
                            KİLOMETRE DURUMU
                          </h4>
                        </div>
                        <p className="text-sm font-black text-cyan-300 mt-1 font-mono ">
                          {activeVehicle.km?.toLocaleString() || "—"} KM
                        </p>
                        <p className="text-[10px] text-cyan-100/50 mt-1 leading-relaxed">
                          Bakım takibinizi Araç Pasaportu'ndan yönetin.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-black/40 p-4 rounded-2xl border border-white/10 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-12 h-12 bg-sky-500/10 blur-xl"></div>
                        <p className="text-[9px] font-black text-sky-400/80 uppercase tracking-widest mb-1.5 font-mono">
                          {t.lastOilChange}
                        </p>
                        <p className="text-xs font-black text-white font-mono leading-none">
                          {activeVehicle.last_oil_change ? new Date(activeVehicle.last_oil_change).toLocaleDateString("tr-TR") : t.notSpecified}
                        </p>
                        <p className="text-[9px] text-cyan-400 mt-2.5 uppercase font-mono font-black tracking-wide ">
                          {t.protected10k}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          triggerHaptic("impact");
                          setShowVehiclePassport(true);
                        }}
                        className="bg-cyan-500/5 p-4 rounded-2xl border border-white/10 text-left hover:bg-white/5 shadow-xl transition-all active-scale group cursor-pointer relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-transparent"></div>
                        <p className="text-[9px] font-black text-cyan-400 uppercase tracking-widest mb-1.5 font-mono">
                          {t.digitalPassport}
                        </p>
                        <p className="text-xs font-black text-white leading-none flex items-center gap-1 font-sans ">
                          {t.history} <ChevronRight size={12} className="text-cyan-400 group-hover:translate-x-0.5 transition-transform" />
                        </p>
                        <p className="text-[9px] text-sky-400 mt-2.5 uppercase font-mono font-black tracking-wide">
                          {t.allHistory}
                        </p>
                      </button>
                    </div>
                  </div>
                </div>
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
              <div className="bg-[#0a0f24]/80 border border-white/10 rounded-[2.5rem] p-6 space-y-4 backdrop-blur-xl shadow-xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-mono font-black text-base uppercase tracking-tight text-white flex items-center gap-2 ">
                    <Calendar size={18} className="text-cyan-400 " /> {t.upcomingTasks}
                  </h3>
                  <span className="text-[9px] font-mono font-black text-cyan-500/80 uppercase tracking-widest border border-white/10 px-2 py-0.5 rounded-md bg-cyan-500/5">
                    {t.calendarStatus}
                  </span>
                </div>

                <div className="relative pl-5 border-l border-white/10 space-y-5 py-2">
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-cyan-400 border-2 border-[#0a0f24] shadow-xl"></div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-sans font-black text-white uppercase leading-none">{t.periodicMaintenance}</h4>
                        <p className="text-[10px] text-cyan-100/50 mt-1">Sıradaki periyodik bakım takvimi</p>
                      </div>
                      <span className="text-[10px] font-mono font-black text-cyan-400 uppercase ">
                        {nextMaintenanceKm.toLocaleString()} KM
                      </span>
                    </div>
                  </div>

                  {nextInspectionDateFormatted && (
                    <div className="relative">
                      <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-sky-400 border-2 border-[#0a0f24] shadow-xl"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-sans font-black text-white uppercase leading-none">{t.tuvturkInspection}</h4>
                          <p className="text-[10px] text-cyan-100/50 mt-1">{t.inspectionApproaching}</p>
                        </div>
                        <span className="text-[10px] font-mono font-black text-sky-400 uppercase ">
                          {nextInspectionDateFormatted}
                        </span>
                      </div>
                    </div>
                  )}

                  {nextInsuranceDateFormatted && (
                    <div className="relative">
                      <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-[#0a0f24] shadow-xl"></div>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-sans font-black text-white uppercase leading-none">{t.trafficInsurance}</h4>
                          <p className="text-[10px] text-cyan-100/50 mt-1">{t.policyRenewal}</p>
                        </div>
                        <span className="text-[10px] font-mono font-black text-slate-400 uppercase">
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
            {activeVehicle && compatibleParts.length > 0 && (
              <div className="bg-[#0a0f24]/80 border border-white/10 rounded-[2.5rem] p-6 space-y-5 backdrop-blur-md shadow-xl">
                <div className="flex justify-between items-center border-b border-cyan-500/10 pb-4">
                  <div>
                    <h3 className="font-black text-base uppercase tracking-tight text-white flex items-center gap-2 ">
                      <ShoppingBag size={18} className="text-cyan-400 " /> {t.compatibleParts}
                    </h3>
                    <p className="text-[9px] text-cyan-500/80 uppercase font-black tracking-widest mt-0.5">
                      {activeVehicle.brand} {activeVehicle.model} {t.recommendedFor}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate("/app/parts")}
                    className="text-[10px] font-black text-cyan-400 hover:text-cyan-300 transition-colors uppercase flex items-center gap-0.5 bg-transparent border-none cursor-pointer"
                  >
                    {t.seeAll} <ChevronRight size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {compatibleParts.map((part) => (
                    <div key={part.id} className="bg-black/40 border border-cyan-500/10 rounded-2xl p-4 flex flex-col justify-between hover:border-white/10 transition-all shadow-xl group">
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-[#0a0f24] mb-3 border border-cyan-500/10">
                        <img src={part.image} alt={part.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-cyan-500/80 backdrop-blur-sm text-[8px] font-black uppercase text-[#0a0f24] tracking-widest shadow-xl">
                          {part.badge}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] font-black uppercase text-sky-500/80 tracking-wider">{part.brand}</span>
                        <h4 className="text-xs font-black text-white line-clamp-2 mt-0.5 leading-snug">{part.name}</h4>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] text-slate-500 line-through font-mono">₺{part.oldPrice}</span>
                          <p className="text-sm font-black text-cyan-400 font-mono ">₺{part.price}</p>
                        </div>
                        <button
                          onClick={() => {
                            triggerHaptic("success");
                            showAlert(t.addedToCart, `${part.name} ${t.addedToCartDesc}`, "success");
                          }}
                          className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 hover:bg-cyan-500/20 text-cyan-400 flex items-center justify-center transition-all cursor-pointer shadow-xl active:scale-90"
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
                <h3 className="font-black text-base uppercase tracking-tight px-1 text-white ">
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
                    className="bg-[#0a0f24]/80 border border-white/10 p-4.5 rounded-[1.8rem] flex justify-between items-center cursor-pointer active-scale shadow-xl hover:border-cyan-400/50 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="bg-white/5 p-2.5 rounded-xl border border-white/10 text-cyan-400 shadow-xl">
                        <Calendar size={20} className="" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white uppercase leading-none">{a.service_type}</h4>
                        <p className="text-[10px] text-cyan-100/50 mt-1.5">{a.company_name} • {new Date(a.appointment_date).toLocaleDateString("tr-TR")}</p>
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
                    className="bg-[#0a0f24]/80 border border-orange-500/30 p-4.5 rounded-[1.8rem] flex justify-between items-center cursor-pointer active-scale shadow-xl hover:border-orange-400/50 hover:shadow-xl transition-all"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/30 text-orange-400 shadow-xl">
                        <FileText size={20} className="" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-black text-white uppercase leading-none line-clamp-1">{q.description}</h4>
                        <p className="text-[10px] text-orange-200/50 mt-1.5">{q.company_name} • {q.total_amount ? `₺${q.total_amount.toLocaleString()}` : t.waitingForQuote}</p>
                      </div>
                    </div>
                    <Badge type="warning">{t.getQuote}</Badge>
                  </div>
                ))}
              </div>
            )}

            {/* REAL-TIME FUEL PRICES WIDGET */}
            <div className="bg-[#0a0f24]/80 border border-white/10 rounded-[2.5rem] p-6 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-mono font-black text-base uppercase tracking-tight text-white flex items-center gap-2 ">
                      <Droplets size={18} className="text-cyan-400 " /> {t.liveFuelPrices}
                    </h3>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-xl"></span>
                      <span className="text-[8px] font-black uppercase tracking-widest text-cyan-400">{t.live}</span>
                    </div>
                  </div>
                  <p className="text-[9px] text-cyan-100/50 uppercase font-black tracking-widest mt-1">
                    {selectedCity.toUpperCase()} • {t.lastUpdate}: {lastUpdated}
                  </p>
                </div>
                
                <select
                  id="city-select"
                  name="city"
                  aria-label="Araç Seçimi"
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="bg-[#0a0f24] border border-white/10 text-cyan-50 text-[10px] font-black uppercase tracking-wider rounded-xl px-3 py-1.5 outline-none cursor-pointer hover:border-cyan-400/50 transition-colors shadow-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2322d3ee' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2rem' }}
                >
                  <option value="istanbul">{t.istanbul}</option>
                  <option value="ankara">{t.ankara}</option>
                  <option value="izmir">{t.izmir}</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-cyan-500/10">
                <div className="bg-black/40 shadow-xl border border-cyan-500/10 hover:border-white/10 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500/60 mb-1">{t.unleaded95}</span>
                  <span className="text-lg font-mono font-black text-white group-hover:scale-110 transition-transform group-hover:text-cyan-400  group-hover:">
                    {fuelPrices[selectedCity]?.benzin || "-"} <span className="text-[10px] text-cyan-500/40">₺/L</span>
                  </span>
                </div>
                <div className="bg-black/40 shadow-xl border border-cyan-500/10 hover:border-white/10 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500/60 mb-1">{t.diesel}</span>
                  <span className="text-lg font-mono font-black text-white group-hover:scale-110 transition-transform group-hover:text-cyan-400  group-hover:">
                    {fuelPrices[selectedCity]?.motorin || "-"} <span className="text-[10px] text-cyan-500/40">₺/L</span>
                  </span>
                </div>
                <div className="bg-black/40 shadow-xl border border-cyan-500/10 hover:border-white/10 p-3.5 rounded-[1.5rem] flex flex-col items-center justify-center relative overflow-hidden group transition-all">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[9px] font-black uppercase tracking-widest text-cyan-500/60 mb-1">{t.lpg}</span>
                  <span className="text-lg font-mono font-black text-white group-hover:scale-110 transition-transform group-hover:text-cyan-400  group-hover:">
                    {fuelPrices[selectedCity]?.lpg || "-"} <span className="text-[10px] text-cyan-500/40">₺/L</span>
                  </span>
                </div>
              </div>

              {/* Station Infrastructure Compliance */}
              <div className="pt-3 border-t border-cyan-500/10 flex flex-col gap-2 text-[9px] text-cyan-100/50 font-semibold">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={11} className="text-cyan-500/80" /> EPDK Lisans Durumu:</span>
                  <span className="text-cyan-400 uppercase font-mono font-black ">Lisanslı (Cezası Yok)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><HardDrive size={11} className="text-cyan-500/80" /> Yeraltı Tank Yaşı:</span>
                  <span className="text-white font-mono font-black ">5 Yıl (Korozyon & Sızıntı Testi Geçildi)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Wind size={11} className="text-cyan-500/80" /> Gaz Geri Kazanım (VRS):</span>
                  <span className="text-white font-mono font-black ">%99.4 Ekolojik Filtre Uyumlu</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Flame size={11} className="text-cyan-500/80" /> Parlama Noktası Audit:</span>
                  <span className="text-cyan-400 uppercase font-mono font-black font-bold ">Sorunsuz</span>
                </div>
              </div>
            </div>

            {/* BEHAVIORAL AI DECISION HELPER CARDS */}
            {activeVehicle && decisionAlerts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <ShieldAlert size={16} className="text-cyan-500/80" />
                  <h4 className="text-[10px] font-black text-cyan-500/80 uppercase tracking-widest ">
                    {t.cockpitDecisionSupport}
                  </h4>
                </div>

                {decisionAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    onClick={alert.action}
                    className="bg-[#0a0f24]/80 border border-white/10 hover:border-cyan-400/50 p-4.5 rounded-[1.8rem] transition-all cursor-pointer active-scale relative overflow-hidden group shadow-xl hover:shadow-xl backdrop-blur-md"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 shadow-xl">
                        <alert.icon size={18} className="text-cyan-400 group-hover:scale-110 transition-transform " />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-xs font-black text-white uppercase tracking-tight ">{alert.title}</h4>
                          <span className="text-[8px] font-black text-cyan-400/80 uppercase flex items-center gap-1 group-hover:text-cyan-400 transition-colors  group-hover:">
                            {alert.actionText} <ChevronRight size={10} />
                          </span>
                        </div>
                        <p className="text-[11px] text-cyan-100/60 leading-relaxed font-medium">
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
                  { icon: Wrench, label: t.getService, route: "/app/mechanics" },
                  { icon: AlertCircle, label: t.emergencySOS, route: "/app/sos" },
                  { icon: Package, label: t.autoParts, route: "/app/parts" },
                  { icon: Key, label: t.callValet, route: "/app/valet" },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => navigate(item.route)}
                    className="bg-white dark:bg-[#0a0f24]/80 border border-black/5 dark:border-white/5 hover:border-white/15 p-3 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 active-scale cursor-pointer group transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center group-hover:bg-white dark:bg-[#0f172a] transition-all shadow-inner">
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
            <div className="bg-white dark:bg-[#0a0f24]/80 border border-slate-200 dark:border-white/10 p-5 rounded-[2.5rem] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-black/30 border border-slate-200 dark:border-white/10 rounded-xl text-cyan-400 shrink-0">
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

      <Footer />
    </div>
  );
};

export default CustomerHome;
