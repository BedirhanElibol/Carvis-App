import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrder } from '../../context/OrderContext';
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle, RefreshCw, Wrench } from 'lucide-react';
import { Badge } from '../../components/Core';
import OrderDetailsModal from './OrderDetailsModal';

const OrdersScreen = () => {
    const navigate = useNavigate();
    const { orders, loading, fetchOrders } = useOrder();
    const [selectedOrder, setSelectedOrder] = useState(null);

    const getStatusConfig = (status) => {
        // ... (Keep existing config)
        switch (status) {
            case 'pending':
                return { icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Beklemede' };
            case 'paid':
                return { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Ödendi' };
            case 'completed':
                return { icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Tamamlandı' };
            case 'cancelled':
                return { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'İptal Edildi' };
            case 'refunded':
                return { icon: XCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'İade Edildi' };

            // New Transparent Eye Statuses
            case 'diagnosing':
                return { icon: Wrench, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Teşhis Ediliyor' };
            case 'repairing':
                return { icon: Wrench, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Onarılıyor' };
            case 'quality_check':
                return { icon: CheckCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'Son Kontroller' };

            default:
                return { icon: Clock, color: 'text-slate-400', bg: 'bg-slate-500/10', label: status };
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-24">
            <OrderDetailsModal
                show={!!selectedOrder}
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />

            {/* Header */}
            {/* ... (Keep existing header) */}
            <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold">Siparişlerim</h1>
                            <p className="text-xs text-slate-400">{orders.length} sipariş</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchOrders}
                        className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
                {/* ... (Keep existing loading/empty logic) */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <Package size={48} className="mx-auto text-slate-600 mb-4" />
                        <p className="text-slate-400 mb-2">Henüz siparişiniz bulunmuyor</p>
                        <p className="text-xs text-slate-500">Teklif kabul edip ödeme yaptığınızda siparişleriniz burada görünür.</p>
                        <button
                            onClick={() => navigate('/quotes')}
                            className="mt-6 bg-primary-500 px-6 py-3 rounded-xl font-bold text-sm active-scale"
                        >
                            Tekliflere Git
                        </button>
                    </div>
                ) : (
                    orders.map(order => {
                        const config = getStatusConfig(order.status);
                        const StatusIcon = config.icon;

                        return (
                            <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="glass-card p-5 rounded-2xl border border-white/10 active-scale cursor-pointer hover:border-primary-500/30 transition-all"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <p className="text-xs text-slate-500 font-mono">#{order.id.slice(0, 8)}</p>
                                        <p className="font-bold text-lg">
                                            {order.seller?.company_name || order.seller?.full_name || 'Satıcı'}
                                        </p>
                                    </div>
                                    <div className={`flex items-center gap-1.5 ${config.bg} ${config.color} px-3 py-1.5 rounded-lg text-xs font-bold`}>
                                        <StatusIcon size={14} />
                                        {config.label}
                                    </div>
                                </div>

                                {order.quote && (
                                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">
                                        {order.quote.description}
                                    </p>
                                )}

                                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                        {(order.status === 'paid' || order.status === 'completed') && (
                                            <Badge type="success" className="text-[9px]">Ödendi</Badge>
                                        )}
                                        {/* Transparent Eye Badge */}
                                        <Badge type="info" className="text-[9px]">Canlı Takip</Badge>
                                    </div>
                                    <p className="text-xl font-black text-primary-400">
                                        ₺{order.total_amount?.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                                    </p>
                                </div>
                                <p className="text-[10px] text-slate-600 mt-3 text-right">
                                    Detaylar için dokun ›
                                </p>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default OrdersScreen;
