import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuote } from '../../context/QuoteContext';
import { useUI } from '../../context/UIContext';
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Clock,
    Calendar,
    MessageCircle,
    Star,
    Shield,
    Truck,
    Phone,
    MapPin
} from 'lucide-react';

const QuoteDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { quotes, acceptQuote, rejectQuote, loading } = useQuote();
    const { showAlert } = useUI();
    const [quote, setQuote] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        const foundQuote = quotes.find(q => q.id === parseInt(id));
        setQuote(foundQuote);
    }, [id, quotes]);

    const handleAccept = async () => {
        if (!quote) return;

        setActionLoading(true);
        const { error } = await acceptQuote(quote.id);
        setActionLoading(false);

        if (error) {
            showAlert('Hata', 'Teklif kabul edilemedi. Lütfen tekrar deneyin.', 'error');
        } else {
            showAlert('Başarılı', 'Teklif kabul edildi! Satıcı ile iletişime geçebilirsiniz.', 'success');
            navigate('/quotes');
        }
    };

    const handleReject = async () => {
        if (!quote) return;

        setActionLoading(true);
        const { error } = await rejectQuote(quote.id);
        setActionLoading(false);

        if (error) {
            showAlert('Hata', 'Teklif reddedilemedi. Lütfen tekrar deneyin.', 'error');
        } else {
            showAlert('Başarılı', 'Teklif reddedildi.', 'info');
            navigate('/quotes');
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending':
                return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Beklemede' };
            case 'accepted':
                return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Kabul Edildi' };
            case 'rejected':
                return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Reddedildi' };
            case 'expired':
                return { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-500/10', label: 'Süresi Doldu' };
            default:
                return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10', label: 'Bilinmiyor' };
        }
    };

    if (loading || !quote) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
        );
    }

    const config = getStatusConfig(quote.status);
    const StatusIcon = config.icon;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-24">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-5">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold">Teklif Detayları</h1>
                        <div className={`flex items-center gap-1.5 mt-1 ${config.bg} ${config.color} px-2 py-0.5 rounded-lg w-fit text-xs font-bold`}>
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
                    <p className="text-sm text-slate-400 mb-1">Toplam Tutar</p>
                    <p className="text-4xl font-black text-primary-400">
                        ₺{quote.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </p>
                    {quote.estimated_delivery_days && (
                        <div className="flex items-center gap-2 mt-3 text-slate-300">
                            <Truck size={16} />
                            <span className="text-sm">{quote.estimated_delivery_days} gün içinde teslimat</span>
                        </div>
                    )}
                </div>

                {/* Satıcı Bilgileri */}
                <div className="glass-card p-5 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold mb-4">Satıcı Bilgileri</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-400">Firma</span>
                            <span className="font-semibold">{quote.seller?.company_name || quote.seller?.full_name || 'Satıcı'}</span>
                        </div>
                        {quote.seller?.seller_rating > 0 && (
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Puan</span>
                                <div className="flex items-center gap-1">
                                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                                    <span className="font-semibold">{quote.seller.seller_rating.toFixed(1)}</span>
                                </div>
                            </div>
                        )}
                        {quote.seller?.experience_years && (
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Deneyim</span>
                                <span className="font-semibold">{quote.seller.experience_years} yıl</span>
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
                                    showAlert('Bilgi', 'Satıcı telefon numarası bulunamadı. Mesaj ile iletişime geçebilirsiniz.', 'info');
                                }
                            }}
                            className="glass-card p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active-scale"
                        >
                            <Phone size={16} />
                            Ara
                        </button>
                        <button
                            onClick={() => navigate(`/messages/${quote.seller_id}`)}
                            className="glass-card p-3 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active-scale"
                        >
                            <MessageCircle size={16} />
                            Mesaj
                        </button>
                    </div>
                </div>

                {/* Teklif Detayları */}
                <div className="glass-card p-5 rounded-2xl border border-white/10">
                    <h3 className="text-lg font-bold mb-4">Teklif Detayları</h3>
                    <div className="space-y-3">
                        {quote.description && (
                            <div>
                                <p className="text-sm text-slate-400 mb-1">Açıklama</p>
                                <p className="text-slate-200">{quote.description}</p>
                            </div>
                        )}
                        {quote.warranty_months > 0 && (
                            <div className="flex items-center gap-2 text-green-400">
                                <Shield size={16} />
                                <span className="text-sm">{quote.warranty_months} ay garanti</span>
                            </div>
                        )}
                        {quote.expires_at && quote.status === 'pending' && (
                            <div className="flex items-center gap-2 text-slate-400">
                                <Calendar size={16} />
                                <span className="text-sm">
                                    Son geçerlilik: {new Date(quote.expires_at).toLocaleDateString('tr-TR')}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Servis Talebi Bilgileri */}
                {quote.service_request && (
                    <div className="glass-card p-5 rounded-2xl border border-white/10">
                        <h3 className="text-lg font-bold mb-4">Talep Bilgileri</h3>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Plaka</span>
                                <span className="font-mono font-bold">{quote.service_request.plate}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-400">Araç</span>
                                <span className="font-semibold">{quote.service_request.brand} {quote.service_request.model}</span>
                            </div>
                            {quote.service_request.description && (
                                <div>
                                    <p className="text-sm text-slate-400 mb-1">Talep Açıklaması</p>
                                    <p className="text-slate-200">{quote.service_request.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Aksiyon Butonları */}
                {quote.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <button
                            onClick={handleReject}
                            disabled={actionLoading}
                            className="glass-card p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-red-400 border border-red-500/30 active-scale disabled:opacity-50"
                        >
                            <XCircle size={20} />
                            Reddet
                        </button>
                        <button
                            onClick={handleAccept}
                            disabled={actionLoading}
                            className="bg-primary-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white active-scale disabled:opacity-50"
                        >
                            {actionLoading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <CheckCircle size={20} />
                                    Kabul Et
                                </>
                            )}
                        </button>
                    </div>
                )}

                {quote.status === 'accepted' && (
                    <div className="space-y-3">
                        <div className="glass-card p-4 rounded-2xl border border-green-500/30 bg-green-500/10">
                            <div className="flex items-center gap-3">
                                <CheckCircle size={24} className="text-green-400" />
                                <div>
                                    <p className="font-bold text-green-400">Teklif Kabul Edildi</p>
                                    <p className="text-sm text-slate-300">Satıcı ile iletişime geçebilirsiniz.</p>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/payment/${quote.id}`)}
                            className="w-full bg-primary-500 p-4 rounded-2xl flex items-center justify-center gap-2 font-bold text-white active-scale"
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
