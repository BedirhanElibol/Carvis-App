import React from "react";
import { ArrowDownRight, ArrowUpRight, Car, FileText, Landmark, PieChart, ShieldCheck, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const FinancialCockpit = ({ _vehicle }) => {
  // Mock Data for demonstration. In a real app, this would come from an API or Supabase.
  const valuation = {
    currentValue: 1250000,
    previousValue: 1210000,
    trend: "up", // 'up' | 'down' | 'flat'
    percentage: 3.3,
    lastUpdated: "Bugün, 09:41"
  };

  const insurances = [
    {
      id: "kasko",
      name: "Kasko",
      icon: <ShieldCheck size={18} />,
      daysLeft: 45,
      totalDays: 365,
      color: "teal"
    },
    {
      id: "trafik",
      name: "Trafik Sigortası",
      icon: <FileText size={18} />,
      daysLeft: 12,
      totalDays: 365,
      color: "amber"
    },
    {
      id: "mtv",
      name: "MTV Ödemesi",
      icon: <Landmark size={18} />,
      daysLeft: 2,
      totalDays: 180,
      color: "red"
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-mono font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <PieChart className="text-cyan-500 dark:text-cyan-400" size={18} />
          Finans & Değer
        </h3>
        <button className="text-[10px] font-mono font-black text-slate-500 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors uppercase tracking-wider bg-transparent border-none cursor-pointer">
          Detaylar &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valuation Card */}
        <motion.div 
          whileHover={{ scale: 0.98 }}
          className="bg-gradient-to-br from-slate-900 via-slate-950 to-black dark:from-slate-900 dark:via-[#0a0f24] dark:to-black rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white border border-white/10"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <TrendingUp size={14} className="text-cyan-400" />
                <span className="text-xs font-mono font-black uppercase tracking-wider text-slate-300">Piyasa Değeri</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                <Car size={20} className="text-slate-300" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-3xl font-mono font-black tracking-tighter">
                  {formatCurrency(valuation.currentValue)}
                </h2>
                <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${valuation.trend === 'up' ? 'bg-cyan-500/20 text-cyan-400' : 'bg-red-500/20 text-red-400'}`}>
                  {valuation.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  %{valuation.percentage}
                </div>
              </div>
              <p className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
                Son Güncelleme: {valuation.lastUpdated}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Insurances & Taxes */}
        <div className="bg-white dark:bg-[#0a0f24]/85 rounded-3xl p-5 shadow-sm border border-slate-200 dark:border-white/10 flex flex-col gap-4">
          <h4 className="text-xs font-mono font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">Poliçe & Vergiler</h4>
          
          {insurances.map((item) => {
            const progress = (item.daysLeft / item.totalDays) * 100;
            const isDanger = item.daysLeft <= 15;
            const isWarning = item.daysLeft <= 45;
            const statusColorClass = isDanger ? 'text-red-500' : isWarning ? 'text-amber-500' : 'text-cyan-500';
            const statusBgClass = isDanger ? 'bg-red-500/10 text-red-500' : isWarning ? 'bg-amber-500/10 text-amber-500' : 'bg-cyan-500/10 text-cyan-500';
            const barBgClass = isDanger ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-cyan-500';
            
            return (
              <div key={item.id} className="relative group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg ${statusBgClass}`}>
                      {item.icon}
                    </div>
                    <div>
                      <h5 className="text-sm font-sans font-semibold text-slate-900 dark:text-white leading-none">{item.name}</h5>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-mono font-black ${statusColorClass}`}>
                      {item.daysLeft} Gün Kaldı
                    </span>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${barBgClass}`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FinancialCockpit;
