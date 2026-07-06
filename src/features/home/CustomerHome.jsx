import React, { useState, useMemo, useEffect } from "react";
import { Activity, Zap, AlertCircle, AlertTriangle, Calendar, Car, CheckCircle, ChevronRight, Disc, Droplets, FileText, Flame, HardDrive, HeartHandshake, Key, Layers, Loader2, Map, MapPin, Maximize, Navigation, Package, Plus, RefreshCw, Search, ShieldAlert, ShieldCheck, ShoppingBag, Star, TrendingDown, User, UserCheck, Video, Wind, Wrench, X } from "lucide-react";
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
    { name: t.periodicMaintenance, icon: Wrench, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "hover:border-cyan-500/30", route: "/app/mechanics" },
    { name: t.brakeSystem, icon: Activity, color: "text-rose-400", bg: "bg-rose-500/10", border: "hover:border-rose-500/30", route: "/app/mechanics" },
    { name: t.tireAndAlignment, icon: Disc, color: "text-blue-400", bg: "bg-blue-500/10", border: "hover:border-blue-500/30", route: "/app/mechanics" },
    { name: t.smartValet, icon: Key, color: "text-amber-400", bg: "bg-amber-500/10", border: "hover:border-amber-500/30", route: "/app/valet" },
    { name: t.spareParts, icon: Package, color: "text-cyan-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30", route: "/app/parts" },
    { name: t.detailing, icon: Droplets, color: "text-cyan-400", bg: "bg-cyan-500/10", border: "hover:border-cyan-500/30", route: "/app/carwash" },
  ], [t]);

  const featuredDeals = useMemo(() => [], []);

  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [showVehiclePassport, setShowVehiclePassport] = useState(false);
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white font-sans pb-32 relative selection:bg-cyan-500/30">
      
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.08]">
        <div className="absolute top-[10%] right-[-5%] w-[600px] h-[600px] bg-orange-500 rounded-full blur-[140px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[500px] h-[500px] bg-cyan-500 rounded-full blur-[120px]"></div>
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
            <Layers size={18} className="text-cyan-400" />
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
            <RefreshCw size={11} className="text-slate-600 dark:text-slate-400" /> {t.changeVehicle}
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
                <SearchAndCategoriesPanel 
                  t={t} 
                  searchQuery={searchQuery} 
                  setSearchQuery={setSearchQuery} 
                  serviceCategories={serviceCategories} 
                />
                
                {/* GUEST MODE ONBOARDING CARD */}
                <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-8 text-center relative overflow-hidden group shadow-2xl backdrop-blur-md">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-8 -mt-8"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none"></div>

                  <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-cyan-500 to-orange-500 text-slate-900 dark:text-white flex items-center justify-center mx-auto mb-5 shadow-lg shadow-cyan-500/10">
                    {isGuest ? (
                      <UserCheck size={28} className="animate-pulse-slow" />
                    ) : (
                      <Car size={28} className="animate-pulse-slow" />
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
                      className="w-full bg-gradient-to-r from-cyan-500 to-orange-500 hover:from-cyan-400 hover:to-orange-500 text-slate-900 dark:text-white px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest active-scale transition-all shadow-lg shadow-cyan-500/15 border-none cursor-pointer"
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

            {/* VEHICLE COCKPIT MASTER MODULE */}
            {activeVehicle && (
              <div className="bg-white dark:bg-[#0a0f24]/85 rounded-[2.5rem] p-6 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12"></div>
                
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
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-orange-500">{activeVehicle.model}</span>
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
                      <User size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-t border-black/5 dark:border-white/5 pt-6">
                    <div className="flex items-center gap-5 bg-black/30 p-4 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-inner">
                      <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-cyan-500/20 to-orange-500/20 border-2 border-cyan-500/30 flex items-center justify-center">
                          <Car size={28} className="text-cyan-400" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                            KİLOMETRE DURUMU
                          </h4>
                        </div>
                        <p className="text-sm font-black text-cyan-400 mt-1 font-mono">
                          {activeVehicle.km?.toLocaleString() || "—"} KM
                        </p>
                        <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          Bakım takibinizi Araç Pasaportu'ndan yönetin.
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
                        <p className="text-[9px] text-cyan-500 mt-2.5 uppercase font-black tracking-wide">
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
                          {t.history} <ChevronRight size={12} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                        </p>
                        <p className="text-[9px] text-cyan-500 mt-2.5 uppercase font-black tracking-wide">
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
              <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 space-y-4 backdrop-blur-md shadow-2xl">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                    <Calendar size={18} className="text-slate-600 dark:text-slate-400" /> {t.upcomingTasks}
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
                      <span className="text-[10px] font-mono font-black text-cyan-400 uppercase">
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
            {activeVehicle && (
              <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 space-y-5 backdrop-blur-md shadow-2xl">
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                      <ShoppingBag size={18} className="text-cyan-400" /> {t.compatibleParts}
                    </h3>
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
                      {activeVehicle.brand} {activeVehicle.model} {t.recommendedFor}
                    </p>
                  </div>
                  <button 
                    onClick={() => navigate("/app/parts")}
                    className="text-[10px] font-black text-cyan-400 hover:text-teal-300 transition-colors uppercase flex items-center gap-0.5 bg-transparent border-none cursor-pointer"
                  >
                    {t.seeAll} <ChevronRight size={12} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {compatibleParts.map((part) => (
                    <div key={part.id} className="bg-black/30 border border-black/5 dark:border-white/5 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-200 dark:border-white/10 transition-all shadow-inner group">
                      <div className="relative rounded-xl overflow-hidden aspect-video bg-white dark:bg-slate-900 mb-3 border border-black/5 dark:border-white/5">
                        <img src={part.image} alt={part.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-cyan-500/80 backdrop-blur-sm text-[8px] font-black uppercase text-slate-900 dark:text-white tracking-widest">
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
                          <p className="text-sm font-black text-cyan-400 font-mono">₺{part.price}</p>
                        </div>
                        <button
                          onClick={() => {
                            triggerHaptic("success");
                            showAlert(t.addedToCart, `${part.name} ${t.addedToCartDesc}`, "success");
                          }}
                          className="w-8 h-8 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-900 dark:text-white flex items-center justify-center transition-all cursor-pointer border-none active:scale-90"
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
                    className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 p-4.5 rounded-[1.8rem] flex justify-between items-center cursor-pointer active-scale shadow-md"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="bg-black/30 p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-cyan-400">
                        <Calendar size={20} />
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
                        <FileText size={20} />
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
                      <Droplets size={18} className="text-blue-500" /> {t.liveFuelPrices}
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

              {/* Station Infrastructure Compliance (Public details normally hard to research) */}
              <div className="pt-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-2 text-[9px] text-slate-500 dark:text-slate-400 font-semibold">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><ShieldCheck size={11} className="text-emerald-500" /> EPDK Lisans Durumu:</span>
                  <span className="text-emerald-500 uppercase font-black">Lisanslı (Cezası Yok)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><HardDrive size={11} className="text-blue-500" /> Yeraltı Tank Yaşı:</span>
                  <span className="text-slate-700 dark:text-slate-300 font-black">5 Yıl (Korozyon & Sızıntı Testi Geçildi)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Wind size={11} className="text-cyan-500" /> Gaz Geri Kazanım (VRS):</span>
                  <span className="text-slate-700 dark:text-slate-300 font-black">%99.4 Ekolojik Filtre Uyumlu</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Flame size={11} className="text-orange-500" /> Parlama Noktası Audit:</span>
                  <span className="text-emerald-500 uppercase font-black font-bold">Sorunsuz</span>
                </div>
              </div>
            </div>

            {/* BEHAVIORAL AI DECISION HELPER CARDS */}
            {activeVehicle && decisionAlerts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 px-1">
                  <ShieldAlert size={16} className="text-slate-600 dark:text-slate-400" />
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
                        <alert.icon size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{alert.title}</h4>
                          <span className="text-[8px] font-black text-cyan-400 uppercase flex items-center gap-1 group-hover:text-slate-900 dark:text-white transition-colors">
                            {alert.actionText} <ChevronRight size={10} />
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
                  { icon: Wrench, label: t.getService, route: "/app/mechanics" },
                  { icon: AlertCircle, label: t.emergencySOS, route: "/app/map" },
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
                  <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{t.carvisApproved}</p>
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

      <Footer />
    </div>
  );
};

export default CustomerHome;
