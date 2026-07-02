import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useMap } from "../../context/MapContext";
import { Badge } from "../../components/Core";
import MapComponent from "./MapComponent";
import LocationRequiredScreen from "./LocationRequiredScreen";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../../supabaseClient";
import { getEGMEDSMarkers } from "../../services/externalApis";
import { calculateHaversineDistance } from "../../utils/geoUtils";
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const playBeep = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
    
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.5);
  } catch (e) {
    console.error("Audio beep failed", e);
  }
};

const StatItem = ({ icon, label, value, color = "text-slate-900 dark:text-white" }) => (
  <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-3 border border-black/5 dark:border-white/5 flex flex-col items-center justify-center text-center">
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
  const [roadAlerts, setRoadAlerts] = useState([]);

  // Drive Mode State
  const [isDriveMode, setIsDriveMode] = useState(false);
  const [closestEDS, setClosestEDS] = useState(null);

  // Proximity Tracking Effect
  useEffect(() => {
    if (!isDriveMode || !userLocation || roadAlerts.length === 0) return;

    let nearest = null;
    let minDistance = Infinity;

    const edsAlerts = roadAlerts.filter(a => a.type === 'eds' || a.type === 'radar');

    edsAlerts.forEach(alert => {
      const dist = calculateHaversineDistance(
        userLocation.lat, userLocation.lng,
        alert.lat, alert.lng
      );
      if (dist < minDistance) {
        minDistance = dist;
        nearest = { ...alert, distanceMeters: dist };
      }
    });

    if (nearest && nearest.distanceMeters < 2000) {
      // Cross thresholds for audio alerts
      if (closestEDS && closestEDS.id === nearest.id) {
        if (closestEDS.distanceMeters >= 500 && nearest.distanceMeters < 500) {
          playBeep();
        } else if (closestEDS.distanceMeters >= 1000 && nearest.distanceMeters < 1000) {
          // Maybe a softer beep for 1km
          playBeep();
        }
      } else if (nearest.distanceMeters < 500) {
        playBeep();
      }
      setClosestEDS(nearest);
    } else {
      setClosestEDS(null);
    }

  }, [userLocation, roadAlerts, isDriveMode, closestEDS]);

  // Simulated SOS provider removed for production

  // Filtered providers for SOS mode
  const filteredProviders = useMemo(() => {
    let list = nearbyProviders || [];
    
    if (showSOSPanel || activeSOS) {
      return list.filter(p => p.role === "mechanic" || p.provider_type === "tow_truck");
    }
    return list;
  }, [nearbyProviders, showSOSPanel, activeSOS]);

  useEffect(() => {
    const fetchRoadAlerts = async () => {
      try {
        const { data, error } = await supabase
          .from("road_alerts")
          .select("*");
          
        let alerts = [];
        if (!error && data) {
          alerts = [...data];
        }

        // Fetch official EGM EDS Markers to integrate deeply into the map
        const egmMarkers = await getEGMEDSMarkers("istanbul");
        
        // Combine DB community alerts with EGM Official EDS markers
        const combinedAlerts = [
          ...alerts,
          ...egmMarkers.map(m => ({
            id: m.id,
            type: m.type.toLowerCase(),
            title: m.name,
            message: m.distance,
            reporter: "EGM Resmi Verisi",
            lat: m.lat,
            lng: m.lng,
            votes: 150 + Math.floor(Math.random() * 100)
          }))
        ];

        setRoadAlerts(combinedAlerts);
      } catch (err) {
        console.error("Error fetching road alerts for map:", err);
      }
    };

    if (permissionStatus === "granted") {
      fetchNearbyProviders();
      fetchRoadAlerts();
    }
  }, [permissionStatus, fetchNearbyProviders]);

  if (permissionStatus === "loading") {
    return (
      <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-4">
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
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (_e) {
      // Ignore if not on native device
    }
    setSosProcessing(type);
    setSosProcessing(true);
    await createSOSRequest(type, "Acil yol yardımı ve çekici talebi.");
    setSosProcessing(false);
    setShowSOSPanel(false);
  };

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 relative overflow-hidden text-slate-900 dark:text-white">
      {/* --- REAL LEAFLET MAP VIEW --- */}
      <div className="absolute inset-0 bg-slate-50 dark:bg-[#060a12] overflow-hidden">
        <MapComponent
          userLocation={userLocation}
          providers={filteredProviders}
          roadAlerts={roadAlerts}
          onProviderSelect={(p) => setSelectedProvider(p)}
        />
      </div>

      {/* --- EXPERT SEARCH OVERLAY --- */}
      {loadingMap && (
        <div className="absolute inset-0 z-20 bg-slate-50 dark:bg-slate-950/40 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <div className="glass-card px-6 py-4 rounded-2xl border border-black/10 dark:border-white/10 flex items-center gap-4 animate-in fade-in zoom-in duration-300">
            <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
              Sistem Taranıyor...
            </span>
          </div>
        </div>
      )}

      {/* --- HEADER CONTROLS --- */}
      <div className="absolute top-6 left-5 right-5 z-30 flex gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 glass-card rounded-2xl flex items-center justify-center active-scale border border-black/10 dark:border-white/10"
        >
          <Icons.ChevronLeft size={24} />
        </button>
        <div className="flex-1 glass-card rounded-2xl border border-black/10 dark:border-white/10 flex items-center px-4 backdrop-blur-3xl shadow-2xl">
          <Icons.Search size={18} className="text-slate-500 dark:text-slate-400 mr-3" />
          <input
            type="text"
            placeholder="Usta veya Yol Yardım ara..."
            className="bg-transparent border-none outline-none text-xs font-bold text-slate-900 dark:text-white w-full placeholder-slate-500"
          />
        </div>
      </div>

      {/* --- DRIVE MODE BUTTON & SOS PANEL BUTTON --- */}
      {!activeSOS && (
        <div className="absolute bottom-32 right-5 z-30 flex flex-col gap-4">
          <button
            onClick={() => setIsDriveMode(!isDriveMode)}
            className={`w-16 h-16 rounded-[2rem] flex flex-col items-center justify-center active-scale border-4 transition-all shadow-xl group ${
              isDriveMode 
                ? "bg-emerald-500 text-slate-900 border-black/20 dark:border-white/20 shadow-[0_0_30px_rgba(16,185,129,0.5)]" 
                : "bg-black/80 dark:bg-white/10 text-white border-transparent backdrop-blur-xl hover:bg-black"
            }`}
          >
            <Icons.Navigation size={20} className={isDriveMode ? "animate-pulse" : ""} />
            <span className="text-[9px] font-black mt-1 uppercase tracking-wider">{isDriveMode ? "Kapat" : "Sürüş"}</span>
          </button>

          <button
            onClick={() => setShowSOSPanel(true)}
            className="w-16 h-16 bg-red-600 text-slate-900 dark:text-white rounded-[2rem] shadow-[0_0_30px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center active-scale border-4 border-black/20 dark:border-white/20 group hover:bg-red-500 transition-all"
          >
            <Icons.AlertTriangle size={20} className="group-hover:animate-bounce" />
            <span className="text-[10px] font-black mt-1">SOS</span>
          </button>
        </div>
      )}

      {/* --- DRIVE MODE HUD OVERLAY --- */}
      <AnimatePresence>
        {isDriveMode && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="absolute top-24 left-5 right-5 z-20 pointer-events-none flex flex-col items-center"
          >
            <div className={`glass-card rounded-[2rem] px-6 py-4 border-2 flex items-center justify-between gap-6 backdrop-blur-3xl shadow-2xl transition-colors duration-500 ${
              closestEDS && closestEDS.distanceMeters < 500 
                ? "border-red-500 bg-red-500/10 shadow-[0_0_40px_rgba(239,68,68,0.4)]" 
                : closestEDS && closestEDS.distanceMeters < 1000 
                ? "border-orange-500 bg-orange-500/10 shadow-[0_0_40px_rgba(249,115,22,0.4)]"
                : "border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.2)]"
            }`}>
              
              <div className="flex flex-col items-center justify-center border-r border-black/10 dark:border-white/10 pr-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">HIZ</span>
                <div className="flex items-end gap-1">
                  <span className="text-3xl font-black text-slate-900 dark:text-white font-mono">--</span>
                  <span className="text-xs font-bold text-slate-500 pb-1">km/h</span>
                </div>
              </div>

              <div className="flex flex-col flex-1">
                {closestEDS ? (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      {closestEDS.distanceMeters < 500 ? (
                        <Icons.AlertOctagon size={16} className="text-red-500 animate-pulse" />
                      ) : (
                        <Icons.AlertTriangle size={16} className="text-orange-500" />
                      )}
                      <span className={`text-[10px] font-black uppercase tracking-widest ${
                        closestEDS.distanceMeters < 500 ? "text-red-500" : "text-orange-500"
                      }`}>
                        EDS YAKLAŞIYOR
                      </span>
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase line-clamp-1">{closestEDS.title || closestEDS.message}</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white font-mono mt-0.5">
                      {Math.round(closestEDS.distanceMeters)} <span className="text-xs text-slate-500">metre</span>
                    </span>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 mb-1">
                      <Icons.ShieldCheck size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">YOL GÜVENLİ</span>
                    </div>
                    <span className="text-sm font-bold text-slate-500 dark:text-slate-400">Yakında radar veya EDS yok</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Screen edge glowing warning if extremely close */}
            {closestEDS && closestEDS.distanceMeters < 500 && (
              <div className="fixed inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(239,68,68,0.3)] z-0 animate-pulse" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- PROVIDER DETAIL PANEL --- */}
      {selectedProvider && !activeSOS && (
        <div className="absolute bottom-10 left-5 right-5 z-40 animate-in slide-in-from-bottom-5">
          <div className="glass-card bg-white dark:bg-slate-900/90 backdrop-blur-3xl border border-black/20 dark:border-white/20 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-10 bg-gradient-to-br blur-3xl ${
              selectedProvider.role === "valet" ? "from-blue-500" :
              selectedProvider.role === "parking" ? "from-emerald-500" :
              selectedProvider.role === "mechanic" ? "from-orange-500" : "from-primary-500"
            }`} />
            
            <button
              onClick={() => setSelectedProvider(null)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:text-white transition-colors z-10"
            >
              <Icons.X size={18} />
            </button>

            <div className="flex items-start gap-4 mb-6 relative z-10">
              <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-slate-900 dark:text-white border border-black/10 dark:border-white/10 shadow-xl overflow-hidden">
                <img 
                  src={selectedProvider.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${selectedProvider.full_name}`} 
                  className="w-full h-full object-cover"
                  alt="Provider"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-black text-xl uppercase tracking-tighter text-slate-900 dark:text-white">
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
              <button className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active-scale border border-black/5 dark:border-white/5">
                <Icons.Phone size={18} /> ARA
              </button>
              <button
                onClick={() => selectedProvider?.id && navigate(`/messages/${selectedProvider.id}`)}
                className="bg-primary-600 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 active-scale shadow-xl shadow-primary-900/20"
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
          <div className="w-full bg-white dark:bg-slate-900 border-t-4 border-red-600 rounded-t-[3rem] p-8 pb-12 relative shadow-[0_-20px_100px_rgba(220,38,38,0.3)] z-10 animate-in slide-in-from-bottom-20 duration-500">
            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-auto mb-8 opacity-50"></div>
            <h2 className="text-2xl font-black tracking-tighter uppercase text-center mb-2">
              ACİL YARDIM ÇAĞRISI
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-bold uppercase tracking-widest mb-10">
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
                  className="bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-4 transition-all active-scale hover:bg-black/10 dark:bg-white/10 group"
                >
                  <div
                    className={`p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/50 ${item.color} group-hover:scale-110 transition-transform shadow-inner`}
                  >
                    <item.icon size={32} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20">
              <Icons.ShieldCheck size={18} className="text-emerald-500" />
              <span className="text-[10px] font-black text-emerald-500 uppercase">
                Resmi Carvis Güvencesi Altındasınız
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Active SOS Panel (Removed simulated provider reference) */}
      <AnimatePresence>
        {activeSOS && (
          <div className="absolute bottom-6 left-5 right-5 z-40">
            <div className="glass-card bg-slate-50 dark:bg-slate-950/95 border-2 border-red-500 p-6 rounded-[2.5rem] shadow-2xl relative space-y-5 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse"></div>
              
              <div className="flex flex-col items-center justify-center py-4 text-center">
                <Icons.Search size={32} className="text-red-500 mb-2 animate-pulse" />
                <h3 className="font-black text-base uppercase text-slate-900 dark:text-white tracking-tight">Yol Yardım Aranıyor...</h3>
                <p className="text-xs text-slate-500 mt-1">Bölgenizdeki uygun ekiplere sinyal gönderildi.</p>
                <div className="mt-4">
                  <button 
                    onClick={() => cancelSOS(activeSOS.id)}
                    className="bg-red-950/20 text-red-400 rounded-2xl font-black text-xs uppercase tracking-wider px-6 py-3 flex items-center justify-center gap-2 border border-red-500/20 w-full"
                  >
                    <Icons.XCircle size={16} /> TALEBİ İPTAL ET
                  </button>
                </div>
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
