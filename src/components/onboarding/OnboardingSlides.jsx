import React, { useState } from "react";
 
import { motion, AnimatePresence } from "framer-motion";
import * as Icons from "lucide-react";

const slides = [
  {
    title: "Master Match",
    subtitle: "HİÇBİR ŞEYİ ŞANSA ASLA BIRAKMAYIN",
    description:
      "Yapay zeka motorunuzu tarar, doğru parçayı bulur ve yüzde yüz uyumu garantiler.",
    icon: Icons.Zap,
    color: "text-yellow-400",
    bg: "from-yellow-500/20 to-transparent",
  },
  {
    title: "BuyBox Marketplace",
    subtitle: "EN İYİ TEKLİFİ ANINDA YAKALAYIN",
    description:
      "Yüzlerce saticidan gelen fiyatlari anlik karsilastirin, en kaliteli ürünü en uygun fiyata alin.",
    icon: Icons.ShoppingBag,
    color: "text-primary-400",
    bg: "from-primary-500/20 to-transparent",
  },
  {
    title: "Şeffaf Tamir",
    subtitle: "ARACINIZ EMİN ELLERDE",
    description:
      "Servis randevularinizi takip edin, onarim aşamalarini canli izleyin ve güvenle ödeyin.",
    icon: Icons.ShieldCheck,
    color: "text-emerald-400",
    bg: "from-emerald-500/20 to-transparent",
  },
];

const OnboardingSlides = ({ onComplete }) => {
  const [current, setCurrent] = useState(0);

  const next = () => {
    if (current === slides.length - 1) {
      onComplete();
    } else {
      setCurrent((prev) => prev + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 flex flex-col justify-center items-center p-8 overflow-hidden">
      {/* Skip Button */}
      <button
        onClick={onComplete}
        className="absolute top-12 right-8 text-slate-500 font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
      >
        Atla
      </button>

      <div className="w-full max-w-sm relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="flex flex-col items-center text-center"
          >
            <div
              className={`w-32 h-32 rounded-[2.5rem] bg-gradient-to-b ${slides[current].bg} flex items-center justify-center mb-12 border border-white/5 shadow-2xl relative`}
            >
              <div className="absolute inset-0 bg-white/5 blur-xl rounded-full"></div>
              {(() => {
                const Icon = slides[current].icon;
                return (
                  <Icon
                    size={56}
                    className={`${slides[current].color} relative z-10`}
                  />
                );
              })()}
            </div>
            <h2 className="text-4xl font-black tracking-tighter text-white mb-2 uppercase">
              {slides[current].title}
            </h2>
            <p
              className={`text-[10px] font-black uppercase tracking-[0.2em] mb-6 ${slides[current].color}`}
            >
              {slides[current].subtitle}
            </p>
            <p className="text-slate-400 text-sm leading-relaxed mb-12 max-w-[280px]">
              {slides[current].description}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-2 mb-12">
          {slides.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-500 ${
                i === current ? "w-8 bg-primary-500" : "w-2 bg-slate-800"
              }`}
            />
          ))}
        </div>

        {/* Next/Finish Button */}
        <button
          onClick={next}
          className="w-full py-5 bg-white text-black rounded-3xl font-black text-xl tracking-tighter transition-all active:scale-95 hover:shadow-2xl hover:shadow-white/10 flex items-center justify-center gap-2 uppercase"
        >
          {current === slides.length - 1 ? "BAŞLAYALIM!" : "DEVAM ET"}
          <Icons.ChevronRight size={24} />
        </button>
      </div>
    </div>
  );
};

export default OnboardingSlides;
