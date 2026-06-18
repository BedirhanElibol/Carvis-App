import React from "react";
import * as Icons from "lucide-react";
import { motion } from "framer-motion";  

const steps = [
  {
    id: "pending",
    label: "Talep Alındı",
    icon: Icons.Clock,
    desc: "Servis talebiniz ulaştı.",
  },
  {
    id: "diagnosing",
    label: "Teşhis & Ekspertiz",
    icon: Icons.Wrench,
    desc: "Usta aracı inceliyor.",
  },
  {
    id: "repairing",
    label: "İşlem Başladı",
    icon: Icons.Wrench,
    desc: "Parça değişimi/onarım yapılıyor.",
  },
  {
    id: "quality_check",
    label: "Son Kontroller",
    icon: Icons.CheckCircle2,
    desc: "Test sürüşü ve kalite kontrol.",
  },
  {
    id: "completed",
    label: "Teslime Hazır",
    icon: Icons.Check,
    desc: "Aracınızı teslim alabilirsiniz.",
  },
];

/**
 * ServiceTimeline Component
 * Vertical timeline tracking the status of a service order.
 */
const ServiceTimeline = ({ status, evidencePhotos = [] }) => {
  // Determine current step index based on status
  const getCurrentStepIndex = (status) => {
    const index = steps.findIndex((s) => s.id === status);
    return index === -1 ? 0 : index;
  };

  const activeIndex = getCurrentStepIndex(status);

  return (
    <div className="relative py-4 px-2">
      {/* Vertical Line */}
      <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-800 rounded-full"></div>

      <div className="space-y-8 relative">
        {steps.map((step, index) => {
          const isActive = index === activeIndex;
          const isCompleted = index < activeIndex;

          return (
            <div
              key={step.id}
              className={`flex gap-4 relative ${index > activeIndex ? "opacity-40 grayscale" : ""}`}
            >
              {/* Icon Bubble */}
              <div
                className={` w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 transition-all duration-500 ${
                  isActive
                    ? "bg-primary-600 border-slate-950 text-white shadow-[0_0_20px_rgba(37,99,235,0.5)] scale-110"
                    : isCompleted
                      ? "bg-emerald-500 border-slate-950 text-white"
                      : "bg-slate-900 border-slate-800 text-slate-600"
                } `}
              >
                <step.icon size={isActive ? 20 : 18} />
              </div>

              {/* Content */}
              <div className={`flex-1 pt-1 ${isActive ? "animate-pulse" : ""}`}>
                <h4
                  className={`font-black uppercase tracking-wider text-xs mb-0.5 ${
                    isActive
                      ? "text-primary-400"
                      : isCompleted
                        ? "text-emerald-400"
                        : "text-slate-500"
                  }`}
                >
                  {step.label}
                </h4>
                <p className="text-xs text-slate-400 leading-snug font-sans">
                  {step.desc}
                </p>

                {/* Evidence Photo */}
                {isActive && evidencePhotos.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3"
                  >
                    <div className="bg-slate-900 p-2 rounded-xl border border-white/10 inline-block">
                      <div className="flex items-center gap-2 mb-2">
                        <Icons.Camera size={12} className="text-primary-400" />
                        <span className="text-[10px] font-black text-slate-300">
                          CANLI GÖRÜNTÜ
                        </span>
                      </div>
                      <img
                        src={evidencePhotos[0]}
                        alt="Process Evidence"
                        className="w-32 h-20 object-cover rounded-lg border border-white/5"
                      />
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceTimeline;
