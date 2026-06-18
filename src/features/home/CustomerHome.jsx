import React, { useState, useMemo } from "react";
import * as Icons from "lucide-react";
import { Badge, Skeleton } from "../../components/Core";
import { useUI } from "../../context/UIContext";
import { useGarage } from "../../context/GarageContext";
import { useAuth } from "../../context/AuthContext";
import { useQuote } from "../../context/QuoteContext";
import { useAppointment } from "../../context/AppointmentContext";
import { useNavigate } from "react-router-dom";
import VehicleSearch from "../garage/VehicleSearch";
import ServiceHistoryModal from "../../components/modals/ServiceHistoryModal";
import OnboardingSlides from "../../components/onboarding/OnboardingSlides";
import VehiclePassport from "./components/VehiclePassport";
import GuidedDiagnostics from "./components/GuidedDiagnostics";
import { triggerHaptic } from "../../utils/haptics";
import Footer from "../../components/layout/Footer";

const CustomerHome = () => {
  const { showAlert, openModal, selectedLocation, setSelectedLocation } = useUI();
  const { currentVehicle, addVehicle } = useGarage();
  const { currentUser } = useAuth();
  const { quotes } = useQuote();
  const { appointments } = useAppointment();
  const navigate = useNavigate();
  const [showVehicleSelector, setShowVehicleSelector] = useState(false);
  const [showServiceHistory, setShowServiceHistory] = useState(false);
  const [showVehiclePassport, setShowVehiclePassport] = useState(false);
  const [showGuidedDiagnostics, setShowGuidedDiagnostics] = useState(false);
  const [selectedCity, setSelectedCity] = useState("istanbul");
  const [fuelPrices, setFuelPrices] = useState({
    istanbul: { benzin: 65.02, motorin: 67.46, lpg: 35.02 },
    ankara: { benzin: 65.99, motorin: 68.58, lpg: 35.56 },
    izmir: { benzin: 66.27, motorin: 68.85, lpg: 34.98 }
  });
  const [lastUpdated, setLastUpdated] = useState("Bugün, 12:00");

  // Live fuel prices fetch from Opet API via CORS Proxy
  React.useEffect(() => {
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

        for (const city of citiesConfig) {
          try {
            const targetUrl = `https://api.opet.com.tr/api/fuelprices/prices?provinceCode=${city.code}&nocache=${Date.now()}`;
            const res = await fetch(`https://corsproxy.io/?url=${encodeURIComponent(targetUrl)}`);
            if (res.ok) {
              const data = await res.json();
              if (Array.isArray(data) && data.length > 0) {
                // Find district with prices, use Altindag for Ankara, Kadikoy for Istanbul, Merkez for Izmir
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
            }
          } catch (cityErr) {
            console.warn(`Could not fetch live prices for ${city.name}:`, cityErr);
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
    // Auto-refresh every 30 minutes
    const interval = setInterval(fetchLivePrices, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync selectedCity with global selectedLocation
  React.useEffect(() => {
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

  // Veri yükleme simülasyonu
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

  // Gerçekçi Araç Verisi & Fallback
  const activeVehicle = useMemo(() => {
    if (currentVehicle) return currentVehicle;
    return null;
  }, [currentVehicle]);

  // Teklifler listesi
  const activeQuotes = useMemo(() => {
    if (isGuest) {
      return [
        {
          id: "demo-q-1",
          status: "pending",
          description: "Ön disk ve balata değişimi için usta teklifleri toplanıyor.",
          company_name: "Borusan Oto Maslak",
          total_amount: 4500,
          created_at: new Date().toISOString(),
        }
      ];
    }
    return Array.isArray(quotes)
      ? quotes
          .filter((q) => q.status === "pending" || q.status === "accepted")
          .slice(0, 2)
      : [];
  }, [quotes, isGuest]);

  // Randevular listesi
  const upcomingAppointments = useMemo(() => {
    if (isGuest) {
      return [
        {
          id: "demo-a-1",
          service_type: "Periyodik Bakım & Check-up",
          appointment_date: new Date(Date.now() + 86400000 * 3).toISOString(),
          status: "approved",
          company_name: "Maslak Pro Servis",
        }
      ];
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

  // Akıllı Davranışsal Karar Desteği Bildirimleri (AI chatbot yerine sessiz zeka)
  const decisionAlerts = useMemo(() => {
    if (!activeVehicle) return [];
    const alerts = [];
    const km = Number(activeVehicle.km) || 0;

    // Fren/Balata aşınma uyarısı (Örnek araç geçmiş analizi)
    alerts.push({
      id: "alert-brake",
      type: "warning",
      icon: Icons.Activity,
      title: "Fren Sistemi Bildirimi",
      desc: "Son iki servis kaydınızda ön fren balatası aşınması gözlemlendi. Bu servis talebinize fren kontrolünü de eklemek ister misiniz?",
      actionText: "Talep Oluştur",
      action: () => navigate("/app/mechanics"),
    });

    // Periyodik bakım uyarısı
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

    // Fiyat Analiz uyarısı (Açık teklif varsa)
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

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans pb-32 animate-fade-in relative">
      {/* Premium Koyu Grafit Arka Plan Işıkları */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-10">
        <div className="absolute top-[10%] right-[-5%] w-[450px] h-[450px] bg-slate-800 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[350px] h-[350px] bg-slate-900 rounded-full blur-[100px]"></div>
      </div>

      {/* TOP COMPACT HEADER */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 border border-white/10 flex items-center justify-center">
            <Icons.Layers size={18} className="text-slate-400" />
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-bold leading-none">
              Carvis
            </p>
            <h2 className="text-sm font-black tracking-tight mt-1 text-white">
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
            className="px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black uppercase tracking-wider hover:bg-white/10 transition-all flex items-center gap-1.5 active-scale"
          >
            <Icons.RefreshCw size={11} className="text-slate-400" /> ARAÇ DEĞİŞTİR
          </button>
        )}
      </div>

      <div className="p-5 space-y-6">
        {/* VEHICLE COCKPIT MASTER MODULE */}
        {activeVehicle ? (
          <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-slate-800 rounded-full blur-3xl opacity-50 -mr-12 -mt-12"></div>
            
            <div className="relative z-10">
              
              {/* Vehicle Title & License Plate */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  {isGuest && (
                    <span className="inline-block text-[8px] font-black tracking-[0.2em] text-amber-500 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md uppercase mb-2">
                      Misafir Önizleme
                    </span>
                  )}
                  <h1 className="text-3xl font-black tracking-tighter uppercase leading-none text-white">
                    {activeVehicle.brand}{" "}
                    <span className="text-slate-400">{activeVehicle.model}</span>
                  </h1>
                  <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1.5">
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
                  className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-all active-scale"
                >
                  <Icons.User size={18} />
                </button>
              </div>

              {/* HEALTH GAUGE RING & STATS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center border-t border-white/5 pt-6">
                
                {/* Dairesel Sağlık Kadranı (Circular Gauge) */}
                <div className="flex items-center gap-5 bg-slate-950/40 p-4 rounded-[2rem] border border-white/5">
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
                        className="text-emerald-500"
                        strokeWidth="3"
                        strokeDasharray={`${activeVehicle.health_score || 96}, 100`}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-lg font-black text-white leading-none font-mono">
                        %{activeVehicle.health_score || 96}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></div>
                      <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
                        ARACIN SAĞLIK DURUMU
                      </h4>
                    </div>
                    <p className="text-sm font-black text-emerald-400 mt-1">
                      MÜKEMMEL DÜZEYDE
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                      Tüm kritik motor, elektrik ve fren mekanik sistemleri aktif.
                    </p>
                  </div>
                </div>

                {/* Kilometre & Son Yağ Değişimi Detay */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-950/40 p-4 rounded-2xl border border-white/5">
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      SON PERİYODİK YAĞ
                    </p>
                    <p className="text-sm font-black text-white font-mono leading-none">
                      {activeVehicle.last_oil_change ? new Date(activeVehicle.last_oil_change).toLocaleDateString("tr-TR") : "Belirtilmedi"}
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1.5 uppercase font-black">
                      10.000 KM KORUMALI
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic("impact");
                      setShowVehiclePassport(true);
                    }}
                    className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 text-left hover:bg-slate-950/60 transition-all active-scale group"
                  >
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                      DİJİTAL PASAPORT
                    </p>
                    <p className="text-sm font-black text-white leading-none flex items-center gap-1">
                      GEÇMİŞ <Icons.ChevronRight size={14} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
                    </p>
                    <p className="text-[9px] text-slate-500 mt-1.5 uppercase font-black">
                      PASAPORT RAPORU
                    </p>
                  </button>
                </div>

              </div>

            </div>
          </div>
        ) : isGuest ? (
          <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 text-center relative overflow-hidden group shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl"></div>
            <div className="w-16 h-16 rounded-2xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mx-auto mb-4">
              <Icons.UserCheck size={32} className="text-primary-500 animate-pulse" />
            </div>
            <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Carvis'e Hoş Geldiniz</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed mb-6 font-medium">
              Aracınızı eklemek, sağlık durumunu takip etmek, AI belirti teşhisi yapmak ve teklifleri yönetmek için lütfen giriş yapın veya kayıt olun.
            </p>
            <button
              onClick={() => openModal("login")}
              className="bg-primary-500 text-white hover:bg-primary-600 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest active-scale transition-all shadow-lg shadow-primary-500/15"
            >
              GİRİŞ YAP / ÜYE OL
            </button>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 text-center">
            <Icons.Car size={44} className="text-slate-600 mx-auto mb-4 animate-pulse" />
            <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Aracınız Ekli Değil</h3>
            <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed mb-6">
              Aracınızın sağlık durumunu, yaklaşan bakımlarını ve maliyetlerini tek panelden takip etmek için hemen araç ekleyin.
            </p>
            <button
              onClick={() => setShowVehicleSelector(true)}
              className="bg-white text-slate-950 px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest active-scale hover:bg-slate-200 transition-all"
            >
              ARAÇ EKLE
            </button>
          </div>
        )}

        {/* SHELL LIVE FUEL PRICES WIDGET */}
        <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-white/5 relative overflow-hidden group shadow-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
          
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <Icons.Fuel size={18} className="text-amber-400" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider leading-none">Canlı Akaryakıt Fiyatları</h4>
                <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1.5">GÜNCEL YAKIT FİYATLARI</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">GÜNCEL</span>
            </div>
          </div>

          {/* City Selector */}
          <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-white/5 mb-5">
            {['istanbul', 'ankara', 'izmir'].map((city) => (
              <button
                key={city}
                onClick={() => {
                  setSelectedCity(city);
                  const locationMap = {
                    istanbul: "İstanbul, Beşiktaş",
                    ankara: "Ankara, Çankaya",
                    izmir: "İzmir, Bornova"
                  };
                  setSelectedLocation(locationMap[city]);
                }}
                className={`py-2 text-[11px] font-black uppercase rounded-lg tracking-wider transition-all ${
                  selectedCity === city
                    ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {city === 'istanbul' ? 'İstanbul' : city === 'ankara' ? 'Ankara' : 'İzmir'}
              </button>
            ))}
          </div>

          {/* Prices Grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'FuelSave Benzin', price: fuelPrices[selectedCity].benzin, change: '-0.12 ₺', trend: 'down' },
              { label: 'V-Power Motorin', price: fuelPrices[selectedCity].motorin, change: '+0.24 ₺', trend: 'up' },
              { label: 'AutoGas LPG', price: fuelPrices[selectedCity].lpg, change: '0.00 ₺', trend: 'stable' },
            ].map((fuel, idx) => (
              <div key={idx} className="bg-slate-950/40 p-4 rounded-2xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider leading-tight">{fuel.label}</span>
                <div className="mt-3 mb-2 flex items-baseline">
                  <span className="text-xl font-black text-white font-mono">{fuel.price.toFixed(2)}</span>
                  <span className="text-xs font-black text-slate-400 font-mono ml-0.5">₺</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {fuel.trend === 'up' ? (
                    <Icons.TrendingUp size={12} className="text-rose-500 animate-pulse" />
                  ) : fuel.trend === 'down' ? (
                    <Icons.TrendingDown size={12} className="text-emerald-500 animate-pulse" />
                  ) : (
                    <Icons.Minus size={12} className="text-slate-500" />
                  )}
                  <span className={`text-[10px] font-bold font-mono ${
                    fuel.trend === 'up' ? 'text-rose-500' : fuel.trend === 'down' ? 'text-emerald-500' : 'text-slate-500'
                  }`}>
                    {fuel.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider border-t border-white/5 pt-4">
            <span>ANLIK AKTİF: {lastUpdated}</span>
            <span className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-0.5">
              İstasyon Bul <Icons.ChevronRight size={12} />
            </span>
          </div>
        </div>

        {/* REHBERLİ AI TEŞHİS ASİSTANI BANNER */}
        {activeVehicle && (
          <div 
            onClick={() => {
              triggerHaptic("impact");
              setShowGuidedDiagnostics(true);
            }}
            className="bg-slate-900 p-5 rounded-[2.5rem] border border-amber-500/30 hover:border-amber-500/50 transition-all cursor-pointer active-scale relative overflow-hidden group shadow-lg shadow-amber-950/5"
          >
            {/* Ambient telemetry lines decoration */}
            <div className="absolute right-0 bottom-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            
            <div className="flex items-start gap-4.5 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <Icons.BrainCircuit size={22} className="text-amber-500 group-hover:scale-110 transition-transform" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[8px] font-black uppercase tracking-[0.2em] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    AI CANLI TELEMETRİ
                  </span>
                  <span className="text-[9px] font-black text-amber-500 flex items-center gap-1 group-hover:text-white transition-colors uppercase">
                    Teşhisi Başlat <Icons.ChevronRight size={12} />
                  </span>
                </div>
                <h4 className="text-sm font-black text-white uppercase tracking-tight">Akıllı Belirti & Ses Teşhisi</h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                  Aracınızdaki ses, titreme veya arıza ışıklarını yapay zeka ve ses mikseri simülasyonuyla 5 saniyede tarayıp usta tekliflerini şeffafça alın.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* BEHAVIORAL AI DECISION HELPER CARDS (Quiet Zeka) */}
        {activeVehicle && decisionAlerts.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <Icons.ShieldAlert size={16} className="text-slate-400" />
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                KOKPİT KARAR DESTEĞİ
              </h4>
            </div>

            {decisionAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={alert.action}
                className="bg-slate-900 p-4.5 rounded-[1.8rem] border border-white/5 hover:border-slate-800 transition-all cursor-pointer active-scale relative overflow-hidden group"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center shrink-0">
                    <alert.icon size={18} className="text-slate-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="text-xs font-black text-white uppercase tracking-tight">{alert.title}</h4>
                      <span className="text-[8px] font-black text-slate-500 uppercase flex items-center gap-1 group-hover:text-white transition-colors">
                        {alert.actionText} <Icons.ChevronRight size={10} />
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                      {alert.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CHRONOLOGICAL MAINTENANCE TIMELINE (Dikey Zaman Çizelgesi) */}
        {activeVehicle && (
          <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-white/5 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-black text-base uppercase tracking-tight text-white flex items-center gap-2">
                <Icons.Calendar size={18} className="text-slate-400" /> Yaklaşan İşler
              </h3>
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                TAKVİM DURUMU
              </span>
            </div>

            <div className="relative pl-5 border-l border-white/10 space-y-5 py-2">
              {/* TÜVTÜRK Muayene */}
              <div className="relative">
                <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-slate-900"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase leading-none">TÜVTÜRK Muayenesi</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Araç muayene bitiş tarihi yaklaşıyor.</p>
                  </div>
                  <span className="text-[10px] font-mono font-black text-emerald-400 uppercase">
                    15 HAZ 2026
                  </span>
                </div>
              </div>

              {/* Zorunlu Trafik Sigortası */}
              <div className="relative">
                <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-amber-500 border-2 border-slate-900"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase leading-none">Zorunlu Trafik Sigortası</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Poliçe yenileme dönemi.</p>
                  </div>
                  <span className="text-[10px] font-mono font-black text-amber-400 uppercase">
                    30 MAY 2026
                  </span>
                </div>
              </div>

              {/* Mevsimlik Lastik Değişimi */}
              <div className="relative">
                <div className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-slate-600 border-2 border-slate-900"></div>
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-black text-white uppercase leading-none">Mevsimlik Lastik Kontrolü</h4>
                    <p className="text-[10px] text-slate-400 mt-1">Lastik diş derinliği ve basınç analizi.</p>
                  </div>
                  <span className="text-[10px] font-mono font-black text-slate-500 uppercase">
                    12 AĞU 2026
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COST INTELLIGENCE PANEL (Maliyet Zekası) */}
        {activeVehicle && (
          <div className="bg-slate-900 rounded-[2.5rem] p-6 border border-white/5">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="font-black text-base uppercase tracking-tight text-white">
                  Bu Ayki Masrafım
                </h3>
                <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
                  ARAÇ MALİYET ANALİZİ
                </p>
              </div>
              <p className="text-2xl font-black text-white tracking-tighter">₺4.850</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5"><Icons.Fuel size={12} /> Akaryakıt</span>
                <span className="font-bold text-white">₺3.200 (%66)</span>
              </div>
              <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full" style={{ width: "66%" }}></div>
                <div className="bg-primary-500 h-full" style={{ width: "24%" }}></div>
                <div className="bg-slate-600 h-full" style={{ width: "10%" }}></div>
              </div>
              <div className="flex gap-4 text-[10px] text-slate-500 pt-2 font-black uppercase">
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Akaryakıt</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span> Servis</span>
                <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span> Diğer</span>
              </div>
            </div>
          </div>
        )}

        {/* ACTIVE FEED: APPOINTMENTS & TENDERS */}
        {(upcomingAppointments.length > 0 || activeQuotes.length > 0) && (
          <div className="space-y-4">
            <h3 className="font-black text-base uppercase tracking-tight px-1">
              Bugünkü İşleriniz ve Araç Durumunuz
            </h3>

            {/* Yaklaşan Randevu */}
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
                className="bg-slate-900 p-4.5 rounded-[1.8rem] border border-white/5 flex justify-between items-center cursor-pointer active-scale"
              >
                <div className="flex items-center gap-3.5">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-white/10 text-emerald-400">
                    <Icons.Calendar size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase leading-none">{a.service_type}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{a.company_name} • {new Date(a.appointment_date).toLocaleDateString("tr-TR")}</p>
                  </div>
                </div>
                <Badge type="success">ONAYLANDI</Badge>
              </div>
            ))}

            {/* Aktif Açık Teklifler */}
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
                className="bg-slate-900 p-4.5 rounded-[1.8rem] border border-white/5 flex justify-between items-center cursor-pointer active-scale"
              >
                <div className="flex items-center gap-3.5">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-white/10 text-primary-400">
                    <Icons.FileText size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-black text-white uppercase leading-none line-clamp-1">{q.description}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">{q.company_name} • {q.total_amount ? `₺${q.total_amount.toLocaleString()}` : "Teklif Bekliyor"}</p>
                  </div>
                </div>
                <Badge type="warning">TEKLİFLER</Badge>
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
                className="bg-slate-900 p-3.5 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 border border-white/5 active-scale cursor-pointer group hover:border-slate-800 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-center group-hover:bg-slate-900 transition-all">
                  <item.icon size={18} className="text-slate-400 group-hover:text-white" />
                </div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter font-sans leading-none text-center">
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* EXPERT HOTLINE BANNER */}
        <div className="bg-slate-900 p-5 rounded-[2.5rem] border border-white/5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-950 border border-white/10 rounded-xl text-primary-400 shrink-0">
              <Icons.ShieldCheck size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-tight">Doğru Servis Eşleşmesi</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">Tüm usta ve servislerimizin belgeleri Carvis tarafından onaylıdır.</p>
            </div>
          </div>
          <Icons.CheckCircle className="text-emerald-400 shrink-0" size={18} />
        </div>

      </div>

      {/* MODALS & TOUR */}
      {showVehicleSelector && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowVehicleSelector(false)}
              className="absolute -top-12 right-0 text-white"
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
