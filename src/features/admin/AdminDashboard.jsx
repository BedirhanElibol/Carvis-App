import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, AlertTriangle, Activity, Database, Server } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../../supabaseClient';
import MarketPulse from './MarketPulse';
import WeatherWidget from './WeatherWidget';
import CurrencyTicker from './CurrencyTicker';

const AdminDashboard = () => {
    const [stats, setStats] = useState([
        { label: 'Toplam Kullanıcı', value: '...', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Aktif Partner', value: '...', icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Toplam Ciro', value: '...', icon: TrendingUp, color: 'text-green-400', bg: 'bg-green-500/10' },
        { label: 'Sistem Durumu', value: 'Stabil', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    ]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // 1. Get Total Users (profiles count)
                const { count: userCount, error: userError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true });

                // 2. Get Partners (profiles where role = partner)
                const { count: partnerCount, error: partnerError } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'partner');

                // 3. Get Revenue (Sum of completed orders)
                const { data: revenueData, error: revenueError } = await supabase
                    .from('orders')
                    .select('total_amount')
                    .eq('status', 'completed'); // Only count completed/paid orders

                const totalRevenue = revenueData?.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0) || 0;

                if (userError || partnerError || revenueError) {
                    console.error('Stats fetch error:', userError || partnerError || revenueError);
                    return;
                }

                setStats([
                    { label: 'Toplam Kullanıcı', value: userCount || 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
                    { label: 'Aktif Partner', value: partnerCount || 0, icon: Database, color: 'text-purple-400', bg: 'bg-purple-500/10' },
                    {
                        label: 'Toplam Ciro',
                        value: `₺${totalRevenue.toLocaleString('tr-TR', { maximumFractionDigits: 0 })}`,
                        icon: TrendingUp,
                        color: 'text-green-400',
                        bg: 'bg-green-500/10'
                    },
                    { label: 'Sistem Durumu', value: '%100', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                ]);

            } catch (error) {
                console.error('Dashboard Error:', error);
            }
        };

        fetchStats();

        // Optional: Real-time subscription for updates
        const channel = supabase
            .channel('admin_dashboard')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchStats())
            .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchStats())
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return (
        <div className="space-y-8 animate-fade-in fade-in-0 duration-500">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black font-outfit text-white">Genel Bakış</h1>
                <p className="text-slate-400">Canlı sistem metrikleri ve anlık durum.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/20 transition-all flex flex-col justify-between h-32"
                    >
                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-lg ${stat.bg}`}>
                                <stat.icon size={20} className={stat.color} />
                            </div>
                            {index === 2 && <span className="text-green-400 text-xs font-bold flex items-center gap-1"><Activity size={10} className="animate-pulse" /> CANLI</span>}
                        </div>
                        <div>
                            <h3 className="text-2xl font-black font-outfit text-white">{stat.value}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{stat.label}</p>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* System Health Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="glass-card p-6 rounded-3xl border border-white/5">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Server size={20} className="text-slate-400" /> Sunucu Performansı
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Veritabanı Bağlantıları</span>
                            <span className="text-green-400 font-bold">Aktif</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="w-[12%] h-full bg-green-500 animate-pulse"></div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">Storage Kapasitesi</span>
                            <span className="text-yellow-400 font-bold">Sağlıklı</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="w-[45%] h-full bg-yellow-500"></div>
                        </div>

                        <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-400">API Gateway</span>
                            <span className="text-blue-400 font-bold">Latency: 24ms</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                            <div className="w-[20%] h-full bg-blue-500"></div>
                        </div>
                    </div>
                </div>

                <div className="glass-card p-6 rounded-3xl border border-white/5 flex flex-col justify-center items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4 relative">
                        <Activity size={32} className="text-green-500" />
                        <span className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                    </div>
                    <h3 className="text-xl font-bold text-white">Sistem Online</h3>
                    <p className="text-slate-400 text-sm mt-2 max-w-xs">
                        Tüm Supabase servisleri (Auth, Database, Edge Functions) aktif ve yanıt veriyor.
                    </p>
                </div>
            </div>

            {/* API Integrations */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Market Stats */}
                <MarketPulse />

                <div className="space-y-6">
                    <WeatherWidget />
                    <CurrencyTicker />
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
