import React, { useState, useEffect } from "react";
import { DollarSign, Wallet, ArrowUpRight, TrendingUp, CheckCircle, Percent, ArrowRight } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function FinancialReportsView({ currentUser }) {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // 1. Get completed orders
      const { data: ordList } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", currentUser.id)
        .eq("status", "completed");

      if (ordList) setCompletedOrders(ordList);

      // 2. Get wallet balance
      const { data: walletData } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", currentUser.id)
        .single();

      if (walletData) setWallet(walletData);
    } catch (err) {
      console.error("Error fetching financial data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  // Calculations
  const grossSales = completedOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const commission = grossSales * 0.1; // 10% commission rate
  const netEarnings = grossSales - commission;

  // Let's assume early payment allows transferring this net earning directly to the user's wallet balance
  const handleEarlyPayout = async () => {
    if (netEarnings <= 0 || !wallet) return;
    setActionLoading(true);
    setSuccessMsg("");
    try {
      const newBalance = (Number(wallet.balance) || 0) + netEarnings;
      
      const { error: walletErr } = await supabase
        .from("wallets")
        .update({ balance: newBalance })
        .eq("id", wallet.id);

      if (walletErr) throw walletErr;

      // Update the status of these orders to prevent double payouts
      // (or we can just mock a transaction log insert, but let's update orders payout status)
      const { error: orderErr } = await supabase
        .from("orders")
        .update({ status: "payout_processed" }) // change to prevent double cashout
        .eq("seller_id", currentUser.id)
        .eq("status", "completed");

      setSuccessMsg(`₺${netEarnings.toLocaleString("tr-TR")} tutarındaki hakedişiniz başarıyla cüzdanınıza aktarıldı.`);
      fetchData();
    } catch (err) {
      console.error("Payout error:", err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Finans Raporları & Erken Ödeme</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Hakedişlerinizi takip edin ve bekleyen ödemelerinizi erken tahsil edin.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle size={16} /> {successMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-6 rounded-2xl shadow-sm">
          <div className="bg-emerald-500/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
            <DollarSign size={20} className="text-emerald-500" />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Brüt Satış Hacmi</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₺{grossSales.toLocaleString("tr-TR")}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-6 rounded-2xl shadow-sm">
          <div className="bg-red-500/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
            <Percent size={20} className="text-red-500" />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Rapidsy Komisyonu (%10)</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">₺{commission.toLocaleString("tr-TR")}</h3>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 p-6 rounded-2xl shadow-sm">
          <div className="bg-blue-500/10 w-10 h-10 rounded-xl flex items-center justify-center mb-4">
            <Wallet size={20} className="text-blue-500" />
          </div>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cüzdan Bakiyesi</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            ₺{wallet ? Number(wallet.balance).toLocaleString("tr-TR") : "0"}
          </h3>
        </div>
      </div>

      {/* Early Payout Card */}
      <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
        <div className="space-y-2 max-w-xl">
          <span className="bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase">Erken Ödeme Fırsatı</span>
          <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Vade Beklemeden Hakedişini Al</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Siparişlerinizden kazandığınız net tutarı, normal ödeme gününü beklemeden anında Rapidsy cüzdan bakiyenize aktararak nakit akışınızı hızlandırın.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 p-6 rounded-2xl text-center md:w-80 space-y-4">
          <div>
            <p className="text-[10px] text-slate-500 font-bold uppercase">Çekilebilir Net Tutar</p>
            <p className="text-3xl font-black text-emerald-500 mt-1">₺{netEarnings.toLocaleString("tr-TR")}</p>
          </div>
          <button
            onClick={handleEarlyPayout}
            disabled={netEarnings <= 0 || actionLoading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-3 rounded-xl text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
          >
            {actionLoading ? "Aktarılıyor..." : "Hemen Tahsil Et"} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
