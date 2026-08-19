import React, { useState, memo } from "react";
import { ChevronRight, FileText, Flame, HeartHandshake, Loader2, MapPin, Maximize, Navigation, ShieldCheck, Star, Video } from "lucide-react";
import { useNavigate } from "react-router-dom";
import LocationMap from "../../../components/ui/LocationMap";
import { useGarage } from "../../../context/GarageContext";

const PopularProvidersPanel = memo(({ t, isLoadingProviders, nearbyProviders, edsMarkers, mapCenter, activeVehicle }) => {
  const { currentVehicle } = useGarage();
  const targetVehicle = activeVehicle || currentVehicle;
  const [hoveredPin, setHoveredPin] = useState(null);
  const navigate = useNavigate();

  return (
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
          <Loader2 className="animate-spin w-8 h-8" />
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
                className={`bg-white dark:bg-[#0a0f24]/80 border ${hoveredPin === prov.id ? 'border-cyan-500/50 bg-teal-50/50 dark:bg-white/10' : 'border-black/5 dark:border-white/5 hover:border-slate-200 dark:border-white/10'} p-5 rounded-[2.2rem] flex flex-col justify-between gap-4 transition-all relative overflow-hidden group cursor-pointer`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-black/40 border border-slate-200 dark:border-white/10 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shadow-inner shrink-0 group-hover:scale-[1.01] transition-transform">
                      <MapPin size={22} />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-sm group-hover:text-cyan-500 dark:group-hover:text-cyan-400 transition-colors">
                        {prov.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                        {prov.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-100 dark:bg-black/40 px-2 py-1 rounded-xl shadow-inner border border-black/5 dark:border-white/5">
                    <Star size={12} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{prov.rating}</span>
                  </div>
                </div>

                <div>
                  {targetVehicle && targetVehicle.brand && (
                    <div className="mb-2">
                      <span className="text-[9px] bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-1 rounded-full font-black tracking-widest uppercase flex items-center gap-1 w-fit shadow-sm">
                        🏷️ {targetVehicle.brand} Özel Servis Uzmanı
                      </span>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    {prov.features && prov.features.map((feat, idx) => (
                      <span key={idx} className="text-[9px] bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-full font-bold tracking-widest uppercase border border-black/5 dark:border-white/5">
                        {feat}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-black/5 dark:border-white/5">
                  <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400">
                    <Navigation size={12} />
                    <span className="font-black text-[10px] uppercase tracking-widest">{prov.distance}</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); navigate("/app/mechanics"); }} className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 flex items-center gap-1 transition-colors bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 px-3 py-1.5 rounded-xl">
                    DETAY <ChevronRight size={12} />
                  </button>
                </div>

                {prov.compliance && (
                  <div className="pt-3 border-t border-black/5 dark:border-white/5 mt-1 space-y-2 text-[9px] text-slate-500 dark:text-slate-400 leading-normal font-semibold">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                        <FileText size={10} className="text-cyan-500" /> Resmi Sicil (MERSIS):
                      </span>
                      <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{prov.compliance.mersis}</span>
                    </div>
                    
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 shrink-0 mt-0.5">
                        <Flame size={10} className={prov.compliance.isCompliant ? "text-emerald-500" : "text-amber-500"} /> İtfaiye Uygunluk:
                      </span>
                      <span className={`${prov.compliance.isCompliant ? "text-emerald-500 font-bold" : "text-amber-400 font-bold"} text-right`}>{prov.compliance.fireLicense}</span>
                    </div>
                    
                    {prov.type === "Oto Servis" ? (
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1 shrink-0 mt-0.5">
                          <ShieldCheck size={10} className="text-blue-500" /> Atık Yağ Çevre Lisansı:
                        </span>
                        <span className={`${prov.compliance.isCompliant ? "text-emerald-500 font-bold" : "text-amber-400 font-bold"} text-right`}>{prov.compliance.wasteOilCert}</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                          <Maximize size={10} className="text-blue-500" /> Yükseklik Gabarisi:
                        </span>
                        <span className="text-blue-400 font-bold font-mono">{prov.compliance.clearanceHeight} Sınırı</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                        <HeartHandshake size={10} className="text-orange-500" /> Sorumluluk Sigortası:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-bold">Mesleki Sigortalı ({prov.compliance.insuranceLimit})</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                        <Video size={10} className="text-cyan-500" /> Aktif CCTV Kameralar:
                      </span>
                      <span className="text-slate-700 dark:text-slate-300 font-mono font-bold">{prov.compliance.cameraCount} Adet Denetimli Kamera</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Map View */}
          <div className="w-full lg:w-1/2 bg-slate-100 dark:bg-[#050814] border border-slate-200 dark:border-white/10 rounded-xl relative overflow-hidden shadow-inner flex items-center justify-center p-2">
            <LocationMap 
              center={mapCenter} 
              markers={[...nearbyProviders, ...edsMarkers]} 
              hoveredPin={hoveredPin} 
              zoom={13} 
            />
          </div>
        </div>
      )}
    </div>
  );
});

PopularProvidersPanel.displayName = 'PopularProvidersPanel';
export default PopularProvidersPanel;
