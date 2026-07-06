import React from "react";
import { motion } from "framer-motion";
import { Key, Car, Wrench, Package, Droplet } from "lucide-react";

export const professions = [
  {
    id: "valet",
    title: "Vale Uzmanı",
    icon: Key,
    desc: "Anlık vale taleplerini alın, araç transferlerini güvenle yapın.",
    color: "amber",
    gradient: "from-amber-500/10 to-orange-500/5",
    border: "hover:border-amber-500/30",
  },
  {
    id: "parking",
    title: "Otopark İşletmesi",
    icon: Car,
    desc: "Otopark kapasitenizi sisteme kaydedip doluluğu ve ciroyu artırın.",
    color: "cyan",
    gradient: "from-cyan-500/10 to-blue-500/5",
    border: "hover:border-cyan-500/30",
  },
  {
    id: "mechanic",
    title: "Oto Servis & Bakım",
    icon: Wrench,
    desc: "Servis randevularını yönetin, AI teşhisli teklifler gönderin.",
    color: "orange",
    gradient: "from-orange-500/10 to-red-500/5",
    border: "hover:border-orange-500/30",
  },
  {
    id: "parts",
    title: "Parça Tedarikçisi",
    icon: Package,
    desc: "Yedek parça stoklarınızı listeleyin, teklif taleplerini yanıtlayın.",
    color: "emerald",
    gradient: "from-emerald-500/10 to-teal-500/5",
    border: "hover:border-emerald-500/30",
  },
  {
    id: "carwash",
    title: "Seyyar Yıkama",
    icon: Droplet,
    desc: "Mobil yıkama araçlarınızla müşterilerin kapısına giderek hizmet verin.",
    color: "cyan",
    gradient: "from-cyan-500/10 to-blue-500/5",
    border: "hover:border-cyan-500/30",
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
          Carvis ekosisteminde hangi rolde gelir kazanıp hizmet sunmak istediğinizi belirtin.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
        {professions.map((prof) => {
          const isSelected = profession === prof.id;
          const Icon = prof.icon;
          return (
            <button
              key={prof.id}
              onClick={() => setProfession(prof.id)}
              className={`p-6 rounded-3xl border transition-all text-left flex items-start gap-4 ${prof.border} ${
                isSelected 
                  ? 'border-primary-500 bg-primary-500/5 shadow-[0_0_15px_rgba(37,99,235,0.05)]' 
                  : 'border-black/5 dark:border-white/5 bg-slate-50 dark:bg-slate-950/30'
              }`}
            >
              <div className={`p-3 rounded-2xl bg-black/20 text-slate-900 dark:text-white border border-black/5 dark:border-white/5`}>
                <Icon size={20} />
              </div>
              <div>
                <h4 className="font-black text-slate-900 dark:text-white text-base tracking-tight uppercase font-sans">{prof.title}</h4>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-1">{prof.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-6 flex justify-end">
        <button 
          onClick={handleNext}
          className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_15px_rgba(37,99,235,0.2)] active-scale"
        >
          DEVAM ET
        </button>
      </div>
    </motion.div>
  );
};

export default ProfessionSelectionStep;
