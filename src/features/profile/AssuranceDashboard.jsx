import React, { useState, useEffect } from "react";
import { ShieldCheck, Flame, Plus, CheckCircle2, History, AlertCircle } from "lucide-react";
import { AssuranceService } from "../../services/AssuranceService";

const AssuranceDashboard = ({ customerId, language = "tr" }) => {
  const [claims, setClaims] = useState([]);
  const [activeCoverages, setActiveCoverages] = useState([]);
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");
  const [damageDesc, setDamageDesc] = useState("");

  useEffect(() => {
    // Load mock claims and coverages
    setClaims([
      {
        id: "claim-1",
        order_id: "order-101",
        reported_damage_desc: "Seyyar yıkama esnasında kaputta hafif çizikler oluştu.",
        claim_status: "recoursed_to_partner",
        payout_amount: 1500,
        recourse_status: "collected",
        created_at: "2026-07-01T12:00:00Z"
      }
    ]);

    setActiveCoverages([
      {
        order_id: "order-105",
        seller_name: "Usta Ahmet Oto Tamir",
        service_type: "Sıvı Bakımı",
        total_amount: 4500,
        assurance_fee: 90,
        expires_at: "2026-07-20T18:00:00Z"
      }
    ]);
  }, [customerId]);

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOrder || !damageDesc) return;

    const newClaim = {
      orderId: selectedOrder,
      customerId,
      sellerId: "seller-mock-uuid",
      description: damageDesc,
      images: []
    };

    const { data, error } = await AssuranceService.submitClaim(newClaim);
    if (!error) {
      setClaims(prev => [
        ...prev,
        {
          id: data.id || Math.random().toString(),
          order_id: selectedOrder,
          reported_damage_desc: damageDesc,
          claim_status: "pending",
          payout_amount: 0,
          created_at: new Date().toISOString()
        }
      ]);
      setShowClaimForm(false);
      setDamageDesc("");
      setSelectedOrder("");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-8 relative z-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <ShieldCheck className="text-teal-500 w-8 h-8" />
            {language === "tr" ? "Rapidsy Güvence Merkezi" : "Rapidsy Assurance Center"}
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            {language === "tr" 
              ? "Tüm siparişlerinizi Rapidsy koruması altına alın ve hasarlarınızı hızlıca tazmin edin."
              : "Keep all your orders protected and file immediate recourse claims."}
          </p>
        </div>
        
        <button
          onClick={() => setShowClaimForm(true)}
          className="bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-primary-600/10"
        >
          <Plus size={16} />
          {language === "tr" ? "HASAR BİLDİR" : "REPORT DAMAGE"}
        </button>
      </div>

      {showClaimForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-black/5 dark:border-white/5 space-y-4">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase">Hasar Bildirim Formu</h3>
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">İlişkili Sipariş</label>
              <select 
                value={selectedOrder}
                onChange={(e) => setSelectedOrder(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-xl px-4 py-3 text-xs font-semibold text-slate-900 dark:text-white outline-none"
              >
                <option value="">Seçiniz...</option>
                {activeCoverages.map(c => (
                  <option key={c.order_id} value={c.order_id}>{c.seller_name} - {c.service_type} ({c.total_amount} TL)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Hasar Açıklaması</label>
              <textarea 
                rows="4"
                placeholder="Lütfen oluşan hasarı detaylıca açıklayınız..."
                value={damageDesc}
                onChange={(e) => setDamageDesc(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-black/5 dark:border-white/5 rounded-xl p-4 text-xs font-semibold text-slate-900 dark:text-white outline-none"
              />
            </div>

            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={() => setShowClaimForm(false)} 
                className="flex-1 py-3 bg-black/5 dark:bg-white/5 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs uppercase"
              >
                Vazgeç
              </button>
              <button 
                type="submit" 
                className="flex-1 py-3 bg-primary-600 text-slate-900 dark:text-white rounded-xl font-black text-xs uppercase tracking-widest"
              >
                Bildirimi Gönder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Active Coverages */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Flame size={16} className="text-teal-500" />
          {language === "tr" ? "Aktif Güvence Kapsamındaki İşlemler" : "Active Covered Transactions"}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeCoverages.map((c) => (
            <div key={c.order_id} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-teal-500/20 flex flex-col justify-between">
              <div>
                <span className="text-[8px] font-black text-teal-600 bg-teal-500/10 px-2 py-0.5 rounded uppercase tracking-widest">GÜVENCE AKTİF</span>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mt-2 uppercase">{c.seller_name}</h4>
                <p className="text-xs font-semibold text-slate-500 mt-1">{c.service_type}</p>
              </div>
              <div className="flex justify-between items-center mt-6 pt-3 border-t border-black/5 dark:border-white/5">
                <span className="text-[10px] font-bold text-slate-400">Son Gün: {new Date(c.expires_at).toLocaleDateString()}</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">{c.total_amount} TL</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Past Claims */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <History size={16} />
          {language === "tr" ? "Geçmiş Hasar Bildirimleri" : "Past Damage Claims"}
        </h3>

        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl shrink-0 mt-0.5">
                  <AlertCircle size={16} className="text-slate-500" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase">Sipariş: #{claim.order_id}</h4>
                  <p className="text-[11px] text-slate-500 font-semibold mt-1">{claim.reported_damage_desc}</p>
                  <span className="text-[9px] font-bold text-slate-400 block mt-1">{new Date(claim.created_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="text-right shrink-0">
                {claim.claim_status === "pending" && (
                  <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider">İnceleniyor</span>
                )}
                {claim.claim_status === "recoursed_to_partner" && (
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase tracking-wider block">Ödendi & Rücu Edildi</span>
                    <span className="text-xs font-black text-slate-900 dark:text-white block mt-1.5">{claim.payout_amount} TL</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AssuranceDashboard;
