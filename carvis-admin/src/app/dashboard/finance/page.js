'use client';

import { useState } from 'react';
import { 
    LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    BarChart, Bar, Legend, Cell, PieChart, Pie
} from 'recharts';
import { CircleDollarSign, TrendingUp, TrendingDown, CreditCard, Wallet, ArrowUpRight, ArrowDownRight, Download, Activity, Zap } from 'lucide-react';

const REVENUE_DATA = [
    { name: 'Oca', ciro: 125000, komisyon: 18750 },
    { name: 'Şub', ciro: 142000, komisyon: 21300 },
    { name: 'Mar', ciro: 135000, komisyon: 20250 },
    { name: 'Nis', ciro: 185000, komisyon: 27750 },
    { name: 'May', ciro: 210000, komisyon: 31500 },
    { name: 'Haz', ciro: 245500, komisyon: 36825 },
];

const PAYOUT_DATA = [
    { name: 'Ustalar', value: 145000, color: '#10b981' }, // primary
    { name: 'Çekiciler', value: 45000, color: '#f97316' }, // accent
    { name: 'Valeler', value: 18675, color: '#3b82f6' }, // blue
];

const RECENT_TRANSACTIONS = [
    { id: 'TRX-9982', provider: 'Ahmet Usta (Motor)', type: 'Tamir Hakedişi', amount: 4500, status: 'completed', date: 'Bugün, 14:30' },
    { id: 'TRX-9983', provider: 'Hızlı Çekici A.Ş', type: 'Çekici Ödemesi', amount: 1200, status: 'pending', date: 'Bugün, 12:15' },
    { id: 'TRX-9984', provider: 'Mehmet Y. (Vale)', type: 'Vale Hakedişi', amount: 450, status: 'completed', date: 'Dün, 18:45' },
    { id: 'TRX-9985', provider: 'Garaj Oto Servis', type: 'Tamir Hakedişi', amount: 12500, status: 'processing', date: 'Dün, 16:20' },
    { id: 'TRX-9986', provider: 'Acil Oto Kurtarma', type: 'Çekici Ödemesi', amount: 850, status: 'completed', date: 'Dün, 11:10' },
];

