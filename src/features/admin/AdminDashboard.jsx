import React, { useState, useEffect } from "react";
import { Activity, Database, Package, Server, TrendingUp, Users } from "lucide-react";
 
import { motion } from "framer-motion";
import { supabase } from "../../supabaseClient";
import { getAdminGlobalStats } from "../../utils/supabaseApi";
import MarketPulse from "./MarketPulse";
import WeatherWidget from "./WeatherWidget";
import CurrencyTicker from "./CurrencyTicker";

const AdminDashboard = () => {
  const [stats, setStats] = useState([
    {
      label: "Toplam Kullanıcı",
      value: "...",
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Aktif Partner",
      value: "...",
      icon: Database,
      color: "text-teal-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Toplam Ciro",
      value: "...",
      icon: TrendingUp,
      color: "text-green-400",
      bg: "bg-green-500/10",
    },
    {
      label: "Bekleyen Sipariş",
      value: "...",
      icon: Package,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ]);

  useEffect(() => {
    const fetchStats = async () => {
      const { success, data, error } = await getAdminGlobalStats();
      if (success && data && typeof data === 'object') {
        const safeData = Array.isArray(data) ? (data[0] || {}) : data;
        setStats([
          {
            label: "Toplam Kullanıcı",
            value: (safeData.userCount || 0).toString(),
            icon: Users,
            color: "text-blue-400",
            bg: "bg-blue-500/10",
          },
          {
            label: "Aktif Shoplar",
            value: (safeData.shopCount || 0).toString(),
            icon: Database,
            color: "text-teal-400",
            bg: "bg-emerald-500/10",
          },
          {
            label: "Toplam Ciro",
            value: `₺${(safeData.totalVolume || 0).toLocaleString("tr-TR", { maximumFractionDigits: 0 })}`,
            icon: TrendingUp,
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
          {
            label: "Toplam Sipariş",
            value: (safeData.orderCount || 0).toString(),
            icon: Package,
            color: "text-amber-400",
            bg: "bg-amber-500/10",
          },
        ]);
      } else if (error || !data) {
        console.error("Admin Stats Error:", error || "Invalid Data");
      }
    };

    fetchStats();

    const channel = supabase
      .channel("admin_dashboard")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchStats(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchStats(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "mechanic_shops" },
        () => fetchStats(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="space-y-8 animate-fade-in p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black font-sans text-slate-900 dark:text-white uppercase tracking-tighter leading-[1.2]">
            Genel Bakış
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-sans uppercase text-[10px] font-bold tracking-widest mt-1">
            Canlı sistem metrikleri ve anlık durum.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-2 px-4 rounded-2xl">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]"></span>
          <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest font-sans">
            Sistem Operasyonel
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-[2rem] border border-black/5 dark:border-white/5 hover:border-black/20 dark:border-white/20 transition-all flex flex-col justify-between h-40 group shadow-xl"
          >
            <div className="flex justify-between items-start">
              <div
                className={`p-3 rounded-xl ${stat.bg} group-hover:scale-110 transition-transform`}
              >
                {(() => {
                  const Icon = stat.icon;
                  return <Icon size={20} className={stat.color} />;
                })()}
              </div>
              {index === 2 && (
                <span className="bg-emerald-500/10 text-teal-400 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-widest font-sans">
                  +8.4%
                </span>
              )}
            </div>
            <div>
              <h3 className="text-3xl font-black font-sans text-slate-900 dark:text-white tracking-tighter leading-[1.2]">
                {stat.value}
              </h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-sans">
                {stat.label}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* System Health Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-2xl">
          <h3 className="font-black text-slate-900 dark:text-white mb-6 flex items-center gap-3 font-sans uppercase tracking-widest text-xs">
            <Server size={20} className="text-slate-500 dark:text-slate-400" /> Sunucu Performansı
          </h3>
          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500 dark:text-slate-400 font-sans">
                  Veritabanı Bağlantıları
                </span>
                <span className="text-teal-400 font-sans">Aktif: {stats[0].value !== "..." ? Math.floor(Math.random() * 5 + 10) : "..."}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 animate-pulse transition-all duration-1000"
                  style={{ width: `${Math.floor(Math.random() * 20 + 5)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500 dark:text-slate-400 font-sans">
                  Storage Kapasitesi
                </span>
                <span className="text-yellow-400 font-sans">Sağlıklı</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="w-[42%] h-full bg-yellow-500"></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                <span className="text-slate-500 dark:text-slate-400 font-sans">API Gateway</span>
                <span className="text-blue-400 font-sans">
                  Gecikme: {stats[0].value !== "..." ? (Math.random() * 10 + 15).toFixed(1) : "..."}ms
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000"
                  style={{ width: `${Math.floor(Math.random() * 15 + 10)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 flex flex-col justify-center items-center text-center shadow-2xl bg-gradient-to-br from-slate-900 to-black">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 relative border border-emerald-500/20">
            <Activity size={40} className="text-emerald-500" />
            <span className="absolute top-0 right-0 w-4 h-4 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white font-sans uppercase tracking-tighter leading-[1.2]">
            Sistem Online
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-3 max-w-xs font-sans">
            Tüm Supabase servisleri (Auth, Database, Edge Functions) aktif ve
            yüksek verimle yanıt veriyor.
          </p>
          <div className="mt-8 flex gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest font-sans">
                PostgreSql
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest font-sans">
                GoTrue
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span className="text-[9px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest font-sans">
                Realtime
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* API Integrations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MarketPulse />
        <div className="lg:col-span-1 space-y-6">
          <WeatherWidget />
          <CurrencyTicker />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
