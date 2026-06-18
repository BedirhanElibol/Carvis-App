import React, { useState, useEffect, useCallback } from "react";
import * as Icons from "lucide-react";
import { useUI } from "../../../context/UIContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabaseClient";


const MechanicJobs = () => {
  const { showAlert } = useUI();
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("tender"); // 'tender' | 'my_jobs'
  const [loading, setLoading] = useState(true);

  const fetchJobs = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let combinedJobs = [];
      // 1. HAVUZ (Tender) sorgusu: service_requests tablosundan pending olanlar
      const { data: reqData, error: reqError } = await supabase
        .from("service_requests")
        .select("*")
        .or("status.eq.pending,status.eq.tender_open");

      if (!reqError && reqData) {
        const tenderMapped = reqData.map((r) => ({
          id: `req-${r.id}`,
          dbId: r.id,
          type: "request",
          car: `${r.brand || "Bilinmeyen"} ${r.model || ""}`,
          plate: r.plate || "------",
          customerName: "Gizli Müşteri",
          issue: r.demand_type || r.description || "Genel Kontrol",
          time: new Date(r.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          status: "tender_open",
          priority: "medium",
          price: 0,
          distance: "Yakında",
          isDb: true,
        }));
        combinedJobs = [...combinedJobs, ...tenderMapped];
      }

      // 2. BENİM İŞLERİM sorgusu: quotes tablosundan bana atanmışlar
      const { data: quoteData, error: quoteError } = await supabase
        .from("quotes")
        .select("*, service_request:service_requests(*)")
        .eq("seller_id", currentUser.id)
        .or("status.eq.accepted,status.eq.in_progress,status.eq.claimed");

      if (!quoteError && quoteData) {
        const myMapped = quoteData.map((q) => {
          const sr = q.service_request || {};
          return {
            id: `quote-${q.id}`,
            dbId: q.id,
            reqId: q.service_request_id,
            type: "quote",
            car: sr.brand ? `${sr.brand} ${sr.model}` : "Bilinmeyen Araç",
            plate: sr.plate || "------",
            customerName: "Müşteri",
            issue: q.description || sr.demand_type || "Sorun Belirtilmedi",
            time: new Date(q.created_at).toLocaleTimeString(),
            status: q.status === "accepted" ? "claimed" : q.status, // map DB accepted to UI claimed
            priority: "high",
            price: q.price || 0,
            isDb: true,
          };
        });
        combinedJobs = [...combinedJobs, ...myMapped];
      }

      if (combinedJobs.length === 0 && (reqError || quoteError)) {
        throw new Error("DB Error or Empty");
      }
      setJobs(combinedJobs);
    } catch (err) {
      console.warn("Gerçek veri çekilirken bir sorun oluştu veya liste boş.", err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleStatus = async (id, newStatus) => {
    const jobToUpdate = jobs.find((j) => j.id === id);
    // Optimistic UI Update
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status: newStatus } : job)),
    );

    if (jobToUpdate && jobToUpdate.isDb) {
      try {
        if (jobToUpdate.type === "request" && newStatus === "claimed") {
          // Havuzdan iş alındı. Bir Quote oluşturmamız lazım.
          await supabase.from("quotes").insert([
            {
              service_request_id: jobToUpdate.dbId,
              seller_id: currentUser.id,
              customer_id: currentUser.id, // Normalde SR'dan gelir ama mock
              price: 1000,
              status: "accepted", // UI mapped
            },
          ]);
          await supabase
            .from("service_requests")
            .update({ status: "claimed" })
            .eq("id", jobToUpdate.dbId);
        } else if (jobToUpdate.type === "quote") {
          // Sadece Quote'u güncelle
          const mappedStatus =
            newStatus === "completed" ? "pending" : "accepted"; // Mock mapping to avoid enum errors
          await supabase
            .from("quotes")
            .update({ status: mappedStatus })
            .eq("id", jobToUpdate.dbId);
        }
        fetchJobs(); // Yeniden çek
      } catch (e) {
        console.error("Status Update Error", e);
      }
    }

    if (newStatus === "claimed") {
      showAlert(
        "İş Üstlenildi",
        "İş sizin üzerinize alındı ve Müşteri detayları açıldı.",
        "success",
      );
    } else if (newStatus === "completed") {
      showAlert(
        "Tamamlandı",
        "Ödeme (Bloke) sistemde tutuluyor. Müşteri onayı bekleniyor.",
        "success",
      );
    }
  };

  const tenderJobs = jobs.filter((j) => j.status === "tender_open");
  const myJobs = jobs.filter((j) =>
    ["in_progress", "claimed"].includes(j.status),
  );

  return (
    <div className="space-y-6 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-sans text-white">
            İş Merkezi
          </h1>
          <p className="text-slate-400">
            Havuzdaki işleri üstlenin veya aktif işlerinizi yönetin.
          </p>
        </div>
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="p-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-all disabled:opacity-50"
        >
          <Icons.RefreshCw
            size={20}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>


      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-slate-900 rounded-2xl w-fit border border-white/5">
        <button
          onClick={() => setActiveTab("tender")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "tender"
              ? "bg-primary-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Açık İhaleler ({tenderJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("my_jobs")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "my_jobs"
              ? "bg-green-600 text-white shadow-lg"
              : "text-slate-400 hover:text-white hover:bg-white/5"
          }`}
        >
          Benim İşlerim ({myJobs.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-6">
        {activeTab === "tender" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h2 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <Icons.ShieldCheck size={14} /> GİZLİLİK MODU AKTİF - SADECE
                ARAÇ DEĞERLERİ GÖSTERİLİR
              </h2>
            </div>
            {tenderJobs.length === 0 ? (
              <p className="text-slate-500 p-8 border border-white/5 border-dashed rounded-2xl text-center md:col-span-2">
                Şu an havuzda hiç açık iş yok.
              </p>
            ) : (
              tenderJobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-card p-5 rounded-2xl border border-white/5 hover:border-primary-500/30 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Icons.EyeOff size={100} />
                  </div>
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            job.priority === "high"
                              ? "bg-red-500/20 text-red-500"
                              : "bg-slate-800 text-slate-400"
                          }`}
                        >
                          {job.priority === "high" ? "ACİL İŞ" : "NORMAL"}
                        </span>
                        <span className="text-slate-500 text-xs font-mono tracking-widest">
                          {job.plate.substring(0, 2)} *** **
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-white">
                        {job.car}
                      </h3>
                      <p className="text-slate-400 font-medium flex items-center gap-2 text-sm mt-1">
                        <Icons.AlertCircle size={14} /> {job.issue} •{" "}
                        {job.distance} Uzakta
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-bold flex items-center gap-1 justify-end">
                        <Icons.Banknote size={16} /> ₺{job.price}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Tahmini Kazanç
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleStatus(job.id, "claimed")}
                    className="w-full relative z-10 bg-primary-600/20 hover:bg-primary-600 text-primary-400 hover:text-white border border-primary-500/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale"
                  >
                    TALEBİ ÜSTLEN VEYA BİLGİ İSTE
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        {activeTab === "my_jobs" && (
          <div className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <h2 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>{" "}
                ŞU AN SİZDE OLAN İŞLER
              </h2>
            </div>
            {myJobs.length === 0 ? (
              <p className="text-slate-500 p-8 border border-white/5 border-dashed rounded-2xl text-center md:col-span-2">
                Üstlendiğiniz bir iş bulunmuyor.
              </p>
            ) : (
              myJobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-card p-6 rounded-2xl border border-green-500/30 bg-green-500/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Icons.Wrench size={100} />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-green-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          MÜŞTERİ ONAYLI
                        </span>
                        <span className="text-slate-300 text-xs font-mono bg-black/50 px-2 py-0.5 rounded">
                          Plaka: {job.plate}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-white">
                        {job.car}
                      </h3>
                      <div className="text-slate-300 font-medium flex flex-col gap-1 mt-2 text-sm text-yellow-400">
                        <span className="flex items-center gap-2 text-slate-400">
                          Müşteri:{" "}
                          <strong className="text-white">
                            {job.customerName}
                          </strong>
                        </span>
                        <span className="flex items-center gap-2">
                          <Icons.AlertCircle size={14} /> {job.issue}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {job.status === "claimed" ? (
                        <button
                          onClick={() => handleStatus(job.id, "in_progress")}
                          className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-xl font-bold transition-all active-scale"
                        >
                          ARACI TESLİM ALDIM
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatus(job.id, "completed")}
                          className="w-full md:w-auto bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all active-scale"
                        >
                          <Icons.CheckCircle size={18} /> İŞİ BİTİR (₺
                          {job.price} AL)
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MechanicJobs;
