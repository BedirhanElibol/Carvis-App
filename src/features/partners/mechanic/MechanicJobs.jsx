import React, { useState, useEffect, useCallback } from "react";
import { AlertCircle, Banknote, CheckCircle, Clock, EyeOff, RefreshCw, ShieldCheck, Wrench, X } from "lucide-react";
import { useUI } from "../../../context/UIContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../supabaseClient";


import { calculateLaborCeiling, validateQuoteLaborPrice } from "../../../utils/laborStandards";
import { validatePartPriceMarkup } from "../../../utils/partPriceChecker";

const MechanicJobs = () => {
  const { showAlert } = useUI();
  const { currentUser } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState("tender"); // 'tender' | 'my_jobs'
  const [loading, setLoading] = useState(true);
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedJobForBid, setSelectedJobForBid] = useState(null);
  const [bidPrice, setBidPrice] = useState("");
  const [bidPartsPrice, setBidPartsPrice] = useState("");
  const [bidNote, setBidNote] = useState("");
  const [bidDeliveryDays, setBidDeliveryDays] = useState("2");
  const [hourlyLaborRate, setHourlyLaborRate] = useState(1000);

  const fetchJobs = useCallback(async () => {
    if (!currentUser) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // Fetch partner hourly labor rate from profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("hourly_labor_rate")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileData?.hourly_labor_rate) {
        setHourlyLaborRate(parseFloat(profileData.hourly_labor_rate));
      }

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
          customerId: r.user_id,
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

  const openBidModal = (job) => {
    setSelectedJobForBid(job);
    setBidPrice("");
    setBidPartsPrice("");
    setBidNote("");
    setBidDeliveryDays("2");
    setShowBidModal(true);
  };

  const handlePlaceBid = async () => {
    if (!selectedJobForBid || !bidPrice) {
      showAlert("Hata", "Lütfen teklif tutarı girin.", "warning");
      return;
    }

    setLoading(true);
    try {
      const oemInfo = calculateLaborCeiling(selectedJobForBid.issue, { model: selectedJobForBid.car }, hourlyLaborRate);
      const validation = validateQuoteLaborPrice(bidPrice, selectedJobForBid.issue, { model: selectedJobForBid.car }, hourlyLaborRate, bidPartsPrice);

      const { error: quoteError } = await supabase.from("quotes").insert([
        {
          service_request_id: selectedJobForBid.dbId,
          seller_id: currentUser.id,
          customer_id: selectedJobForBid.customerId,
          price: parseFloat(bidPrice),
          labor_price: validation.estimatedLaborPrice,
          parts_price: validation.estimatedPartsPrice,
          standard_hours: oemInfo.standardHours,
          max_labor_ceiling: oemInfo.maxLaborCeiling,
          is_oem_compliant: validation.isCompliant,
          description: bidNote.trim() || `${selectedJobForBid.car} için OEM standartlarına uygun usta teklifi`,
          warranty_months: 12,
          estimated_delivery_days: parseInt(bidDeliveryDays) || 2,
          status: "pending",
        },
      ]);

      if (quoteError) throw quoteError;

      await supabase
        .from("service_requests")
        .update({ status: "tender_open" })
        .eq("id", selectedJobForBid.dbId);

      showAlert("Başarılı", "Teklifiniz iletildi, müşteri onayı bekleniyor.", "success");
      setShowBidModal(false);
      fetchJobs();
    } catch (err) {
      console.error("Place bid error:", err);
      showAlert("Hata", "Teklif verilirken bir hata oluştu.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, newStatus) => {
    const jobToUpdate = jobs.find((j) => j.id === id);
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, status: newStatus } : job)),
    );

    if (jobToUpdate && jobToUpdate.isDb) {
      try {
        if (jobToUpdate.type === "quote") {
          const mappedStatus =
            newStatus === "completed" ? "completed" : "accepted";
          await supabase
            .from("quotes")
            .update({ status: mappedStatus })
            .eq("id", jobToUpdate.dbId);
        }
        fetchJobs();
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
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-black font-sans text-slate-900 dark:text-white">
              İş Merkezi
            </h1>
            <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 uppercase tracking-widest">
              <ShieldCheck size={12} /> Sigorta Onaylı Servis
            </span>
          </div>
          <p className="text-slate-500 dark:text-slate-400">
            Havuzdaki işleri üstlenin veya aktif işlerinizi yönetin.
          </p>
        </div>
        <button
          onClick={fetchJobs}
          disabled={loading}
          className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white rounded-xl transition-all disabled:opacity-50"
        >
          <RefreshCw
            size={20}
            className={loading ? "animate-spin" : ""}
          />
        </button>
      </div>


      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white dark:bg-slate-900 rounded-2xl w-fit border border-black/5 dark:border-white/5">
        <button
          onClick={() => setActiveTab("tender")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "tender"
              ? "bg-primary-600 text-slate-900 dark:text-white shadow-lg"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-black/5 dark:bg-white/5"
          }`}
        >
          Açık İhaleler ({tenderJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("my_jobs")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "my_jobs"
              ? "bg-green-600 text-slate-900 dark:text-white shadow-lg"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-black/5 dark:bg-white/5"
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
                <ShieldCheck size={14} /> GİZLİLİK MODU AKTİF - SADECE
                ARAÇ DEĞERLERİ GÖSTERİLİR
              </h2>
            </div>
            {tenderJobs.length === 0 ? (
              <p className="text-slate-500 p-8 border border-black/5 dark:border-white/5 border-dashed rounded-2xl text-center md:col-span-2">
                Şu an havuzda hiç açık iş yok.
              </p>
            ) : (
              tenderJobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-card p-5 rounded-2xl border border-black/5 dark:border-white/5 hover:border-primary-500/30 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <EyeOff size={100} />
                  </div>
                  <div className="relative z-10 flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                            job.priority === "high"
                              ? "bg-red-500/20 text-red-500"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {job.priority === "high" ? "ACİL İŞ" : "NORMAL"}
                        </span>
                        {(job.is_insurance_claim || job.issue?.toLowerCase().includes("kasko") || job.issue?.toLowerCase().includes("sigorta")) && (
                          <span className="bg-primary-500/20 text-primary-400 border border-primary-500/30 text-[9px] font-black px-2 py-0.5 rounded uppercase flex items-center gap-1">
                            <ShieldCheck size={10} /> SİGORTA KAPSAMINDA
                          </span>
                        )}
                        <span className="text-slate-500 text-xs font-mono tracking-widest">
                          {job.plate.substring(0, 2)} *** **
                        </span>
                      </div>
                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {job.car}
                      </h3>
                      <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2 text-sm mt-1">
                        <AlertCircle size={14} /> {job.issue} •{" "}
                        {job.distance} Uzakta
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold flex items-center gap-1 justify-end">
                        Açık İhale
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        Teklif Usulü
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => openBidModal(job)}
                    className="w-full relative z-10 bg-primary-600/20 hover:bg-primary-600 text-primary-400 hover:text-slate-900 dark:text-white border border-primary-500/20 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active-scale font-sans"
                  >
                    TEKLİF VER / İNCELE
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
              <p className="text-slate-500 p-8 border border-black/5 dark:border-white/5 border-dashed rounded-2xl text-center md:col-span-2">
                Üstlendiğiniz bir iş bulunmuyor.
              </p>
            ) : (
              myJobs.map((job) => (
                <div
                  key={job.id}
                  className="glass-card p-6 rounded-2xl border border-green-500/30 bg-green-500/5 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Wrench size={100} />
                  </div>
                  <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-green-500 text-slate-900 dark:text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">
                          MÜŞTERİ ONAYLI
                        </span>
                        <span className="text-slate-600 dark:text-slate-300 text-xs font-mono bg-black/50 px-2 py-0.5 rounded">
                          Plaka: {job.plate}
                        </span>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        {job.car}
                      </h3>
                      <div className="text-slate-600 dark:text-slate-300 font-medium flex flex-col gap-1 mt-2 text-sm text-yellow-400">
                        <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                          Müşteri:{" "}
                          <strong className="text-slate-900 dark:text-white">
                            {job.customerName}
                          </strong>
                        </span>
                        <span className="flex items-center gap-2">
                          <AlertCircle size={14} /> {job.issue}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 w-full md:w-auto">
                      {job.status === "claimed" ? (
                        <button
                          onClick={() => handleStatus(job.id, "in_progress")}
                          className="w-full md:w-auto bg-slate-100 dark:bg-slate-800 hover:bg-slate-700 text-slate-900 dark:text-white px-6 py-3 rounded-xl font-bold transition-all active-scale"
                        >
                          ARACI TESLİM ALDIM
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatus(job.id, "completed")}
                          className="w-full md:w-auto bg-green-500 hover:bg-green-400 text-slate-900 dark:text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-500/20 transition-all active-scale"
                        >
                          <CheckCircle size={18} /> İŞİ BİTİR (₺
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

      {/* Bid Modal */}
      {showBidModal && selectedJobForBid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
          <div className="glass-card w-full max-w-lg p-6 rounded-[2.5rem] border border-black/10 dark:border-white/10 space-y-6 animate-in scale-in duration-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-primary-500/10 text-primary-400 rounded-xl border border-primary-500/20">
                  <Wrench size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-tight text-sm font-sans">
                    TEKLİF VER (İHALE)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-sans">
                    {selectedJobForBid.car}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowBidModal(false)}
                className="p-2 text-slate-400 hover:text-slate-200 rounded-lg active-scale"
              >
                <X size={20} />
              </button>
            </div>

            {/* OEM Labor Standards Info Card */}
            {selectedJobForBid && (() => {
              const oem = calculateLaborCeiling(selectedJobForBid.issue, { model: selectedJobForBid.car }, hourlyLaborRate);
              return (
                <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 to-blue-950/40 rounded-2xl border border-cyan-500/30 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-cyan-400 font-black uppercase tracking-wider text-[10px]">
                    <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> OEM Standart İşçilik Güvencesi</span>
                    <span className="text-slate-400 font-normal">{oem.categoryName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-300 font-mono text-[11px] pt-0.5">
                    <span>Fabrika Süresi: <strong className="text-white">{oem.standardHours} Saat</strong></span>
                    <span>Azami İşçilik Tavanı: <strong className="text-emerald-400 font-bold">{oem.maxLaborCeiling.toLocaleString('tr-TR')} TL</strong></span>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
                  Toplam Teklif Tutarı (TL)
                </label>
                <div className="mt-2 flex items-center gap-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-black/10 dark:border-white/10 px-4 py-3">
                  <Banknote size={18} className="text-primary-400" />
                  <input
                    type="number"
                    value={bidPrice}
                    onChange={(e) => setBidPrice(e.target.value)}
                    placeholder="Örn: 2500"
                    className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-600 font-mono"
                  />
                  <span className="text-xs text-slate-500 font-bold font-sans">TL</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
                  Tahmini Parça Maliyeti (Varsa)
                </label>
                <div className="mt-2 flex items-center gap-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-black/10 dark:border-white/10 px-4 py-3">
                  <Banknote size={18} className="text-teal-400" />
                  <input
                    type="number"
                    value={bidPartsPrice}
                    onChange={(e) => setBidPartsPrice(e.target.value)}
                    placeholder="Örn: 1200 (Kalanı işçilik sayılır)"
                    className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-600 font-mono"
                  />
                  <span className="text-xs text-slate-500 font-bold font-sans">TL</span>
                </div>
                {bidPartsPrice > 0 && selectedJobForBid && (() => {
                  const check = validatePartPriceMarkup(selectedJobForBid.issue, bidPartsPrice);
                  return (
                    <div className={`mt-2 p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between ${
                      check.isOverpriced
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    }`}>
                      <span>
                        {check.isOverpriced ? '⚠️ Piyasa Tavanı Aşıldı:' : '🟢 Piyasa Perakende Fiyatı:'}{' '}
                        <strong>{check.fairMin.toLocaleString('tr-TR')} TL – {check.fairMax.toLocaleString('tr-TR')} TL</strong>
                      </span>
                      {check.isOverpriced && (
                        <span className="font-bold text-red-400">+{check.markupPercent}% Fiyat Farkı</span>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
                  Tahmini İş Süresi (İş Günü)
                </label>
                <div className="mt-2 flex items-center gap-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-black/10 dark:border-white/10 px-4 py-3">
                  <Clock size={18} className="text-primary-400" />
                  <input
                    type="number"
                    value={bidDeliveryDays}
                    onChange={(e) => setBidDeliveryDays(e.target.value)}
                    placeholder="Örn: 2"
                    className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-600 font-mono"
                  />
                  <span className="text-xs text-slate-500 font-bold font-sans">GÜN</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest font-sans">
                  Açıklama / Yapılacak İşlemler
                </label>
                <textarea
                  value={bidNote}
                  onChange={(e) => setBidNote(e.target.value)}
                  rows={3}
                  placeholder="Kullanılacak parça kalitesi, garanti durumu ve işçilik detaylarını yazın..."
                  className="mt-2 w-full bg-white dark:bg-slate-900/80 rounded-2xl border border-black/10 dark:border-white/10 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-600 outline-none resize-none font-sans"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowBidModal(false)}
                className="bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active-scale border border-black/10 dark:border-white/10 font-sans"
              >
                İPTAL
              </button>
              <button
                onClick={handlePlaceBid}
                className="bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-500 hover:to-primary-500 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active-scale shadow-xl shadow-primary-900/40 border border-black/10 dark:border-white/10 font-sans"
              >
                TEKLİF GÖNDER
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MechanicJobs;
