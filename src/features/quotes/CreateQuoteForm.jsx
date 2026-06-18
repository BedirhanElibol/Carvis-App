import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";
import { supabase } from "../../supabaseClient";
import * as Icons from "lucide-react";

const CreateQuoteForm = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showAlert } = useUI();

  const [serviceRequest, setServiceRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    price: "",
    estimated_delivery_days: "",
    description: "",
    warranty_months: 12,
  });

  const fetchServiceRequest = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("id", requestId)
        .single();
      if (error) throw error;
      setServiceRequest(data);
    } catch {
      showAlert("Hata", "Talep bulunamadı.", "error");
      navigate("/partner/dashboard");
    } finally {
      setLoading(false);
    }
  }, [requestId, navigate, showAlert]);

  useEffect(() => {
    fetchServiceRequest();
  }, [fetchServiceRequest]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.price || parseFloat(formData.price) <= 0) {
      showAlert("Hata", "Lütfen geçerli bir fiyat girin.", "error");
      return;
    }
    if (!formData.description.trim()) {
      showAlert("Hata", "Lütfen teklif açıklaması girin.", "error");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("quotes")
        .insert([
          {
            service_request_id: parseInt(requestId),
            seller_id: currentUser.id,
            customer_id: serviceRequest.user_id,
            price: parseFloat(formData.price),
            estimated_delivery_days: formData.estimated_delivery_days
              ? parseInt(formData.estimated_delivery_days)
              : null,
            description: formData.description,
            warranty_months: parseInt(formData.warranty_months),
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;

      showAlert(
        "Başarılı",
        "Teklifiniz gönderildi! Müşteri teklifinizi inceleyecek.",
        "success",
      );
      navigate("/partner/dashboard");
    } catch (error) {
      console.error("Error creating quote:", error);
      showAlert(
        "Hata",
        "Teklif gönderilemedi. Lütfen tekrar deneyin.",
        "error",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Security Check: Restrict to Partner/Admin
  if (currentUser?.role !== "partner" && currentUser?.role !== "admin") {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-5 text-center">
        <Icons.ShieldAlert size={64} className="text-red-500 mb-6 mx-auto animate-pulse" />
        <h2 className="text-2xl font-black text-white mb-2">Yetkisiz Erişim</h2>
        <p className="text-slate-400 max-w-md mb-8">Bu form sadece onaylı servisler ve idari yöneticiler içindir.</p>
        <button onClick={() => navigate("/application/home")} className="bg-white text-slate-950 font-black px-8 py-3 rounded-xl hover:bg-slate-200 transition-all">Geri Dön</button>
      </div>
    );
  }

  if (!serviceRequest) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale"
          >
            <Icons.ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold">Teklif Oluştur</h1>
            <p className="text-xs text-slate-400">
              {serviceRequest.brand} {serviceRequest.model}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Talep Bilgileri */}
        <div className="glass-card p-5 rounded-2xl border border-white/10">
          <h3 className="text-lg font-bold mb-4">Talep Bilgileri</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Plaka</span>
              <span className="font-mono font-bold">
                {serviceRequest.plate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Araç</span>
              <span className="font-semibold">
                {serviceRequest.brand} {serviceRequest.model}
              </span>
            </div>
            {serviceRequest.engine_code && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Motor</span>
                <span className="font-semibold">
                  {serviceRequest.engine_code}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Talep Tipi</span>
              <span className="font-semibold">
                {serviceRequest.demand_type === "part" ? "Parça" : "Servis"}
              </span>
            </div>
            {serviceRequest.description && (
              <div className="pt-2 border-t border-white/5">
                <p className="text-sm text-slate-400 mb-1">Müşteri Notu</p>
                <p className="text-slate-200">{serviceRequest.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Teklif Formu */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Fiyat */}
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <label className="flex items-center gap-2 text-sm font-bold mb-3">
              <Icons.DollarSign size={18} className="text-primary-500" /> Teklif
              Fiyatı (₺)
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="Örn: 450.00"
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
              required
            />
          </div>

          {/* Teslimat Süresi */}
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <label className="flex items-center gap-2 text-sm font-bold mb-3">
              <Icons.Clock size={18} className="text-primary-500" /> Tahmini
              Teslimat (Gün)
            </label>
            <input
              type="number"
              value={formData.estimated_delivery_days}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  estimated_delivery_days: e.target.value,
                })
              }
              placeholder="Örn: 2"
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Garanti */}
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <label className="flex items-center gap-2 text-sm font-bold mb-3">
              <Icons.Shield size={18} className="text-primary-500" /> Garanti
              Süresi (Ay)
            </label>
            <select
              value={formData.warranty_months}
              onChange={(e) =>
                setFormData({ ...formData, warranty_months: e.target.value })
              }
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:border-primary-500 focus:outline-none"
            >
              <option value="0">Garantisiz</option>
              <option value="6">6 Ay</option>
              <option value="12">12 Ay</option>
              <option value="24">24 Ay</option>
              <option value="36">36 Ay</option>
            </select>
          </div>

          {/* Açıklama */}
          <div className="glass-card p-5 rounded-2xl border border-white/10">
            <label className="flex items-center gap-2 text-sm font-bold mb-3">
              <Icons.FileText size={18} className="text-primary-500" /> Teklif
              Açıklaması
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Örn: Bosch marka orijinal fren balatası + disk seti. 2 yıl garanti. Montaj dahil."
              rows={5}
              className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white placeholder-slate-500 focus:border-primary-500 focus:outline-none resize-none"
              required
            />
            <p className="text-xs text-slate-500 mt-2">
              Ürün/hizmet detaylarını, marka bilgisini ve montaj durumunu
              belirtin.
            </p>
          </div>

          {/* Bilgilendirme */}
          <div className="glass-card p-4 rounded-2xl border border-primary-500/30 bg-primary-500/5">
            <p className="text-sm text-slate-300">
              <span className="font-bold text-primary-400">💡 İpucu:</span>{" "}
              Detaylı ve net teklifler müşteriler tarafından daha çok tercih
              edilir.
            </p>
          </div>

          {/* Gönder Butonu */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white active-scale disabled:opacity-50"
          >
            {submitting ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <Icons.Send size={20} /> Teklifi Gönder
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateQuoteForm;
