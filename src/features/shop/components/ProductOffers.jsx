import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Badge } from '../../../components/Core';

const ProductOffers = ({ scoredOffers, t }) => {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 space-y-4">
            <h4 className="font-bold text-xl text-slate-800 flex items-center gap-2"><SlidersHorizontal size={20} /> Tüm Satıcı Teklifleri</h4>
            <div className="space-y-3">
                {scoredOffers.map(offer => (
                    <div key={offer.sellerId} className={`p-3 rounded-xl border flex justify-between items-center transition duration-300 shadow-md ${offer.isBuyBoxWinner ? 'border-teal-500 bg-emerald-50 shadow-lg' : 'border-slate-200 hover:bg-slate-50'}`}>
                        <div className="flex-1 space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-900">{offer.seller}</span>
                                {offer.isBuyBoxWinner && <Badge type="success">{t.buyBoxWinner}</Badge>}
                                {offer.type === 'used' && <Badge type="neutral">Çıkma</Badge>}
                            </div>
                            <p className="text-xs text-slate-500">Puan: {offer.rating} <span className="font-black">|</span> Teslimat: {offer.deliveryTime} gün</p>
                            <p className="text-xs font-mono text-blue-600">BB Skoru: {offer.buyBoxScore || 'Hesaplanmadı'}</p>
                        </div>
                        <div className="text-right">
                            <span className="font-black text-lg text-orange-600">{offer.price} ₺</span>
                            {offer.stock > 0 && offer.stock <= 5 ? (
                                <p className="text-[10px] font-black text-red-500 uppercase animate-pulse">Son {offer.stock} Ürün</p>
                            ) : (
                                <p className="text-xs text-slate-500">Stok: {offer.stock}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductOffers;
