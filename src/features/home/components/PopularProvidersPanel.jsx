import React from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { triggerHaptic } from "../../../utils/haptics";
import { useUI } from "../../../context/UIContext";
import { popularProviders } from "../data/constants";

export const PopularProvidersPanel = () => {
  const navigate = useNavigate();
  const { showAlert } = useUI();
  return (
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
};
