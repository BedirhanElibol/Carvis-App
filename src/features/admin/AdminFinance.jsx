import React, { useState, useEffect, useCallback } from "react";
import * as Icons from "lucide-react";
 
import { motion } from "framer-motion";
import { supabase } from "../../supabaseClient";
import { useUI } from "../../context/UIContext";

/**
 * AdminFinance Component
 * Dashboard for platform revenue, commissions, and transaction history.
 */
const AdminFinance = () => {
  const { showAlert } = useUI();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    todayRevenue: 0,
    pendingPayouts: 0,
    commissionEarned: 0,
  });

  const fetchFinanceData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch recent transactions and orders in parallel for performance
      const [
        { data: txData, error: txError },
        { data: orderData, error: orderError }
      ] = await Promise.all([
        supabase
          .from("wallet_transactions")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("orders")
          .select("total_amount, commission_rate, created_at, status")
          .in("status", ["paid", "completed"])
      ]);

      if (txError) throw txError;
      if (orderError) throw orderError;

      setTransactions(txData || []);

      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));

      let total = 0;
      let daily = 0;
      let commission = 0;

      orderData.forEach((order) => {
        total += order.total_amount || 0;
        commission += (order.total_amount || 0) * (order.commission_rate || 0.05);

        const orderDate = new Date(order.created_at);
        if (orderDate >= today) {
          daily += order.total_amount || 0;
        }
      });

      setStats({
        totalRevenue: total,
        todayRevenue: daily,
        pendingPayouts: 0,
        commissionEarned: commission,
      });
    } catch (error) {
      console.error("Finance Fetch Error:", error);
      showAlert("Hata", "Finans verileri alınamadı.", "error");
    } finally {
      setLoading(false);
    }
  }, [showAlert]);

  useEffect(() => {
    fetchFinanceData();
  }, [fetchFinanceData]);

  const statCards = [
    {
      label: "Toplam Hacim",
      value: `₺${stats.totalRevenue.toLocaleString()}`,
      icon: Icons.Activity,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
    },
    {
      label: "Bugünkü Ciro",
      value: `₺${stats.todayRevenue.toLocaleString()}`,
      icon: Icons.TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Platform Komisyonu",
      value: `₺${stats.commissionEarned.toLocaleString()}`,
      icon: Icons.Percent,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      label: "Bekleyen Ödemeler",
      value: `₺${stats.pendingPayouts.toLocaleString()}`,
      icon: Icons.Clock,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8 p-6 animate-fade-in">
      <div>
        <h1 className="text-4xl font-black font-sans text-slate-900 dark:text-white uppercase tracking-tighter leading-[1.2]">
          Finans & Kasa
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-sans uppercase text-[10px] font-bold tracking-widest mt-1">
          Platform gelirleri ve işlem geçmişi yönetimi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6 rounded-[2rem] border border-black/5 dark:border-white/5 flex flex-col justify-between h-36 relative overflow-hidden group"
          >
            <div className={`p-3 rounded-xl ${stat.bg} w-fit`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <div>
              <h3 className="text-2xl font-black font-sans text-slate-900 dark:text-white tracking-tighter leading-[1.2]">
                {stat.value}
              </h3>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-sans">
                {stat.label}
              </p>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon size={80} />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="glass-card rounded-[2.5rem] border border-black/5 dark:border-white/5 overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/5 dark:bg-white/5">
          <h3 className="font-black text-slate-900 dark:text-white font-sans uppercase tracking-widest text-xs">
            Son İşlemler
          </h3>
          <button
            onClick={fetchFinanceData}
            className="p-2 hover:bg-black/10 dark:bg-white/10 rounded-full transition-colors"
          >
            <Icons.RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-black/5 dark:border-white/5 uppercase text-[10px] font-black tracking-widest text-slate-500">
                <th className="p-6">İşlem ID</th>
                <th className="p-6">Tür</th>
                <th className="p-6">Açıklama</th>
                <th className="p-6 text-right">Tutar</th>
                <th className="p-6">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan="5" className="p-6 bg-black/5 dark:bg-white/5 h-16"></td>
                    </tr>
                  ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-slate-500 font-sans">
                    Henüz bir işlem bulunmuyor.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-black/5 dark:bg-white/5 transition-colors group">
                    <td className="p-6 font-mono text-[10px] text-slate-500">
                      #{tx.id.slice(0, 8)}
                    </td>
                    <td className="p-6">
                      <span
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          tx.type === "payment"
                            ? "bg-emerald-500/10 text-emerald-500"
                            : tx.type === "withdrawal"
                              ? "bg-red-500/10 text-red-500"
                              : "bg-blue-500/10 text-blue-500"
                        }`}
                      >
                        {tx.type}
                      </span>
                    </td>
                    <td className="p-6 text-sm text-slate-600 dark:text-slate-300 font-medium">
                      {tx.description}
                    </td>
                    <td className="p-6 text-right font-black text-slate-900 dark:text-white tracking-tighter">
                      {tx.amount > 0 ? "+" : ""}₺{tx.amount.toLocaleString()}
                    </td>
                    <td className="p-6 text-xs text-slate-500 font-medium">
                      {new Date(tx.created_at).toLocaleString("tr-TR")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;
