'use client';

import { useState, useEffect } from 'react';
import { Users, ShieldAlert, Wrench, CircleDollarSign, TrendingUp, Activity, Zap, Cpu, Clock, AlertTriangle, Car, AlertOctagon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function DashboardOverview() {
    const [diagnostics, setDiagnostics] = useState([]);
    const [loading, setLoading] = useState(true);
    const supabase = createClient();

    const STATS = [
        { title: 'Aktif Kullanıcılar', value: '14,523', trend: '+12%', isPositive: true, icon: Users, color: 'text-primary', bg: 'bg-primary/10 border-primary/20', glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]' },
        { title: 'Bekleyen Çağrılar', value: '3', trend: '-2', isPositive: true, icon: ShieldAlert, color: 'text-destructive', bg: 'bg-destructive/10 border-destructive/20', glow: 'shadow-[0_0_15px_rgba(239,68,68,0.2)]' },
        { title: 'Bağlı Sistemler', value: '8', trend: '100% UP', isPositive: true, icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.2)]' },
        { title: 'Aylık Ciro (Tahmini)', value: '₺245.500', trend: '+18%', isPositive: true, icon: CircleDollarSign, color: 'text-accent', bg: 'bg-accent/10 border-accent/20', glow: 'shadow-[0_0_15px_rgba(249,115,22,0.2)]' },
    ];

    useEffect(() => {
        // İlk verileri çek
        const fetchInitialData = async () => {
            try {
                const { data, error } = await supabase
                    .from('ai_diagnostics')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .limit(5);

                if (error) throw error;
                setDiagnostics(data || []);
            } catch (err) {
                console.error("AI verileri çekilirken hata:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();

        // Supabase Realtime (Canlı Dinleme) Ayarla
        const channel = supabase.channel('realtime-ai-diagnostics')
            .on('postgres_changes', { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'ai_diagnostics' 
            }, (payload) => {
                console.log("🔥 Yeni AI Teşhisi Geldi!", payload.new);
                setDiagnostics((current) => {
                    const newArray = [payload.new, ...current];
                    return newArray.slice(0, 5); // Sadece son 5 kaydı tut
                });
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const getSeverityStyles = (severity) => {
        switch(severity) {
            case 'Critical': return { color: 'text-destructive', bg: 'bg-destructive/10', border: 'border-destructive/30', icon: AlertOctagon };
            case 'High': return { color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/30', icon: AlertTriangle };
            case 'Medium': return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', icon: ShieldAlert };
            case 'Low': return { color: 'text-primary', bg: 'bg-primary/10', border: 'border-primary/30', icon: Wrench };
            default: return { color: 'text-muted-foreground', bg: 'bg-muted/10', border: 'border-border', icon: Car };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter">Genel Bakış</h1>
                    <p className="text-sm font-semibold text-muted-foreground mt-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
                        Carvis AI Core sistemleri aktif ve veriler senkronize.
                    </p>
                </div>
                <button className="glass-panel text-foreground text-sm font-bold py-2.5 px-5 rounded-xl hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all duration-300 flex items-center gap-2 group">
                    <TrendingUp size={16} className="group-hover:-translate-y-0.5 transition-transform" /> 
                    <span>Derin Analiz Raporu</span>
                </button>
            </div>

            {/* Stats Grid - Asymmetrical feeling with massive typography */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {STATS.map((stat, i) => (
                    <div 
                        key={i} 
                        className="glass-panel p-6 rounded-[2rem] hover:-translate-y-1 transition-all duration-300 group"
                    >
                        <div className="flex items-start justify-between mb-6">
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all duration-300 ${stat.bg} ${stat.glow} group-hover:scale-110`}>
                                <stat.icon size={28} className={stat.color} />
                            </div>
                            <span className={`text-[11px] font-black px-2.5 py-1 rounded-md border ${
                                stat.isPositive 
                                ? 'bg-primary/10 text-primary border-primary/20' 
                                : 'bg-destructive/10 text-destructive border-destructive/20'
                            }`}>
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-muted-foreground font-bold text-sm tracking-wide">{stat.title}</h3>
                        <p className="text-4xl font-black text-foreground mt-2 tracking-tighter">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts & Realtime Area */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* AI Diagnostics Feed */}
                <div className="xl:col-span-2 glass-panel p-8 rounded-[2.5rem] min-h-[450px] flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[80px] -z-10 group-hover:bg-primary/10 transition-colors duration-700"></div>
                    
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-black text-foreground flex items-center gap-3">
                            <Zap className="text-accent" size={24} />
                            Yapay Zeka (AI) Canlı Akış
                        </h2>
                        <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20 flex items-center gap-2">
                            <Activity size={14} className="animate-pulse" />
                            Live WebSockets
                        </span>
                    </div>

                    <div className="flex-1 border border-border/50 rounded-2xl bg-black/20 p-2 flex flex-col gap-2 relative z-10 overflow-hidden">
                        {loading ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <Activity className="text-muted-foreground/30 mb-4 animate-pulse" size={48} />
                                <span className="text-muted-foreground font-bold text-sm tracking-widest uppercase">Veriler Yükleniyor...</span>
                            </div>
                        ) : diagnostics.length === 0 ? (
                            <div className="flex-1 flex flex-col items-center justify-center">
                                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:20px_20px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
                                <span className="text-muted-foreground font-bold text-sm tracking-widest uppercase relative z-10">Henüz Teşhis Kaydı Yok</span>
                            </div>
                        ) : (
                            diagnostics.map((diag, index) => {
                                const styles = getSeverityStyles(diag.severity);
                                const Icon = styles.icon;
                                const confPercent = Math.round(diag.confidence_score * 100);
                                
                                return (
                                    <div 
                                        key={diag.id} 
                                        className={`p-4 rounded-xl border ${styles.border} bg-black/40 hover:bg-white/5 transition-all duration-500 flex items-start gap-4 animate-in slide-in-from-left-4 fade-in`}
                                        style={{ animationDelay: `${index * 100}ms` }}
                                    >
                                        <div className={`p-3 rounded-lg ${styles.bg} ${styles.color} shrink-0 mt-1`}>
                                            <Icon size={20} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <h4 className="font-bold text-foreground text-sm truncate">{diag.predicted_issue}</h4>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${styles.border} ${styles.color}`}>
                                                    {diag.severity}
                                                </span>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-1 mb-2">
                                                {diag.description}
                                            </p>
                                            <div className="flex items-center justify-between text-xs font-semibold">
                                                <span className="text-accent flex items-center gap-1">
                                                    <Zap size={12} /> {diag.recommended_action}
                                                </span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-muted-foreground flex items-center gap-1">
                                                        <Activity size={12} /> %{confPercent} Emin
                                                    </span>
                                                    <span className="text-muted-foreground/50 flex items-center gap-1">
                                                        <Clock size={12} />
                                                        {new Date(diag.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Heatmap / Mini Map */}
                <div className="glass-panel p-8 rounded-[2.5rem] min-h-[450px] flex flex-col relative overflow-hidden">
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/5 rounded-full blur-[60px] -z-10"></div>
                    <h2 className="text-xl font-black text-foreground mb-6">Acil Müdahale Haritası</h2>
                    <div className="flex-1 border border-border/50 rounded-2xl bg-black/20 flex items-center justify-center relative overflow-hidden">
                        {/* Mock Radar effect */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-full rounded-full border border-primary/10 animate-ping" style={{ animationDuration: '3s' }}></div>
                            <div className="absolute w-2/3 h-2/3 rounded-full border border-primary/20"></div>
                            <div className="absolute w-1/3 h-1/3 rounded-full border border-primary/30 bg-primary/5"></div>
                            <div className="absolute w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_rgba(16,185,129,1)]"></div>
                        </div>
                        <span className="text-primary font-black text-xs z-10 bg-black/50 px-3 py-1 rounded-full backdrop-blur-md border border-primary/30">Radar Aktif</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
