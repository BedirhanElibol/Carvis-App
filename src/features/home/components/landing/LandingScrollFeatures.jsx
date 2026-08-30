import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Car, SearchCheck, Cpu, ShieldCheck, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FeatureTextItem = ({ feature, index, scrollYProgress, navigate, language }) => {
  const start = index * 0.25;
  const end = (index + 1) * 0.25;
  
  // Strictly increasing domain mapped inside the [start, end] chunk
  const fadeInStart = start;
  const fadeInEnd = start + 0.05;
  const fadeOutStart = end - 0.05;
  const fadeOutEnd = end;
  
  // Active range for opacity
  const opacity = useTransform(
    scrollYProgress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [0, 1, 1, 0]
  );

  // Slight upward movement as it fades out
  const y = useTransform(
    scrollYProgress,
    [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd],
    [20, 0, 0, -20]
  );

  // Pointer events should only be active when fully visible to prevent blocking
  const pointerEvents = useTransform(scrollYProgress, (v) => 
    (v >= start && v <= end) ? "auto" : "none"
  );

  return (
    <motion.div
      style={{ opacity, y, pointerEvents }}
      className="absolute inset-0 flex flex-col justify-center"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-10 h-10 rounded-xl ${feature.color} flex items-center justify-center shadow-lg`}>
          {feature.icon}
        </div>
        <span className="text-[10px] md:text-xs font-black tracking-widest uppercase text-slate-500 dark:text-slate-400">
          {feature.badge}
        </span>
      </div>
      
      <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1] mb-6 whitespace-pre-line">
        {feature.title}
      </h2>
      
      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-lg">
        {feature.desc}
      </p>

      {/* Only show button on last slide */}
      {index === 3 && (
        <motion.button 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={() => navigate("/application/home")}
          className="mt-8 self-start px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full font-black text-sm uppercase tracking-widest hover:scale-[1.01] transition-transform"
        >
          {language === "tr" ? "HEMEN BAŞLA" : "START NOW"}
        </motion.button>
      )}
    </motion.div>
  );
};

const FeatureMockupItem = ({ feature, index, scrollYProgress }) => {
  const start = index * 0.25;
  const end = (index + 1) * 0.25;
  
  const fadeInStart = start;
  const fadeInEnd = start + 0.05;
  
  // Cards stack up. New card comes from bottom.
  const y = useTransform(
    scrollYProgress,
    [fadeInStart, fadeInEnd, end],
    [150, 0, -20 * index] // Stack slightly upward as we scroll past
  );

  const scale = useTransform(
    scrollYProgress,
    [start, end - 0.05, end],
    [1, 1, 0.95] // Scale down slightly when it becomes background
  );

  const opacity = useTransform(
    scrollYProgress,
    [fadeInStart, fadeInEnd],
    [0, 1]
  );
  
  // Z-index ensures newer cards appear on top
  const zIndex = index * 10;

  return (
    <motion.div
      style={{ y, scale, opacity, zIndex }}
      className="absolute w-full max-w-[320px] md:max-w-[400px] transform-gpu"
    >
      {feature.content}
    </motion.div>
  );
};

const LandingScrollFeatures = ({ language, t }) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  
  // Track scroll progress within the container.
  // Note: Framer Motion internally throttles and uses requestAnimationFrame for 60fps rendering.
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const features = [
    {
      id: "garage",
      icon: <Car size={32} className="text-white" />,
      badge: language === "tr" ? "01 / AKILLI GARAJ" : "01 / SMART GARAGE",
      title: language === "tr" ? "Tüm Araçlarınız\nTek Ekranda." : "All Your Vehicles\nOn One Screen.",
      desc: language === "tr" 
        ? "Araçlarınızın periyodik bakımını, muayene tarihlerini, MTV ödemelerini ve yakıt tüketimini kusursuz bir arayüzden yönetin. Hiçbir tarihi kaçırmayın." 
        : "Manage periodic maintenance, inspection dates, taxes, and fuel consumption from a flawless interface. Never miss a date.",
      color: "bg-sky-500",
      content: (
        <div className="flex flex-col gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200/50 dark:border-white/10 w-full">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <Car size={24} className="text-slate-400" />
                </div>
                <div>
                  <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded-full mb-2"></div>
                  <div className="h-3 w-24 bg-slate-800 dark:bg-slate-200 rounded-full"></div>
                </div>
              </div>
              <div className="h-8 w-8 rounded-full border-2 border-green-500 flex items-center justify-center">
                <Check size={14} className="text-green-500" />
              </div>
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-950/50">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                    <div className="h-2 w-20 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
                  </div>
                  <div className="h-2 w-12 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    },
    {
      id: "quotes",
      icon: <SearchCheck size={32} className="text-white" />,
      badge: language === "tr" ? "02 / ŞEFFAF İHALE" : "02 / TRANSPARENT BIDS",
      title: language === "tr" ? "Fiyatları Karşılaştır.\nKazan." : "Compare Prices.\nWin.",
      desc: language === "tr" 
        ? "Bulunduğunuz konumdaki onaylı ustalar arızanız için birbiriyle yarışsın. Fiyat, puan ve lokasyon kıyaslamasıyla en uygun servisi seçin." 
        : "Let verified mechanics in your area compete for your repair. Choose the best service by comparing price, rating, and location.",
      color: "bg-blue-600",
      content: (
        <div className="flex flex-col gap-4">
          <div className="relative">
            {/* Background blurred card */}
            <div className="absolute top-4 -right-4 w-full h-full bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-200/50 dark:border-white/5 blur-sm z-0 scale-95"></div>
            
            {/* Foreground card */}
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-200/50 dark:border-white/10 w-full relative z-10">
              <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <div className="h-2 w-20 bg-slate-300 dark:bg-slate-600 rounded-full mb-2"></div>
                  <div className="text-2xl font-black text-slate-900 dark:text-white">₺2.450</div>
                </div>
                <div className="px-3 py-1 bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold rounded-full uppercase tracking-wider">
                  EN İYİ TEKLİF
                </div>
              </div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-[10px] font-bold text-blue-600">A.S</div>
                <div>
                  <div className="h-2 w-24 bg-slate-800 dark:bg-slate-200 rounded-full mb-1"></div>
                  <div className="h-1.5 w-16 bg-slate-300 dark:bg-slate-600 rounded-full"></div>
                </div>
              </div>
              <div className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold text-center">
                TEKLİFİ ONAYLA
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "ai",
      icon: <Cpu size={32} className="text-white" />,
      badge: language === "tr" ? "03 / YAPAY ZEKA" : "03 / ARTIFICIAL INTELLIGENCE",
      title: language === "tr" ? "Arızayı Anlat.\nÇözümü Gör." : "Explain the Fault.\nSee the Solution.",
      desc: language === "tr" 
        ? "Aracınızdan gelen sesi, yanan arıza lambasını veya sorunu Rapidsy Asistan'a anlatın. Anında teşhis ve tahmini onarım maliyeti cebinize gelsin." 
        : "Describe the sound, warning light, or issue to Rapidsy Assistant. Get instant diagnostics and estimated repair costs right in your pocket.",
      color: "bg-indigo-600",
      content: (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-200/50 dark:border-white/10 w-full flex flex-col h-64 relative overflow-hidden">
          {/* Decorative AI background */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 50% 0%, #4f46e5 0%, transparent 70%)' }}></div>
          
          <div className="flex-1 space-y-4 relative z-10 flex flex-col justify-end">
            <div className="self-end bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tr-sm max-w-[80%]">
              <div className="h-2 w-32 bg-slate-400 dark:bg-slate-500 rounded-full mb-2"></div>
              <div className="h-2 w-20 bg-slate-400 dark:bg-slate-500 rounded-full"></div>
            </div>
            
            <div className="self-start bg-indigo-500 text-white p-4 rounded-2xl rounded-tl-sm max-w-[85%] shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <Cpu size={14} className="text-indigo-200" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-100">RAPIDSY AI</span>
              </div>
              <div className="h-2 w-36 bg-indigo-200/50 rounded-full mb-2"></div>
              <div className="h-2 w-full bg-indigo-200/50 rounded-full mb-2"></div>
              <div className="h-2 w-24 bg-indigo-200/50 rounded-full"></div>
            </div>
          </div>
        </div>
      )
    },
    {
      id: "escrow",
      icon: <ShieldCheck size={32} className="text-white" />,
      badge: language === "tr" ? "04 / DOĞRUDAN ÖDEME" : "04 / DIRECT PAYMENT",
      title: language === "tr" ? "%0 Komisyon.\nDoğrudan Anlaşma." : "0% Commission.\nDirect Payment.",
      desc: language === "tr" 
        ? "Carvis %0 komisyon ile çalışır. Teklifinizi seçip randevunuzu onaylayın, ödemeyi doğrudan dükkanda partnere %0 komisyonla yapın." 
        : "Carvis operates with 0% commission. Choose your bid, confirm appointment, and pay directly to the partner with 0% commission.",
      color: "bg-emerald-500",
      content: (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-8 border border-slate-200/50 dark:border-white/10 w-full flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-emerald-500/5"></div>
          
          <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center relative z-10 mb-6 border-4 border-white dark:border-slate-800">
            <div className="absolute inset-0 rounded-full border border-emerald-500 animate-ping opacity-20"></div>
            <ShieldCheck size={32} className="text-emerald-500" />
          </div>
          
          <div className="text-center relative z-10 w-full">
            <div className="h-2 w-24 bg-emerald-200 dark:bg-emerald-900 rounded-full mx-auto mb-3"></div>
            <div className="h-4 w-40 bg-slate-800 dark:bg-white rounded-full mx-auto mb-6"></div>
            
            <div className="w-full bg-slate-100 dark:bg-slate-950 rounded-xl p-4 flex items-center justify-between border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-5 bg-slate-300 dark:bg-slate-700 rounded flex items-center justify-center text-[8px] font-black text-white">VISA</div>
                <div className="h-2 w-12 bg-slate-300 dark:bg-slate-700 rounded-full"></div>
              </div>
              <div className="h-4 w-4 rounded-full bg-emerald-500 flex items-center justify-center">
                <Check size={10} className="text-white" />
              </div>
            </div>
          </div>
        </div>
      )
    }
  ];

  return (
    <section className="bg-slate-50 dark:bg-slate-950 w-full relative">
      {/* 
        Container height determines how long the scroll journey lasts.
        400vh means 4 screen heights of scrolling while the content stays sticky.
      */}
      <div ref={containerRef} className="h-[400vh] relative" style={{ position: "relative" }}>
        
        {/* Sticky Container */}
        <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            
            {/* Left Side: Dynamic Text */}
            <div className="relative h-[40vh] lg:h-[60vh] flex items-center">
              {features.map((feature, index) => (
                <FeatureTextItem
                  key={feature.id}
                  feature={feature}
                  index={index}
                  scrollYProgress={scrollYProgress}
                  navigate={navigate}
                  language={language}
                />
              ))}
            </div>

            {/* Right Side: Stacking Cards Mockups */}
            <div className="relative h-[40vh] lg:h-[60vh] flex items-center justify-center lg:justify-end perspective-1000">
              {features.map((feature, index) => (
                <FeatureMockupItem
                  key={`mockup-${feature.id}`}
                  feature={feature}
                  index={index}
                  scrollYProgress={scrollYProgress}
                />
              ))}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingScrollFeatures;
