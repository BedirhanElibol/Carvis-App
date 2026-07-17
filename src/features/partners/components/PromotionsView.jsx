import React, { useState, useEffect } from "react";
import { Tag, Plus, X, AlertCircle, Percent, Calendar } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function PromotionsView({ currentUser }) {
  const [coupons, setCoupons] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  const [isCampaignModalOpen, setIsCampaignModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const [couponForm, setCouponForm] = useState({
    code: "",
    discount: "",
    expiry: ""
  });
  const [campaignForm, setCampaignForm] = useState({
    title: "",
    description: "",
    discount: ""
  });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data: coupList } = await supabase
        .from("coupons")
        .select("*")
        .eq("seller_id", currentUser.id);

      if (coupList) setCoupons(coupList);

      const { data: campList } = await supabase
        .from("campaigns")
        .select("*")
        .eq("seller_id", currentUser.id);

      if (campList) setCampaigns(campList);
    } catch (err) {
      console.error("Error fetching promotions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    setError("");
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("coupons")
        .insert([{
          seller_id: currentUser.id,
          code: couponForm.code.toUpperCase(),
          discount_percentage: Number(couponForm.discount),
          expires_at: couponForm.expiry ? new Date(couponForm.expiry).toISOString() : null,
          is_active: true
        }]);

      if (error) throw error;
      setIsCouponModalOpen(false);
      setCouponForm({ code: "", discount: "", expiry: "" });
      fetchData();
    } catch (err) {
      setError(err.message || "Kupon oluşturulamadı.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setError("");
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("campaigns")
        .insert([{
          seller_id: currentUser.id,
          title: campaignForm.title,
          description: campaignForm.description,
          discount_rate: Number(campaignForm.discount),
          is_active: true
        }]);

      if (error) throw error;
      setIsCampaignModalOpen(false);
      setCampaignForm({ title: "", description: "", discount: "" });
      fetchData();
    } catch (err) {
      setError(err.message || "Kampanya oluşturulamadı.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Promosyon & Kampanya Yönetimi</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">İndirim kuponları oluşturun ve özel kampanyalar tanımlayarak satışlarınızı artırın.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCouponModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} /> Kupon Ekle
          </button>
          <button
            onClick={() => setIsCampaignModalOpen(true)}
            className="bg-slate-900 dark:bg-white text-white dark:text-black hover:opacity-90 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} /> Kampanya Ekle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Coupons List */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Percent size={18} className="text-emerald-500" /> Aktif Kuponlar
          </h3>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
          ) : coupons.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Oluşturulmuş kupon bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {coupons.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 flex justify-between items-center">
                  <div>
                    <h4 className="font-mono font-black text-slate-900 dark:text-white text-sm">{c.code}</h4>
                    <p className="text-[10px] text-slate-500 mt-1">
                      İndirim Oranı: %{c.discount_percentage} · Son Tarih: {c.expires_at ? new Date(c.expires_at).toLocaleDateString("tr-TR") : "Süresiz"}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase">
                    Aktif
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Campaigns List */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Tag size={18} className="text-blue-500" /> Mağaza Kampanyaları
          </h3>

          {loading ? (
            <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
          ) : campaigns.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-4">Oluşturulmuş kampanya bulunmuyor.</p>
          ) : (
            <div className="space-y-4">
              {campaigns.map((c) => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 flex justify-between items-start">
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 dark:text-white text-xs">{c.title}</h4>
                    <p className="text-[10px] text-slate-500">{c.description}</p>
                    <p className="text-[10px] font-bold text-blue-500">%{c.discount_rate} İndirim Oranı</p>
                  </div>
                  <span className="text-[10px] font-bold text-blue-500 bg-blue-500/10 px-2.5 py-1 rounded-full uppercase">
                    Yayında
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Kupon Ekle */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setIsCouponModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black mb-4 uppercase">Yeni İndirim Kuponu</h3>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"><AlertCircle size={14} />{error}</div>}
            
            <form onSubmit={handleCreateCoupon} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kupon Kodu</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: CARVIS10"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">İndirim Yüzdesi (%)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="100"
                    placeholder="10"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                    value={couponForm.discount}
                    onChange={(e) => setCouponForm({ ...couponForm, discount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Geçerlilik Tarihi</label>
                  <input
                    type="date"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                    value={couponForm.expiry}
                    onChange={(e) => setCouponForm({ ...couponForm, expiry: e.target.value })}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors"
              >
                {actionLoading ? "Oluşturuluyor..." : "Kuponu Kaydet"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Kampanya Ekle */}
      {isCampaignModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setIsCampaignModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black mb-4 uppercase">Yeni Kampanya Tanımla</h3>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"><AlertCircle size={14} />{error}</div>}
            
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kampanya Başlığı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Hafta Sonu Parça İndirimi"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  value={campaignForm.title}
                  onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kampanya İndirim Yüzdesi (%)</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  placeholder="15"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none"
                  value={campaignForm.discount}
                  onChange={(e) => setCampaignForm({ ...campaignForm, discount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kampanya Detay Açıklaması</label>
                <textarea
                  required
                  rows="3"
                  placeholder="Kampanya şartları ve kapsamını belirtin..."
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-xs focus:outline-none resize-none"
                  value={campaignForm.description}
                  onChange={(e) => setCampaignForm({ ...campaignForm, description: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors"
              >
                {actionLoading ? "Oluşturuluyor..." : "Kampanyayı Başlat"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
