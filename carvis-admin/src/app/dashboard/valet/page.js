'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MapPin, Search, Clock, CheckCircle2, Car, MoreVertical } from 'lucide-react';

export default function ValetDashboard() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            // Using valet_bookings which has customer_id in master schema
            const { data, error } = await supabase
                .from('valet_bookings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error) {
            console.error('Error fetching valet bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
            case 'accepted': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
            case 'picked_up': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
            case 'parked': return 'bg-primary/10 text-primary border-primary/20';
            case 'completed': return 'bg-accent/10 text-accent border-accent/20';
            case 'cancelled': return 'bg-destructive/10 text-destructive border-destructive/20';
            default: return 'bg-muted/10 text-muted-foreground border-border';
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
                    <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter">Vale Hizmetleri</h1>
                    <p className="text-sm font-semibold text-muted-foreground mt-2">
                        Aktif vale talepleri ve teslimat süreçleri.
                    </p>
                </div>
                <div className="flex gap-3">
                    <div className="glass-panel px-4 py-2 rounded-xl flex items-center gap-2">
                        <Search size={16} className="text-muted-foreground" />
                        <input 
                            type="text" 
                            placeholder="Plaka veya ID Ara..." 
                            className="bg-transparent border-none outline-none text-sm font-semibold w-48 text-foreground placeholder:text-muted-foreground/50"
                        />
                    </div>
                </div>
            </div>

            {/* Table Area */}
            <div className="glass-panel p-1 rounded-2xl overflow-hidden relative group">
                <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-primary/10 transition-colors duration-700"></div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border/50 bg-black/20">
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground rounded-tl-xl">ID / Tarih</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Müşteri & Araç</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Lokasyon</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Tutar</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Durum</th>
                                <th className="p-4 text-xs font-black uppercase tracking-widest text-muted-foreground rounded-tr-xl">İşlem</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-sm">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                                            <span className="font-semibold text-xs tracking-widest uppercase">Yükleniyor...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="p-8 text-center">
                                        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
                                            <Car size={32} className="opacity-20" />
                                            <span className="font-semibold">Henüz hiç vale talebi bulunmuyor.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                bookings.map((booking) => (
                                    <tr key={booking.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="font-semibold text-foreground">{booking.id?.substring(0, 8)}...</div>
                                            <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                                <Clock size={12} /> {formatDate(booking.created_at)}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="font-semibold text-foreground">Müşteri: {booking.customer_id?.substring(0,6)}</div>
                                            <div className="text-xs text-muted-foreground mt-1">Araç ID: {booking.vehicle_id ? booking.vehicle_id.substring(0,6) : '-'}</div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <MapPin size={14} className="text-primary" />
                                                <span className="font-medium text-muted-foreground truncate max-w-[200px]" title={booking.pickup_point}>
                                                    {booking.pickup_point || 'Belirtilmedi'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-foreground">
                                            {formatCurrency(booking.price)}
                                        </td>
                                        <td className="p-4">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider border ${getStatusColor(booking.status)}`}>
                                                {booking.status || 'pending'}
                                            </span>
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
