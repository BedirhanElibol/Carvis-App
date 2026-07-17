import React, { useState, useEffect } from "react";
import { Droplet, MapPin, Calendar, DollarSign, RefreshCw, Star, CheckCircle, Navigation, Plus, X, AlertCircle } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function CarwashDashboardView({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active, history
  const [error, setError] = useState("");

  const [stats, setStats] = useState({
    activeWashes: 0,
    completedToday: 0,
    waterLevel: "94%",
    earnings: 0
  });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("carwash_requests")
        .select("*, profiles:customer_id(full_name, phone)")
        .order("created_at", { ascending: false });

      if (!error && data) {
        setRequests(data);
        const myActive = data.filter(r => r.status === "accepted" && r.provider_id === currentUser.id).length;
        const myCompleted = data.filter(r => r.status === "completed" && r.provider_id === currentUser.id);
        const totalEarnings = myCompleted.reduce((sum, r) => sum + (Number(r.price) || 0), 0);

        setStats({
          activeWashes: myActive,
          completedToday: myCompleted.length,
          waterLevel: "94%",
          earnings: totalEarnings
        });
      }
    } catch (err) {
      console.error("Carwash fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleAccept = async (id) => {
    const { error } = await supabase
      .from("carwash_requests")
      .update({ status: "accepted", provider_id: currentUser.id })
      .eq("id", id);
    if (!error) fetchData();
  };

  const handleComplete = async (id) => {
    const { error } = await supabase
      .from("carwash_requests")
      .update({ status: "completed" })
      .eq("id", id);
    if (!error) fetchData();
  };

  // Filter based on tabs
  const availableRequests = requests.filter(r => r.status === "pending");
  const myActiveJobs = requests.filter(r => r.status === "accepted" && r.provider_id === currentUser.id);
  const myCompletedJobs = requests.filter(r => r.status === "completed" && r.provider_id === currentUser.id);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Seyyar Yıkama Paneli</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Bölgenizdeki seyyar / mobil yıkama taleplerini üstlenin.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Aktif İşlerim", value: stats.activeWashes, icon: Navigation, color: "text-cyan-500", bg: "bg-cyan-500/10" },
          { label: "Tamamlanan Yıkama", value: stats.completedToday, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Su Tankı Kapasitesi", value: stats.waterLevel, icon: Droplet, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Toplam Hasılat", value: `₺${stats.earnings.toLocaleString("tr-TR")}`, icon: DollarSign, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{s.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${s.bg}`}>
              <s.icon size={24} className={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-black/5 dark:border-white/5 pb-px">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "active"
              ? "text-cyan-500"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
          }`}
        >
          Aktif Yıkama Talepleri
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "history"
              ? "text-cyan-500"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
          }`}
        >
          Geçmiş Yıkama İşlerim
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-cyan-500 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "active" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Requests in Area */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Bölgenizdeki Yıkama Talepleri</h3>
              <span className="bg-cyan-500/10 text-cyan-500 px-3 py-1 rounded-full text-[10px] font-bold">HAZIR TALEPLER</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
            ) : availableRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <Droplet size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">Bölgenizde açık talep bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <span className="bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                          {req.wash_type} Yıkama
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2">Müşteri: {req.profiles?.full_name || "Gizli Müşteri"}</h4>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-slate-900 dark:text-white">₺{req.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{req.address_text}</span>
                    </div>
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                    >
                      Görevi Kabul Et
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Work Orders */}
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Aktif Yıkama Görevlerim</h3>
              <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-bold">İŞLEMDELER</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
            ) : myActiveJobs.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">Üstlendiğiniz aktif görev yok.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myActiveJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-3">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">{job.profiles?.full_name || "Müşteri"}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">Araç: {job.vehicles?.brand} {job.vehicles?.model} ({job.vehicles?.plate})</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-sm text-slate-900 dark:text-white">₺{job.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span className="truncate">{job.address_text}</span>
                    </div>
                    <button
                      onClick={() => handleComplete(job.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
                    >
                      Yıkamayı Tamamla (Escrow Çöz)
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* History View */
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Tamamlanan Yıkama Görevleri</h3>
            <span className="bg-slate-500/10 text-slate-500 px-3 py-1 rounded-full text-[10px] font-bold">GEÇMİŞ</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
          ) : myCompletedJobs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">Geçmişte tamamladığınız görev bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCompletedJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-3">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{job.profiles?.full_name || "Müşteri"}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">Araç: {job.vehicles?.brand} {job.vehicles?.model} ({job.vehicles?.plate})</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-slate-900 dark:text-white">₺{job.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin size={14} className="text-slate-400 shrink-0" />
                    <span className="truncate">{job.address_text}</span>
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
