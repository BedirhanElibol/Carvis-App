import React from "react";
import * as Icons from "lucide-react";
import { LEGAL_TEXTS } from "./legalTexts";

/**
 * LegalViewModal
 * A premium modal for displaying legal documents (KVKK, Terms, etc.)
 */
const LegalViewModal = ({ type, isOpen, onClose }) => {
  if (!isOpen || !type || !LEGAL_TEXTS[type]) return null;

  const doc = LEGAL_TEXTS[type];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" 
        onClick={onClose}
      ></div>
      
      <div className="glass-card w-full max-w-2xl max-h-[80vh] rounded-[2.5rem] overflow-hidden flex flex-col relative animate-slide-up border border-white/10">
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-600/20 flex items-center justify-center text-primary-500">
              <Icons.ShieldCheck size={20} />
            </div>
            <h3 className="font-black text-xl text-white">{doc.title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400"
          >
            <Icons.X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto custom-scrollbar text-slate-300 space-y-6 font-sans text-sm leading-relaxed">
          {doc.content.split('\n\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
          
          <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 text-[10px] text-slate-500 italic">
            Son Güncelleme: {new Date().toLocaleDateString('tr-TR')}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-white/5 border-t border-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-xl font-bold transition-all active-scale"
          >
            Anladım
          </button>
        </div>
      </div>
    </div>
  );
};

export default LegalViewModal;
