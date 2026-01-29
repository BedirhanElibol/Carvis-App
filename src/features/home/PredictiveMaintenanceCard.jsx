import { Activity, Wrench, History } from 'lucide-react';
import { useGarage } from '../../context/GarageContext';
import { cn } from '../../lib/utils';
import { useNavigate } from 'react-router-dom';

export const PredictiveMaintenanceCard = ({ currentVehicle, onShowHistory }) => {
    const { getMaintenanceStatus } = useGarage();
    const navigate = useNavigate();

    if (!currentVehicle) return null;

    const maintenanceItems = getMaintenanceStatus(currentVehicle);
    const minLife = Math.min(...maintenanceItems.map(i => i.value));
    const isUrgent = minLife <= 20;

    return (
        <div className={cn(
            "p-6 rounded-[2.5rem] border animate-slide-up shadow-2xl relative overflow-hidden group mb-6 transition-all duration-500 hover:scale-[1.02]",
            isUrgent ? 'bg-red-950/40 border-red-500/50' : 'bg-slate-900 border-white/5'
        )}>
            {/* Background Glow */}
            <div className={cn(
                "absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl -mr-20 -mt-20",
                isUrgent ? "bg-red-600/10" : "bg-primary-600/10"
            )}></div>

            <div className="relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-2xl transition-all duration-700",
                            isUrgent ? 'bg-red-500/20 border-red-500/40 text-red-400 rotate-12' : 'bg-primary-500/10 border-primary-500/20 text-primary-400'
                        )}>
                            <Activity size={30} className={isUrgent ? 'animate-pulse' : ''} />
                        </div>
                        <div>
                            <h4 className="font-black text-white text-base italic tracking-tighter uppercase leading-none">AKILLI BAKIM RADARI</h4>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                {isUrgent ? '⚠ DİKKAT: BAZI PARÇALAR KRİTİK SEVİYEDE' : 'TÜM SİSTEMLER OPTİMUM SEVİYEDE'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onShowHistory}
                        className="glass-card p-3 rounded-2xl border border-white/10 hover:bg-white/10 transition-all active-scale"
                        title="Servis Geçmişi"
                    >
                        <History size={20} className="text-slate-400" />
                    </button>
                </div>

                {/* Status Gauges Grid */}
                <div className="grid grid-cols-1 gap-4">
                    {maintenanceItems.map(item => (
                        <div key={item.id} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span className="text-slate-400">{item.label}</span>
                                <span className={cn(
                                    "font-mono",
                                    item.value <= 20 ? "text-red-400" : "text-white"
                                )}>%{Math.round(item.value)} ÖMÜR</span>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden border border-white/5">
                                <div
                                    className={cn(
                                        "h-full transition-all duration-1000 rounded-full",
                                        item.value <= 20 ? "bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_10px_rgba(239,68,68,0.5)]" :
                                            item.value <= 40 ? "bg-gradient-to-r from-orange-500 to-yellow-400" :
                                                "bg-gradient-to-r from-primary-600 to-indigo-500"
                                    )}
                                    style={{ width: `${item.value}%` }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/service-request')}
                        className={cn(
                            "flex-1 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all active-scale shadow-2xl flex items-center justify-center gap-3 border",
                            isUrgent
                                ? "bg-white text-slate-950 hover:bg-slate-100 border-white/20"
                                : "bg-slate-950 text-white hover:bg-slate-900 border-white/5"
                        )}
                    >
                        <Wrench size={18} /> BAKIM RANDEVUSU AL
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PredictiveMaintenanceCard;
