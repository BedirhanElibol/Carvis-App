import React, { useState } from "react";
import * as Icons from "lucide-react";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { useWallet } from "../../context/WalletContext";
import { supabase } from "../../supabaseClient";

const CONSULTATION_TOPICS = [
  { id: "engine", label: "Motor & Performans", icon: Icons.Activity, fee: 150 },
  { id: "electrical", label: "Elektronik & Yazılım", icon: Icons.Cpu, fee: 200 },
  { id: "mod", label: "Modifiye & Tuning", icon: Icons.Gauge, fee: 250 },
  { id: "purchase", label: "Araç Alım Danışmanlığı", icon: Icons.Search, fee: 100 },
];

const ExpertHotline = () => {
  const { showAlert } = useUI();
  const { currentUser } = useAuth();
  const { balance } = useWallet();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRequest = async () => {
    if (!currentUser) return showAlert("Hata", "Lütfen giriş yapın.", "error");
    if (!selectedTopic) return showAlert("Hata", "Lütfen bir konu seçin.", "error");
    if (balance < selectedTopic.fee) return showAlert("Yetersiz Bakiye", "Cüzdanınızda yeterli bakiye bulunmuyor.", "error");

    setLoading(true);
    try {
      const { error } = await supabase.from("consultations").insert([{
        user_id: currentUser.id,
        topic: selectedTopic.id,
        description: description,
        fee: selectedTopic.fee,
        status: "pending"
      }]);

      if (error) throw error;

      showAlert("Talep Alındı", "Uzmanımız en kısa sürede sizinle iletişime geçecek.", "success");
      setDescription("");
      setSelectedTopic(null);
    } catch (err) {
      console.error(err);
      showAlert("Hata", "Talep iletilemedi.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 pb-32 space-y-8 animate-fade-in text-white font-sans">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
           <div className="p-2 bg-primary-600/20 rounded-lg">
             <Icons.Headset size={20} className="text-primary-500" />
           </div>
           <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.3em]">Rapidsy Expert</span>
        </div>
        <h3 className="text-3xl font-black tracking-tighter uppercase leading-none">Usta Danışmanlığı</h3>
        <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
          Aracınızla ilgili sorularınızı uzmanlarımıza anlık olarak sorun, profesyonel destek alın.
        </p>
      </div>

      {/* Topics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {CONSULTATION_TOPICS.map((topic) => (
          <button
            key={topic.id}
            onClick={() => setSelectedTopic(topic)}
            className={`p-5 rounded-[2rem] border transition-all active-scale text-left relative overflow-hidden group ${
              selectedTopic?.id === topic.id 
                ? "bg-primary-600 border-primary-500 shadow-2xl shadow-primary-900/30" 
                : "glass-card border-white/5 bg-white/5 hover:border-white/20"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 border transition-colors ${
              selectedTopic?.id === topic.id ? "bg-white/20 border-white/20" : "bg-white/5 border-white/5"
            }`}>
              <topic.icon size={20} className={selectedTopic?.id === topic.id ? "text-white" : "text-primary-400"} />
            </div>
            <h4 className="text-[11px] font-black uppercase tracking-tight mb-1">{topic.label}</h4>
            <p className={`text-[10px] font-bold ${selectedTopic?.id === topic.id ? "text-white/60" : "text-slate-500"}`}>
              {topic.fee} ₺ / Seans
            </p>
            <div className={`absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform ${
               selectedTopic?.id === topic.id ? "text-white" : "text-primary-500"
            }`}>
              <topic.icon size={80} />
            </div>
          </button>
        ))}
      </div>

      {/* Request Details */}
      <div className="space-y-4">
        <div className="space-y-2 px-1">
          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Detaylar (Opsiyonel)</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Sorununuzu veya merak ettiklerinizi buraya yazabilirsiniz..."
            className="w-full bg-slate-950 border border-white/5 rounded-[1.8rem] p-5 text-sm text-white outline-none focus:border-primary-500/50 transition-all min-h-[140px] shadow-inner"
          />
        </div>

        <button
          onClick={handleRequest}
          disabled={loading || !selectedTopic}
          className="w-full bg-white text-slate-950 py-5 rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl active-scale disabled:opacity-50 transition-all flex items-center justify-center gap-3"
        >
          {loading ? "GÖNDERİLİYOR..." : "GÖRÜŞME TALEBİ OLUŞTUR"}
          <Icons.ChevronRight size={18} />
        </button>
      </div>

      {/* Trust Banner */}
      <div className="glass-card p-6 rounded-[2.5rem] border border-emerald-500/10 bg-emerald-500/5 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center border border-emerald-500/10">
          <Icons.ShieldCheck size={24} className="text-emerald-500" />
        </div>
        <div className="flex-1">
          <h4 className="text-[11px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Güvenli Danışmanlık</h4>
          <p className="text-[10px] text-slate-400 font-medium">Uzmanlarımız Rapidsy tarafından doğrulanan 10+ yıl deneyimli baş ustalardır.</p>
        </div>
      </div>
    </div>
  );
};

export default ExpertHotline;
