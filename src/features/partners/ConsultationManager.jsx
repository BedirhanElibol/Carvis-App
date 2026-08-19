import React, { useCallback, useEffect, useState } from "react";

import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

const ConsultationManager = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [activeTab, setActiveTab] = useState("pool"); // 'pool' or 'my_consultations'
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase.from("consultations").select("*");
      
      if (activeTab === "pool") {
        query = query.is("expert_id", null).eq("status", "pending");
      } else {
        query = query.eq("expert_id", currentUser.id);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      setConsultations(data || []);
    } catch (_err) {
      console.error(_err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, currentUser?.id]);

   
  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const claimConsultation = async (id) => {
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ expert_id: currentUser.id, status: "scheduled" })
        .eq("id", id);
      
      if (error) throw error;
      showAlert("Başarılı", "Danışmanlık talebi üzerinize atandı.", "success");
      fetchConsultations();
    } catch (_err) {
      showAlert("Hata", "Talep sahiplenilemedi.", "error");
    }
  };

  const completeConsultation = async (id) => {
    try {
      const { error } = await supabase
        .from("consultations")
        .update({ status: "completed" })
        .eq("id", id);
      
      if (error) throw error;
      showAlert("Başarılı", "Hizmet tamamlandı olarak işaretlendi.", "success");
      fetchConsultations();
    } catch (_err) {
      showAlert("Hata", "Durum güncellenemedi.", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-2 bg-white dark:bg-slate-900/50 p-1.5 rounded-2xl border border-black/5 dark:border-white/5">
        <button 
          onClick={() => setActiveTab("pool")}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'pool' ? 'bg-primary-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
        >
          Bekleyen Havuz
        </button>
        <button 
          onClick={() => setActiveTab("my_consultations")}
          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'my_consultations' ? 'bg-primary-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
        >
          Benim Taleplerim
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-10 opacity-50">Yükleniyor...</div>
        ) : consultations.length === 0 ? (
          <div className="text-center py-10 opacity-50 font-sans uppercase text-[10px] font-black tracking-widest">
            Henüz talep bulunmuyor
          </div>
        ) : (
          consultations.map(c => (
            <div key={c.id} className="glass-card p-6 rounded-[2rem] border border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white text-lg tracking-tighter uppercase mb-1">{c.topic}</h4>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed line-clamp-2">
                    {c.description || "Açıklama yok"}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-primary-400 bg-primary-600/10 px-3 py-1 rounded-lg border border-primary-500/10">
                    {c.fee} ₺
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-black/5 dark:border-white/5 flex gap-3">
                {activeTab === 'pool' ? (
                  <button 
                    onClick={() => claimConsultation(c.id)}
                    className="w-full bg-white text-slate-950 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active-scale hover:bg-primary-600 hover:text-slate-900 dark:text-white transition-all"
                  >
                    DANIŞMANLIĞI ÜSTLEN
                  </button>
                ) : (
                  <>
                    <button className="flex-1 bg-primary-600 text-slate-900 dark:text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active-scale transition-all">
                       MESAJLAŞMAYA GİT
                    </button>
                    {c.status !== 'completed' && (
                      <button 
                        onClick={() => completeConsultation(c.id)}
                        className="flex-1 glass-card border border-emerald-500/20 text-teal-400 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active-scale transition-all"
                      >
                         TAMAMLA
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ConsultationManager;
