import React from "react";
import * as Icons from "lucide-react";
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
      icon: <Icons.ShieldCheck size={18} />,
      daysLeft: 45,
      totalDays: 365,
      color: "teal"
    },
    {
      id: "trafik",
      name: "Trafik Sigortası",
      icon: <Icons.FileText size={18} />,
      daysLeft: 12,
      totalDays: 365,
      color: "amber"
    },
    {
      id: "mtv",
      name: "MTV Ödemesi",
      icon: <Icons.Landmark size={18} />,
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
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
          <Icons.PieChart className="text-primary-500" size={18} />
          Finans & Değer
        </h3>
        <button className="text-[10px] font-bold text-slate-500 hover:text-primary-500 transition-colors uppercase tracking-wider">
          Detaylar &rarr;
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Valuation Card */}
        <motion.div 
          whileHover={{ scale: 0.98 }}
          className="bg-gradient-to-br from-slate-900 to-black dark:from-slate-800 dark:to-slate-950 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-white border border-white/10"
        >
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full border border-white/10">
                <Icons.TrendingUp size={14} className="text-primary-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Piyasa Değeri</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md">
                <Icons.Car size={20} className="text-slate-300" />
              </div>
            </div>

            <div>
              <div className="flex items-baseline gap-3 mb-1">
                <h2 className="text-3xl font-black tracking-tighter">
                  {formatCurrency(valuation.currentValue)}
                </h2>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${valuation.trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {valuation.trend === 'up' ? <Icons.ArrowUpRight size={14} /> : <Icons.ArrowDownRight size={14} />}
                  %{valuation.percentage}
                </div>
              </div>
              <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                Son Güncelleme: {valuation.lastUpdated}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Insurances & Taxes */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-black/5 dark:border-white/5 flex flex-col gap-4">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Poliçe & Vergiler</h4>
          
          {insurances.map((item) => {
            const progress = (item.daysLeft / item.totalDays) * 100;
            return (
              <div key={item.id} className="relative group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-${item.color}-500/10 text-${item.color}-500`}>
                      {item.icon}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white leading-none">{item.name}</h5>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-black ${item.daysLeft <= 15 ? 'text-red-500' : item.daysLeft <= 45 ? 'text-amber-500' : 'text-teal-500'}`}>
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
                    className={`h-full rounded-full ${item.daysLeft <= 15 ? 'bg-red-500' : item.daysLeft <= 45 ? 'bg-amber-500' : 'bg-teal-500'}`}
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
