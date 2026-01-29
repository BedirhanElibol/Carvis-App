import React, { useState } from 'react';
import { Wrench, Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { useUI } from '../../../context/UIContext';

const MechanicJobs = () => {
    const { showAlert } = useUI();
    const [jobs, setJobs] = useState([
        { id: 1, car: 'BMW 320i', plate: '34 RPD 91', issue: 'Yağ Bakımı', time: '14:00', status: 'in_progress', priority: 'medium' },
        { id: 2, car: 'Audi A3', plate: '06 ANK 06', issue: 'Fren Balatası', time: '15:30', status: 'pending', priority: 'high' },
        { id: 3, car: 'Fiat Egea', plate: '35 IZM 35', issue: 'Genel Kontrol', time: '16:00', status: 'pending', priority: 'low' },
    ]);

    const handleStatus = (id, newStatus) => {
        setJobs(prev => prev.map(job => job.id === id ? { ...job, status: newStatus } : job));
        showAlert('Güncellendi', 'İş durumu değiştirildi.', 'success');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black italic tracking-tighter text-white">İş Takibi</h1>
                    <p className="text-slate-400 text-sm">Servis kuyruğu ve aktif işlemler</p>
                </div>
                <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg active-scale">
                    + YENİ İŞ
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Active Job */}
                <div className="md:col-span-2">
                    <h2 className="text-sm font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        ŞU AN YAPILIYOR
                    </h2>
                    {jobs.filter(j => j.status === 'in_progress').map(job => (
                        <div key={job.id} className="glass-card p-6 rounded-2xl border border-primary-500/30 bg-primary-500/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Wrench size={100} />
                            </div>
                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-primary-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">Lifte Alındı</span>
                                        <span className="text-slate-400 text-xs font-mono">{job.plate}</span>
                                    </div>
                                    <h3 className="text-3xl font-black text-white italic">{job.car}</h3>
                                    <p className="text-slate-300 font-medium flex items-center gap-2 mt-1">
                                        <AlertCircle size={14} /> {job.issue}
                                    </p>
                                </div>
                                <button
                                    onClick={() => handleStatus(job.id, 'completed')}
                                    className="bg-green-500 hover:bg-green-400 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all active-scale"
                                >
                                    <CheckCircle size={18} /> TAMAMLA
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Queue */}
                <div className="md:col-span-2">
                    <h2 className="text-sm font-bold text-slate-500 uppercase mb-3">BEKLEYENLER ({jobs.filter(j => j.status === 'pending').length})</h2>
                    <div className="space-y-3">
                        {jobs.filter(j => j.status === 'pending').map(job => (
                            <div key={job.id} className="glass-card p-4 rounded-xl border border-white/5 flex items-center justify-between hover:bg-white/5 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${job.priority === 'high' ? 'bg-red-500/10 text-red-500' : 'bg-slate-800 text-slate-400'}`}>
                                        {job.time}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white leading-tight">{job.car}</h4>
                                        <p className="text-xs text-slate-500">{job.issue} • {job.plate}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleStatus(job.id, 'in_progress')}
                                    className="bg-slate-800 hover:bg-primary-600 text-slate-300 hover:text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                                >
                                    BAŞLA
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MechanicJobs;
