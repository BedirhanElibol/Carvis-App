import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuote } from "../../context/QuoteContext";
import { useUI } from "../../context/UIContext";
import { useShop } from "../../context/ShopContext";
import { validatePartPriceMarkup } from "../../utils/partPriceChecker";
import { ArrowLeft, Calendar, CheckCircle, Clock, Layers, MessageCircle, Package, Percent, Phone, Shield, ShieldCheck, Star, Truck, Wrench, XCircle } from "lucide-react";

const QuoteDetailScreen = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { quotes, acceptQuote, rejectQuote, loading } = useQuote();
  const { showAlert } = useUI();
  const { products } = useShop();

  const [quote, setQuote] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const foundQuote = quotes.find((q) => q.id === id);
    setQuote(foundQuote);
  }, [id, quotes]);

  const handleAccept = async () => {
    if (!quote) return;
    setActionLoading(true);
    const { error } = await acceptQuote(quote.id);
    setActionLoading(false);
    if (error) {
      showAlert(
        "Hata",
        "Teklif kabul edilemedi. Lütfen tekrar deneyin.",
        "error",
      );
    } else {
      showAlert(
        "Başarılı",
        "Teklif kabul edildi! Satıcı ile iletişime geçebilirsiniz.",
        "success",
      );
      navigate("/quotes");
    }
  };

  const handleReject = async () => {
    if (!quote) return;
    setActionLoading(true);
    const { error } = await rejectQuote(quote.id);
    setActionLoading(false);
    if (error) {
      showAlert(
        "Hata",
        "Teklif reddedilemedi. Lütfen tekrar deneyin.",
        "error",
      );
    } else {
      showAlert("Başarılı", "Teklif reddedildi.", "info");
      navigate("/quotes");
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          icon: Clock,
          color: "text-yellow-400",
          bg: "bg-yellow-500/10",
          label: "Beklemede",
        };
      case "accepted":
        return {
          icon: CheckCircle,
          color: "text-green-400",
          bg: "bg-green-500/10",
          label: "Kabul Edildi",
        };
      case "rejected":
        return {
          icon: XCircle,
          color: "text-red-400",
          bg: "bg-red-500/10",
          label: "Reddedildi",
        };
      case "expired":
        return {
          icon: Clock,
          color: "text-slate-500",
          bg: "bg-slate-500/10",
          label: "Süresi Doldu",
        };
      default:
        return {
          icon: Clock,
          color: "text-slate-500 dark:text-slate-400",
          bg: "bg-slate-500/10",
          label: "Bilinmiyor",
        };
    }
  };

  if (loading || !quote) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const config = getStatusConfig(quote.status);
  const StatusIcon = config.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 p-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Teklif Detayları</h1>
            <div
              className={`flex items-center gap-1.5 mt-1 ${config.bg} ${config.color} px-2 py-0.5 rounded-lg w-fit text-xs font-bold`}
            >
              <StatusIcon size={14} />
              {config.label}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Fiyat Kartı */}
        <div className="glass-card p-6 rounded-2xl border border-primary-500/30 bg-gradient-to-br from-primary-500/10 to-transparent">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Toplam Tutar (KDV Dahil)</p>
              <p className="text-2xl font-bold text-slate-700 dark:text-slate-300 font-mono">
                ₺{quote.price.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-black uppercase px-3 py-1.5 rounded-xl flex items-center gap-1.5 shadow-sm shadow-primary-500/10">
                <ShieldCheck size={14} /> CARVİS GÜVENCELİ
              </div>
              {quote.warranty_months > 0 && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400 text-[10px] font-black uppercase px-2 py-1 rounded-lg flex items-center gap-1">
                  <Shield size={12} /> {quote.warranty_months} AY GARANTİLİ İŞÇİLİK
                </div>
              )}
            </div>
          </div>

          {/* Şeffaf Maliyet Kırılımı Tablosu */}
          <div className="mt-6 border-t border-black/5 dark:border-white/5 pt-4 space-y-2.5">
            {/* OEM Standard Hours & Ceiling Card */}
            <div className="p-3.5 bg-gradient-to-r from-cyan-950/40 to-slate-900/40 rounded-xl border border-cyan-500/30 text-xs mb-3 space-y-1">
              <div className="flex items-center justify-between text-cyan-400 font-black uppercase text-[10px] tracking-wider">
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} /> OEM FABRİKA STANDART İŞÇİLİK KORUMASI</span>
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">SABİTLENMİŞ TAVAN</span>
              </div>
              <div className="flex justify-between items-center text-slate-300 font-mono text-[11px] pt-1">
                <span>Fabrika Standart Süresi: <strong className="text-white">{quote.standard_hours || "1.0"} Saat</strong></span>
                <span>Tavan İşçilik Limiti: <strong className="text-emerald-400 font-bold">₺{(quote.max_labor_ceiling || (quote.price * 0.4)).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}</strong></span>
              </div>
            </div>

            {/* Carvis Fair Part Price Wall & Retail Range Warning */}
            {(() => {
              const partsPriceNum = quote.parts_price || quote.price * 0.55;
              const issueName = quote.service_request?.demand_type || quote.description || "";
              const check = validatePartPriceMarkup(issueName, partsPriceNum, products);

              return (
                <div className={`p-4 rounded-xl border text-xs space-y-2.5 ${
                  check.isOverpriced
                    ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                }`}>
                  <div className="flex items-center justify-between font-black text-[11px] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck size={15} className={check.isOverpriced ? 'text-amber-400' : 'text-emerald-400'} />
                      {check.isOverpriced ? '⚠️ PARÇA FİYATİ PİYASA UYARISI' : '🟢 ŞEFFAF PARÇA FİYATI GÜVENCESİ'}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${check.isOverpriced ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {check.isOverpriced ? 'PİYASA ÜZERİNDE' : 'MAKUL PARÇA FİYATI'}
                    </span>
                  </div>

                  <p className="text-[11px] leading-relaxed opacity-90 font-sans">
                    Bu yedek parçanın Türkiye piyasasındaki ortalama perakende satış fiyatı:{' '}
                    <strong className="text-white font-mono">₺{check.fairMin.toLocaleString('tr-TR')} – ₺{check.fairMax.toLocaleString('tr-TR')}</strong> arasındadır.
                  </p>

                  {check.isOverpriced && (
                    <div className="pt-1">
                      <button
                        onClick={() => navigate(`/parts?search=${encodeURIComponent(issueName)}`)}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition active-scale shadow-lg"
                      >
                        🛒 Parçayı Carvis Pazaryerinden ₺{check.fairMin.toLocaleString('tr-TR')}'ye Al (Sadece İşçilik Öde)
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Package size={13} className="text-slate-500" /> Yedek Parça Bedeli <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1 rounded text-slate-600 dark:text-slate-300 ml-1">(Orijinal / Sertifikalı)</span>
              </span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">
                ₺{(quote.parts_price || quote.price * 0.55).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Wrench size={13} className="text-slate-500" /> OEM İşçilik & Kalibrasyon <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-1 rounded ml-1 border border-cyan-500/20">(Tavan Korumalı)</span>
              </span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">
                ₺{(quote.labor_price || quote.price * 0.25).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Layers size={13} className="text-slate-500" /> Carvis Hizmet Bedeli (%10)
              </span>
              <span className="text-teal-400 font-mono font-bold">
                ₺{(quote.price * 0.10).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Percent size={13} className="text-slate-500" /> Devlet KDV Vergisi (%20)
              </span>
              <span className="text-slate-900 dark:text-white font-mono font-bold">
                ₺{(quote.price * 0.20).toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl border border-black/5 dark:border-white/5 text-[9px] text-slate-500 dark:text-slate-400 mt-3 leading-relaxed">
              <span className="font-bold text-slate-900 dark:text-white uppercase block mb-1">Müşteri ve Ortak Şeffaflık İlkesi:</span>
              Carvis, fabrika standart işçilik saatlerini (OEM FRT) ve parça piyasa tavan fiyatlarını esas alır. Usta gizli kar marjı ekleyemez. %10 Carvis bedeli; usta eğitimleri, yol yardımı sigortası ve 1 Yıl / 20.000 KM parça garantisi için kullanılır.
            </div>
          </div>

          {quote.estimated_delivery_days && (
            <div className="flex items-center gap-2 mt-4 text-slate-600 dark:text-slate-300 border-t border-black/5 dark:border-white/5 pt-3 text-xs">
              <Truck size={14} className="text-primary-400" />
              <span>
                Tahmini tamamlanma süresi: <strong>{quote.estimated_delivery_days} iş günü</strong>
              </span>
            </div>
          )}
        </div>

        {/* Satıcı Bilgileri */}
        <div className="glass-card p-5 rounded-2xl border border-black/10 dark:border-white/10">
          <h3 className="text-lg font-bold mb-4">Satıcı Bilgileri</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400">Firma</span>
              <span className="font-semibold">
                {quote.seller?.company_name ||
                  quote.seller?.full_name ||
                  "Satıcı"}
              </span>
            </div>
            {quote.seller?.seller_rating > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-wider">Rapidsy Güven Skoru</span>
                <div className="flex items-center gap-1 bg-green-500/10 px-2 py-1 rounded-lg border border-green-500/20">
                  <Shield size={14} className="text-green-500" />
                  <span className="font-black text-green-600 dark:text-green-400">
                    {quote.seller.seller_rating.toFixed(1)} / 5.0
                  </span>
                </div>
              </div>
            )}
            {quote.seller?.experience_years && (
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Deneyim</span>
                <span className="font-semibold">
                  {quote.seller.experience_years} yıl
                </span>
              </div>
            )}
          </div>

          {/* İletişim Butonları */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => {
                const phone = quote.seller?.phone;
                if (phone) {
                  window.location.href = `tel:${phone}`;
                } else {
                  showAlert(
                    "Bilgi",
                    "Satıcı telefon numarası bulunamadı. Mesaj ile iletişime geçebilirsiniz.",
                    "info",
                  );
                }
              }}
              className="glass-card p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active-scale"
            >
              <Phone size={16} /> Ara
            </button>
            <button
              onClick={() => navigate(`/messages/${quote.seller_id}`)}
              className="glass-card p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active-scale"
            >
              <MessageCircle size={16} /> Mesaj
            </button>
          </div>
        </div>

        {/* Teklif Detayları */}
        <div className="glass-card p-5 rounded-2xl border border-black/10 dark:border-white/10">
          <h3 className="text-lg font-bold mb-4">Teklif Detayları</h3>
          <div className="space-y-3">
            {quote.description && (
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">Açıklama</p>
                <p className="text-slate-700 dark:text-slate-200">{quote.description}</p>
              </div>
            )}

            {quote.expires_at && quote.status === "pending" && (
              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                <Calendar size={16} />
                <span className="text-sm">
                  Son geçerlilik:{" "}
                  {new Date(quote.expires_at).toLocaleDateString("tr-TR")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Servis Talebi Bilgileri */}
        {quote.service_request && (
          <div className="glass-card p-5 rounded-2xl border border-black/10 dark:border-white/10">
            <h3 className="text-lg font-bold mb-4">Talep Bilgileri</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Plaka</span>
                <span className="font-mono font-bold">
                  {quote.service_request.plate}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Araç</span>
                <span className="font-semibold">
                  {quote.service_request.brand} {quote.service_request.model}
                </span>
              </div>
              {quote.service_request.description && (
                <div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
                    Talep Açıklaması
                  </p>
                  <p className="text-slate-700 dark:text-slate-200">
                    {quote.service_request.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Aksiyon Butonları */}
        {quote.status === "pending" && (
          <div className="grid grid-cols-2 gap-3 pt-4">
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="glass-card p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-red-400 border border-red-500/30 active-scale disabled:opacity-50"
            >
              <XCircle size={20} /> Reddet
            </button>
            <button
              onClick={handleAccept}
              disabled={actionLoading}
              className="bg-primary-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-slate-900 dark:text-white active-scale disabled:opacity-50"
            >
              {actionLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <CheckCircle size={20} /> Kabul Et
                </>
              )}
            </button>
          </div>
        )}

        {quote.status === "accepted" && (
          <div className="space-y-3">
            <div className="glass-card p-4 rounded-2xl border border-green-500/30 bg-green-500/10">
              <div className="flex items-center gap-3">
                <CheckCircle size={24} className="text-green-400" />
                <div>
                  <p className="font-bold text-green-400">
                    Teklif Kabul Edildi
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">
                    Satıcı ile iletişime geçebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(`/payment/${quote.id}`)}
              className="w-full bg-primary-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-slate-900 dark:text-white active-scale"
            >
              💳 Ödeme Yap
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuoteDetailScreen;
