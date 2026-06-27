import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ProactiveAlerts = ({ vehicle }) => {
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    // Akıllı Uyarı Simülasyonu
    const hour = new Date().getHours();
    let selectedAlert = null;

    if (hour >= 6 && hour < 11) {
      selectedAlert = {
        type: "morning",
        icon: <Icons.Sunrise className="text-amber-500" size={24} />,
        title: "Günaydın!",
        message: `${vehicle?.make || 'Aracınız'} güne hazır. Trafik yoğunluğu normal görünüyor, güvenli sürüşler.`,
        bg: "from-amber-500/10 to-transparent",
        border: "border-amber-500/20"
      };
    } else if (hour >= 18 || hour < 5) {
      selectedAlert = {
        type: "evening",
        icon: <Icons.Moon className="text-indigo-400" size={24} />,
        title: "İyi Akşamlar",
        message: "Bugün harika bir sürüş çıkardınız. Farlarınızı kontrol etmeyi unutmayın.",
        bg: "from-indigo-500/10 to-transparent",
        border: "border-indigo-500/20"
      };
    } else {
      // Rastgele gün içi uyarı (Simüle edilmiş hava durumu veya bakım)
      const isCold = Math.random() > 0.5;
      if (isCold) {
        selectedAlert = {
          type: "weather",
          icon: <Icons.CloudSnow className="text-cyan-400" size={24} />,
          title: "Hava Serin (4°C)",
          message: "Yola çıkmadan önce lastik basınçlarınızı ve silecek suyunuzu kontrol etmenizi öneririz.",
          bg: "from-cyan-500/10 to-transparent",
          border: "border-cyan-500/20"
        };
      } else {
        selectedAlert = {
          type: "maintenance",
          icon: <Icons.Sparkles className="text-teal-400" size={24} />,
          title: "Sistem Taraması Temiz",
          message: "Aracınızın tüm verileri optimum seviyede. Bir sonraki periyodik bakıma 4.500 km var.",
          bg: "from-teal-500/10 to-transparent",
          border: "border-teal-500/20"
        };
      }
    }

    setAlert(selectedAlert);
  }, [vehicle]);

  if (!alert) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`mb-6 p-4 rounded-3xl border ${alert.border} bg-gradient-to-r ${alert.bg} bg-white dark:bg-slate-900 shadow-sm relative overflow-hidden`}
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
          {alert.icon}
        </div>
        <div className="flex items-start gap-4 relative z-10">
          <div className="mt-1 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-black/5 dark:border-white/5">
            {alert.icon}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                {alert.title}
              </h4>
              <span className="text-[10px] font-bold text-slate-500 uppercase bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                Canlı
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {alert.message}
            </p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProactiveAlerts;
