import React, { useState, useEffect } from "react";
import { Truck, AlertTriangle, Navigation, Clock, CheckCircle, Check, Plus, X, AlertCircle } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function TowTruckDashboardView({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active, history
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    activeRuns: 0,
    responseTime: "14 Dk",
    fleetCapacity: "8 / 10 Mobil",
    earnings: 0
  });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("emergency_requests")
        .select("*, profiles:customer_id(full_name, phone)")
        .in("status", ["paid_searching", "accepted", "completed"])
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRequests(data);
        const myActive = data.filter(r => r.status === "accepted" && r.assigned_provider_id === currentUser.id).length;
        const myCompleted = data.filter(r => r.status === "completed" && r.assigned_provider_id === currentUser.id);
        const totalEarnings = myCompleted.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

        setStats({
          activeRuns: myActive,
          responseTime: "14 Dk",
          fleetCapacity: "8 / 10 Mobil",
          earnings: totalEarnings
        });
      }
    } catch (err) {
      console.error("Tow truck fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleAccept = async (id) => {
    const { error } = await supabase
      .from("emergency_requests")
      .update({ status: "accepted", assigned_provider_id: currentUser.id })
      .eq("id", id);
    if (!error) fetchData();
  };

  const handleComplete = async (id) => {
    const { error } = await supabase
      .from("emergency_requests")
      .update({ status: "completed" })
      .eq("id", id);
    if (!error) fetchData();
  };

  // Filters based on tab
  const emergencyPool = requests.filter(r => r.status === "paid_searching");
  const activeAssignments = requests.filter(r => r.status === "accepted" && r.assigned_provider_id === currentUser.id);
  const completedAssignments = requests.filter(r => r.status === "completed" && r.assigned_provider_id === currentUser.id);

  return (
    <div className="space-y-8 font-sans text-slate-100">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-black text-white uppercase tracking-tighter glow-orange">Acil Çekici İstasyon Paneli</h1>
          <p className="text-slate-400 text-xs mt-1">Havuzdaki çekici çağrıları ve aktif operasyonlarınız.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Aktif Görevler", value: stats.activeRuns, icon: Truck, color: "text-red-400", bg: "bg-red-500/10" },
          { label: "Ort. Yanıt Süresi", value: stats.responseTime, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { label: "Mevcut Filo Gücü", value: stats.fleetCapacity, icon: Navigation, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Toplam SOS Hasılatı", value: `₺${stats.earnings.toLocaleString("tr-TR")}`, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
        ].map((s) => (
          <div key={s.label} className="glass-card border border-white/5 bg-slate-900/40 p-6 rounded-3xl flex items-center justify-between shadow-sm hover:border-white/10 transition-all duration-300">
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-mono font-black text-white mt-1.5">{s.value}</h3>
            </div>
            <div className={`p-4 rounded-2xl ${s.bg}`}>
              <s.icon size={22} className={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-white/5 pb-px">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all cursor-pointer relative ${
            activeTab === "active"
              ? "text-orange-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Aktif Çağrılar & Görevler
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all cursor-pointer relative ${
            activeTab === "history"
              ? "text-orange-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Geçmiş SOS Görevleri
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "active" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* SOS Emergency Queue */}
          <div className="glass-card border border-white/5 bg-slate-900/40 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">Acil Çekici Çağrı Havuzu</h3>
              <span className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider animate-pulse">CANLI ACİL SOS</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
            ) : emergencyPool.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <AlertTriangle size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">Havuzda aktif çekici çağrısı yok.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {emergencyPool.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-red-500/5 border border-red-500/10 space-y-3 hover:border-red-500/20 transition-all">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">Acil Çekici Talebi</h4>
                        <p className="text-[10px] text-slate-400 mt-1">{req.description || "Yol yardımı talebi"}</p>
                      </div>
                      <p className="font-mono font-black text-sm text-red-400">₺{req.price}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <Navigation size={14} className="text-slate-500" />
                      <span>Konum: {req.lat.toFixed(4)}, {req.lng.toFixed(4)}</span>
                    </div>
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="w-full bg-red-600 hover:bg-red-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors active-scale shadow-lg shadow-red-500/20"
                    >
                      Görevi Üstlen (Yola Çık)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Towing Assignments */}
          <div className="glass-card border border-white/5 bg-slate-900/40 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">Aktif Görevlerim</h3>
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">ROTA ÜZERİNDE</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
            ) : activeAssignments.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Truck size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">Üzerinizde aktif görev bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeAssignments.map((job) => (
                  <div key={job.id} className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{job.profiles?.full_name || "Müşteri"}</h4>
                        <p className="text-[10px] text-slate-400 mt-1">{job.description || "Yol yardımı talebi"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-sm text-white">₺{job.price}</p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center bg-slate-950/40 border border-white/5 p-3 rounded-xl text-xs">
                      <span className="font-bold text-slate-400">İletişim:</span>
                      <span className="font-mono font-bold text-white">{job.profiles?.phone || "05xx xxx xx xx"}</span>
                    </div>
                    <button
                      onClick={() => handleComplete(job.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-colors flex items-center justify-center gap-1.5 active-scale shadow-lg shadow-emerald-500/20"
                    >
                      <Check size={16} /> Çekimi Tamamladım (Ödeme Al)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History View */
        <div className="glass-card border border-white/5 bg-slate-900/40 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">Geçmiş Kurtarma Görevleri</h3>
            <span className="bg-slate-500/10 text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">GEÇMİŞ</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
          ) : completedAssignments.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">Geçmişte tamamladığınız görev bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedAssignments.map((job) => (
                <div key={job.id} className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{job.profiles?.full_name || "Müşteri"}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">{job.description || "Yol yardımı talebi"}</p>
                    </div>
                    <p className="font-mono font-black text-sm text-white">₺{job.price}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
