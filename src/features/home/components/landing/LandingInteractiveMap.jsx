import React, { memo } from "react";
import { ChevronRight, Star, Loader2, FileText, Flame, ShieldCheck, Maximize, HeartHandshake, Video } from "lucide-react";
import LocationMap from "../../../../components/ui/LocationMap";

const LandingInteractiveMap = memo(({t, language, isLoadingProviders, nearbyProviders, edsMarkers, mapCenter, hoveredPin, setHoveredPin, openModal}) => {
  return (
    <>
        {/* INTERACTIVE MAP PREVIEW (Nearby Providers with Hover Pins) */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-24 relative">
          <div className="text-center mb-12">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-orange-400">{t.rapidsyNetwork}</span>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mt-2 tracking-tight uppercase">
              {language === "tr" ? "TÜRKİYE GENELİ SERVİS AĞI" : "NATIONWIDE SERVICE NETWORK"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto mt-4 text-sm md:text-base leading-relaxed">
              {language === "tr" ? "Sadece İstanbul'da değil, Anadolu'nun dört bir yanındaki onaylı ustalar ve vale noktaları Rapidsy güvencesiyle hizmetinizde." : "Not just in Istanbul, but certified mechanics and valet points all across the country at your service."}
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 h-[600px] w-full">
            {/* Left Column: Provider Cards */}
            <div className="w-full lg:w-[400px] flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingProviders ? (
                <div className="flex justify-center items-center h-full text-slate-500">
                  <Loader2 className="animate-spin w-8 h-8" />
                </div>
              ) : nearbyProviders.length === 0 ? (
                <div className="flex justify-center items-center h-full text-slate-500 text-sm font-bold">
                  {t.noServiceFound}
                </div>
              ) : (
                nearbyProviders.map((prov, index) => (
                  <div 
                    key={`${prov.id}-${index}`}
                    onMouseEnter={() => setHoveredPin(prov.id)}
                    onMouseLeave={() => setHoveredPin(null)}
                    onClick={() => openModal("login", "customer")}
                    className={`bg-white/80 dark:bg-black/40 border ${hoveredPin === prov.id ? 'border-orange-500/50 bg-black/10 dark:bg-emerald-500/10' : 'border-black/5 dark:border-emerald-500/10 hover:border-black/20 dark:hover:border-emerald-500/30'} p-5 rounded-3xl transition-all cursor-pointer group flex flex-col gap-3 shadow-xl backdrop-blur-md`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-tight text-sm group-hover:text-orange-400 transition-colors">{prov.name}</h4>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mt-1">{prov.type}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 shadow-sm px-2 py-1 rounded-lg border border-black/5 dark:border-white/5">
                        <Star size={10} className="text-yellow-400 fill-yellow-400" />
                        {prov.rating}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2 pb-2 border-b border-black/5 dark:border-white/5">
                      <span className="text-[10px] font-black text-teal-400 uppercase tracking-widest">{prov.distance}</span>
                      <button className="text-[9px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:text-white flex items-center gap-1 transition-colors">
                        {t.inspectBtn} <ChevronRight size={10} />
                      </button>
                    </div>

                    {prov.compliance && (
                      <div className="pt-2 space-y-2 text-[9px] text-slate-500 dark:text-slate-400 leading-normal font-semibold">
                        <div className="flex items-center justify-between">
                          <span className="font-bold uppercase tracking-wider text-[8px] flex items-center gap-1">
                            <FileText size={10} className="text-teal-500" /> Resmi Sicil (MERSIS):
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
                ))
              )}
            </div>

            {/* Right Column: Interactive Map Component */}
            <div className="flex-1 bg-slate-50 dark:bg-[#050814] border border-slate-200 dark:border-white/10 rounded-[2.5rem] relative overflow-hidden shadow-2xl flex items-center justify-center p-2">
              <LocationMap 
                center={mapCenter} 
                markers={[...nearbyProviders, ...edsMarkers]} 
                hoveredPin={hoveredPin} 
                zoom={5.7} 
              />
            </div>
          </div>
        </section>

    </>
  );
});

LandingInteractiveMap.displayName = 'LandingInteractiveMap';
export default LandingInteractiveMap;
