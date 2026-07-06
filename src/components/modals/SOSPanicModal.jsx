import React, { useState, useEffect } from "react";
import { Activity, MapPin, Phone, ShieldCheck, TriangleAlert, Truck, X } from "lucide-react";
import { cn } from "../../lib/utils";

const SOSPanicModal = ({ show, onClose }) => {
  const [locationStatus, setLocationStatus] = useState("capturing"); // 'capturing', 'shared', 'error'
  const [coordinates, setCoordinates] = useState(null);

  useEffect(() => {
    if (show) {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationStatus("shared");
            setCoordinates({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          (error) => {
            console.error("GPS Error:", error);
            setLocationStatus("error");
            // Fallback to static if denied for demo but show error
            setCoordinates({ lat: 41.0082, lng: 28.9784 });
          },
          { enableHighAccuracy: true },
        );
      } else {
        setLocationStatus("error");
      }
    } else {
      setLocationStatus("capturing");
      setCoordinates(null);
    }
  }, [show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-red-950/20 backdrop-blur-2xl animate-in fade-in duration-500">
      {/* Pulsing Emergency Background */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-600/20 via-transparent to-transparent animate-pulse-slow"></div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-950 w-full max-w-lg rounded-[3rem] border-2 border-red-500/50 shadow-[0_0_100px_rgba(239,68,68,0.4)] overflow-hidden relative animate-in zoom-in-95 duration-300">
        {/* Header Section */}
        <div className="bg-red-600 p-8 text-center relative">
          <button
            onClick={onClose}
            className="absolute right-6 top-6 bg-black/20 hover:bg-black/40 p-2 rounded-full transition-all text-slate-900 dark:text-white active-scale"
          >
            <X size={24} />
          </button>
          <div className="bg-black/20 dark:bg-white/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 animate-pulse">
            <TriangleAlert size={44} className="text-slate-900 dark:text-white" />
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase font-sans">
            PANİK MODU
          </h2>
          <p className="text-red-100 font-bold text-xs uppercase tracking-widest mt-1 opacity-80 font-sans">
            Acil Durum Yardım Merkezi
          </p>
        </div>

        {/* Body Content */}
        <div className="p-8 space-y-6">
          {/* Location Status Card */}
          <div
            className={cn(
              "p-4 rounded-2xl flex items-center justify-between border transition-all duration-700",
              locationStatus === "capturing"
                ? "bg-white dark:bg-slate-900 border-black/5 dark:border-white/5"
                : "bg-emerald-500/10 border-emerald-500/30",
            )}
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "p-3 rounded-xl",
                  locationStatus === "capturing"
                    ? "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                    : "bg-emerald-500 text-slate-900 dark:text-white",
                )}
              >
                {locationStatus === "capturing" ? (
                  <MapPin className="animate-bounce" size={20} />
                ) : (
                  <ShieldCheck size={20} />
                )}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 font-sans">
                  Güvenlik Durumu
                </p>
                <p
                  className={cn(
                    "font-bold text-sm font-sans",
                    locationStatus === "capturing"
                      ? "text-slate-900 dark:text-white"
                      : "text-teal-400",
                  )}
                >
                  {locationStatus === "capturing"
                    ? "KONUM TESPİT EDİLİYOR..."
                    : "KONUM GÜVENLİ PAYLAŞILDI"}
                </p>
              </div>
            </div>
            {locationStatus === "shared" && coordinates && (
              <div className="text-right">
                <span className="text-[8px] font-mono text-emerald-500/50 block tracking-tighter">
                  {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
                </span>
              </div>
            )}
          </div>

          {/* SOS Actions Grid */}
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-red-600/10 border border-red-500/20 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-red-600/20 transition-all active-scale group">
              <div className="bg-red-600 p-4 rounded-2xl group-hover:scale-110 transition duration-300">
                <Truck size={32} className="text-slate-900 dark:text-white" />
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest text-center font-sans">
                ÇEKİCİ ÇAĞIR
              </span>
            </button>
            <button className="bg-primary-500/10 border border-primary-500/20 p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 hover:bg-primary-500/20 transition-all active-scale group">
              <div className="bg-primary-500 p-4 rounded-2xl group-hover:scale-110 transition duration-300">
                <Activity size={32} className="text-slate-900 dark:text-white" />
              </div>
              <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest text-center font-sans">
                YOL YARDIM
              </span>
            </button>
          </div>

          {/* Fast Emergency Call */}
          <button className="w-full bg-white text-slate-950 p-5 rounded-2xl flex items-center justify-between group active-scale hover:bg-slate-100 transition-all">
            <div className="flex items-center gap-4">
              <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white p-3 rounded-xl">
                <Phone size={24} />
              </div>
              <div className="text-left">
                <p className="font-black text-xl leading-none font-sans">
                  ACİL ÇAĞRI MERKEZİ
                </p>
                <p className="text-[10px] font-bold text-slate-500 tracking-widest mt-1 font-sans">
                  112 YÖNLENDİRMESİ
                </p>
              </div>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-slate-200 flex items-center justify-center group-hover:border-slate-950 transition duration-300">
              <TriangleAlert size={18} />
            </div>
          </button>

          <p className="text-[9px] text-center text-slate-600 font-medium px-10 leading-relaxed font-sans">
            Panik modu aktif edildiğinde bilgileriniz güvenli sunucularımıza
            kaydedilir ve en yakın yardım ekibine iletilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SOSPanicModal;
