import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { TrendingUp, Users, Star, Activity, Car, Key, Wrench, Package, CreditCard, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import PaymentModal from '../../components/payment/PaymentModal';
import ProcessManager from './ProcessManager';

const PartnerDashboard = () => {
    const { currentUser } = useAuth();
    const { showAlert } = useUI();
    const [searchParams] = useSearchParams();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null); // { amount, title }

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
            color: 'purple',
            gradient: 'from-purple-500/10 to-indigo-500/5',
            border: 'border-purple-500/20',
            text: 'text-purple-400'
        }
    };

    const currentTheme = themes[activeRole] || themes.parking;

    // Dynamic Stats based on Role
    const [stats, setStats] = useState([
        { label: 'Günlük Ciro', value: '...', icon: TrendingUp, color: `text-${currentTheme.color}-500`, bg: `bg-${currentTheme.color}-500/10` },
        { label: 'Aktif İşlemler', value: '...', icon: Activity, color: 'text-white', bg: 'bg-white/10' },
        { label: 'Müşteri Memnuniyeti', value: '5.0', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
        { label: 'Toplam Ziyaret', value: '...', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    ]);

    useEffect(() => {
        if (!currentUser) return;

        const fetchPartnerStats = async () => {
            // 1. Get Revenue & Count (orders where seller_id = current user)
            // For 'daily', we would filter by date, but for now getting total for demo impact
            const { data: orders, error } = await supabase
                .from('orders')
                .select('total_amount')
                .eq('seller_id', currentUser.id)
                .eq('status', 'completed');

            if (!error && orders) {
                const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
                const count = orders.length;

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
                        color: 'text-white',
                        bg: 'bg-white/10'
                    },
                    { label: 'Müşteri Memnuniyeti', value: '5.0', icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
                    { label: 'Profil Görüntüleme', value: (count * 3 + 12).toString(), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
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
                    customer_id: currentUser.id, // Self-sale for POS demo (or dummy customer)
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
                        <h1 className="text-4xl font-black font-outfit text-white tracking-tight">
                            Hoş Geldiniz, {currentUser?.user_metadata?.full_name || 'İş Ortağımız'}
                        </h1>
                        <p className="text-slate-400 mt-2 font-inter max-w-xl">
                            İşletmenizin performans özeti ve anlık bildirimler aşağıdadır.
                        </p>
                    </div>
                    {/* Decorative Logic */}
                    <div className={`hidden md:block w-32 h-32 rounded-full bg-${currentTheme.color}-500/20 blur-[60px] absolute right-[-20px] top-[-20px]`} />
                </div>
            </div>

            {/* Quick Actions (POS) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl border border-white/5 md:col-span-2">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <CreditCard className="text-green-400" /> Hızlı Tahsilat (POS)
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {activeRole === 'mechanic' && (
                            <>
                                <button onClick={() => handleCreateInvoice(4500, 'Periyodik Bakım')} className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold border border-white/10 active-scale transition">
                                    Periyodik Bakım (4.500 ₺)
                                </button>
                                <button onClick={() => handleCreateInvoice(1200, 'Yağ Değişimi')} className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold border border-white/10 active-scale transition">
                                    Yağ Değişimi (1.200 ₺)
                                </button>
                                <button onClick={() => handleCreateInvoice(750, 'Arıza Tespit')} className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold border border-white/10 active-scale transition">
                                    Arıza Tespit (750 ₺)
                                </button>
                            </>
                        )}
                        {activeRole === 'valet' && (
                            <>
                                <button onClick={() => handleCreateInvoice(250, 'Standart Vale')} className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold border border-white/10 active-scale transition">
                                    Standart Vale (250 ₺)
                                </button>
                                <button onClick={() => handleCreateInvoice(500, 'VIP Vale')} className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold border border-white/10 active-scale transition">
                                    VIP Vale (500 ₺)
                                </button>
                            </>
                        )}
                        {activeRole === 'parking' && (
                            <button onClick={() => handleCreateInvoice(150, 'Günlük Otopark')} className="px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-white font-bold border border-white/10 active-scale transition">
                                Günlük Otopark (150 ₺)
                            </button>
                        )}

                        <button onClick={() => showAlert("Özel Tutar", "Tutar girme ekranı yakında eklenecek.", "info")} className="px-4 py-3 bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 rounded-xl font-bold border border-primary-500/20 active-scale transition border-dashed">
                            + Özel Tutar
                        </button>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center">
                    <Receipt size={40} className="text-slate-600 mb-2" />
                    <h4 className="text-white font-bold">Son Fatura</h4>
                    <p className="text-slate-500 text-sm mt-1">Henüz fatura kesilmedi.</p>
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
                        className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 flex flex-col justify-between h-40"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-3 rounded-xl ${stat.bg}`}>
                                <stat.icon size={22} className={stat.color} />
                            </div>
                            {index === 0 && <span className="text-green-400 text-xs font-bold">+12%</span>}
                        </div>
                        <div>
                            <h3 className="text-3xl font-black font-outfit text-white mb-1">{stat.value}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>


            {/* Active Process Management (Transparent Eye) */}
            <div className="glass-card p-6 rounded-3xl border border-white/5 bg-slate-900/50">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Activity className="text-primary-400" />
                        Aktif İşlem Yönetimi
                    </h3>
                    <span className="text-[10px] font-bold bg-primary-500/10 text-primary-400 px-3 py-1 rounded-lg border border-primary-500/20">
                        CANLI İŞLEM
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Mock Active Order Card */}
                    <div className="bg-slate-950 p-4 rounded-2xl border border-white/5">
                        <div className="flex justify-between mb-4">
                            <div>
                                <h4 className="font-bold text-white text-sm">34 SR 1905 - VW Passat</h4>
                                <p className="text-xs text-slate-500">Periyodik Bakım • Müşteri: Ahmet Y.</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-300">
                                AY
                            </div>
                        </div>

                        {/* Process Manager Integration */}
                        <ProcessManager
                            currentStatus="repairing" // Mock initial status
                            onUpdateStatus={(newStatus) => {
                                showAlert("Durum Güncellendi", `İşlem durumu: ${newStatus}`, "success");
                            }}
                        />
                    </div>

                    <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 flex flex-col justify-center items-center text-center opacity-50">
                        <Wrench size={32} className="text-slate-700 mb-2" />
                        <p className="text-sm font-bold text-slate-500">Başka aktif işlem yok</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity Section */}
            <div className="glass-card p-8 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold font-outfit">Son Hareketler</h2>
                    <button className={`text-sm font-bold uppercase hover:underline ${currentTheme.text}`}>
                        Tümünü Gör
                    </button>
                </div>

                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <motion.div
                            key={i}
                            whileHover={{ x: 5 }}
                            className="flex items-center justify-between border-b border-white/5 pb-4 last:border-0 last:pb-0"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-400 border border-white/10">
                                    {activeRole === 'valet' ? '34VL' : activeRole === 'mechanic' ? '34SR' : '34PK'}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">
                                        {activeRole === 'valet' ? 'Araç Teslim Alındı' : activeRole === 'mechanic' ? 'Periyodik Bakım' : 'Giriş İşlemi'}
                                    </p>
                                    <p className="text-xs text-slate-500">Bugün • 14:{30 + i * 5}</p>
                                </div>
                            </div>
                            <span className="text-white font-mono text-sm font-bold bg-white/5 px-3 py-1 rounded-lg">
                                {activeRole === 'valet' ? 'Bekliyor' : 'Tamamlandı'}
                            </span>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div >
    );
};

export default PartnerDashboard;
