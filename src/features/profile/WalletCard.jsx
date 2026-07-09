import React from "react";
import { Radio, ShieldCheck, User, Wallet, Zap } from "lucide-react";
import { useWallet } from "../../context/WalletContext";

const WalletCard = () => {
  const { balance, creditLimit, creditUsed } = useWallet();
  
  const availableCredit = creditLimit - creditUsed;
  const creditUsagePercent = creditLimit > 0 ? (creditUsed / creditLimit) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* Main Balance Card */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-900 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group border border-black/10 dark:border-white/10 active-scale">
        <div className="absolute top-0 right-0 w-48 h-48 bg-black/10 dark:bg-white/10 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-125 transition-transform duration-700"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-accent-500/20 rounded-full blur-2xl -ml-12 -mb-12"></div>
        
        <div className="relative z-10 space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wallet size={20} className="text-primary-200" />
              <span className="text-[10px] font-black text-primary-200 uppercase tracking-[0.3em]">Rapidsy Wallet</span>
            </div>
            <Radio size={20} className="text-slate-900 dark:text-white/40 animate-pulse" />
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-primary-200 uppercase tracking-widest mb-1 opacity-60">Kalan Bakiye</p>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
              {balance.toLocaleString()} <span className="text-lg text-primary-200">₺</span>
            </h2>
          </div>
          
          <div className="pt-4 flex items-center justify-between">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-primary-600 bg-primary-800 flex items-center justify-center text-[8px] font-bold text-slate-900 dark:text-white/50">
                  <User size={12} />
                </div>
              ))}
            </div>
            <button className="bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:bg-white/20 px-4 py-2 rounded-xl text-xs font-black text-slate-900 dark:text-white transition-all backdrop-blur-md border border-black/10 dark:border-white/10">
              YÜKLE
            </button>
          </div>
        </div>
      </div>

      {/* Credit / SNPL Card */}
      <div className="glass-card p-6 rounded-[2rem] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent-500/10 rounded-lg">
              <Zap size={16} className="text-accent-500" />
            </div>
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Rapidsy Credit (SNPL)</h4>
          </div>
          <span className="text-[10px] font-bold text-accent-500 bg-accent-500/10 px-2 py-0.5 rounded-full">AKTİF</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-end">
            <p className="text-[10px] text-slate-500 font-bold uppercase">Kullanılabilir Limit</p>
            <p className="text-sm font-black text-slate-900 dark:text-white">{availableCredit.toLocaleString()} ₺</p>
          </div>
          <div className="h-2 bg-white dark:bg-slate-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent-600 to-accent-400 rounded-full transition-all duration-1000"
              style={{ width: `${100 - creditUsagePercent}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-slate-600 text-right">Toplam Limit: {creditLimit.toLocaleString()} ₺</p>
        </div>

        <div className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5 flex items-center gap-3">
          <ShieldCheck size={16} className="text-emerald-500" />
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Bu limitle Rapidsy servislerinde "Şimdi Al, Sonra Öde" avantajını kullanabilirsiniz.</p>
        </div>
      </div>
    </div>
  );
};

export default WalletCard;
