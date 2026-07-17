import React, { useState, useEffect } from "react";
import { Wrench, Calendar, DollarSign, Star, Clock, CheckCircle2, ChevronRight, User, Settings, Shield, Plus, X, AlertCircle } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function MechanicDashboardView({ currentUser }) {
  const [appointments, setAppointments] = useState([]);
  const [activeJobs, setActiveJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active, history
  
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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Oto Servis & Bakım Paneli</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">İş emirleri oluşturun ve aktif randevularınızı yönetin.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsOrderModalOpen(true)}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-orange-500/20"
          >
            <Plus size={16} /> İş Emri Ekle
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Aktif Onarımlar", value: stats.activeCount, icon: Wrench, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Bekleyen Randevular", value: stats.pendingAppointments, icon: Calendar, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Toplam Hasılat", value: `₺${stats.monthlyEarnings.toLocaleString("tr-TR")}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Müşteri Puanı", value: `${stats.rating} / 5.0`, icon: Star, color: "text-yellow-500", bg: "bg-yellow-500/10" },
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
              ? "text-orange-500"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
          }`}
        >
          Aktif Talepler & Onarımlar
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-orange-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "history"
              ? "text-orange-500"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
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
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {activeTab === "active" ? "Aktif Servis & İş Emirleri" : "Tamamlanan İş Emirleri"}
            </h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${activeTab === "active" ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500"}`}>
              {activeTab === "active" ? "DEVAM EDEN" : "TAMAMLANANLAR"}
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
          ) : filteredJobs.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">Gösterilecek iş emri bulunmuyor.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {filteredJobs.map((job) => (
                <div key={job.id} className="py-4 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === "active" ? "bg-orange-500/10 text-orange-500" : "bg-emerald-500/10 text-emerald-500"}`}>
                      <Wrench size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">{job.profiles?.full_name || "Müşteri"}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Sipariş No: #{job.id.slice(0, 8)} · Tutar: ₺{job.total_amount} · Durum: <span className="font-bold text-slate-600 dark:text-slate-300 uppercase text-[9px]">{job.status}</span></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeTab === "active" && (
                      <button
                        onClick={() => handleCompleteJob(job.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Tamamla
                      </button>
                    )}
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Appointments List */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {activeTab === "active" ? "Randevu İstekleri" : "Geçmiş Randevular"}
            </h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${activeTab === "active" ? "bg-blue-500/10 text-blue-500" : "bg-slate-500/10 text-slate-500"}`}>
              {activeTab === "active" ? "YENİ İSTEKLER" : "GEÇMİŞ"}
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
          ) : filteredAppts.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">Randevu kaydı bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppts.slice(0, 5).map((appt) => (
                <div key={appt.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">{appt.profiles?.full_name || "Müşteri"}</h4>
                      <p className="text-[10px] text-slate-500">{appt.vehicles?.brand} {appt.vehicles?.model} ({appt.vehicles?.plate})</p>
                    </div>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded">
                      {new Date(appt.appointment_date).toLocaleDateString("tr-TR")}
                    </span>
                  </div>
                  {activeTab === "active" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveAppointment(appt.id)}
                        className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold py-2 rounded-xl text-xs transition-colors"
                      >
                        Onayla & İş Başlat
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: İş Emri Ekle */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setIsOrderModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black mb-4 uppercase">İş Emri Ekle</h3>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"><AlertCircle size={14} />{error}</div>}
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tutar (₺)</label>
                <input
                  type="number"
                  required
                  placeholder="Örn: 2400"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  value={orderForm.price}
                  onChange={(e) => setOrderForm({ ...orderForm, price: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Durum</label>
                <select
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
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
                className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors"
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
