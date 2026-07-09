'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Fuel, Search, Clock, CheckCircle2, TrendingUp, MoreVertical } from 'lucide-react';

export default function FuelDashboard() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const { data, error } = await supabase
                .from('fuel_logs')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching fuel logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount || 0);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return new Intl.DateTimeFormat('tr-TR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        }).format(new Date(dateStr));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter">Yakıt Yönetimi</h1>
                    <p className="text-sm font-semibold text-muted-foreground mt-2">
                        Kullanıcıların yakıt alımları ve istasyon tercihleri.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2">
                        <Search size={16} className="text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="İstasyon veya Plaka..." 
                            className="bg-transparent border-none outline-none text-sm font-semibold w-48 text-foreground placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="glass-panel p-1 rounded-2xl overflow-hidden relative group">
                <div className="absolute bottom-[-20%] left-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[80px] -z-10 group-hover:bg-accent/10 transition-colors duration-700"></div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/50 bg-black/20">
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground rounded-tl-xl">Kayıt Tarihi</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Kullanıcı ID</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">İstasyon</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Litre / Fiyat</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Toplam Tutar</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground rounded-tr-xl">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-4 border-accent/20 border-t-accent rounded-full animate-spin"></div>
                                            <span className="font-semibold text-xs tracking-widest uppercase">Yükleniyor...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <Fuel size={32} className="opacity-20" />
                                            <span className="font-semibold">Yakıt kaydı bulunmuyor.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Clock size={14} className="text-muted-foreground" />
                                                {formatDate(log.date || log.created_at)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-foreground">{log.user_id?.substring(0,8)}...</div>
                                        </td>
                                        <td className="p-4 font-medium text-muted-foreground">
                                            {log.station_name || 'Bilinmiyor'}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-foreground">{log.liters} L</div>
                                            <div className="text-xs text-muted-foreground mt-1">{formatCurrency(log.price_per_liter)} / L</div>
                                        </td>
                                        <td className="p-4 font-black text-accent">
                                            {formatCurrency(log.total_cost)}
                                        </td>
                                        <td className="p-4">
                                            <button className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
                                                <MoreVertical size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
