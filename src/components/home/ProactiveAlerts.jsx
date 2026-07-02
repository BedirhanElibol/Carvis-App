import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";
import { getKGMAlerts } from "../../services/externalApis";

const ProactiveAlerts = ({ vehicle, mapCenter }) => {
  const { showAlert, selectedLocation } = useUI();
  const { currentUser } = useAuth();
  const [kgmAlerts, setKgmAlerts] = useState([]);
  const [loadingKgm, setLoadingKgm] = useState(false);

  // Initial community reports list
  const [reports, setReports] = useState([
    {
      id: 1,
      type: "radar",
      icon: <Icons.Radar className="text-rose-500 animate-pulse" size={18} />,
      title: "Mobil Hız Radarı",
      message: "Kadıköy Bağdat Caddesi çıkışı, sağ şeritte hız denetimi var.",
      location: "İstanbul, Kadıköy",
      reporter: "Mert K.",
      timeStr: "12 dakika önce",
      votes: 14,
      voted: false,
      voted_users: []
    },
    {
      id: 2,
      type: "bump",
      icon: <Icons.AlertTriangle className="text-amber-500" size={18} />,
      title: "Derin Çukur & Bozuk Kasis",
      message: "Ataşehir Bulvarı kavşak çıkışında gizli derin çukur ve sert tümsek.",
      location: "İstanbul, Ataşehir",
      reporter: "Buse S.",
      timeStr: "34 dakika önce",
      votes: 8,
      voted: false,
      voted_users: []
    },
    {
      id: 3,
      type: "fuel",
      icon: <Icons.Percent className="text-emerald-500" size={18} />,
      title: "Ucuz Akaryakıt Fırsatı",
      message: "Maltepe Opet istasyonunda motorinde ₺1.20 indirim kuyruksuz.",
      location: "İstanbul, Maltepe",
      reporter: "Ahmet T.",
      timeStr: "3 dakika önce",
      votes: 27,
      voted: false,
      voted_users: []
    }
  ]);

  const [reportingType, setReportingType] = useState(null);
  const [newReportText, setNewReportText] = useState("");
  const [newReportLocation, setNewReportLocation] = useState("İstanbul, Kadıköy");

  useEffect(() => {
    let isMounted = true;
    const fetchOfficialAndDbAlerts = async () => {
      setLoadingKgm(true);
      try {
        const city = selectedLocation || "istanbul";
        
        // 1. Fetch official highway agency (KGM) alerts from API/fallback
        const official = await getKGMAlerts(city);
        const mappedOfficial = (official || []).map(item => {
          let icon = <Icons.AlertCircle className="text-blue-500" size={18} />;
          if (item.type === "radar") icon = <Icons.Radar className="text-rose-500 animate-pulse" size={18} />;
          else if (item.type === "bump") icon = <Icons.AlertTriangle className="text-amber-500" size={18} />;
          else if (item.type === "accident") icon = <Icons.Zap className="text-orange-500" size={18} />;
          return { ...item, icon };
        });

        // 2. Fetch crowdsourced alerts from Supabase database
        const { data: dbAlerts, error } = await supabase
          .from("road_alerts")
          .select("*")
          .eq("city", city.toLowerCase())
          .order("created_at", { ascending: false });

        let mappedDb = [];
        if (!error && dbAlerts && dbAlerts.length > 0) {
          mappedDb = dbAlerts.map(item => {
            let icon = <Icons.AlertCircle className="text-blue-500" size={18} />;
            if (item.type === "radar") icon = <Icons.Radar className="text-rose-500 animate-pulse" size={18} />;
            else if (item.type === "bump") icon = <Icons.AlertTriangle className="text-amber-500" size={18} />;
            else if (item.type === "fuel") icon = <Icons.Percent className="text-emerald-500" size={18} />;
            else if (item.type === "accident") icon = <Icons.Zap className="text-orange-500" size={18} />;

            // Format timestamp for display
            let timeStr = "1 dakika önce";
            if (item.created_at) {
              const diffMs = new Date() - new Date(item.created_at);
              const diffMin = Math.floor(diffMs / 60000);
              if (diffMin < 1) timeStr = "Şimdi";
              else if (diffMin < 60) timeStr = `${diffMin} dakika önce`;
              else {
                const diffHours = Math.floor(diffMin / 60);
                if (diffHours < 24) timeStr = `${diffHours} saat önce`;
                else timeStr = new Date(item.created_at).toLocaleDateString("tr-TR");
              }
            }

            const hasVoted = currentUser && item.voted_users?.includes(currentUser.id);

            return {
              id: item.id,
              type: item.type,
              icon,
              title: item.title,
              message: item.message,
              location: item.location,
              reporter: item.reporter,
              timeStr,
              votes: item.votes,
              voted: !!hasVoted,
              voted_users: item.voted_users || []
            };
          });
        }

        if (isMounted) {
          if (mappedDb.length > 0) {
            setReports(mappedDb);
          } else {
            // Keep local defaults if DB has none yet
            setReports([
              {
                id: 1,
                type: "radar",
                icon: <Icons.Radar className="text-rose-500 animate-pulse" size={18} />,
                title: "Mobil Hız Radarı",
                message: "Kadıköy Bağdat Caddesi çıkışı, sağ şeritte hız denetimi var.",
                location: "İstanbul, Kadıköy",
                reporter: "Mert K.",
                timeStr: "12 dakika önce",
                votes: 14,
                voted: false,
                voted_users: []
              },
              {
                id: 2,
                type: "bump",
                icon: <Icons.AlertTriangle className="text-amber-500" size={18} />,
                title: "Derin Çukur & Bozuk Kasis",
                message: "Ataşehir Bulvarı kavşak çıkışında gizli derin çukur ve sert tümsek.",
                location: "İstanbul, Ataşehir",
                reporter: "Buse S.",
                timeStr: "34 dakika önce",
                votes: 8,
                voted: false,
                voted_users: []
              }
            ]);
          }
          setKgmAlerts(mappedOfficial);
        }
      } catch (err) {
        console.error("General alerts fetch error:", err);
      } finally {
        if (isMounted) setLoadingKgm(false);
      }
    };

    fetchOfficialAndDbAlerts();
    return () => { isMounted = false; };
  }, [selectedLocation, currentUser]);

  const handleVote = async (id) => {
    if (id.toString().startsWith("kgm")) {
      setKgmAlerts(prev =>
        prev.map(r => {
          if (r.id === id) {
            return {
              ...r,
              votes: r.voted ? r.votes - 1 : r.votes + 1,
              voted: !r.voted
            };
          }
          return r;
        })
      );
      return;
    }

    if (!currentUser) {
      showAlert("Giriş Gerekli", "Yol raporlarını onaylamak için üye girişi yapmalısınız.", "warning");
      return;
    }

    const report = reports.find(r => r.id === id);
    if (!report) return;

    const isVoted = report.voted;
    let newVotedUsers = [...(report.voted_users || [])];
    let newVotes = report.votes;

    if (isVoted) {
      newVotedUsers = newVotedUsers.filter(uid => uid !== currentUser.id);
      newVotes = Math.max(0, newVotes - 1);
    } else {
      if (!newVotedUsers.includes(currentUser.id)) {
        newVotedUsers.push(currentUser.id);
      }
      newVotes += 1;
    }

    // Check if ID is custom mock number (e.g. 1, 2, 3). If so, update locally only.
    if (typeof id === "number" && id < 10) {
      setReports(prev =>
        prev.map(r => {
          if (r.id === id) {
            return {
              ...r,
              votes: newVotes,
              voted: !isVoted,
              voted_users: newVotedUsers
            };
          }
          return r;
        })
      );
      return;
    }

    const { error } = await supabase
      .from("road_alerts")
      .update({
        votes: newVotes,
        voted_users: newVotedUsers
      })
      .eq("id", id);

    if (error) {
      console.error("Error updating vote in DB:", error);
      showAlert("Hata", "Oylama kaydedilemedi. Lütfen tekrar deneyin.", "error");
      return;
    }

    setReports(prev =>
      prev.map(r => {
        if (r.id === id) {
          return {
            ...r,
            votes: newVotes,
            voted: !isVoted,
            voted_users: newVotedUsers
          };
        }
        return r;
      })
    );
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    if (!newReportText.trim()) return;

    if (!currentUser) {
      showAlert("Giriş Gerekli", "Yol raporu paylaşmak için üye girişi yapmalısınız.", "warning");
      return;
    }

    let title = "Topluluk Bildirimi";
    if (reportingType === "radar") {
      title = "Hız Radarı / Denetim";
    } else if (reportingType === "bump") {
      title = "Kasis / Çukur Uyarısı";
    } else if (reportingType === "fuel") {
      title = "Ucuz Akaryakıt / Fiyat";
    } else if (reportingType === "accident") {
      title = "Yol Engel / Kaza";
    }

    const city = selectedLocation || "istanbul";
    const reporterName = currentUser.full_name || currentUser.email?.split("@")[0] || "Sürücü";

    const insertPayload = {
      type: reportingType,
      title,
      message: newReportText,
      location: newReportLocation,
      reporter: reporterName,
      votes: 1,
      voted_users: [currentUser.id],
      user_id: currentUser.id,
      city: city.toLowerCase(),
      lat: mapCenter?.lat || null,
      lng: mapCenter?.lng || null
    };

    const { data, error } = await supabase
      .from("road_alerts")
      .insert([insertPayload])
      .select();

    if (error) {
      console.error("Error saving alert to Supabase:", error);
      showAlert("Hata", "Bildirim kaydedilemedi. Lütfen tekrar deneyin.", "error");
      return;
    }

    if (data && data[0]) {
      const dbItem = data[0];
      let icon = <Icons.AlertCircle className="text-blue-500" size={18} />;
      if (dbItem.type === "radar") icon = <Icons.Radar className="text-rose-500 animate-pulse" size={18} />;
      else if (dbItem.type === "bump") icon = <Icons.AlertTriangle className="text-amber-500" size={18} />;
      else if (dbItem.type === "fuel") icon = <Icons.Percent className="text-emerald-500" size={18} />;
      else if (dbItem.type === "accident") icon = <Icons.Zap className="text-orange-500" size={18} />;

      const newAlert = {
        id: dbItem.id,
        type: dbItem.type,
        icon,
        title: dbItem.title,
        message: dbItem.message,
        location: dbItem.location,
        reporter: dbItem.reporter,
        timeStr: "Şimdi",
        votes: dbItem.votes,
        voted: true,
        voted_users: dbItem.voted_users || []
      };

      setReports(prev => [newAlert, ...prev]);
    }

    setNewReportText("");
    setReportingType(null);
    showAlert("Bildirim Alındı", "Yol raporunuz bölgedeki diğer sürücülerle başarıyla paylaşıldı.", "success");
  };

  return (
    <div className="bg-white dark:bg-[#0a0f24]/85 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 backdrop-blur-md shadow-2xl space-y-6 text-slate-900 dark:text-white">
      {/* Title */}
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-black text-base uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              <Icons.Users size={18} className="text-teal-500" /> Topluluk Yol Raporları
            </h3>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              <span className="text-[8px] font-black uppercase tracking-widest text-teal-400">Canlı Radar</span>
            </div>
          </div>
          <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest mt-1">
            Bölgenizdeki veya {vehicle?.brand} {vehicle?.model} rotasındaki sürücü bildirimleri
          </p>
        </div>
      </div>

      {/* Action Buttons to Report */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => setReportingType(reportingType === "radar" ? null : "radar")}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
            reportingType === "radar"
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500 font-bold"
              : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/20 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
          }`}
        >
          <Icons.Radar size={20} className="mb-1" />
          <span className="text-[8px] font-black uppercase tracking-wider text-center">Radar</span>
        </button>
        <button
          onClick={() => setReportingType(reportingType === "bump" ? null : "bump")}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
            reportingType === "bump"
              ? "bg-amber-500/10 border-amber-500/30 text-amber-500 font-bold"
              : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/20 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
          }`}
        >
          <Icons.AlertTriangle size={20} className="mb-1" />
          <span className="text-[8px] font-black uppercase tracking-wider text-center">Kasis/Çukur</span>
        </button>
        <button
          onClick={() => setReportingType(reportingType === "fuel" ? null : "fuel")}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
            reportingType === "fuel"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-500 font-bold"
              : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/20 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
          }`}
        >
          <Icons.Percent size={20} className="mb-1" />
          <span className="text-[8px] font-black uppercase tracking-wider text-center">Ucuz Yakıt</span>
        </button>
        <button
          onClick={() => setReportingType(reportingType === "accident" ? null : "accident")}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all cursor-pointer ${
            reportingType === "accident"
              ? "bg-orange-500/10 border-orange-500/30 text-orange-500 font-bold"
              : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 hover:border-black/20 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
          }`}
        >
          <Icons.Zap size={20} className="mb-1" />
          <span className="text-[8px] font-black uppercase tracking-wider text-center">Yol Kaza</span>
        </button>
      </div>

      {/* Reporting Form */}
      <AnimatePresence>
        {reportingType && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreateReport}
            className="overflow-hidden bg-black/10 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[9px] font-black uppercase tracking-widest text-teal-400">
                Yeni Rapor Gönder: {reportingType.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => setReportingType(null)}
                className="text-[9px] font-black text-slate-400 hover:text-white bg-transparent border-none cursor-pointer"
              >
                Kapat
              </button>
            </div>
            <textarea
              value={newReportText}
              onChange={(e) => setNewReportText(e.target.value)}
              placeholder="Detaylı yol durumu, hız sınırı, istasyon markası veya kaza şeridini girin..."
              required
              rows={2}
              className="w-full bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 rounded-xl p-2.5 text-xs outline-none text-slate-900 dark:text-white focus:ring-1 focus:ring-teal-500/30"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={newReportLocation}
                onChange={(e) => setNewReportLocation(e.target.value)}
                placeholder="Konum (İlçe, Cadde)"
                required
                className="flex-1 bg-white dark:bg-slate-950/50 border border-black/10 dark:border-white/10 rounded-xl px-3 py-2 text-xs outline-none text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="bg-teal-500 hover:bg-teal-400 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border-none cursor-pointer transition-all active:scale-95 flex items-center gap-1.5"
              >
                <Icons.Send size={12} /> Gönder
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Reports List */}
      <div className="space-y-3">
        {loadingKgm && (
          <div className="flex justify-center items-center py-4 text-xs text-slate-500 gap-2">
            <Icons.Loader2 className="animate-spin text-teal-500" size={16} />
            <span>KGM Resmi Bültenleri Çekiliyor...</span>
          </div>
        )}
        {[...kgmAlerts, ...reports].map((r) => (
          <div
            key={r.id}
            className="bg-white dark:bg-white/5 border border-black/5 dark:border-white/5 p-4 rounded-2xl flex flex-col gap-2 hover:border-black/10 dark:hover:border-white/10 transition-colors text-left"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0">
                  {r.icon}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">{r.title}</h4>
                    {r.id.toString().startsWith("kgm") && (
                      <span className="text-[7px] font-black text-red-500 dark:text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20 uppercase tracking-widest">KGM</span>
                    )}
                  </div>
                  <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest mt-1 block">{r.location}</span>
                </div>
              </div>
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 tracking-wider">
                {r.timeStr}
              </span>
            </div>

            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
              {r.message}
            </p>

            <div className="flex justify-between items-center mt-1 pt-2 border-t border-black/5 dark:border-white/5">
              <span className="text-[8px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                Kaynak: <strong className="text-slate-700 dark:text-slate-300">{r.reporter}</strong>
              </span>

              <button
                type="button"
                onClick={() => handleVote(r.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold transition-all border cursor-pointer ${
                  r.voted
                    ? "bg-teal-500/10 border-teal-500/20 text-teal-400"
                    : "bg-transparent border-black/10 dark:border-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white"
                }`}
              >
                <Icons.ThumbsUp size={10} className={r.voted ? "fill-teal-400" : ""} />
                <span>Onayla ({r.votes})</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProactiveAlerts;
