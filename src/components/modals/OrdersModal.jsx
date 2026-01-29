import React from 'react';
import { Package, X } from 'lucide-react';
import { Badge } from '../Core';

const OrdersModal = ({ show, onClose, t, orders }) => {
    if (!show || !t) return null;
    return (
        <div className="fixed inset-0 bg-black/60 z-[85] flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-xl flex items-center gap-2"><Package size={22} className="text-orange-600" /> {t.myOrders}</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400" /></button>
                </div>
                <div className="flex-1 overflow-y-auto space-y-4">
                    {orders.length === 0 ? <p className="text-center text-slate-500 py-10">{t.noOrders}</p> :
                        orders.map(order => (
                            <div key={order.id} className="border border-slate-100 p-4 rounded-2xl bg-white shadow-md hover:shadow-lg transition">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-bold text-sm text-slate-800">{order.product}</span>
                                    <Badge type={order.status === 'Teslim Edildi' ? 'success' : 'warning'}>{order.status}</Badge>
                                </div>
                                <div className="flex justify-between items-end">
                                    <p className="text-xs text-slate-500">{order.date}</p>
                                    <span className="font-bold text-orange-600">{order.price} ₺</span>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
};

export default OrdersModal;
