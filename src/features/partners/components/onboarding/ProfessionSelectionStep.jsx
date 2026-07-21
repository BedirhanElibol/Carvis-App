import React from "react";
import { motion } from "framer-motion";
import { Key, Car, Wrench, Package, Droplet, Truck, Shield } from "lucide-react";

const professions = [
  {
    id: "mechanic",
    title: "Oto Servis & Bakım",
    icon: Wrench,
    desc: "Servis randevularını yönetin, AI teşhisli teklifler gönderin, uzmanlık alanlarınızı sergileyin.",
    color: "orange",
    gradient: "from-orange-500/10 to-red-500/5",
    border: "hover:border-orange-500/30",
    iconBg: "bg-orange-500/10 text-orange-500",
  },
  {
    id: "parts",
    title: "Parça Tedarikçisi",
    icon: Package,
    desc: "Yedek parça stoklarınızı listeleyin. OEM, çıkma veya muadil ayrımıyla güven kazanın.",
    color: "emerald",
    gradient: "from-emerald-500/10 to-teal-500/5",
    border: "hover:border-emerald-500/30",
    iconBg: "bg-emerald-500/10 text-emerald-500",
  },
  {
    id: "carwash",
    title: "Seyyar Yıkama",
    icon: Droplet,
    desc: "Mobil yıkama araçlarınızla müşterilerin kapısına gidin. Detailing ve ozon hizmetleri ekleyin.",
    color: "cyan",
    gradient: "from-cyan-500/10 to-blue-500/5",
    border: "hover:border-cyan-500/30",
    iconBg: "bg-cyan-500/10 text-cyan-500",
  },
  {
    id: "parking",
    title: "Otopark İşletmesi",
    icon: Car,
    desc: "Otopark doluluk kapasitenizi, saatlik ücretlerinizi ve Rapidsy rezervasyonlarını yönetin.",
    color: "amber",
    gradient: "from-amber-500/10 to-orange-500/5",
    border: "hover:border-amber-500/30",
    iconBg: "bg-amber-500/10 text-amber-500",
  },
  {
    id: "insurance",
    title: "Sigorta Şirketi",
    icon: Shield,
    desc: "Kasko, trafik ve ferdi kaza ürünlerinizi sergileyin. Araç sahiplerine dijital poliçe teklif edin.",
    color: "blue",
    gradient: "from-blue-500/10 to-indigo-500/5",
    border: "hover:border-blue-500/30",
    iconBg: "bg-blue-500/10 text-blue-500",
  },
];

const ProfessionSelectionStep = ({ profession, setProfession, handleNext }) => {
  return (
    <motion.div
      key="step1"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6 relative z-10 text-center"
    >
      <div>
        <span className="text-[9px] font-black tracking-widest text-primary-400 uppercase">AŞAMA 1</span>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mt-1 mb-2 font-sans">
          Mesleğinizi Seçin
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-md mx-auto leading-relaxed">
          Rapidsy ekosisteminde hangi rolde gelir kazanıp hizmet sunmak istediğinizi belirtin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
        {professions.map((prof) => {
          const isSelected = profession === prof.id;
          const Icon = prof.icon;
          return (
            <button
              key={prof.id}
              onClick={() => setProfession(prof.id)}
              className={`p-5 rounded-2xl border transition-all text-left flex items-start gap-4 ${prof.border} ${
                isSelected
                  ? "border-primary-500 bg-primary-500/5 shadow-xl"
                  : "border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-950/30 hover:bg-white dark:hover:bg-slate-900/50"
              }`}
            >
              <div className={`p-2.5 rounded-xl shrink-0 ${prof.iconBg}`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-slate-900 dark:text-white text-sm tracking-tight uppercase font-sans">
                  {prof.title}
                </h4>
                <p className="text-slate-500 text-xs font-medium leading-relaxed mt-1">{prof.desc}</p>
              </div>
              {isSelected && (
                <div className="ml-auto shrink-0">
                  <div className="w-4 h-4 rounded-full bg-primary-500 flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-xl active-scale"
        >
          DEVAM ET
        </button>
      </div>
    </motion.div>
  );
};

export default ProfessionSelectionStep;

