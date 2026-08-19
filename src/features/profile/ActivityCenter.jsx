import React, { useCallback, useEffect, useState } from "react";
import { FileCheck, Inbox, MessageSquare, ShieldCheck, Users } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const ActivityCenter = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("consultations"); // 'consultations', 'bids', 'insurance'
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let result = [];
      if (activeTab === "consultations") {
        const { data: cons } = await supabase
          .from("consultations")
          .select("*, expert:profiles!expert_id(full_name)")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });
        result = cons || [];
      } else if (activeTab === "insurance") {
        const { data: ins } = await supabase
          .from("insurance_applications")
          .select("*")
          .eq("user_id", currentUser.id)
          .order("created_at", { ascending: false });
        result = ins || [];
      }
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentUser?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const StatusBadge = ({ status }) => {
    const colors = {
      pending: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      completed: "bg-emerald-500/10 text-teal-400 border-emerald-500/20",
      active: "bg-emerald-500/10 text-teal-400 border-emerald-500/20",
      won: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      lost: "bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20",
    };
    return (
      <span className={`px-2 py-0.5 rounded-lg border text-[8px] font-black uppercase tracking-widest ${colors[status] || colors.pending}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8 p-6">
      <div className="text-center">
        <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase mb-2">Aktivite Merkezi</h2>
        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em]">Tüm süreçlerini buradan yönetin</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-white dark:bg-slate-900/50 p-1.5 rounded-xl border border-black/5 dark:border-white/5">
        {[
          { id: "consultations", label: "Danışmanlık", icon: Users },
          { id: "insurance", label: "Sigorta", icon: ShieldCheck },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? "bg-primary-600 text-slate-900 dark:text-white" : "text-slate-500 hover:text-slate-900 dark:text-white"
            }`}
          >
            <tab.icon size={14} />
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="flex items-center justify-center h-full opacity-50 uppercase text-[10px] font-black tracking-widest">Veriler çekiliyor...</div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30 text-center">
            <Inbox size={48} className="mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Eksik parça: Henüz kayıt bulunamadı</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {data.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="glass-card p-6 rounded-xl border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 flex flex-col justify-between hover:border-black/20 dark:border-white/20 transition-all group"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="p-3 rounded-2xl bg-black/20 border border-black/5 dark:border-white/5 group-hover:scale-[1.02] transition-transform">
                      {activeTab === 'consultations' ? <MessageSquare size={20} className="text-primary-400" /> : 
                       <FileCheck size={20} className="text-teal-400" />}
                    </div>
                    <StatusBadge status={item.status} />
                  </div>

                  <div>
                    <h4 className="text-slate-900 dark:text-white font-black uppercase tracking-tighter text-xl mb-1 truncate">
                      {activeTab === 'consultations' ? item.topic : 
                       item.product_type}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                       {new Date(item.created_at).toLocaleDateString("tr-TR")}
                    </p>
                  </div>

                   <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                      <span className="text-xs font-black text-slate-900 dark:text-white">
                        {`Bedel: ₺${item.fee || 0}`}
                      </span>
                      <button className="text-[9px] font-black text-primary-400 uppercase tracking-[0.3em] hover:text-slate-900 dark:text-white transition-colors">
                         DETAYLAR →
                      </button>
                   </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityCenter;
