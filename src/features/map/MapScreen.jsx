import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useMap } from "../../context/MapContext";
import { Badge } from "../../components/Core";
import MapComponent from "./MapComponent";
import LocationRequiredScreen from "./LocationRequiredScreen";
import { AnimatePresence } from "framer-motion";

const StatItem = ({ icon, label, value, color = "text-white" }) => (
  <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center">
    <div className={`mb-1 ${color}`}>{icon}</div>
    <p className="text-[7px] font-black uppercase tracking-[0.1em] text-slate-500 mb-0.5">{label}</p>
    <p className={`text-[10px] font-black ${color}`}>{value}</p>
  </div>
);

const MapScreen = () => {
  const navigate = useNavigate();
  const {
    nearbyProviders,
    fetchNearbyProviders,
    userLocation,
    activeSOS,
    createSOSRequest,
    cancelSOS,
    permissionStatus,
    retryLocation,
    bypassPermission,
    loadingMap,
  } = useMap();

  const [selectedProvider, setSelectedProvider] = useState(null);
  const [showSOSPanel, setShowSOSPanel] = useState(false);
  const [sosProcessing, setSosProcessing] = useState(false);

  // Live SOS Tracker simulation state
  const [sosLoc, setSosLoc] = useState(null);
  const [sosEta, setSosEta] = useState(12); // minutes left
  const [sosStep, setSosStep] = useState(1); // 1 = Assigned, 2 = On the way, 3 = Arrived

  // Simulating live vehicle movement towards user
  useEffect(() => {
    if (!activeSOS || !userLocation) {
      setSosLoc(null);
      setSosEta(12);
      setSosStep(1);
      return;
    }

    // Set initial position of tow truck 0.008 degrees away
    if (!sosLoc) {
      setSosLoc({
        lat: userLocation.lat + 0.008,
        lng: userLocation.lng + 0.008,
      });
      setSosEta(12);
      setSosStep(1);
    }

    // Setup simulation steps
    const interval = setInterval(() => {
      setSosLoc((current) => {
        if (!current) return null;
        
        // Compute delta
        const latDelta = userLocation.lat - current.lat;
        const lngDelta = userLocation.lng - current.lng;
        
        // Check if arrived (extremely close)
        if (Math.abs(latDelta) < 0.0005 && Math.abs(lngDelta) < 0.0005) {
          setSosEta(0);
          setSosStep(3);
          clearInterval(interval);
          return userLocation;
        }

        // Simulating moving 20% closer to user every step
        setSosEta((prev) => Math.max(1, prev - 2));
        setSosStep(2);
        return {
          lat: current.lat + latDelta * 0.22,
          lng: current.lng + lngDelta * 0.22,
        };
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [activeSOS, userLocation, sosLoc]);

  // Create simulated active tow truck provider to put on the map
  const simulatedSosProvider = useMemo(() => {
    if (!activeSOS || !userLocation) return null;
    return {
      id: "simulated-sos-tow-truck",
      full_name: "Kadir Usta (Güven Çekici)",
      company_name: "Carvis Acil Çekici A.Ş.",
      role: "mechanic",
      avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=kadir",
      rating: "4.9",
      lat: sosLoc ? sosLoc.lat : userLocation.lat + 0.008,
      lng: sosLoc ? sosLoc.lng : userLocation.lng + 0.008,
      specialized: {
        technician_count: 1,
        is_authorized_service: true,
      }
    };
  }, [activeSOS, userLocation, sosLoc]);

  const sosProgressStyle = { width: `${sosStep === 1 ? '33%' : sosStep === 2 ? '66%' : '100%'}` };

  // Filtered providers for SOS mode
  const filteredProviders = useMemo(() => {
    let list = nearbyProviders || [];
    
    // Add simulated provider if SOS active
    if (simulatedSosProvider) {
      list = [simulatedSosProvider, ...list];
    }

    if (showSOSPanel || activeSOS) {
      return list.filter(p => p.role === "mechanic" || p.provider_type === "tow_truck" || p.id === "simulated-sos-tow-truck");
    }
    return list;
  }, [nearbyProviders, showSOSPanel, activeSOS, simulatedSosProvider]);

  useEffect(() => {
    if (permissionStatus === "granted") {
      fetchNearbyProviders();
    }
  }, [permissionStatus, fetchNearbyProviders]);

  if (permissionStatus === "loading") {
    return (
      <div className="fixed inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 animate-pulse">
          Harita Hazırlanıyor...
        </p>
      </div>
    );
  }

  if (permissionStatus === "denied") {
    return (
      <LocationRequiredScreen
        onRetry={retryLocation}
        onBypass={bypassPermission}
      />
    );
  }

  const handleCreateSOS = async (type) => {
    setSosProcessing(type);
    setSosProcessing(true);
    await createSOSRequest(type, "Acil yol yardımı ve çekici talebi.");
    setSosProcessing(false);
    setShowSOSPanel(false);
  };

  return (
    <div className="h-screen bg-slate-950 relative overflow-hidden text-white">
      {/* --- REAL LEAFLET MAP VIEW --- */}
      <div className="absolute inset-0 bg-[#060a12] overflow-hidden">
        <MapComponent
          userLocation={userLocation}
          providers={filteredProviders}
          onProviderSelect={(p) => {
            if (p.id === "simulated-sos-tow-truck") return; // Simulated tow marker click disabled
            setSelectedProvider(p);
          }}
        />
      </div>

      {/* --- EXPERT SEARCH OVERLAY --- */}
      {loadingMap && (
        <div className="absolute inset-0 z-20 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="glass-card px-6 py-4 rounded-2xl border border-white/10 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
              Sistem Taranıyor...
            </span>
          </div>
        </div>
      )}

      {/* --- HEADER CONTROLS --- */}
      <div className="absolute top-6 left-5 right-5 z-30 flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center active-scale border border-white/10"
        >
          <Icons.ChevronLeft size={24} />
        </button>
        <div className="flex-1 glass-card rounded-2xl border border-white/10 flex items-center px-4 backdrop-blur-3xl shadow-2xl">
          <Icons.Search size={18} className="text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Usta veya Yol Yardım ara..."
            className="bg-transparent border-none outline-none text-xs font-bold text-white w-full placeholder-slate-500"
          />
        </div>
      </div>

      {/* --- SOS PANEL BUTTON --- */}
      {!activeSOS && (
        <button
          onClick={() => setShowSOSPanel(true)}
          className="absolute bottom-32 right-5 z-30 w-16 h-16 bg-red-600 text-white rounded-[2rem] shadow-[0_0_30px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center active-scale border-4 border-white/20 group hover:bg-red-500 transition-all"
        >
          <Icons.AlertTriangle size={20} className="group-hover:animate-bounce" />
          <span className="text-[10px] font-black mt-1">SOS</span>
        </button>
      )}

      {/* --- PROVIDER DETAIL PANEL --- */}
      {selectedProvider && !activeSOS && (
        <div className="absolute bottom-10 left-5 right-5 z-40 animate-in slide-in-from-bottom-5">
          <div className="glass-card bg-slate-900/90 backdrop-blur-3xl border border-white/20 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-br blur-3xl ${
              selectedProvider.role === "valet" ? "from-blue-500" :
              selectedProvider.role === "parking" ? "from-emerald-500" :
              selectedProvider.role === "mechanic" ? "from-orange-500" : "from-primary-500"
            }`} />
            
            <button
              onClick={() => setSelectedProvider(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-colors z-10"
            >
              <Icons.X size={18} />
            </button>

            <div className="flex items-start gap-4 mb-6 relative z-10">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white border border-white/10 shadow-xl overflow-hidden">
                <img 
                  src={selectedProvider.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedProvider.full_name}`} 
                  className="w-full h-full object-cover"
                  alt="Provider"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-xl uppercase tracking-tighter text-white">
                    {selectedProvider.full_name}
                  </h3>
                  {selectedProvider.specialized?.is_authorized_service && (
                    <Icons.ShieldCheck size={16} className="text-blue-400" />
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <Icons.Star size={14} className="fill-yellow-400" />
                    <span className="text-xs font-black">{selectedProvider.rating || "4.8"}</span>
                  </div>
                  <Badge type={selectedProvider.role === "valet" ? "info" : "success"} className="text-[8px] px-2 py-0.5">
                    {selectedProvider.role === "valet" ? "Sertifikalı Vale" :
                     selectedProvider.role === "parking" ? "Güvenli Otopark" :
                     selectedProvider.role === "mechanic" ? "Uzman Tekniker" : "Yedek Parça"}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Specialized Stats Grid */}
            <div className="grid grid-cols-3 gap-2 mb-6 relative z-10">
              {selectedProvider.role === "valet" && (
                <>
                  <StatItem icon={<Icons.Shield size={14}/>} label="Sigorta" value={selectedProvider.specialized?.insurance_verified ? "Var" : "Yok"} color="text-blue-400" />
                  <StatItem icon={<Icons.Layers size={14}/>} label="Kapasite" value={`${selectedProvider.specialized?.max_concurrent_cars || 1} Araç`} />
                  <StatItem icon={<Icons.MapPin size={14}/>} label="Uzaklık" value="1.2 KM" color="text-emerald-400" />
                </>
              )}
              {selectedProvider.role === "parking" && (
                <>
                  <StatItem icon={<Icons.Zap size={14}/>} label="Şarj (EV)" value={selectedProvider.specialized?.has_ev_charging ? "Aktif" : "Yok"} color={selectedProvider.specialized?.has_ev_charging ? "text-emerald-400" : "text-slate-500"} />
                  <StatItem icon={<Icons.Camera size={14}/>} label="Güvenlik" value={selectedProvider.specialized?.has_security_cams ? "Kamera" : "Sınırlı"} />
                  <StatItem icon={<Icons.MapPin size={14}/>} label="Uzaklık" value="0.8 KM" color="text-emerald-400" />
                </>
              )}
              {selectedProvider.role === "mechanic" && (
                <>
                  <StatItem icon={<Icons.Wrench size={14}/>} label="Hizmet" value="Yerinde Mobil" color="text-orange-400" />
                  <StatItem icon={<Icons.Users size={14}/>} label="Ekip" value={`${selectedProvider.specialized?.technician_count || 1} Usta`} />
                  <StatItem icon={<Icons.MapPin size={14}/>} label="Uzaklık" value="2.1 KM" color="text-emerald-400" />
                </>
              )}
              {selectedProvider.role === "parts" && (
                <>
                  <StatItem icon={<Icons.Truck size={14}/>} label="Teslimat" value={`${selectedProvider.specialized?.delivery_radius_km || 50} KM`} color="text-primary-400" />
                  <StatItem icon={<Icons.CircleDollarSign size={14}/>} label="Min Sip." value={`${selectedProvider.specialized?.min_order_amount || 0}₺`} />
                  <StatItem icon={<Icons.MapPin size={14}/>} label="Uzaklık" value="4.5 KM" color="text-emerald-400" />
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="bg-slate-800 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active-scale border border-white/5">
                <Icons.Phone size={18} /> ARA
              </button>
              <button
                onClick={() => navigate(`/messages/${selectedProvider.id || "mock"}`)}
                className="bg-primary-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active-scale shadow-xl shadow-primary-900/20"
              >
                <Icons.MessageCircle size={18} /> MESAJ AT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- SOS PANIC SHEET MODAL --- */}
      {showSOSPanel && (
        <div className="absolute inset-0 z-50 flex items-end animate-in fade-in duration-300">
          <div
            className="absolute inset-0 bg-red-950/20 backdrop-blur-md"
            onClick={() => setShowSOSPanel(false)}
          ></div>
          <div className="w-full bg-slate-900 border-t-4 border-red-600 rounded-t-[3rem] p-8 pb-12 relative shadow-[0_-20px_100px_rgba(220,38,38,0.3)] z-10 animate-in slide-in-from-bottom-20 duration-500">
            <div className="w-12 h-1.5 bg-slate-800 rounded-full mx-auto mb-8 opacity-50"></div>
            <h2 className="text-2xl font-black tracking-tighter uppercase text-center mb-2">
              ACİL YARDIM ÇAĞRISI
            </h2>
            <p className="text-xs text-slate-400 text-center font-bold uppercase tracking-widest mb-10">
              Sorun nedir? Yol yardım 15 dakika içinde yanında.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  id: "engine_failure",
                  label: "Motor Arızası",
                  icon: Icons.AlertTriangle,
                  color: "text-orange-500",
                },
                {
                  id: "tow_truck",
                  label: "Çekici Lazım",
                  icon: Icons.Truck,
                  color: "text-blue-500",
                },
                {
                  id: "battery_dead",
                  label: "Akü Bitti",
                  icon: Icons.Zap,
                  color: "text-yellow-500",
                },
                {
                  id: "tire_puncture",
                  label: "Lastik Patladı",
                  icon: Icons.LocateFixed,
                  color: "text-emerald-500",
                },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleCreateSOS(item.id)}
                  className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all active-scale hover:bg-white/10 group"
                >
                  <div
                    className={`p-4 rounded-2xl bg-slate-950/50 ${item.color} group-hover:scale-110 transition-transform shadow-inner`}
                  >
                    <item.icon size={32} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <Icons.ShieldCheck size={18} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase">
                Resmi Rapidsy Güvencesi Altındasınız
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- ACTIVE SOS REAL-TIME TRACKING HUD PANEL --- */}
      <AnimatePresence>
        {activeSOS && (
          <div className="absolute bottom-6 left-5 right-5 z-40">
            <div className="glass-card bg-slate-950/95 border-2 border-red-500 p-6 rounded-[2.5rem] shadow-2xl relative space-y-5 overflow-hidden">
              
              {/* Pulsing Emergency indicator */}
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse"></div>

              {/* Driver info block */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={simulatedSosProvider.avatar_url} 
                      className="w-14 h-14 rounded-2xl border border-white/10 object-cover"
                      alt="Assigned Tow Driver" 
                    />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center border-2 border-slate-950">
                      <Icons.Truck size={10} className="text-white" />
                    </span>
                  </div>
                  <div>
                    <h3 className="font-black text-base uppercase text-white tracking-tight leading-none mb-1">
                      {simulatedSosProvider.full_name}
                    </h3>
                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">
                      {simulatedSosProvider.company_name}
                    </p>
                    <div className="flex items-center gap-1 mt-1 text-yellow-400">
                      <Icons.Star size={10} className="fill-yellow-400" />
                      <span className="text-[9px] font-black">{simulatedSosProvider.rating}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <Badge type="error" className="text-[8px] font-black tracking-widest px-3 py-1 animate-pulse">
                    YOL YARDIM YOLDA
                  </Badge>
                  <p className="text-2xl font-black text-red-500 mt-2 tracking-tighter">
                    {sosEta} <span className="text-[10px] font-bold text-slate-400 uppercase">DK</span>
                  </p>
                </div>
              </div>

              {/* Progress Tracking Bar */}
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-white/5">
                <div className="flex justify-between items-center text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">
                  <span className={sosStep >= 1 ? "text-red-400" : ""}>Talebiniz Alındı</span>
                  <span className={sosStep >= 2 ? "text-red-400" : ""}>Ekip Yolda</span>
                  <span className={sosStep >= 3 ? "text-emerald-400" : ""}>Ulaştı</span>
                </div>
                
                {/* Visual Progress Bar */}
                <div className="relative w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                  <div 
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-orange-500 transition-all duration-1000"
                    style={sosProgressStyle}
                  ></div>
                </div>
              </div>

              {/* Cost & Action Controls */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900 p-3 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center">
                  <Icons.Banknote size={14} className="text-emerald-500 mb-0.5" />
                  <p className="text-[7px] font-black uppercase text-slate-500">Sabit Ücret</p>
                  <p className="text-[10px] font-black text-emerald-400">₺1.750</p>
                </div>
                
                <button 
                  onClick={() => navigate(`/messages/${simulatedSosProvider.id}`)}
                  className="bg-slate-900 text-white rounded-2xl font-black text-[9px] uppercase tracking-wider flex flex-col items-center justify-center gap-1 active-scale border border-white/5"
                >
                  <Icons.MessageCircle size={14} className="text-primary-400" />
                  MESAJ AT
                </button>
                
                <button 
                  onClick={() => cancelSOS(activeSOS.id)}
                  className="bg-red-950/20 text-red-400 rounded-2xl font-black text-[9px] uppercase tracking-wider flex flex-col items-center justify-center gap-1 active-scale border border-red-500/20"
                >
                  <Icons.XCircle size={14} className="text-red-500" />
                  TALEBİ İPTAL ET
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden processing indicator */}
      {sosProcessing && <div className="hidden" />}
    </div>
  );
};

export default MapScreen;
