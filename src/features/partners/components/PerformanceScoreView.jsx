import React, { useState, useEffect, useMemo } from "react";
import { BarChart3, TrendingUp, Clock, RotateCcw, Star, Package, Truck, Award, ShieldCheck, ChevronUp, ChevronDown } from "lucide-react";
import { supabase } from "../../../supabaseClient";

const badgeConfig = {
  gold: { label: "Altın Mağaza", color: "from-amber-400 to-yellow-600", textColor: "text-amber-900", icon: "🏆" },
  silver: { label: "Gümüş Mağaza", color: "from-slate-300 to-slate-500", textColor: "text-slate-900", icon: "🥈" },
  bronze: { label: "Bronz Mağaza", color: "from-orange-400 to-orange-700", textColor: "text-orange-900", icon: "🥉" },
  starter: { label: "Yeni Mağaza", color: "from-slate-500 to-slate-700", textColor: "text-white", icon: "🚀" }
};

function MiniLineChart({ data, color = "#f97316" }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const w = 200;
  const h = 60;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-16" preserveAspectRatio="none">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${points} ${w},${h}`}
        fill="url(#lineGrad)"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PerformanceScoreView({ currentUser }) {
  const [orders, setOrders] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchData = async () => {
      setLoading(true);
      const [ordRes, revRes, retRes] = await Promise.all([
        supabase.from("orders").select("id, status, created_at, total_amount").eq("seller_id", currentUser.id).order("created_at", { ascending: false }),
        supabase.from("reviews").select("id, rating, created_at").eq("seller_id", currentUser.id),
        supabase.from("return_requests").select("id, status, created_at").eq("seller_id", currentUser.id)
      ]);
      setOrders(ordRes.data || []);
      setReviews(revRes.data || []);
      setReturns(retRes.data || []);
      setLoading(false);
    };
    fetchData();
  }, [currentUser]);

  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => ["completed", "delivered", "payout_processed", "shipped"].includes(o.status));
    const fulfillmentRate = totalOrders > 0 ? Math.round((completedOrders.length / totalOrders) * 100) : 0;

    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
      : "0.0";

    const totalReturns = returns.length;
    const approvedReturns = returns.filter(r => r.status === "approved").length;
    const returnRate = totalOrders > 0 ? Math.round((totalReturns / totalOrders) * 100) : 0;

    // Overall weighted score (out of 5)
    const ratingScore = parseFloat(avgRating) || 0;
    const fulfillmentScore = (fulfillmentRate / 100) * 5;
    const returnPenalty = Math.min(returnRate * 0.1, 2); // max 2 point penalty
    const overallScore = Math.max(0, Math.min(5, (ratingScore * 0.5 + fulfillmentScore * 0.35 + (5 - returnPenalty) * 0.15))).toFixed(1);

    // Badge
    let badge = "starter";
    if (parseFloat(overallScore) >= 4.5) badge = "gold";
    else if (parseFloat(overallScore) >= 3.5) badge = "silver";
    else if (parseFloat(overallScore) >= 2.5) badge = "bronze";

    // 30-day order trend (last 30 days, grouped by day)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dailyCounts = Array(30).fill(0);
    orders.forEach(o => {
      const d = new Date(o.created_at);
      if (d >= thirtyDaysAgo) {
        const dayIndex = Math.floor((d - thirtyDaysAgo) / (1000 * 60 * 60 * 24));
        if (dayIndex >= 0 && dayIndex < 30) dailyCounts[dayIndex]++;
      }
    });

    return {
      totalOrders,
      completedOrders: completedOrders.length,
      fulfillmentRate,
      avgRating,
      reviewCount: reviews.length,
      totalReturns,
      approvedReturns,
      returnRate,
      overallScore: parseFloat(overallScore),
      badge,
      dailyCounts,
      totalRevenue: completedOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
    };
  }, [orders, reviews, returns]);

  const badge = badgeConfig[metrics.badge];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-slate-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-black uppercase tracking-tight text-white glow-orange">Performans Karnesi</h1>
          <p className="text-xs text-slate-400 mt-1">Mağaza performansınızı takip edin, metriklerinizi iyileştirin.</p>
        </div>
        {/* Store Badge */}
        <div className={`bg-gradient-to-r ${badge.color} px-5 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-orange-500/10`}>
          <span className="text-2xl">{badge.icon}</span>
          <div>
            <p className={`font-black text-xs uppercase tracking-wider ${badge.textColor}`}>{badge.label}</p>
            <p className={`text-[10px] font-bold ${badge.textColor} opacity-75`}>Genel Puan: {metrics.overallScore}/5.0</p>
          </div>
        </div>
      </div>

      {/* Overall Score Card */}
      <div className="glass-card border border-white/5 bg-slate-900/40 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Score Circle */}
          <div className="relative w-36 h-36 shrink-0">
            <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-slate-800" />
              <circle cx="60" cy="60" r="52" fill="none" stroke="url(#scoreGrad)" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${(metrics.overallScore / 5) * 327} 327`}
              />
              <defs>
                <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#eab308" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-mono font-black text-white">{metrics.overallScore}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">/ 5.0</span>
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="flex-1 space-y-4 w-full">
            {[
              { label: "Müşteri Memnuniyeti", value: metrics.avgRating, max: 5, color: "bg-amber-500", weight: "50%", icon: Star },
              { label: "Sipariş Karşılama", value: (metrics.fulfillmentRate / 20).toFixed(1), max: 5, color: "bg-emerald-500", weight: "35%", icon: Package },
              { label: "İade Performansı", value: (Math.max(0, 5 - metrics.returnRate * 0.1)).toFixed(1), max: 5, color: "bg-blue-500", weight: "15%", icon: RotateCcw }
            ].map((m) => (
              <div key={m.label} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <m.icon size={14} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-300">{m.label}</span>
                    <span className="text-[9px] text-slate-500 font-bold">({m.weight})</span>
                  </div>
                  <span className="text-xs font-mono font-black text-white">{m.value}/{m.max}</span>
                </div>
                <div className="h-2 bg-slate-950/40 border border-white/5 rounded-full overflow-hidden">
                  <div className={`h-full ${m.color} rounded-full transition-all duration-700`} style={{ width: `${(parseFloat(m.value) / m.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Toplam Sipariş", value: metrics.totalOrders, icon: Package, color: "text-blue-400", bg: "bg-blue-500/10", trend: metrics.fulfillmentRate > 70 ? "up" : "down" },
          { label: "Karşılama Oranı", value: `%${metrics.fulfillmentRate}`, icon: Truck, color: "text-emerald-400", bg: "bg-emerald-500/10", trend: metrics.fulfillmentRate > 80 ? "up" : "down" },
          { label: "Ort. Değerlendirme", value: `${metrics.avgRating} ★`, icon: Star, color: "text-amber-400", bg: "bg-amber-500/10", trend: parseFloat(metrics.avgRating) >= 4 ? "up" : "down" },
          { label: "İade Oranı", value: `%${metrics.returnRate}`, icon: RotateCcw, color: "text-red-400", bg: "bg-red-500/10", trend: metrics.returnRate < 5 ? "up" : "down" }
        ].map((kpi) => (
          <div key={kpi.label} className="glass-card border border-white/5 bg-slate-900/40 p-5 rounded-2xl shadow-sm hover:border-white/10 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                <kpi.icon size={18} className={kpi.color} />
              </div>
              <div className={`flex items-center gap-0.5 text-[10px] font-bold ${kpi.trend === "up" ? "text-emerald-400" : "text-red-400"}`}>
                {kpi.trend === "up" ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                {kpi.trend === "up" ? "İyi" : "Düşük"}
              </div>
            </div>
            <p className="text-xl font-mono font-black text-white">{kpi.value}</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Order Trend Chart */}
      <div className="glass-card border border-white/5 bg-slate-900/40 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-mono font-black uppercase tracking-tight text-white">Son 30 Gün Sipariş Trendi</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Günlük sipariş hacmi</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl">
            <TrendingUp size={14} className="text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-emerald-400">₺{metrics.totalRevenue.toLocaleString("tr-TR")} Ciro</span>
          </div>
        </div>
        <MiniLineChart data={metrics.dailyCounts} />
        <div className="flex justify-between mt-2">
          <span className="text-[9px] text-slate-500 font-bold">30 gün önce</span>
          <span className="text-[9px] text-slate-500 font-bold">Bugün</span>
        </div>
      </div>

      {/* Tips */}
      <div className="bg-gradient-to-r from-orange-500/5 to-amber-500/5 border border-orange-500/10 rounded-3xl p-6">
        <div className="flex items-start gap-4">
          <div className="bg-orange-500/10 p-3 rounded-2xl shrink-0">
            <Award size={24} className="text-orange-500" />
          </div>
          <div className="space-y-2">
            <h3 className="font-mono font-black text-sm text-white uppercase tracking-wider">Puanınızı Nasıl Artırırsınız?</h3>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-start gap-2"><ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" /> Siparişleri 24 saat içinde kargolayarak karşılama oranınızı yükseltin.</li>
              <li className="flex items-start gap-2"><ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" /> Müşteri yorumlarına hızlı ve profesyonel yanıt vererek memnuniyeti artırın.</li>
              <li className="flex items-start gap-2"><ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" /> İade taleplerini adil ve çabuk çözümleyerek iade oranınızı düşürün.</li>
              <li className="flex items-start gap-2"><ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" /> OEM uyumluluk bilgilerini doğru girerek yanlış sipariş oranını minimize edin.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
