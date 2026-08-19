import React, { memo } from "react";
import { Store } from "lucide-react";
import { useNavigate } from "react-router-dom";

const LandingBusinessPortalCTA = memo(({t}) => {
  const navigate = useNavigate();
  return (
    <>
        {/* BOTTOM BUSINESS PORTAL CTA */}
        <section className="w-full max-w-7xl mx-auto px-6 mb-28 text-center relative">
          <div className="max-w-4xl mx-auto bg-gradient-to-b from-white to-slate-50 dark:from-[#090e21] dark:to-[#040713] border border-slate-200 dark:border-white/10 rounded-[3rem] p-10 md:p-16 relative overflow-hidden">
            {/* Background elements */}
            

            <div className="relative z-10 flex flex-col items-center">
              <span className="text-orange-400 text-xs font-black uppercase tracking-widest mb-4">
                {t.rapidsyForBusiness}
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">
                {t.digitizeYourShop}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm md:text-base max-w-2xl leading-relaxed mb-8">
                {t.businessPortalDesc}
              </p>
              
              <button
                onClick={() => navigate("/partner-login")}
                className="group px-8 py-4.5 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-400 hover:to-amber-500 text-slate-900 dark:text-white font-black text-sm uppercase tracking-widest shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-2.5 cursor-pointer border-none"
              >
                <Store size={18} className="text-orange-100 group-hover:rotate-6 transition-transform" />
                {t.registerBusiness}
              </button>
            </div>
          </div>
        </section>

    </>
  );
});

LandingBusinessPortalCTA.displayName = 'LandingBusinessPortalCTA';
export default LandingBusinessPortalCTA;
