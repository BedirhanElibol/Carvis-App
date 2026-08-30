import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Car, SearchCheck, Cpu, ShieldCheck } from 'lucide-react';

const LandingFeatureCarousel = ({ language, t }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const features = [
    {
      id: "garage",
      icon: <Car size={32} className="text-sky-500" />,
      title: language === "tr" ? "Akıllı Garaj Yönetimi" : "Smart Garage Management",
      desc: language === "tr" 
        ? "Tüm araçlarınızın periyodik bakımını, muayene tarihlerini ve yakıt giderlerini tek bir ekrandan, pürüzsüz bir dijital deneyimle yönetin." 
        : "Manage periodic maintenance, inspection dates, and fuel expenses for all your vehicles from a single, seamless digital screen.",
      mockupBg: "from-sky-100 to-sky-50 dark:from-slate-800 dark:to-slate-900",
      content: (
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/5">
            <div className="flex justify-between items-center mb-4">
              <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded"></div>
              <div className="h-4 w-8 bg-sky-500/20 rounded"></div>
            </div>
            <div className="h-32 w-full bg-slate-100 dark:bg-slate-900 rounded-xl mb-4"></div>
            <div className="flex gap-2">
              <div className="h-8 w-full bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
              <div className="h-8 w-full bg-slate-100 dark:bg-slate-900 rounded-lg"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "quotes",
      icon: <SearchCheck size={32} className="text-sky-500" />,
      title: language === "tr" ? "Şeffaf Teklif Sistemi" : "Transparent Quote System",
      desc: language === "tr" 
        ? "Yüzlerce onaylı ustadan anında fiyat alın. Fiyatı, puanı ve lokasyonu karşılaştırın. Sürpriz maliyetler olmadan şeffaf bir şekilde işinizi çözün." 
        : "Get instant prices from hundreds of verified mechanics. Compare price, rating, and location without any surprise costs.",
      mockupBg: "from-slate-100 to-slate-50 dark:from-slate-900 dark:to-[#0a0f24]",
      content: (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-white/5 flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 dark:bg-slate-900 rounded-xl shrink-0"></div>
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-2 w-1/3 bg-slate-100 dark:bg-slate-900 rounded"></div>
              </div>
              <div className="w-16 h-8 bg-sky-500/10 rounded-lg"></div>
            </div>
          ))}
        </div>
      )
    },
    {
      id: "ai",
      icon: <Cpu size={32} className="text-sky-500" />,
      title: language === "tr" ? "Yapay Zeka Teşhisi" : "AI Diagnostics",
      desc: language === "tr" 
        ? "Aracınızdaki arızayı, sesi veya sorunu Rapidsy Asistanı'na anlatın. Saniyeler içinde en doğru tahmini ve ortalama maliyeti öğrenin." 
        : "Explain the fault, sound, or issue in your car to Rapidsy Assistant. Get the most accurate prediction and estimated cost in seconds.",
      mockupBg: "from-sky-50 to-white dark:from-[#0a0f24] dark:to-slate-950",
      content: (
        <div className="flex flex-col gap-4 h-full justify-end">
          <div className="bg-white dark:bg-slate-900 p-3 rounded-2xl rounded-bl-none shadow-md max-w-[80%] border border-slate-100 dark:border-white/5">
            <div className="h-2 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
            <div className="h-2 w-32 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
          <div className="bg-sky-500 text-white p-3 rounded-2xl rounded-br-none shadow-md max-w-[80%] self-end">
            <div className="h-2 w-24 bg-white/50 rounded mb-2"></div>
            <div className="h-2 w-16 bg-white/50 rounded"></div>
          </div>
        </div>
      )
    },
    {
      id: "escrow",
      icon: <ShieldCheck size={32} className="text-sky-500" />,
      title: language === "tr" ? "Doğrudan Ödeme (%0 Komisyon)" : "Direct Payment (0% Commission)",
      desc: language === "tr" 
        ? "Carvis %0 komisyonla çalışır. Randevunuzu oluşturur, ödemeyi doğrudan dükkanda partnere yaparsınız." 
        : "Carvis operates with 0% commission. Book your appointment and pay directly to the partner at the shop.",
      mockupBg: "from-slate-50 to-slate-100 dark:from-slate-950 dark:to-[#0a0f24]",
      content: (
        <div className="flex flex-col items-center justify-center h-full gap-6">
          <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center border-4 border-white dark:border-slate-900 relative">
            <ShieldCheck size={48} className="text-emerald-500" />
            <div className="absolute inset-0 rounded-full border-2 border-emerald-500 animate-ping opacity-20"></div>
          </div>
          <div className="text-center space-y-2">
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mx-auto"></div>
            <div className="h-2 w-24 bg-slate-100 dark:bg-slate-900 rounded mx-auto"></div>
          </div>
        </div>
      )
    }
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % features.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + features.length) % features.length);
  };

  // Auto play
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto px-6 py-24 relative">
      <div className="text-center mb-16">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          {language === "tr" ? "Geleceğin Otomotiv Deneyimi" : "Automotive Experience of the Future"}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mt-6 text-base md:text-lg font-medium leading-relaxed">
          {language === "tr" 
            ? "Oto sanayi stresine son. Tüm araç yaşam döngünüzü avucunuzun içinden, uçtan uca dijital olarak yönetin."
            : "End the stress of auto repair shops. Manage your entire vehicle lifecycle digitally, right from the palm of your hand."}
        </p>
      </div>

      <div className="relative bg-white dark:bg-[#030712] rounded-[3rem] border border-slate-200 dark:border-white/10 overflow-hidden min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-2 h-full absolute inset-0"
          >
            {/* Left Content */}
            <div className="p-10 md:p-16 flex flex-col justify-center h-full">
              <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-center justify-center mb-8 shadow-sm">
                {features[currentIndex].icon}
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-6 tracking-tight">
                {features[currentIndex].title}
              </h3>
              <p className="text-lg text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                {features[currentIndex].desc}
              </p>
            </div>

            {/* Right Mockup */}
            <div className={`h-full bg-gradient-to-br ${features[currentIndex].mockupBg} p-10 md:p-16 flex items-center justify-center relative overflow-hidden`}>
              {/* Subtle grid in background of mockup area */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(black 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
              
              <div className="w-full max-w-sm aspect-[9/16] bg-white/50 dark:bg-black/20 border border-white/50 dark:border-white/10 rounded-xl p-6 relative z-10">
                {/* Phone Notch/Status bar */}
                <div className="w-1/3 h-4 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-8"></div>
                {features[currentIndex].content}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="absolute bottom-6 md:bottom-10 left-10 md:left-16 flex items-center gap-4 z-20">
          <div className="flex gap-2">
            <button onClick={prevSlide} className="w-12 h-12 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/20 transition-all text-slate-900 dark:text-white">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextSlide} className="w-12 h-12 rounded-full bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 shadow-sm flex items-center justify-center hover:bg-slate-50 dark:hover:bg-white/20 transition-all text-slate-900 dark:text-white">
              <ChevronRight size={20} />
            </button>
          </div>
          <div className="flex gap-2 ml-4">
            {features.map((_, idx) => (
              <button 
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${currentIndex === idx ? 'w-8 h-2 bg-sky-500' : 'w-2 h-2 bg-slate-300 dark:bg-white/20'}`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

export default LandingFeatureCarousel;
