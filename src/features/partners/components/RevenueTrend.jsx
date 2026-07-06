import React from "react";
import { Minus, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const RevenueTrend = ({ color = "primary" }) => {
  // Week data will be fetched dynamically
  const data = [
    { day: "Pzt", value: 0, label: "₺0" },
    { day: "Sal", value: 0, label: "₺0" },
    { day: "Çar", value: 0, label: "₺0" },
    { day: "Per", value: 0, label: "₺0" },
    { day: "Cum", value: 0, label: "₺0" },
    { day: "Cmt", value: 0, label: "₺0" },
    { day: "Paz", value: 0, label: "₺0" },
  ];

  const colorConfig = {
    primary: "from-primary-500 to-teal-500",
    cyan: "from-cyan-500 to-blue-600",
    amber: "from-amber-500 to-orange-600",
    orange: "from-orange-500 to-red-600",
    emerald: "from-emerald-500 to-teal-600",
  };

  const gradient = colorConfig[color] || colorConfig.primary;

  return (
    <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 relative overflow-hidden group">
      {/* Background Glow */}
      <div
        className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${gradient} opacity-5 blur-[80px] group-hover:opacity-10 transition-opacity`}
      ></div>

      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">
            Haftalık Performans
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
              Gelir Analizi
            </span>
            <div className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-1">
              <Minus size={10} className="text-emerald-500" />
              <span className="text-[9px] font-black text-emerald-500">
                0%
              </span>
            </div>
          </div>
        </div>
        <div
          className={`p-2.5 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-slate-500 dark:text-slate-400`}
        >
          <TrendingUp size={18} />
        </div>
      </div>

      {/* Visual Chart Area */}
      <div className="h-32 flex items-end justify-between gap-2 px-1">
        {data.map((item, i) => (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-3 group/bar"
          >
            {/* Tooltip on Hover */}
            <div className="opacity-0 group-hover/bar:opacity-100 transition-opacity absolute -top-8 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-[9px] font-black px-2 py-1 rounded-lg border border-black/10 dark:border-white/10 whitespace-nowrap z-10 pointer-events-none">
              {item.label}
            </div>
            {/* The Bar */}
            <div className="w-full relative flex items-end justify-center">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${item.value}%` }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 100 }}
                className={`w-full max-w-[12px] rounded-t-full bg-gradient-to-t ${gradient} relative shadow-xl shadow-primary-900/20`}
              >
                {/* Animated Shine Effect */}
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover/bar:opacity-100 transition-opacity rounded-t-full"></div>
              </motion.div>
            </div>
            {/* Day Label */}
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover/bar:text-slate-900 dark:text-white transition-colors duration-300">
              {item.day}
            </span>
          </div>
        ))}
      </div>

      {/* Bottom Insight */}
      <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
          Tahmini Aylık Büyüme
        </p>
        <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">
          ~₺0
        </p>
      </div>
    </div>
  );
};

export default RevenueTrend;
