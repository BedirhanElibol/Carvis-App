import React, { memo } from "react";
import { ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { triggerHaptic } from "../../../utils/haptics";

const FeaturedDealsPanel = memo(({ t, featuredDeals, showAlert }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <div>
          <h3 className="text-lg font-black tracking-tight text-slate-900 dark:text-white uppercase">
            {t.specialDeals}
          </h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
            {t.specialDealsDesc}
          </p>
        </div>
        <span className="text-[10px] font-black text-cyan-400 uppercase tracking-wider">
          {t.catchDeals}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {featuredDeals.map((deal) => (
          <div 
            key={deal.id}
            className="bg-white dark:bg-[#0a0f24]/80 border border-black/5 dark:border-white/5 rounded-[2.2rem] p-4.5 flex flex-col justify-between hover:border-slate-200 dark:border-white/10 transition-all group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl pointer-events-none"></div>
            
            <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-white dark:bg-slate-900 mb-4 border border-black/5 dark:border-white/5">
              <img 
                src={deal.image} 
                alt={deal.title} 
                className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-500" 
              />
              <span className="absolute top-2 left-2 px-2.5 py-1 rounded-lg bg-cyan-500/80 text-[8px] font-black uppercase text-slate-900 dark:text-white tracking-widest shadow-md">
                {deal.badge}
              </span>
              <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[8px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                <Star size={10} className="text-yellow-400 fill-yellow-400" />
                {deal.rating} ({deal.reviewsCount})
              </div>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block mb-1">
                {deal.provider}
              </span>
              <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                {deal.title}
              </h4>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-black/5 dark:border-white/5 pt-3">
              <div>
                {deal.originalPrice > 0 && (
                  <span className="text-[9px] text-slate-500 line-through font-mono">
                    ₺{deal.originalPrice.toLocaleString("tr-TR")}
                  </span>
                )}
                <p className="text-sm font-black text-cyan-400 font-mono">
                  {deal.price === 0 ? "Ücretsiz" : `₺${deal.price.toLocaleString("tr-TR")}`}
                </p>
              </div>
              <button
                onClick={() => {
                  triggerHaptic("success");
                  showAlert(t.dealSelected, `${deal.title} ${t.dealSelectedDesc}`, "success");
                  navigate("/app/mechanics");
                }}
                className="px-4 py-2 rounded-xl bg-white dark:bg-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-white/10 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                {t.bookAppointment} <ChevronRight size={10} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

FeaturedDealsPanel.displayName = 'FeaturedDealsPanel';
export default FeaturedDealsPanel;
