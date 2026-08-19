import React, { useState, useEffect } from "react";
import { Wrench, Calendar, DollarSign, Star, Clock, CheckCircle2, ChevronRight, User, Settings, Shield, Plus, X, AlertCircle, Phone, Navigation, Volume2, BellRing } from "lucide-react";
import { supabase } from "../../../supabaseClient";

// Web Audio API Loud Workshop Alert Sound for Mechanics
const playLoudWorkshopSiren = () => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    
    // Play 2-tone alarm chime
    const playTone = (freq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "square"; // Loud piercing square wave for noisy garages
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(0.35, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    };

    playTone(900, ctx.currentTime, 0.25);
    playTone(1200, ctx.currentTime + 0.3, 0.35);
  } catch (e) {
    console.warn("Audio alert blocked:", e);
  }
};

export default function MechanicDashboardView({ currentUser }) {
  const [appointments, setAppointments] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active, history
  const [newJobAlert, setNewJobAlert] = useState(null); // Realtime alert popup
  
  // Modals
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [orderForm, setOrderForm] = useState({
    price: "",
    status: "in_progress"
  });

  const [stats, setStats] = useState({
    monthlyEarnings: 0,
    activeCount: 0,
    pendingAppointments: 0,
    rating: "5.0"
  });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // 1. Fetch all appointments for the current seller
      const { data: appts } = await supabase
        .from("appointments")
        .select("*, vehicles(brand, model, plate), profiles:customer_id(full_name, phone)")
        .eq("seller_id", currentUser.id)
        .order("appointment_date", { ascending: true });

      setAppointments(appts || []);

      // 2. Fetch all repair jobs (orders) for the current seller
      const { data: jobs } = await supabase
        .from("orders")
        .select("*, profiles:customer_id(full_name, phone)")
        .eq("seller_id", currentUser.id)
        .order("created_at", { ascending: false });

      setActiveJobs(jobs || []);

      // 3. Calculate earnings
      const completed = jobs?.filter(o => o.status === "completed" || o.status === "payout_processed") || [];
      const totalEarnings = completed.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
      const ratings = completed.filter(o => o.rating) || [];
      const avgRating = ratings.length > 0
        ? (ratings.reduce((sum, o) => sum + o.rating, 0) / ratings.length).toFixed(1)
        : "5.0";

      const activeCount = jobs?.filter(o => ["pending", "in_progress", "ready"].includes(o.status)).length || 0;
      const pendingAppts = appts?.filter(a => a.status === "pending").length || 0;

      setStats({
        monthlyEarnings: totalEarnings,
        activeCount,
        pendingAppointments: pendingAppts,
        rating: avgRating
      });
    } catch (err) {
      console.error("Mechanic fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (!currentUser?.id) return;

    // Realtime listener for incoming customer requests/appointments
    const subscription = supabase
      .channel(`mechanic_alerts_${currentUser.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'appointments', filter: `seller_id=eq.${currentUser.id}` },
        (payload) => {
          playLoudWorkshopSiren();
          setNewJobAlert(payload.new);
          fetchData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [currentUser]);

  const handleApproveAppointment = async (id) => {
    setError("");
    // Find appointment details
    const appt = appointments.find(a => a.id === id);
    if (!appt) return;

    try {
      // 1. Update appointment status to approved
      const { error: apptErr } = await supabase
        .from("appointments")
        .update({ status: "approved" })
        .eq("id", id);

      if (apptErr) throw apptErr;

      // 2. Automatically create an active repair work order in progress
      const { error: orderErr } = await supabase
        .from("orders")
        .insert([{
          seller_id: currentUser.id,
          customer_id: appt.customer_id,
          vehicle_id: appt.vehicle_id,
          total_amount: 1500, // Standard base diagnostics fee placeholder
          status: "in_progress",
          commission_rate: 0.1
        }]);

      if (orderErr) throw orderErr;
      fetchData();
    } catch (err) {
      console.error("Error approving appointment:", err);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    setError("");
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .insert([{
          seller_id: currentUser.id,
          customer_id: currentUser.id, // Self-served or dummy customer mapping
          total_amount: Number(orderForm.price),
          status: orderForm.status,
          commission_rate: 0.1
        }]);

      if (error) throw error;
      setIsOrderModalOpen(false);
      setOrderForm({ price: "", status: "in_progress" });
      fetchData();
    } catch (err) {
      setError(err.message || "İş emri oluşturulamadı.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteJob = async (id) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "completed" })
      .eq("id", id);
    if (!error) fetchData();
  };

  // Filters based on activeTab
  const filteredJobs = activeJobs.filter(job => {
    if (activeTab === "active") {
      return ["pending", "in_progress", "ready"].includes(job.status);
    } else {
      return ["completed", "payout_processed"].includes(job.status);
    }
  });

  const filteredAppts = appointments.filter(appt => {
    if (activeTab === "active") {
      return appt.status === "pending";
    } else {
      return ["approved", "declined"].includes(appt.status);
    }
  });

  return (
    <div className="space-y-8 font-sans text-slate-100">
      {/* Realtime Siren Flash Alert Banner for New Customer Orders */}
      {newJobAlert && (
        <div className="bg-gradient-to-r from-rose-600 via-red-600 to-amber-600 border-2 border-amber-300 p-5 rounded-xl animate-pulse flex items-center justify-between gap-4 text-white">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/20 rounded-2xl animate-bounce">
              <BellRing size={28} className="text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded text-amber-300">
                🚨 YENİ MÜŞTERİ TALEBİ GELDİ!
              </span>
              <h4 className="font-black text-lg uppercase mt-1">Acil Hizmet Bekliyor</h4>
              <p className="text-xs text-amber-100 font-medium">Lütfen aşağıdaki listeden talebi inceleyip teklif verin veya kabul edin.</p>
            </div>
          </div>
          <button
            onClick={() => setNewJobAlert(null)}
            className="px-4 py-2 bg-black/40 hover:bg-black/60 text-white rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer border border-white/20"
          >
            Kapat
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-mono font-black text-white uppercase tracking-tighter">Oto Servis & Bakım Paneli</h1>
          <p className="text-slate-400 text-xs mt-1">İş emirleri oluşturun ve aktif randevularınızı yönetin.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all cursor-pointer active-scale shadow-lg shadow-orange-500/20"
          >
            <Plus size={16} /> İş Emri Ekle
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Aktif Onarımlar", value: stats.activeCount, icon: Wrench, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Bekleyen Randevular", value: stats.pendingAppointments, icon: Calendar, color: "text-blue-400", bg: "bg-blue-500/10" },
          { label: "Toplam Hasılat", value: `₺${stats.monthlyEarnings.toLocaleString("tr-TR")}`, icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10" },
          { label: "Müşteri Puanı", value: `${stats.rating} / 5.0`, icon: Star, color: "text-amber-400", bg: "bg-amber-500/10" },
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
          Aktif Talepler & Onarımlar
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
          Geçmiş & Tamamlananlar
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Repair Jobs List */}
        <div className="glass-card border border-white/5 bg-slate-900/40 rounded-xl p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">
              {activeTab === "active" ? "Aktif Servis & İş Emirleri" : "Tamamlanan İş Emirleri"}
            </h3>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${activeTab === "active" ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500"}`}>
              {activeTab === "active" ? "DEVAM EDEN" : "TAMAMLANANLAR"}
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-4">
              <Wrench size={40} className="mx-auto text-orange-500/40" />
              <div>
                <p className="font-black text-sm text-white">Henüz Aktif İş Emri Bulunmuyor</p>
                <p className="text-xs text-slate-400 mt-1">Dükkanınıza gelen müşteri araçları için yeni bir iş emri başlatabilirsiniz.</p>
              </div>
              <button
                onClick={() => setIsOrderModalOpen(true)}
                className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider cursor-pointer transition-all active-scale shadow-lg shadow-orange-900/30"
              >
                <Plus size={16} /> + İlk İş Emrini Oluştur
              </button>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filteredJobs.map((job) => (
                <div key={job.id} className="py-4 flex justify-between items-center group cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "active" ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                      <Wrench size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{job.profiles?.full_name || "Müşteri"}</h4>
                      <p className="text-[10px] text-slate-400 mt-1">Sipariş: #{job.id.slice(0, 8)} · Tutar: ₺{job.total_amount} · Durum: <span className="font-black text-slate-300 uppercase text-[9px]">{job.status}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeTab === "active" && (
                      <button
                        onClick={() => handleCompleteJob(job.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors cursor-pointer flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Tamamla
                      </button>
                    )}
                    <ChevronRight size={16} className="text-slate-500 group-hover:text-white transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointments List */}
        <div className="glass-card border border-white/5 bg-slate-900/40 rounded-xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-mono font-black text-white uppercase tracking-tight">
              {activeTab === "active" ? "Randevu İstekleri" : "Geçmiş Randevular"}
            </h3>
            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${activeTab === "active" ? "bg-blue-500/10 text-blue-400" : "bg-slate-500/10 text-slate-400"}`}>
              {activeTab === "active" ? "YENİ İSTEKLER" : "GEÇMİŞ"}
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
          ) : filteredAppts.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <Calendar size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">Randevu kaydı bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppts.slice(0, 5).map((appt) => {
                const customerPhone = appt.profiles?.phone || appt.phone;
                const vehicleAddress = appt.service_address || "İstanbul";
                return (
                  <div key={appt.id} className="p-4 rounded-2xl bg-slate-950/60 border border-orange-500/20 space-y-3 hover:border-orange-500/40 transition-colors shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-black text-sm text-white">{appt.profiles?.full_name || "Müşteri"}</h4>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{appt.vehicles?.brand} {appt.vehicles?.model} ({appt.vehicles?.plate})</p>
                      </div>
                      <span className="text-[9px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded font-black uppercase">
                        {new Date(appt.appointment_date).toLocaleDateString("tr-TR")}
                      </span>
                    </div>

                    {/* Quick Call & Location Buttons for Garages (Large Touch Targets) */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {customerPhone ? (
                        <a
                          href={`tel:${customerPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl shadow-md border border-emerald-400/20 transition-all no-underline"
                        >
                          <Phone size={14} /> Müşteriyi Ara
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-500 flex items-center justify-center py-2 bg-slate-900 rounded-xl">Telefon Belirtilmemiş</span>
                      )}

                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(vehicleAddress)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-[11px] uppercase tracking-wider rounded-xl shadow-md border border-cyan-400/20 transition-all no-underline"
                      >
                        <Navigation size={14} /> Haritada Gör
                      </a>
                    </div>

                    {activeTab === "active" && (
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={() => handleApproveAppointment(appt.id)}
                          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer transition-colors active-scale shadow-lg shadow-orange-900/30"
                        >
                          Onayla & İş Başlat
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal: İş Emri Ekle */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-xl p-6 relative">
            <button onClick={() => setIsOrderModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
            <h3 className="text-lg font-mono font-black mb-4 uppercase text-white">İş Emri Ekle</h3>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"><AlertCircle size={14} />{error}</div>}
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Tutar (₺)</label>
                <input
                  type="number"
                  required
                  placeholder="Örn: 2400"
                  className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-orange-500/50 outline-none text-white"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Durum</label>
                <select
                  className="w-full bg-slate-950/60 border border-white/5 rounded-xl px-4 py-3 text-xs focus:border-orange-500/50 outline-none text-white"
                  value={orderForm.status}
                  onChange={(e) => setOrderForm({ ...orderForm, status: e.target.value })}
                >
                  <option value="in_progress">Onarımda</option>
                  <option value="ready">Hazır</option>
                </select>
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl text-xs uppercase tracking-widest cursor-pointer transition-colors active-scale"
              >
                {actionLoading ? "Kaydediliyor..." : "İş Emrini Kaydet"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
