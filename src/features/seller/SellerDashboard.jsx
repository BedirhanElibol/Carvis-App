import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    ClipboardList,
    Store,
    LogOut,
    Sparkles,
    Activity,
    CircleHelp,
    CirclePlus,
    Phone,
    Gavel,
    Car,
    Clock,
    DollarSign
} from 'lucide-react';
import { Badge } from '../../components/Core';
import ServiceRequestCard from './ServiceRequestCard';
import { useSeller } from '../../context/SellerContext';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { usePayment } from '../../context/PaymentContext';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { t, toggleLanguage, language, showAlert } = useUI();
    const { handleLogout, currentUser } = useAuth();
    const { proTab, setProTab, sellerOrders, loading: sellerLoading } = useSeller();
    const { sellerBalance } = usePayment();

    const [serviceRequests, setServiceRequests] = useState([]);
    const [loadingRequests, setLoadingRequests] = useState(true);

    useEffect(() => {
        if (currentUser) {
            fetchServiceRequests();
        }
    }, [currentUser]);

    const fetchServiceRequests = async () => {
        setLoadingRequests(true);
        try {
            // Sadece bekleyen (pending) talepleri getir
            const { data, error } = await supabase
                .from('service_requests')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setServiceRequests(data || []);
        } catch (error) {
            console.error('Error fetching service requests:', error);
        } finally {
            setLoadingRequests(false);
        }
    };

    if (!t) return null;

    // Gerçek siparişlerden toplam kazanç hesapla
    const totalEarnings = sellerOrders.reduce((acc, order) => acc + (order.total_amount || 0), 0);

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            {/* Header / Stats Panel */}
            <div className="bg-slate-900 text-white p-6 pb-12 rounded-b-[2.5rem] shadow-2xl relative z-10">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary-600 p-2.5 rounded-xl shadow-md"><Store size={20} className="text-white" /></div>
                        <div>
                            <span className="font-bold text-lg block leading-none italic uppercase tracking-tighter">Partner Panel</span>
                            <span className="text-[10px] text-slate-400 font-medium">Hoş geldin, {currentUser?.user_metadata?.full_name}</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={toggleLanguage} className="bg-white/10 p-2 rounded-full hover:bg-white/20 font-bold text-xs w-8 h-8 flex items-center justify-center transition-all">{language?.toUpperCase()}</button>
                        <button onClick={handleLogout} className="bg-white/10 p-2 rounded-full hover:bg-red-500/80 transition-all shadow-md"><LogOut size={18} /></button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{t.totalSales}</p>
                        <h2 className="text-2xl font-black italic">₺{totalEarnings.toLocaleString('tr-TR')}</h2>
                        <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition">
                            <DollarSign size={40} />
                        </div>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/5 shadow-inner group">
                        <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Mevcut Bakiye</p>
                        <h2 className="text-2xl font-black italic text-primary-400">₺{sellerBalance?.available_balance?.toLocaleString('tr-TR') || '0'}</h2>
                        <div className="absolute top-2 right-2 opacity-10 group-hover:opacity-20 transition">
                            <Clock size={40} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex-1 overflow-y-auto -mt-6 pt-8 px-5 pb-24 space-y-6">
                <div className="flex bg-white p-1.5 rounded-2xl shadow-2xl border border-slate-100 mb-4 sticky top-0 z-20">
                    {[
                        { id: 'dashboard', label: "Genel Bakış", icon: LayoutDashboard },
                        { id: 'requests', label: "İş Talepleri", icon: ClipboardList },
                        { id: 'orders', label: "Siparişler", icon: ShoppingBag },
                        { id: 'profile', label: "Profil", icon: Gavel }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setProTab(tab.id)}
                            className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase flex flex-col items-center justify-center gap-1.5 transition-all active-scale ${proTab === tab.id ? 'bg-primary-600 text-white shadow-xl shadow-primary-900/20 scale-105' : 'text-slate-400 hover:bg-slate-50'}`}
                        >
                            <tab.icon size={18} /> {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Contents */}
                {proTab === 'dashboard' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-500/10 rounded-full blur-2xl"></div>
                            <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2 italic tracking-tighter uppercase"><Activity size={20} className="text-primary-600" /> Analiz</h3>
                            <div className="flex gap-6 items-center">
                                <div className="w-24 h-24 rounded-full border-[6px] border-slate-50 flex items-center justify-center text-primary-600 font-black text-2xl shadow-inner relative">
                                    <svg className="absolute inset-0 w-full h-full -rotate-90">
                                        <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="264" strokeDashoffset="66" className="text-primary-500 opacity-20"></circle>
                                        <circle cx="48" cy="48" r="42" fill="none" stroke="currentColor" strokeWidth="6" strokeDasharray="264" strokeDashoffset="100" className="text-primary-500"></circle>
                                    </svg>
                                    %75
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-500 font-black uppercase tracking-widest">Başarı Oranı</p>
                                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">Tekliflerinizin kabul edilme oranı ortalamanın üzerinde. <span className="text-primary-600 font-bold">Harika iş!</span></p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-slate-800 flex items-center gap-2 italic tracking-tighter uppercase"><CirclePlus size={20} className="text-blue-500" /> Hızlı Eylem</h3>
                            </div>
                            <button onClick={() => setProTab('requests')} className="w-full bg-slate-900 text-white p-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 active-scale shadow-xl shadow-slate-900/20">
                                <ClipboardList size={20} /> Yeni İşlere Bak
                            </button>
                        </div>
                    </div>
                )}

                {proTab === 'requests' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="font-black text-xl text-slate-900 uppercase italic tracking-tighter">İş Talepleri</h3>
                            <Badge type="info">{serviceRequests.length} Açık Talep</Badge>
                        </div>

                        {loadingRequests ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                                <p className="text-xs text-slate-400 mt-4 font-bold uppercase tracking-widest">Talepler Getiriliyor...</p>
                            </div>
                        ) : serviceRequests.length === 0 ? (
                            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl text-center">
                                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <ClipboardList size={40} className="text-slate-300" />
                                </div>
                                <h4 className="font-black text-slate-800 text-lg mb-2 italic">TALEP BULUNAMADI</h4>
                                <p className="text-xs text-slate-500 font-medium">Şu an için bekleyen bir iş talebi bulunmuyor. Yeni talepler geldiğinde burada listeleyeceğiz.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {serviceRequests.map(request => (
                                    <ServiceRequestCard key={request.id} request={request} isSellerView={true} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {proTab === 'orders' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="font-black text-xl text-slate-900 uppercase italic tracking-tighter font-bold">{t.orders}</h3>
                            <Badge type="neutral">{sellerOrders.length} İşlem</Badge>
                        </div>

                        {sellerOrders.length === 0 ? (
                            <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 shadow-xl text-center">
                                <ShoppingBag size={48} className="mx-auto text-slate-200 mb-4" />
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Henüz bir satışınız yok</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {sellerOrders.map(order => (
                                    <div key={order.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl group hover:border-primary-500/30 transition-all active-scale">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="bg-slate-50 p-2.5 rounded-xl">
                                                <span className="font-black text-[10px] text-slate-900">NO: #{order.id}</span>
                                            </div>
                                            <Badge type={order.status === 'paid' ? 'success' : 'warning'}>
                                                {order.status === 'paid' ? 'Ödendi' : order.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="w-10 h-10 bg-primary-500/10 rounded-full flex items-center justify-center">
                                                <Car size={18} className="text-primary-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Müşteri ID</p>
                                                <p className="text-xs font-bold text-slate-900 leading-none truncate w-32">{order.customer_id.substring(0, 13)}...</p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                                            <div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Tutar</p>
                                                <span className="font-black text-xl text-slate-900 italic">₺{order.total_amount.toLocaleString('tr-TR')}</span>
                                            </div>
                                            <button onClick={() => navigate(`/app/messages`)} className="bg-slate-900 text-white px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-600 transition-all active:scale-95 shadow-lg">
                                                MESAJ GÖNDER
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Satıcı Profil Sekmesi */}
                {proTab === 'profile' && (
                    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4">
                        <div className="flex justify-between items-center px-2">
                            <h3 className="font-black text-xl text-slate-900 uppercase italic tracking-tighter">Satıcı Profili</h3>
                        </div>

                        {/* Profil Kartı */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center">
                                    <Store size={32} className="text-primary-600" />
                                </div>
                                <div>
                                    <h4 className="font-black text-lg text-slate-900">{currentUser?.user_metadata?.full_name || 'Satıcı'}</h4>
                                    <p className="text-sm text-slate-500">{currentUser?.email}</p>
                                    <Badge type="success" className="mt-1">Aktif Satıcı</Badge>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Toplam Sipariş</p>
                                    <p className="text-2xl font-black text-slate-900">{sellerOrders.length}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-xl">
                                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Toplam Kazanç</p>
                                    <p className="text-2xl font-black text-primary-600">₺{totalEarnings.toLocaleString('tr-TR')}</p>
                                </div>
                            </div>
                        </div>

                        {/* Hesap Ayarları */}
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl">
                            <h4 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                                <CircleHelp size={18} className="text-slate-400" /> Hesap Ayarları
                            </h4>
                            <div className="space-y-3">
                                <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                                    <span className="text-sm font-medium text-slate-700">İşletme Bilgileri</span>
                                    <Phone size={16} className="text-slate-400" />
                                </button>
                                <button className="w-full flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition">
                                    <span className="text-sm font-medium text-slate-700">Ödeme Ayarları</span>
                                    <DollarSign size={16} className="text-slate-400" />
                                </button>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center justify-center gap-2 p-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 transition font-bold"
                                >
                                    <LogOut size={16} />
                                    Çıkış Yap
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SellerDashboard;
