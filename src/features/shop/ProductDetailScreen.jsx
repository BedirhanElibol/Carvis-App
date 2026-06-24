import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    Heart,
    ShieldCheck,
    Truck,
    PackageCheck,
    FileBadge,
    ChevronRight,
    ArrowRight,
    SlidersHorizontal,
    CirclePlus
} from 'lucide-react';
import { Badge } from '../../components/Core';
import { getBuyBoxWinner } from '../../utils/productUtils';
import { useShop } from '../../context/ShopContext';
import { useUI } from '../../context/UIContext';

const ProductDetailScreen = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { products, addToCart, toggleFavorite, favorites } = useShop();
    const { t } = useUI();
    const [showCert, setShowCert] = useState(false);
    const [product, setProduct] = useState(null);

    useEffect(() => {
        const found = products.find(p => p.id === parseInt(id));
        setProduct(found);
    }, [id, products]);

    if (!t) return null;
    if (!product) return (
        <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
    );

    const offersSorted = product.offers ? product.offers.map(o => ({ ...o, isBuyBoxWinner: false })) : [];
    const winnerOffer = getBuyBoxWinner(offersSorted) || { price: 0, seller: "Stok Yok", stock: 0 };
    const buyBoxPrice = winnerOffer.price;
    const scoredOffers = offersSorted.map(offer => {
        return offersSorted.find(o => o.sellerId === offer.sellerId) || offer;
    }).sort((a, b) => (b.buyBoxScore || 0) - (a.buyBoxScore || 0));

    const handleBuyNow = () => {
        addToCart(product, winnerOffer);
        navigate('/checkout'); // Direct to new checkout wizard
    };

    return (
        <div className="p-5 pb-32 space-y-6 animate-fade-in relative min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white">
            <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex justify-between items-center mb-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-900 dark:text-white font-black text-[10px] uppercase tracking-widest glass-card px-5 py-3 rounded-2xl shadow-2xl hover:bg-black/10 dark:bg-white/10 active-scale border border-black/10 dark:border-white/10">
                    <ChevronLeft size={16} className="text-primary-500" /> {t.back}
                </button>
                <button onClick={() => toggleFavorite(product.id)} className="p-3 glass-card rounded-full shadow-2xl text-slate-500 hover:text-red-500 transition-all border border-black/10 dark:border-white/10 active-scale">
                    <Heart size={20} className={favorites.includes(product.id) ? "fill-red-500 text-red-500" : ""} />
                </button>
            </div>

            <div className="glass-card !p-6 space-y-6 shadow-2xl rounded-[3rem] border border-black/5 dark:border-white/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-600/10 rounded-full blur-3xl -mr-20 -mt-20"></div>

                <div className="w-full h-80 bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-inner relative border border-black/5 dark:border-white/5">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-1000" />
                    {product.certified && (
                        <div className="absolute top-5 left-5 bg-primary-600 text-slate-900 dark:text-white px-4 py-2 rounded-full text-[10px] font-black flex items-center gap-2 shadow-2xl border border-primary-500/30 uppercase tracking-widest animate-pulse">
                            <ShieldCheck size={16} className="text-primary-200" /> {t.certifiedPart}
                        </div>
                    )}
                </div>

                <div className="space-y-4 relative z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="text-[10px] text-primary-500 font-black uppercase tracking-[0.2em]">{product.brand}</span>
                            <div className="h-px bg-black/10 dark:bg-white/10 flex-1"></div>
                        </div>
                        <h3 className="font-black text-3xl text-slate-900 dark:text-white italic tracking-tighter leading-none mb-3">{product.name}</h3>
                        <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5">
                                <PackageCheck size={14} className="text-green-500" />
                                {winnerOffer.type === 'used' ? t.conditionUsed : t.conditionNew}
                            </div>
                            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full border border-black/5 dark:border-white/5">
                                <Truck size={14} className="text-primary-500" />
                                {winnerOffer.deliveryTime} GÜN TESLİMAT
                            </div>
                        </div>
                    </div>

                    {product.certified && (
                        <div className="glass-card border border-primary-500/20 p-5 rounded-[2rem] cursor-pointer hover:bg-primary-500/5 transition-all shadow-xl active-scale" onClick={() => setShowCert(!showCert)}>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-primary-600/10 flex items-center justify-center border border-primary-500/20">
                                        <FileBadge size={26} className="text-primary-500" />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-slate-900 dark:text-white text-sm italic tracking-tight">RAPIDSY DİJİTAL SERTİFİKA</h4>
                                        <p className="text-[9px] text-slate-500 uppercase tracking-widest font-black mt-0.5">{showCert ? "Gizlemek için dokun" : "İncelemek için dokun"}</p>
                                    </div>
                                </div>
                                <ChevronRight size={20} className={`text-slate-600 transition-transform duration-500 ${showCert ? 'rotate-90' : ''}`} />
                            </div>
                            {showCert && (
                                <div className="mt-5 pt-5 border-t border-black/10 dark:border-white/10 space-y-3 animate-slide-up">
                                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                                        <span className="text-slate-500">Şasi No (VIN):</span>
                                        <span className="text-primary-400 font-mono">{product.vin}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                                        <span className="text-slate-500">Ekspretiz Durumu:</span>
                                        <span className="text-green-500">KUSURSUZ (A+)</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px] font-black tracking-widest uppercase">
                                        <span className="text-slate-500">Rapidsy Onay No:</span>
                                        <span className="text-slate-900 dark:text-white">RPD-988231-X</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-8 border-t border-black/5 dark:border-white/5 mt-4">
                        <div className="flex justify-between items-end mb-6">
                            <div>
                                <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest line-through mb-1.5">Piyasa Fiyatı: {(buyBoxPrice * 1.2).toFixed(0)} ₺</p>
                                <p className="font-black text-5xl text-slate-900 dark:text-white italic tracking-tighter">{buyBoxPrice.toLocaleString()} <span className="text-2xl not-italic ml-1">₺</span></p>
                            </div>
                            <div className="bg-green-600/20 text-green-500 px-4 py-2 rounded-2xl font-black text-xs border border-green-500/20">%20 FIRSAT</div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => addToCart(product, winnerOffer)} className="flex-1 glass-card border border-black/10 dark:border-white/10 text-slate-900 dark:text-white py-4.5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-black/5 dark:bg-white/5 transition-all active-scale shadow-2xl">
                                {t.addToCart}
                            </button>
                            <button onClick={handleBuyNow} className="flex-[1.5] bg-primary-600 text-slate-900 dark:text-white py-4.5 rounded-[1.8rem] font-black text-xs uppercase tracking-widest hover:bg-primary-500 transition-all shadow-2xl shadow-primary-900/50 flex justify-center items-center gap-3 active-scale">
                                {t.buyNow} <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xl space-y-4">
                <h4 className="font-bold text-xl text-slate-800 flex items-center gap-2"><SlidersHorizontal size={20} /> Tüm Satıcı Teklifleri</h4>
                <div className="space-y-3">
                    {scoredOffers.map(offer => (
                        <div key={offer.sellerId} className={`p-3 rounded-xl border flex justify-between items-center transition duration-300 shadow-md ${offer.isBuyBoxWinner ? 'border-emerald-600 bg-emerald-50 shadow-lg' : 'border-slate-200 hover:bg-slate-50'}`}>
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
                                <p className="text-xs text-slate-500">Stok: {offer.stock}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ProductDetailScreen;
