import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, AlertTriangle, ShieldAlert, CheckCircle, Wrench, X, ArrowRight, Activity, DollarSign } from "lucide-react";
import { obdCodesDatabase, searchOBDCode } from "../../data/obdCodes";
import { useNavigate } from "react-router-dom";

const OBDSearchModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCode, setSelectedCode] = useState(null);

  if (!isOpen) return null;

  const searchResults = searchTerm.trim() ? searchOBDCode(searchTerm) : obdCodesDatabase.slice(0, 4);

  const handleSelectCode = (codeItem) => {
    setSelectedCode(codeItem);
  };

  const handleCreateRequest = (codeItem) => {
    onClose();
    navigate(`/service-request?type=repair&desc=${encodeURIComponent(`OBD Arıza Kodu [${codeItem.code}]: ${codeItem.title}`)}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 w-full max-w-xl rounded-[2.5rem] p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-white"
        >
          {/* Modal Header */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Activity size={22} />
              </div>
              <div>
                <h3 className="font-black text-lg uppercase tracking-tight">OBD-II Arıza Kodu Sözlüğü</h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                  Göstergede çıkan DTC kodunu (P0300 vb.) sorgulayın
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedCode(null);
              }}
              placeholder="Örn: P0300, P0420, P0171 veya arıza adı..."
              className="w-full bg-slate-100 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-xs font-bold outline-none focus:ring-2 focus:ring-cyan-500/30 text-slate-900 dark:text-white uppercase tracking-wider placeholder:normal-case"
            />
          </div>

          {/* Code Selection Details View */}
          {selectedCode ? (
            <div className="bg-slate-50 dark:bg-slate-950/60 p-5 rounded-2xl border border-black/10 dark:border-white/10 space-y-4 animate-fade-in">
              <button
                onClick={() => setSelectedCode(null)}
                className="text-[10px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-1 hover:underline"
              >
                ← Listeye Dön
              </button>

              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xl font-mono font-black text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-xl border border-cyan-500/20">
                    {selectedCode.code}
                  </span>
                  <h4 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white mt-2">
                    {selectedCode.title}
                  </h4>
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mt-0.5">
                    Kategori: {selectedCode.category}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-xl border text-[9px] font-black uppercase tracking-wider ${
                  selectedCode.riskLevel === "high" ? "bg-red-500/10 border-red-500/30 text-red-400" :
                  selectedCode.riskLevel === "medium" ? "bg-amber-500/10 border-amber-500/30 text-amber-400" :
                  "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                }`}>
                  {selectedCode.riskLabel}
                </div>
              </div>

              {/* Driving Advice */}
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs ${
                selectedCode.canDrive ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" : "bg-red-500/10 border-red-500/20 text-red-300"
              }`}>
                {selectedCode.canDrive ? <CheckCircle size={18} className="shrink-0 text-emerald-400" /> : <ShieldAlert size={18} className="shrink-0 text-red-400" />}
                <p className="text-[11px] font-medium leading-relaxed">{selectedCode.driveAdvice}</p>
              </div>

              {/* Symptoms & Possible Causes */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Görülen Belirtiler</span>
                  <ul className="text-[10px] space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                    {selectedCode.symptoms.map((s, i) => <li key={i}>• {s}</li>)}
                  </ul>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-black/5 dark:border-white/5 space-y-1">
                  <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Olası Nedenler</span>
                  <ul className="text-[10px] space-y-1 text-slate-700 dark:text-slate-300 font-medium">
                    {selectedCode.possibleCauses.map((c, i) => <li key={i}>• {c}</li>)}
                  </ul>
                </div>
              </div>

              {/* Estimated Repair Cost & Action */}
              <div className="p-4 bg-gradient-to-r from-cyan-950/40 to-slate-900/40 rounded-xl border border-cyan-500/30 flex justify-between items-center">
                <div>
                  <span className="text-[9px] font-black uppercase text-slate-400 tracking-widest block">Tahmini Tamir Maliyeti</span>
                  <span className="text-base font-black font-mono text-cyan-400">
                    ₺{selectedCode.estimatedCost.min.toLocaleString()} – ₺{selectedCode.estimatedCost.max.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => handleCreateRequest(selectedCode)}
                  className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active-scale transition-all"
                >
                  <Wrench size={14} /> Teklif Al <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ) : (
            /* Search Results Grid */
            <div className="space-y-2.5">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block">
                {searchTerm ? `Arama Sonuçları (${searchResults.length})` : "Sık Karşılaşılan OBD Arıza Kodları"}
              </span>
              {searchResults.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs font-bold">
                  Aranan OBD kodu veya arıza tanımı bulunamadı.
                </div>
              ) : (
                searchResults.map((item) => (
                  <div
                    key={item.code}
                    onClick={() => handleSelectCode(item)}
                    className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-black/5 dark:border-white/5 hover:border-cyan-500/40 rounded-2xl flex justify-between items-center cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-lg text-xs border border-cyan-500/20">
                        {item.code}
                      </span>
                      <div>
                        <h4 className="font-bold text-xs text-slate-900 dark:text-white">{item.title}</h4>
                        <span className="text-[9px] font-bold text-slate-500 uppercase">{item.category}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-black text-slate-400">
                        ₺{item.estimatedCost.min} - ₺{item.estimatedCost.max}
                      </span>
                      <ArrowRight size={14} className="text-slate-500" />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OBDSearchModal;
