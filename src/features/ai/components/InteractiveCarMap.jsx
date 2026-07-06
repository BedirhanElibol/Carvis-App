import React from "react";
import { motion } from "framer-motion";  
import { Activity, Cpu, Disc, Wind, Zap } from "lucide-react";

/**
 * InteractiveCarMap Component
 * Visual representation of the vehicle with interactive fault zones.
 */
const InteractiveCarMap = ({ activeZones = [], onZoneClick }) => {
  // Zones definition (Coordinates for SVG paths or circles)
  const zones = [
    { id: "engine", label: "Motor & Transmisyon", x: "50%", y: "25%", icon: Cpu },
    { id: "brakes_front", label: "Ön Frenler", x: "50%", y: "40%", icon: Disc },
    { id: "brakes_rear", label: "Arka Frenler", x: "50%", y: "75%", icon: Disc },
    { id: "battery", label: "Elektrik & Batarya", x: "35%", y: "22%", icon: Zap },
    { id: "exhaust", label: "Egzoz Sistemi", x: "50%", y: "85%", icon: Wind },
    { id: "suspension", label: "Süspansiyon", x: "65%", y: "50%", icon: Activity },
  ];

  return (
    <div className="relative w-full aspect-[1/2] max-w-[280px] mx-auto bg-white dark:bg-slate-900/40 rounded-[3rem] border border-black/5 dark:border-white/5 p-8 backdrop-blur-3xl overflow-hidden group">
      {/* Holographic Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent opacity-30"></div>

      {/* The Car Silhouette (Simplified Top-Down) */}
      <svg viewBox="0 0 100 200" className="w-full h-full drop-shadow-[0_0_20px_rgba(59,130,246,0.1)]">
        {/* Main Body */}
        <motion.path
          d="M30,20 Q50,15 70,20 L75,50 L80,100 L75,170 Q50,185 25,170 L20,100 L25,50 Z"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="1.5"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />

        {/* Inner Structure Lines (Wireframe) */}
        <path
          d="M25,60 L75,60 M20,100 L80,100 M25,140 L75,140"
          stroke="rgba(255,255,255,0.03)"
          strokeWidth="1"
        />

        {/* Wheels */}
        {[
          { cx: 20, cy: 45 },
          { cx: 80, cy: 45 },
          { cx: 20, cy: 155 },
          { cx: 80, cy: 155 },
        ].map((w, i) => (
          <rect
            key={i}
            x={w.cx - 4}
            y={w.cy - 8}
            width="8"
            height="16"
            rx="2"
            fill="rgba(255,255,255,0.05)"
          />
        ))}

        {/* Active Fault Highlights */}
        {activeZones.map((zoneId) => {
          const zone = zones.find((z) => z.id === zoneId);
          if (!zone) return null;
          return (
            <motion.circle
              key={`highlight-${zoneId}`}
              cx={zone.x}
              cy={zone.y}
              r="12"
              fill="url(#faultGradient)"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          );
        })}
        <defs>
          <radialGradient id="faultGradient">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>
      </svg>

      {/* Interactive Points (Buttons) */}
      {zones.map((zone) => {
        const isActive = activeZones.includes(zone.id);
        const Icon = zone.icon;
        return (
          <motion.button
            key={zone.id}
            onClick={() => onZoneClick?.(zone)}
            style={{ left: zone.x, top: zone.y }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
              isActive
                ? "bg-red-500 border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)]"
                : "bg-slate-100 dark:bg-slate-800/80 border-black/10 dark:border-white/10 hover:bg-slate-700"
            } border `}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
          >
            <Icon size={12} className={isActive ? "text-slate-900 dark:text-white" : "text-slate-500 dark:text-slate-400"} />
            {/* Label on Hover */}
            <div className="absolute top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-[8px] font-black px-2 py-1 rounded border border-black/10 dark:border-white/10 whitespace-nowrap pointer-events-none z-20">
              {zone.label}
            </div>
          </motion.button>
        );
      })}

      {/* Bottom Status Info */}
      <div className="absolute bottom-6 left-6 right-6 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em]">
            Sistem Tarandı
          </span>
        </div>
        {activeZones.length > 0 ? (
          <p className="text-[10px] font-black text-red-400 uppercase tracking-widest animate-bounce">
            {activeZones.length} KRİTİK ARIZA
          </p>
        ) : (
          <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest">
            TÜM BİRİMLER OK
          </p>
        )}
      </div>
    </div>
  );
};

export default InteractiveCarMap;
