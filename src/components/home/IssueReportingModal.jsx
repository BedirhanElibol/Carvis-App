import React from "react";
import { X, Wrench, Thermometer, Disc, Droplets, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { triggerHaptic } from "../../utils/haptics";

const IssueReportingModal = ({ isOpen, onClose, t }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSelectService = (serviceType) => {
    triggerHaptic("light");
    onClose();
    // Redirect to Mechanics Screen with maintenance flow and pre-selected context
    navigate("/app/mechanics", { state: { flow: "maintenance", serviceType } });
  };

  const services = [
    {
      id: "repair",
      title: "Arıza / Sorun Bildir",
      desc: "Beklenmedik bir sorun yaşıyorum",
      icon: Thermometer,
      color: "text-red-500",
      bg: "bg-red-500/10",
      border: "border-red-500/20"
    },
    {
      id: "maintenance",
      title: "Periyodik Bakım",
      desc: "Yağ, filtre ve genel kontrol zamanı geldi",
      icon: Wrench,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      id: "tire",
      title: "Lastik & Rot Balans",
      desc: "Lastik değişimi veya ayar ihtiyacım var",
      icon: Disc,
      color: "text-cyan-500",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20"
    },
    {
      id: "wash",
      title: "Temizlik & Detaylı Bakım",
      desc: "İç-dış yıkama, seramik kaplama",
      icon: Droplets,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    }
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        ></motion.div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-sm bg-white dark:bg-[#0f172a] rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-black/5 dark:border-white/5 relative bg-slate-50 dark:bg-slate-900/50">
            <button
              onClick={onClose}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
            <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
              Sorun Bildir
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Aracınızla ilgili nasıl bir işlem yaptırmak istiyorsunuz?
            </p>
          </div>

          {/* Body */}
          <div className="p-4 overflow-y-auto space-y-3">
            {services.map((service) => (
              <button
                key={service.id}
                onClick={() => handleSelectService(service.id)}
                className="w-full text-left p-4 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-all flex items-center gap-4 group active-scale"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${service.bg} ${service.color} ${service.border}`}>
                  <service.icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{service.title}</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{service.desc}</p>
                </div>
                <ChevronRight size={18} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default IssueReportingModal;
