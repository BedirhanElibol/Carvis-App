import React, { useState, useEffect } from "react";
import { Droplet, MapPin, Calendar, DollarSign, RefreshCw, Star, CheckCircle, Navigation, Plus, X, AlertCircle, Camera } from "lucide-react";
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
    <div className="space-y-8 font-sans text-slate-100">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-black text-white uppercase tracking-tighter">Seyyar Yıkama Paneli</h1>
          <p className="text-slate-400 text-xs mt-1">Bölgenizdeki seyyar / mobil yıkama taleplerini üstlenin.</p>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Aktif İşlerim", value: stats.activeWashes, icon: Navigation, color: "text-cyan-400", bg: "bg-cyan-500/10" },
          { label: "Tamamlanan Yıkama", value: stats.completedToday, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Su Tankı Kapasitesi", value: stats.waterLevel, icon: Droplet, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Toplam Hasılat", value: `₺${stats.earnings.toLocaleString("tr-TR")}`, icon: DollarSign, color: "text-orange-500", bg: "bg-yellow-500/10" },
        ].map((s) => (
          <div key={s.label} className="glass-card border border-white/5 bg-slate-900/40 p-6 rounded-xl flex items-center justify-between shadow-sm hover:border-white/10 transition-all duration-300">
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
          Aktif Yıkama Talepleri
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
          Geçmiş Yıkama İşlerim
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      {activeTab === "active" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Available Requests in Area */}
          <div className="glass-card border border-white/5 bg-slate-900/40 rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">Bölgenizdeki Yıkama Talepleri</h3>
              <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">HAZIR TALEPLER</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
            ) : availableRequests.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <Droplet size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">Bölgenizde açık talep bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {availableRequests.map((req) => (
                  <div key={req.id} className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <span className="bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                          {req.wash_type} Yıkama
                        </span>
                        <h4 className="font-bold text-sm text-white mt-2.5">Müşteri: {req.profiles?.full_name || "Gizli Müşteri"}</h4>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-sm text-white">₺{req.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin size={14} className="text-slate-500 shrink-0" />
                      <span className="truncate">{req.address_text}</span>
                    </div>
                    <button
                      onClick={() => handleAccept(req.id)}
                      className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors active-scale shadow-lg shadow-orange-500/10"
                    >
                      Görevi Kabul Et
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Work Orders */}
          <div className="glass-card border border-white/5 bg-slate-900/40 rounded-xl p-6 space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">Aktif Yıkama Görevlerim</h3>
              <span className="bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">İŞLEMDELER</span>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
            ) : myActiveJobs.length === 0 ? (
              <div className="py-12 text-center text-slate-500">
                <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
                <p className="font-bold text-sm">Üstlendiğiniz aktif görev yok.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {myActiveJobs.map((job) => (
                  <div key={job.id} className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                    <div className="flex justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-white">{job.profiles?.full_name || "Müşteri"}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">Araç: {job.vehicles?.brand} {job.vehicles?.model} ({job.vehicles?.plate})</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-black text-sm text-white">₺{job.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <MapPin size={14} className="text-slate-500 shrink-0" />
                      <span className="truncate">{job.address_text}</span>
                    </div>
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-2.5 rounded-xl text-[10px] text-emerald-300 flex items-center gap-2">
                      <Camera size={16} className="shrink-0 text-emerald-400" />
                      <span>360° Fotoğraf Kanıtı Alındı (Öncesi / Sonrası Çizik Teminatlı)</span>
                    </div>

                    <button
                      onClick={() => handleComplete(job.id)}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-colors flex items-center justify-center gap-1.5 active-scale shadow-lg shadow-emerald-500/20"
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
        <div className="glass-card border border-white/5 bg-slate-900/40 rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">Tamamlanan Yıkama Görevleri</h3>
            <span className="bg-slate-500/10 text-slate-400 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">GEÇMİŞ</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
          ) : myCompletedJobs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">Geçmişte tamamladığınız görev bulunmuyor.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCompletedJobs.map((job) => (
                <div key={job.id} className="p-4 rounded-2xl bg-slate-950/40 border border-white/5 space-y-3 hover:border-white/10 transition-colors">
                  <div className="flex justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-white">{job.profiles?.full_name || "Müşteri"}</h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">Araç: {job.vehicles?.brand} {job.vehicles?.model} ({job.vehicles?.plate})</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono font-black text-sm text-white">₺{job.price}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <MapPin size={14} className="text-slate-500 shrink-0" />
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
