import React, { memo } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ShieldCheck, Star, Cpu, ArrowRight } from "lucide-react";

const LandingProblemSolution = memo(({ t, language }) => {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  const cards = [
    {
      probTitle: t.prob1Title,
      probDesc: t.prob1Desc,
      solTitle: t.sol1Title,
      solDesc: t.sol1Desc,
      iconProb: AlertTriangle,
      iconSol: ShieldCheck,
      colorProb: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      colorSol: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20 dark:text-emerald-400 dark:bg-emerald-500/10",
      glow: "from-rose-500/5 to-emerald-500/5",
    },
    {
      probTitle: t.prob2Title,
      probDesc: t.prob2Desc,
      solTitle: t.sol2Title,
      solDesc: t.sol2Desc,
      iconProb: AlertTriangle,
      iconSol: Star,
      colorProb: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      colorSol: "text-amber-500 bg-amber-500/10 border-amber-500/20 dark:text-amber-400 dark:bg-amber-500/10",
      glow: "from-rose-500/5 to-amber-500/5",
    },
    {
      probTitle: t.prob3Title,
      probDesc: t.prob3Desc,
      solTitle: t.sol3Title,
      solDesc: t.sol3Desc,
      iconProb: AlertTriangle,
      iconSol: Cpu,
      colorProb: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      colorSol: "text-teal-500 bg-teal-500/10 border-teal-500/20 dark:text-teal-400 dark:bg-teal-500/10",
      glow: "from-rose-500/5 to-teal-500/5",
    },
  ];

  return (
    <section className="w-full max-w-7xl mx-auto px-6 mb-28">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <motion.span
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-[10px] font-black text-emerald-600 dark:text-emerald-400 tracking-widest uppercase mb-4"
        >
          {t.probSolBadge}
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight"
        >
          {t.probSolTitle}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto mt-4 text-sm md:text-base font-semibold leading-relaxed"
        >
          {t.probSolDesc}
        </motion.p>
      </div>

      {/* Comparison Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {cards.map((card, idx) => {
          const IconProb = card.iconProb;
          const IconSol = card.iconSol;

          return (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="bg-white/60 dark:bg-[#0a0f24]/60 border border-black/5 dark:border-white/5 rounded-[2.5rem] p-8 space-y-6 relative overflow-hidden backdrop-blur-xl shadow-xl flex flex-col justify-between group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              {/* Subtle background glow effect */}
              <div className={`absolute -inset-24 bg-gradient-to-tr ${card.glow} blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10`} />

              <div className="space-y-6">
                {/* 1. The Problem Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${card.colorProb}`}>
                      <IconProb size={16} />
                    </div>
                    <span className="text-[10px] font-black tracking-wider text-rose-500 uppercase">
                      {language === "tr" ? "SORUN" : "PROBLEM"}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                    {card.probTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {card.probDesc}
                  </p>
                </div>

                {/* Divider */}
                <div className="flex items-center justify-center py-2 relative">
                  <div className="w-full h-px bg-slate-100 dark:bg-white/5" />
                  <div className="absolute px-3 py-0.5 bg-slate-50 dark:bg-[#0c122b] rounded-full border border-slate-100 dark:border-white/5 text-[9px] font-mono font-black text-slate-400 uppercase tracking-widest">
                    VS
                  </div>
                </div>

                {/* 2. The Solution Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border ${card.colorSol}`}>
                      <IconSol size={16} />
                    </div>
                    <span className="text-[10px] font-black tracking-wider text-emerald-500 dark:text-emerald-400 uppercase">
                      {language === "tr" ? "RAPIDSY ÇÖZÜMÜ" : "RAPIDSY SOLUTION"}
                    </span>
                  </div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {card.solTitle}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-semibold leading-relaxed">
                    {card.solDesc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </section>
  );
});

LandingProblemSolution.displayName = "LandingProblemSolution";
export default LandingProblemSolution;
