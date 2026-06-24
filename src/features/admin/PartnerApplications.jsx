import React, { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import * as Icons from "lucide-react";
 
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "../../context/UIContext";
// Admin module for reviewing corporate partner applications
const PartnerApplications = () => {
  const { showAlert } = useUI();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending"); // pending, approved, rejected, all
  const [selectedApp, setSelectedApp] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("partner_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error("Fetch errors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appId, userId, newStatus) => {
    setActionLoading(true);
    try {
      // 1. Update Application Status
      const { error: appError } = await supabase
        .from("partner_applications")
        .update({ status: newStatus, updated_at: new Date() })
        .eq("id", appId);

      if (appError) throw appError;

      // 2. Update Profile application_status and escalate role
      const profileUpdates = { application_status: newStatus };
      if (newStatus === "approved") {
        profileUpdates.role = "partner";
      }

      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", userId);

      if (profileError) throw profileError;

      // Refresh list
      await fetchApplications();
      setSelectedApp(null);
      showAlert("Başarılı", "İşlem başarıyla tamamlandı", "success");
    } catch (err) {
      showAlert("Hata", "İşlem başarısız: " + err.message, "error");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredApps = applications.filter((app) => 
    activeTab === "all" ? true : app.status === activeTab
  );

  const StatusBadge = ({ status }) => {
    const styles = {
      pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      approved: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      rejected: "bg-rose-500/10 text-rose-500 border-rose-500/20"
    };
    const labels = { pending: "Beklemede", approved: "Onaylandı", rejected: "Reddedildi" };
    return (
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Partner Başvuruları</h2>
          <p className="text-slate-500 text-sm">Gelen kurumsal iş ortağı taleplerini inceleyin ve yönetin.</p>
        </div>
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-black/5 dark:border-white/5">
          {["pending", "approved", "rejected", "all"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === tab 
                ? "bg-red-600 text-slate-900 dark:text-white shadow-lg shadow-red-900/50" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              }`}
            >
              {tab === "pending" ? "Bekleyen" : tab === "approved" ? "Onaylı" : tab === "rejected" ? "Reddedilen" : "Tümü"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="flex justify-center py-20">
            <Icons.Loader2 className="animate-spin text-red-500" size={40} />
          </div>
        ) : filteredApps.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl p-12 text-center">
            <Icons.Layers className="mx-auto text-slate-700 mb-4" size={48} />
            <h3 className="text-slate-900 dark:text-white font-bold">Kayıt Bulunamadı</h3>
            <p className="text-slate-500 text-sm">Bu kategoride henüz bir başvuru yok.</p>
          </div>
        ) : (
          filteredApps.map((app) => (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={app.id}
              className="bg-white dark:bg-slate-900/50 border border-black/5 dark:border-white/5 hover:border-black/10 dark:border-white/10 p-6 rounded-2xl transition-all cursor-pointer group"
              onClick={() => setSelectedApp(app)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Icons.Briefcase size={24} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white">{app.company_name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Icons.Clock size={12} /> {new Date(app.created_at).toLocaleDateString("tr-TR")}
                      </span>
                      <StatusBadge status={app.status} />
                    </div>
                  </div>
                </div>
                <Icons.ChevronRight className="text-slate-600 group-hover:text-slate-900 dark:text-white" size={20} />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 lg:p-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedApp(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-4xl bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
            >
              <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-red-600/20 flex items-center justify-center text-red-500">
                    <Icons.ShieldCheck size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">{selectedApp.company_name}</h3>
                    <p className="text-slate-500 text-sm">Başvuru Detayları ve Evrak İnceleme</p>
                  </div>
                </div>
                <button onClick={() => setSelectedApp(null)} className="text-slate-500 hover:text-slate-900 dark:text-white">
                  <Icons.X size={32} />
                </button>
              </div>

              <div className="p-8 overflow-y-auto max-h-[70vh] grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Commercial Section */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest">Ticari Bilgiler</h5>
                    <div className="bg-black/20 p-4 rounded-xl space-y-3 border border-black/5 dark:border-white/5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Vergi No:</span>
                        <span className="text-slate-900 dark:text-white font-mono">{selectedApp.tax_number || "Girilmedi"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Vergi Dairesi:</span>
                        <span className="text-slate-900 dark:text-white">{selectedApp.tax_office || "Girilmedi"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">MERSİS:</span>
                        <span className="text-slate-900 dark:text-white font-mono">{selectedApp.mersis_number || "Girilmedi"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Ticaret Sicil No:</span>
                        <span className="text-slate-900 dark:text-white">{selectedApp.trade_registry_number || "Girilmedi"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest">İletişim & Finans</h5>
                    <div className="bg-black/20 p-4 rounded-xl space-y-3 border border-black/5 dark:border-white/5">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">KEP Adresi:</span>
                        <span className="text-slate-900 dark:text-white font-mono">{selectedApp.kep_address || "Girilmedi"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">IBAN:</span>
                        <span className="text-slate-900 dark:text-white font-mono">{selectedApp.iban_number || "Girilmedi"}</span>
                      </div>
                      <div className="space-y-2">
                        <span className="text-slate-500 text-xs block">İşyeri Adresi:</span>
                        <p className="text-slate-900 dark:text-white text-sm bg-black/40 p-3 rounded-lg border border-black/5 dark:border-white/5">
                          {selectedApp.office_address || "Adres bilgisi yok."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Document Preview (Mock) */}
                <div className="space-y-6">
                  <h5 className="text-xs font-black text-slate-500 uppercase tracking-widest">Yüklenen Belgeler</h5>
                  <div className="grid grid-cols-2 gap-4">
                    {["Vergi Levhası", "İmza Sirküleri", "Sicil Gazetesi", "Faaliyet Belgesi"].map((doc) => (
                      <div key={doc} className="group aspect-video bg-black/40 border border-black/5 dark:border-white/5 rounded-2xl flex flex-col items-center justify-center gap-2 hover:bg-slate-100 dark:bg-slate-800 hover:border-red-500/50 transition-all cursor-pointer relative overflow-hidden">
                        <Icons.FileText size={24} className="text-slate-600 group-hover:text-red-500" />
                        <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-900 dark:text-white uppercase tracking-tight">{doc}</span>
                        <div className="absolute inset-0 bg-red-600/0 group-hover:bg-red-600/10 transition-all" />
                      </div>
                    ))}
                  </div>
                  
                  <div className="bg-red-600/5 border border-red-600/20 p-4 rounded-xl">
                    <p className="text-[10px] text-red-400 font-bold uppercase leading-tight italic">
                      * Trendyol ve KVKK standartları gereği belgeler manuel doğrulamadan geçmelidir.
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-8 bg-black/40 border-t border-black/5 dark:border-white/5 flex gap-4">
                {selectedApp.status === "pending" && (
                  <>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleStatusUpdate(selectedApp.id, selectedApp.user_id, "approved")}
                      className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-2xl shadow-lg shadow-emerald-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <Icons.Loader2 className="animate-spin" /> : <Icons.Check size={20} />}
                      BAŞVURUYU ONAYLA
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleStatusUpdate(selectedApp.id, selectedApp.user_id, "rejected")}
                      className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-rose-900/50 text-slate-900 dark:text-white font-black rounded-2xl border border-black/5 dark:border-white/5 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      {actionLoading ? <Icons.Loader2 className="animate-spin" /> : <Icons.X size={20} />}
                      REDDET
                    </button>
                  </>
                )}
                {selectedApp.status !== "pending" && (
                  <div className={`w-full py-4 text-center rounded-2xl font-black ${
                    selectedApp.status === "approved" ? "bg-emerald-600/10 text-emerald-500" : "bg-rose-600/10 text-rose-500"
                  }`}>
                    BU BAŞVURU {selectedApp.status.toUpperCase()} DURUMUNDADIR
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PartnerApplications;
