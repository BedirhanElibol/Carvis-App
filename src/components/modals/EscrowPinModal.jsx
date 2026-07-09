import React, { useState } from 'react';
import { ShieldCheck, Copy, CheckCircle2, Lock, KeyRound, X } from 'lucide-react';

// Inline modal wrapper — BaseModal was removed
const BaseModal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-black/5 dark:border-white/5">
          <h2 className="font-black text-base text-slate-900 dark:text-white">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const EscrowPinModal = ({ isOpen, onClose, amount, providerName, pinCode = "482159" }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(pinCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Güvenli Ödeme (Escrow) Onayı">
      <div className="flex flex-col items-center justify-center p-4">
        
        {/* Shield Icon & Header */}
        <div className="w-16 h-16 bg-teal-500/10 rounded-full flex items-center justify-center mb-4 ring-8 ring-teal-500/5">
          <ShieldCheck className="w-8 h-8 text-teal-500" />
        </div>
        
        <h3 className="text-xl font-black text-slate-900 dark:text-white text-center mb-2">
          Ödemeniz Güvenli Havuzda
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6 max-w-sm">
          <span className="font-bold text-slate-700 dark:text-slate-200">{amount} ₺</span> tutarındaki ödemeniz 
          Rapidsy güvencesiyle havuza alındı. İşlem kusursuz tamamlanana kadar <span className="font-bold text-orange-500">{providerName}</span> hesabına aktarılmayacaktır.
        </p>

        {/* PIN Section */}
        <div className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl -mr-10 -mt-10 rounded-full" />
          
          <div className="flex items-center justify-center gap-2 mb-2">
            <KeyRound className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500">İş Bitim Onay Kodu (PIN)</span>
          </div>

          <div className="flex items-center justify-center gap-3 my-4">
            {pinCode.split('').map((char, idx) => (
              <div key={idx} className="w-10 h-14 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center text-2xl font-mono font-black text-slate-900 dark:text-teal-400 shadow-sm">
                {char}
              </div>
            ))}
          </div>

          <button 
            onClick={handleCopy}
            className="w-full mt-2 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Kopyalandı!' : 'Kodu Kopyala'}
          </button>
        </div>

        {/* Warning Section */}
        <div className="w-full mt-4 bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
          <p className="text-xs text-orange-700 dark:text-orange-300 font-medium leading-relaxed">
            Bu kod, ödemenin havuza aktarıldığını kanıtlar. <strong className="font-black">Sadece aracınızı teslim aldığınızda ve işten memnun kaldığınızda</strong> bu kodu usta ile paylaşın. Kodu verdiğiniz an ödeme ustaya aktarılır.
          </p>
        </div>

        <button 
          onClick={onClose}
          className="w-full mt-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold hover:bg-slate-800 dark:hover:bg-slate-100 transition-all shadow-lg shadow-slate-900/20 dark:shadow-white/20 active:scale-[0.98]"
        >
          Anladım
        </button>
      </div>
    </BaseModal>
  );
};

export default EscrowPinModal;
