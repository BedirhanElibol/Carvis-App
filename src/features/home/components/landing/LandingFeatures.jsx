import React from "react";
import { Cpu, Repeat, Zap } from "lucide-react";

const LandingFeatures = ({ language }) => {
  return (
    <section className="w-full bg-slate-50 dark:bg-[#0a0f1c] transition-colors duration-500 py-20 relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 rounded-2xl p-8 flex flex-col gap-4 shadow-sm dark:shadow-none transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 mb-2">
              <Cpu size={20} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {language === "tr" ? "Şeffaf & Adil" : "Transparent & Fair"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
              {language === "tr" 
                ? "Sistem parçaları ve işçiliği ayrı hesaplar. Sürpriz maliyetler, gizli ücretler olmadan sadece ihtiyacınız olana ödeme yaparsınız." 
                : "The system calculates parts and labor separately. No surprise costs, no hidden fees. You only pay for what you need."}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 rounded-2xl p-8 flex flex-col gap-4 shadow-sm dark:shadow-none transition-colors">
            <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-2">
              <Repeat size={20} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {language === "tr" ? "Uçtan Uca Süreç" : "End-to-End Process"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
              {language === "tr" 
                ? "Tek platform üzerinden vale talebinden, usta seçimine, onarımdan teslimata kadar tüm süreci mesajlaşarak veya anlık takip edebilirsiniz." 
                : "Track the entire process from valet request to mechanic selection, repair, and delivery through a single platform."}
            </p>
          </div>

          <div className="bg-white dark:bg-[#0f1423] border border-slate-200 dark:border-white/5 rounded-2xl p-8 flex flex-col gap-4 shadow-sm dark:shadow-none transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
              <Zap size={20} />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
              {language === "tr" ? "Anında Aksiyon" : "Instant Action"}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
              {language === "tr" 
                ? "Bekleme ekranları yok. Talebinizi oluşturduğunuz an bölgenizdeki en uygun ustaların ekranına düşer ve hızla teklifler gelmeye başlar." 
                : "No waiting screens. The moment you create your request, it appears on the screens of the best mechanics in your area."}
            </p>
          </div>

        </div>

      </div>
    </section>
  );
};

export default LandingFeatures;
