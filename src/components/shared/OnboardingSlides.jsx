import React, { useState } from "react";
import * as Icons from "lucide-react";
const SLIDES = [
  {
    icon: Icons.Car,
    color: "from-blue-500 to-primary-600",
    title: "Garajınızı Oluşturun",
    subtitle:
      "Aracınızı ekleyin, size özel parça ve servis önerileri alın. VIN ile otomatik tanımlama yapabilirsiniz.",
    highlight: "%100 doğru parça eşleştirme",
  },
  {
    icon: Icons.Sparkles,
    color: "from-primary-500 to-primary-700",
    title: "AI Ekspertiniz Hazır",
    subtitle:
      "Fotoğraf çekin — hasar analizi yapsın. Arıza kodlarını çözümlesin. Aracınıza özel tavsiyeler versin.",
    highlight: "Gemini Pro ile güçlendirilmiş",
  },
  {
    icon: Icons.ShoppingBag,
    color: "from-emerald-500 to-green-700",
    title: "Pazar Yeri & BuyBox",
    subtitle:
      "Onlarca satıcıdan en uygun fiyatı otomatik bulun. Sertifikalı parçalar ve güvenli alışveriş.",
    highlight: "Akıllı fiyat karşılaştırma",
  },
  {
    icon: Icons.MapPin,
    color: "from-amber-500 to-orange-600",
    title: "En Yakın Usta",
    subtitle:
      "Harita üzerinde size en yakın usta ve servis noktalarını bulun. Acil yol yardımı çağırın.",
    highlight: "SOS & 7/24 acil destek",
  },
];
const OnboardingSlides = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;
  const Icon = slide.icon;
  const handleNext = () => {
    if (isLast) {
      localStorage.setItem("__SAFE_TOKEN_6__carvis_onboarding__END_TOKEN_6___seen", "true");
      onComplete();
    } else {
      setCurrentSlide((prev) => prev + 1);
    }
  };
  const handleSkip = () => {
    localStorage.setItem("__SAFE_TOKEN_6__carvis_onboarding__END_TOKEN_6___seen", "true");
    onComplete();
  };
  return (
    <div className="fixed inset-0 z-[999] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-between p-8 animate-fade-in">
      {" "}
      {/* Skip */}{" "}
      <div className="w-full flex justify-end">
        {" "}
        <button
          onClick={handleSkip}
          className="text-slate-600 hover:text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-colors"
        >
          {" "}
          Atla <Icons.X size={14} />{" "}
        </button>{" "}
      </div>{" "}
      {/* Content */}{" "}
      <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm">
        {" "}
        {/* Icon */}{" "}
        <div className="relative mb-10">
          {" "}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${slide.color} rounded-full blur-3xl opacity-30 scale-150`}
          />{" "}
          <div
            className={`relative bg-gradient-to-br ${slide.color} p-8 rounded-[2.5rem] shadow-2xl border border-black/10 dark:border-white/10`}
          >
            {" "}
            <Icon size={48} className="text-slate-900 dark:text-white" />{" "}
          </div>{" "}
        </div>{" "}
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter mb-3">
          {slide.title}
        </h2>{" "}
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-5">
          {slide.subtitle}
        </p>{" "}
        <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest bg-primary-500/10 px-4 py-2 rounded-xl border border-primary-500/20">
          {" "}
          {slide.highlight}{" "}
        </span>{" "}
      </div>{" "}
      {/* Navigation */}{" "}
      <div className="w-full max-w-sm space-y-5">
        {" "}
        {/* Progress Dots */}{" "}
        <div className="flex justify-center gap-2">
          {" "}
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === currentSlide ? "w-8 bg-primary-500" : "w-1.5 bg-slate-700"}`}
            />
          ))}{" "}
        </div>{" "}
        {/* Next Button */}{" "}
        <button
          onClick={handleNext}
          className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.2em] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center gap-3 ${isLast ? "bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white shadow-primary-900/40" : "bg-white text-slate-950 hover:bg-slate-100 shadow-white/10"}`}
        >
          {" "}
          {isLast ? "Başlayalım!" : "Devam"}{" "}
          <Icons.ChevronRight size={18} />{" "}
        </button>{" "}
      </div>{" "}
    </div>
  );
};
export default OnboardingSlides;