export default function FinanceDashboard() {
    const [timeframe, setTimeframe] = useState('6M');

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
                        <CircleDollarSign className="text-primary" size={32} />
                        Finans & Hakedişler
                    </h1>
                    <p className="text-muted-foreground mt-1 font-medium">Platform cirosu, komisyon gelirleri ve iş ortağı hakedişleri.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="glass-panel p-1 rounded-xl hidden md:flex">
                        {['1W', '1M', '3M', '6M', '1Y'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setTimeframe(t)}
                                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition-all ${timeframe === t ? 'bg-primary/20 text-primary shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                    <button className="flex items-center gap-2 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2.5 rounded-xl text-sm font-bold transition-all border border-border hover:border-primary/50 group">
                        <Download size={16} className="text-primary group-hover:-translate-y-0.5 transition-transform" /> Rapor İndir
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Total Revenue */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-primary relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={64} className="text-primary" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Toplam Hacim (Bu Ay)</p>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                            <Wallet size={20} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-foreground">₺245.500</h3>
                    <div className="flex items-center gap-2 mt-4 text-sm font-bold">
                        <span className="flex items-center text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            <ArrowUpRight size={14} className="mr-1" /> +18.2%
                        </span>
                        <span className="text-muted-foreground font-medium">geçen aya göre</span>
                    </div>
                </div>

                {/* Platform Commission */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-accent relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Zap size={64} className="text-accent" />
                    </div>
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Platform Geliri (%15)</p>
                        <div className="p-2 bg-accent/10 rounded-lg text-accent shadow-[0_0_15px_rgba(249,115,22,0.2)]">
                            <TrendingUp size={20} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-foreground">₺36.825</h3>
                    <div className="flex items-center gap-2 mt-4 text-sm font-bold">
                        <span className="flex items-center text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                            <ArrowUpRight size={14} className="mr-1" /> +22.4%
                        </span>
                        <span className="text-muted-foreground font-medium">geçen aya göre</span>
                    </div>
                </div>

                {/* Pending Payouts */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Bekleyen Hakedişler</p>
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <CircleDollarSign size={20} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-foreground">₺42.300</h3>
                    <div className="flex items-center gap-2 mt-4 text-sm font-bold">
                        <span className="flex items-center text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-md">
                            12 İşlem
                        </span>
                        <span className="text-muted-foreground font-medium">onay bekliyor</span>
                    </div>
                </div>

                {/* Avg Transaction Value */}
                <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-purple-500 relative overflow-hidden group">
                    <div className="flex justify-between items-start mb-4">
                        <p className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">Ort. İşlem Tutarı</p>
                        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                            <CreditCard size={20} />
                        </div>
                    </div>
                    <h3 className="text-3xl font-black text-foreground">₺3.450</h3>
                    <div className="flex items-center gap-2 mt-4 text-sm font-bold">
                        <span className="flex items-center text-destructive bg-destructive/10 px-2 py-0.5 rounded-md">
                            <ArrowDownRight size={14} className="mr-1" /> -2.1%
                        </span>
                        <span className="text-muted-foreground font-medium">geçen aya göre</span>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue & Commission Area Chart */}
                <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
                    <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
                        <Activity className="text-primary" size={20} />
                        Hacim & Gelir Trendi
                    </h3>
                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCiro" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorKomisyon" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.2)" tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} />
                                <YAxis stroke="rgba(255,255,255,0.2)" tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 600}} axisLine={false} tickLine={false} tickFormatter={(value) => \`₺\${value / 1000}k\`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(3, 7, 18, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 'bold' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold' }} />
                                <Area type="monotone" dataKey="ciro" name="Toplam Hacim (₺)" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCiro)" activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981', style: {filter: 'drop-shadow(0 0 10px rgba(16,185,129,0.5))'} }} />
                                <Area type="monotone" dataKey="komisyon" name="Platform Geliri (₺)" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorKomisyon)" activeDot={{ r: 8, strokeWidth: 0, fill: '#f97316', style: {filter: 'drop-shadow(0 0 10px rgba(249,115,22,0.5))'} }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Payout Distribution Pie Chart */}
                <div className="glass-panel p-6 rounded-2xl">
                    <h3 className="text-lg font-black text-foreground mb-6 flex items-center gap-2">
                        <CircleDollarSign className="text-accent" size={20} />
                        Hakediş Dağılımı
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={PAYOUT_DATA}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {PAYOUT_DATA.map((entry, index) => (
                                        <Cell key={\`cell-\${index}\`} fill={entry.color} style={{filter: \`drop-shadow(0 0 8px \${entry.color}40)\`}} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(3, 7, 18, 0.9)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px', fontWeight: 'bold' }}
                                    formatter={(value) => \`₺\${value.toLocaleString('tr-TR')}\`}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                        {PAYOUT_DATA.map(item => (
                            <div key={item.name} className="flex justify-between items-center bg-secondary/30 px-4 py-2.5 rounded-xl border border-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color, boxShadow: \`0 0 10px \${item.color}\` }}></div>
                                    <span className="font-semibold text-sm">{item.name}</span>
                                </div>
                                <span className="font-black text-sm">₺{item.value.toLocaleString('tr-TR')}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="glass-panel p-6 rounded-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-black text-foreground">Son Hakediş Ödemeleri</h3>
                    <button className="text-sm font-bold text-primary hover:text-primary/80 transition-colors">Tümünü Gör</button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead>
                            <tr className="border-b border-white/5 text-muted-foreground">
                                <th className="pb-4 px-4 font-bold uppercase tracking-wider text-xs">İşlem ID</th>
                                <th className="pb-4 px-4 font-bold uppercase tracking-wider text-xs">İş Ortağı</th>
                                <th className="pb-4 px-4 font-bold uppercase tracking-wider text-xs">Tarih</th>
                                <th className="pb-4 px-4 font-bold uppercase tracking-wider text-xs">Tür</th>
                                <th className="pb-4 px-4 font-bold uppercase tracking-wider text-xs">Tutar</th>
                                <th className="pb-4 px-4 font-bold uppercase tracking-wider text-xs text-right">Durum</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {RECENT_TRANSACTIONS.map((trx) => (
                                <tr key={trx.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="py-4 px-4 font-bold text-muted-foreground group-hover:text-foreground">{trx.id}</td>
                                    <td className="py-4 px-4 font-semibold">{trx.provider}</td>
                                    <td className="py-4 px-4 text-muted-foreground">{trx.date}</td>
                                    <td className="py-4 px-4">
                                        <span className="bg-secondary px-3 py-1 rounded-full text-xs font-bold text-foreground">
                                            {trx.type}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 font-black text-foreground">₺{trx.amount.toLocaleString('tr-TR')}</td>
                                    <td className="py-4 px-4 text-right">
                                        {trx.status === 'completed' && <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold border border-primary/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">Ödendi</span>}
                                        {trx.status === 'pending' && <span className="inline-block bg-accent/10 text-accent px-3 py-1 rounded-full text-xs font-bold border border-accent/20 shadow-[0_0_10px_rgba(249,115,22,0.2)]">Bekliyor</span>}
                                        {trx.status === 'processing' && <span className="inline-block bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-bold border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]">İşleniyor</span>}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
