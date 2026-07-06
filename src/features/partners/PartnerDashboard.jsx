import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { TrendingUp, Users, Star, Activity, Car, Key, Wrench, Package, CreditCard, Receipt, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import PaymentModal from '../../components/payment/PaymentModal';
import ProcessManager from './ProcessManager';
import { useSeller } from '../../context/SellerContext';
import { generateInvoicePDF } from '../../utils/invoiceGenerator';
import ActiveOrderCard from './components/ErpCrmManager'; 

const PartnerDashboard = () => {
    const { currentUser } = useAuth();
    const { showAlert } = useUI();
    const { sellerOrders } = useSeller();
    const [searchParams] = useSearchParams();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null); // { amount, title }
    const [customPosData, setCustomPosData] = useState({ title: '', amount: '' });

    // Determine active role (Query Param for Dev/Preview OR Real User Role)
    const activeRole = searchParams.get('role') || currentUser?.role || 'parking';

    // UI/UX Pro Max Themes
    const themes = {
        parking: {
            title: 'Otopark İşletmesi',
            icon: Car,
            color: 'cyan',
            gradient: 'from-cyan-500/10 to-blue-500/5',
            border: 'border-cyan-500/20',
            text: 'text-cyan-400'
        },
        valet: {
            title: 'Vale Hizmeti',
            icon: Key,
            color: 'amber',
            gradient: 'from-amber-500/10 to-orange-500/5',
            border: 'border-amber-500/20',
            text: 'text-amber-400'
        },
        mechanic: {
            title: 'Oto Servis & Bakım',
            icon: Wrench,
            color: 'orange',
            gradient: 'from-orange-500/10 to-red-500/5',
            border: 'border-orange-500/20',
            text: 'text-orange-400'
        },
        parts: {
            title: 'Parça Tedarikçisi',
            icon: Package,
            color: 'emerald',
            gradient: 'from-emerald-500/10 to-teal-500/5',
            border: 'border-emerald-500/20',
            text: 'text-teal-400'
        },
        carwash: {
            title: 'Seyyar Yıkama',
            icon: Droplet,
            color: 'cyan',
            gradient: 'from-cyan-500/10 to-blue-500/5',
            border: 'border-cyan-500/20',
            text: 'text-cyan-400'
        }
    };

    const currentTheme = themes[activeRole] || themes.parking;

    // Dynamic Stats based on Role
    const [stats, setStats] = useState([
        { label: 'Günlük Ciro', value: '...', icon: TrendingUp, color: `text-${currentTheme.color}-500`, bg: `bg-${currentTheme.color}-500/10` },
        { label: 'Aktif İşlemler', value: '...', icon: Activity, color: 'text-slate-900 dark:text-white', bg: 'bg-black/10 dark:bg-white/10' },
        { label: 'Müşteri Memnuniyeti', value: '5.0', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: 'Toplam Ziyaret', value: '...', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    ]);

    useEffect(() => {
        if (!currentUser) return;

        const fetchPartnerStats = async () => {
            // 1. Get Revenue & Count (orders where seller_id = current user)
            // Fetch completed orders revenue and count
            const { data: orders, error } = await supabase
                .from('orders')
                .select('total_amount, rating')
                .eq('seller_id', currentUser.id)
                .eq('status', 'completed');

            if (!error && orders) {
                const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
                const count = orders.length;
                const ratedOrders = orders.filter(o => o.rating);
                const averageRating = ratedOrders.length > 0 
                    ? (ratedOrders.reduce((sum, o) => sum + o.rating, 0) / ratedOrders.length).toFixed(1) 
                    : '5.0';

                setStats([
                    {
                        label: 'Toplam Ciro',
                        value: `₺${totalRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
                        icon: TrendingUp,
                        color: `text-${currentTheme.color}-500`,
                        bg: `bg-${currentTheme.color}-500/10`
                    },
                    {
                        label: 'Toplam İşlem',
                        value: count.toString(),
                        icon: Activity,
                        color: 'text-slate-900 dark:text-white',
                        bg: 'bg-black/10 dark:bg-white/10'
                    },
                    { label: 'Müşteri Memnuniyeti', value: averageRating, icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                    { label: 'Profil Görüntüleme', value: '—', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                ]);
            }
        };

        fetchPartnerStats();

        const channel = supabase
            .channel('partner_dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `seller_id=eq.${currentUser.id}` }, () => fetchPartnerStats())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser, currentTheme]);

    const handleCreateInvoice = (amount, title) => {
        setSelectedInvoice({ amount, title });
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async () => {
        try {
            // Create a real completed order record in DB
            const { error } = await supabase.from('orders').insert([
                {
                    seller_id: currentUser.id,
                    customer_id: currentUser.id,
                    total_amount: selectedInvoice.amount,
                    status: 'completed',
                    commission_rate: 0.1,
                    created_at: new Date().toISOString(),
                    quote_id: null // POS transaction has no quote
                }
            ]);

            if (error) throw error;

            setIsPaymentModalOpen(false);
            showAlert("Tahsilat Başarılı", `${selectedInvoice?.amount} TL kasanıza işlendi.`, "success");
        } catch (error) {
            console.error('POS Error:', error);
            showAlert("Hata", "İşlem kaydedilemedi.", "error");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in p-6">
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                type="payment" // Custom type for direct payment logic
                fixedAmount={selectedInvoice?.amount}
                onSuccess={handlePaymentSuccess}
            />

            {/* Header Section */}
            <div className={`glass-card p-8 rounded-3xl border ${currentTheme.border} bg-gradient-to-br ${currentTheme.gradient} relative overflow-hidden`}>
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className={`p-2 rounded-lg bg-black/20 ${currentTheme.text}`}>
                                <currentTheme.icon size={24} />
                            </div>
                            <span className={`text-sm font-bold uppercase tracking-widest ${currentTheme.text} opacity-80`}>
                                {currentTheme.title}
                            </span>
                        </div>
                        <h1 className="text-4xl font-black font-outfit text-slate-900 dark:text-white tracking-tight">
                            Hoş Geldiniz, {currentUser?.user_metadata?.full_name || 'İş Ortağımız'}
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400 mt-2 font-inter max-w-xl">
                            İşletmenizin performans özeti ve anlık bildirimler aşağıdadır.
                        </p>
                    </div>
                    {/* Decorative Logic */}
                    <div className={`hidden md:block w-32 h-32 rounded-full bg-${currentTheme.color}-500/20 blur-[60px] absolute right-[-20px] top-[-20px]`} />
                </div>
            </div>

            {/* Quick Actions (POS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-black/5 dark:border-white/5 md:col-span-2">
                    <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <CreditCard className="text-green-400" /> Hızlı Tahsilat (POS)
                    </h3>
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Hizmet / Ürün Adı</label>
                                <input 
                                    type="text" 
                                    placeholder="Örn: Balata Değişimi" 
                                    value={customPosData.title}
                                    onChange={(e) => setCustomPosData(prev => ({ ...prev, title: e.target.value }))}
                                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-primary-500 transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Tutar (₺)</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    placeholder="Örn: 1500" 
                                    value={customPosData.amount}
                                    onChange={(e) => setCustomPosData(prev => ({ ...prev, amount: e.target.value }))}
                                    className="w-full bg-slate-100 dark:bg-slate-900/50 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white outline-none focus:border-primary-500 transition-colors"
                                />
                            </div>
                        </div>
                        <button 
                            onClick={() => {
                                if (customPosData.title && customPosData.amount > 0) {
                                    handleCreateInvoice(Number(customPosData.amount), customPosData.title);
                                    setCustomPosData({ title: '', amount: '' });
                                } else {
                                    showAlert("Hata", "Lütfen hizmet adını ve geçerli bir tutar girin.", "error");
                                }
                            }}
                            className="w-full px-4 py-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl font-black uppercase tracking-widest active-scale transition shadow-lg shadow-primary-600/20"
                        >
                            Ödemeyi Al & Fatura Kes
                        </button>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-black/5 dark:border-white/5 flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4 w-full">
                        <Receipt size={24} className="text-slate-600" />
                        <h4 className="text-slate-900 dark:text-white font-bold flex-1">Son Faturalar</h4>
                    </div>
                    <div className="w-full space-y-2 overflow-y-auto max-h-32 pr-2">
                        {sellerOrders?.filter(o => o.status === 'completed').length > 0 ? (
                            sellerOrders.filter(o => o.status === 'completed').slice(0, 3).map(order => (
                                <div key={order.id} className="flex justify-between items-center bg-black/5 dark:bg-white/5 p-3 rounded-lg">
                                    <span className="text-sm font-bold">{order.total_amount} ₺</span>
                                    <button 
                                        onClick={() => generateInvoicePDF(order, currentUser)}
                                        className="text-xs bg-primary-600 hover:bg-primary-500 text-white px-3 py-1.5 rounded-lg font-bold"
                                    >
                                        PDF
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm text-center py-4">Henüz fatura kesilmedi.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 rounded-2xl border border-black/5 dark:border-white/5 hover:border-black/20 dark:border-white/20 transition-all duration-300 flex flex-col justify-between h-40"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon size={22} className={stat.color} />
                            </div>
                            {index === 0 && <span className="text-green-400 text-xs font-bold">+12%</span>}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black font-outfit text-slate-900 dark:text-white mb-1">{stat.value}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>


            {/* Active Process Management (Transparent Eye) */}
            <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Activity className="text-primary-400" />
                        Aktif İşlem Yönetimi
                    </h3>
                    <span className="text-[10px] font-bold bg-primary-500/10 text-primary-400 px-3 py-1 rounded-lg border border-primary-500/20">
                        CANLI İŞLEM
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Active Orders from DB */}
                    <ActiveOrderCard currentUser={currentUser} showAlert={showAlert} />

                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="glass-card p-8 rounded-3xl border border-black/5 dark:border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-outfit">Son Hareketler</h2>
                    <button className={`text-sm font-bold uppercase hover:underline ${currentTheme.text}`}>
                        Tümünü Gör
                    </button>
                </div>

                <RecentActivityList currentUser={currentUser} activeRole={activeRole} />

            </div>
        </div >
    );
};

export default PartnerDashboard;
