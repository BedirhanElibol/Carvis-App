import React, { useState } from "react";
import { Search, AlertTriangle, Wrench, ShieldCheck, X, Activity, ChevronRight, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { OBD2_CODES, searchObd2Codes } from "../../constants/obd2Codes";

const Obd2DictionaryModal = ({ isOpen, onClose, onRequestService }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Tümü");
  const [activeCode, setActiveCode] = useState(null);

  if (!isOpen) return null;

  const categories = ["Tümü", "Motor & Yakıt", "Ateşleme & Motor", "Turbo & Motor", "Emisyon & EGR", "Emisyon & Egzoz", "Motor & Soğutma", "Otomatik Şanzıman", "ABS & Şasi", "Güvenlik & Airbag", "CAN-Bus & İletişim"];

  const filteredCodes = searchObd2Codes(searchTerm).filter((item) => {
    return selectedCategory === "Tümü" || item.category === selectedCategory;
  });

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case "Kritik":
        return "bg-rose-500/20 text-rose-400 border-rose-500/40";
      case "Yüksek":
        return "bg-amber-500/20 text-amber-400 border-amber-500/40";
      case "Orta":
        return "bg-sky-500/20 text-sky-400 border-sky-500/40";
      default:
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/40";
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[80] flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 text-white">
        
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center font-bold">
              <Activity size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-widest text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20">
                  OBD-II / ECU KOD SÖZLÜĞÜ
                </span>
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight mt-0.5">
                Arıza Kodu Teşhis & Sözlük Rehberi
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-2xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar & Category Filter */}
        <div className="p-5 border-b border-white/10 bg-slate-950/30 space-y-4 shrink-0">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Arıza Kodu veya Belirti Ara (Örn: P0300, P0171, tekleme, turbo...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:border-teal-500 outline-none font-mono"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-teal-500 text-slate-950 font-extrabold shadow-lg"
                    : "bg-white/5 text-slate-400 hover:text-white border border-white/5"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredCodes.map((item) => (
            <div
              key={item.code}
              onClick={() => setActiveCode(activeCode?.code === item.code ? null : item)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer bg-slate-950/60 hover:bg-slate-950 flex flex-col justify-between ${
                activeCode?.code === item.code ? "border-teal-500 ring-2 ring-teal-500/20" : "border-white/10 hover:border-teal-500/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-base font-black text-teal-400 bg-teal-500/10 px-3 py-1 rounded-xl border border-teal-500/30">
                    {item.code}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-lg border ${getSeverityBadge(item.severity)}`}>
                    {item.severity} Risk
                  </span>
                </div>
                <h4 className="font-black text-sm text-slate-100 mt-2 leading-snug">
                  {item.title}
                </h4>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                  <strong className="text-slate-300 font-semibold">Belirtiler:</strong> {item.symptoms}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">Tahmini Maliyet: <strong className="text-emerald-400 font-mono">{item.estimatedCost}</strong></span>
                <span className="text-teal-400 font-bold flex items-center gap-1">
                  Detay Gör <ChevronRight size={14} />
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Selected Code Detail Drawer / Modal */}
        <AnimatePresence>
          {activeCode && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="p-6 bg-slate-950 border-t border-teal-500/30 text-white space-y-4 shrink-0 shadow-2xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-black text-teal-400 bg-teal-500/10 px-3 py-1 rounded-xl border border-teal-500/30">
                      {activeCode.code}
                    </span>
                    <h3 className="text-base font-black text-white">{activeCode.title}</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">Kategori: <span className="text-teal-300 font-semibold">{activeCode.category}</span></p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveCode(null)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <h5 className="font-black text-rose-400 uppercase text-[10px]">Olası Kök Nedenler</h5>
                  <p className="text-slate-300 leading-relaxed">{activeCode.rootCauses}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <h5 className="font-black text-emerald-400 uppercase text-[10px]">Önerilen Tamir & Çözüm</h5>
                  <p className="text-slate-300 leading-relaxed">{activeCode.solution}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/10">
                <div className="text-xs">
                  <span className="text-slate-400 block">Ortalama Sanayi Onarım Maliyeti</span>
                  <span className="text-lg font-black font-mono text-emerald-400">{activeCode.estimatedCost}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onRequestService?.(activeCode);
                    onClose();
                  }}
                  className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs uppercase tracking-widest active-scale transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer border-none"
                >
                  <Wrench size={16} /> BU ARIZA İÇİN USTALARDAN TEKLİF AL
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Obd2DictionaryModal;
