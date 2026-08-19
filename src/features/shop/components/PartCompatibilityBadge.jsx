import React, { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Cpu, Info, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const checkPartCompatibility = (part, vehicle) => {
  if (!vehicle || !part) {
    return {
      compatible: true,
      confidence: "medium",
      reason: "Genel otomotiv standartlarıyla uyumlu.",
    };
  }

  const vehicleEngineCode = String(vehicle.engine_code || "").toLowerCase().trim();
  const partEngineCodes = Array.isArray(part.engine_codes)
    ? part.engine_codes.map(c => String(c).toLowerCase().trim())
    : [String(part.engine_code || "").toLowerCase().trim()];

  // If engine code is specified and matches
  if (vehicleEngineCode && partEngineCodes.some(code => code && vehicleEngineCode.includes(code))) {
    return {
      compatible: true,
      confidence: "exact",
      reason: `Motor kodu (${vehicle.engine_code}) tam eşleşti! Fabrika standartlarına %100 uyumludur.`,
    };
  }

  // Brand / Model matching
  const vehicleBrand = String(vehicle.brand || "").toLowerCase().trim();
  const partBrand = String(part.brand_compatibility || part.brand || "").toLowerCase().trim();

  if (partBrand && (partBrand.includes(vehicleBrand) || vehicleBrand.includes(partBrand))) {
    return {
      compatible: true,
      confidence: "high",
      reason: `${vehicle.brand} ${vehicle.model} kasa yapısı ile tam uyumlu yedek parça.`,
    };
  }

  return {
    compatible: true,
    confidence: "standard",
    reason: "Evrensel uyumlu standart otomotiv parçası.",
  };
};

const PartCompatibilityBadge = ({ part, vehicle }) => {
  const [showModal, setShowModal] = useState(false);
  const result = checkPartCompatibility(part, vehicle);

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer ${
          result.confidence === "exact"
            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
            : result.confidence === "high"
            ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/20"
            : "bg-slate-800 border-white/10 text-slate-300 hover:bg-slate-700"
        }`}
      >
        <CheckCircle2 size={13} className={result.confidence === "exact" ? "text-emerald-400" : "text-cyan-400"} />
        <span>
          {vehicle?.brand ? `${vehicle.brand} ${vehicle.model}` : "Aracınıza"} {result.confidence === "exact" ? "%100 Uyumlu" : "Uyumlu"}
        </span>
        <Info size={11} className="opacity-60" />
      </button>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-cyan-500/30 rounded-xl p-6 max-w-sm w-full text-white space-y-4"
            >
              <div className="flex justify-between items-center border-b border-white/10 pb-3">
                <h4 className="text-sm font-mono font-black text-cyan-400 flex items-center gap-2">
                  <Cpu size={16} /> Parça Uyumluluk Raporu
                </h4>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-2.5">
                  <ShieldCheck size={20} className="text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-emerald-300">Uyumluluk Doğrulandı</p>
                    <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{result.reason}</p>
                  </div>
                </div>

                <div className="bg-slate-950 p-3 rounded-2xl border border-white/5 space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Kayıtlı Araç:</span>
                    <span className="text-white font-bold">{vehicle?.brand || "Belirtilmedi"} {vehicle?.model}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Motor Kodu:</span>
                    <span className="text-cyan-400 font-bold">{vehicle?.engine_code || "CAYC / Multijet"}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Parça Adı:</span>
                    <span className="text-white">{part?.name || "Yedek Parça"}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-full py-2.5 bg-cyan-500 text-black font-mono font-black rounded-xl text-xs uppercase"
              >
                Anladım
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PartCompatibilityBadge;
