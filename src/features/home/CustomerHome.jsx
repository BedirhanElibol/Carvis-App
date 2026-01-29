import React, { useState } from 'react';
import {
    Activity,
    CircleCheck,
    Car,
    CirclePlus,
    LogIn,
    TriangleAlert,
    ShieldAlert,
    Ticket,
    ShoppingCart,
    Wrench,
    Droplet,
    Wallet,
    Gavel,
    CircleParking,
    Key,
    FileText,
    CalendarDays,
    X
} from 'lucide-react';
import { Badge } from '../../components/Core';
import PredictiveMaintenanceCard from './PredictiveMaintenanceCard';
import AISuggestionCard from './AISuggestionCard';
import QuoteCard from '../quotes/QuoteCard';
import { useUI } from '../../context/UIContext';
import { useGarage } from '../../context/GarageContext';
import { useAuth } from '../../context/AuthContext';
import { useQuote } from '../../context/QuoteContext';
import { useAppointment } from '../../context/AppointmentContext';
import { useNavigate } from 'react-router-dom';
import VehicleSearch from '../garage/VehicleSearch';
import ServiceHistoryModal from '../../components/modals/ServiceHistoryModal';
import MarketPulse from '../admin/MarketPulse';
import WeatherWidget from '../admin/WeatherWidget';
import CurrencyTicker from '../admin/CurrencyTicker';

const CustomerHome = () => {
    const { t, showAlert, openModal } = useUI();
    const { currentVehicle, addVehicle } = useGarage();
    const { currentUser } = useAuth();
    const { quotes } = useQuote();
    const { appointments } = useAppointment();
    const navigate = useNavigate();

    const [showVehicleSelector, setShowVehicleSelector] = useState(false);
    const [showServiceHistory, setShowServiceHistory] = useState(false);

    if (!t) return null;

    // Sadece pending ve accepted teklifleri göster
    const activeQuotes = Array.isArray(quotes)
        ? quotes.filter(q => q.status === 'pending' || q.status === 'accepted').slice(0, 3)
        : [];

    // Yaklaşan randevular (gelecek tarihteki ilk 2 randevu)
    const upcomingAppointments = Array.isArray(appointments)
        ? appointments
            .filter(a => new Date(a.appointment_date) > new Date() && a.status !== 'cancelled')
            .sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date))
            .slice(0, 2)
        : [];

    const handleVehicleFound = async (data) => {
        const { error } = await addVehicle({
            brand: data.brand,
            model: data.model,
            plate: data.plate || '34RPD' + Math.floor(100 + Math.random() * 900),
            km: data.km || '0',
            engine_code: data.engine_code || '',
        });

        if (!error) {
            setShowVehicleSelector(false);
            showAlert("Başarılı", "Yeni araç garajınıza eklendi.", "success");
        } else {
            showAlert("Hata", "Araç eklenirken bir sorun oluştu.", "error");
        }
    };

    return (
        <div className="p-5 space-y-6 pb-32 animate-fade-in relative min-h-screen">
            {/* Context Background for Liquid Glass */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden opacity-30">
                <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] bg-primary-500/20 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[10%] left-[-5%] w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-[80px] animate-liquid"></div>
            </div>

            {/* MAIN VEHICLE PANEL */}
            <div className="bg-slate-950 rounded-[3rem] p-7 text-white shadow-2xl relative overflow-hidden border border-white/5 group">
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary-600 rounded-full blur-[90px] opacity-20 group-hover:opacity-30 transition duration-700"></div>

                <div className="relative z-10">
                    {currentUser && !currentUser.isAnonymous ? (
                        currentVehicle ? (
                            <>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Badge type="info" className="text-[9px] px-2 py-0.5 uppercase tracking-tighter">Garajda Aktif</Badge>
                                        </div>
                                        <h2 className="text-4xl font-black tracking-tight leading-none italic">{currentVehicle?.brand} <span className="text-primary-400 not-italic">{currentVehicle?.model}</span></h2>
                                    </div>
                                    <button onClick={() => navigate('/app/profile')} className="glass-card p-3 rounded-2xl border border-white/10 hover:bg-white/5 transition-all text-white active-scale">
                                        <Car size={18} className="text-primary-400" />
                                    </button>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 glass-card border border-white/5 p-4 rounded-[1.5rem] shadow-inner backdrop-blur-md">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.plate}</p>
                                        <p className="text-xl font-mono font-black text-primary-100">{currentVehicle?.plate}</p>
                                    </div>
                                    <div className="flex-1 glass-card border border-white/5 p-4 rounded-[1.5rem] shadow-inner backdrop-blur-md">
                                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{t.km}</p>
                                        <p className="text-xl font-mono font-black text-primary-100">{Number(currentVehicle?.km).toLocaleString()}</p>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-6">
                                <Activity size={40} className="text-primary-500 mx-auto mb-4 animate-pulse" />
                                <h3 className="text-2xl font-black mb-2 text-white italic">HAYALİNDEKİ GARAJ</h3>
                                <p className="text-xs text-slate-400 px-8">Aracını hemen ekle, bakım raporlarını ve parça fiyatlarını anında takip et.</p>
                                <button onClick={() => setShowVehicleSelector(true)} className="mt-6 bg-primary-600 hover:bg-primary-500 text-white py-3 px-8 rounded-2xl font-black text-sm flex items-center justify-center gap-3 mx-auto shadow-xl shadow-primary-900/50 transition-all active-scale">
                                    <CirclePlus size={20} /> ARAÇ EKLE
                                </button>
                            </div>
                        )
                    ) : (
                        <div className="text-center py-10 relative group">
                            {/* Decorative background for guest mode */}
                            <div className="absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent"></div>

                            <div className="bg-primary-500/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border border-primary-500/20 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                                <Car size={40} className="text-primary-500 animate-pulse-slow" />
                            </div>

                            <h3 className="text-3xl font-black mb-3 text-white tracking-tighter italic">CARVIS <span className="text-primary-400 not-italic whitespace-nowrap">EXTREME</span></h3>
                            <p className="text-sm text-slate-400 px-10 leading-relaxed max-w-sm mx-auto">
                                Tüm servis geçmişi, yapay zeka destekli teşhis ve anlık yedek parça teklifleri için garajınızı hemen kurun.
                            </p>

                            <button
                                onClick={() => openModal('login')}
                                className="mt-8 bg-gradient-to-r from-primary-600 to-indigo-600 text-white py-4 px-10 rounded-2xl font-black text-sm flex items-center justify-center gap-3 mx-auto shadow-xl shadow-primary-900/40 hover:scale-105 transition-all active:scale-95 uppercase tracking-widest border border-white/10"
                            >
                                <LogIn size={20} /> Ücretsiz Giriş Yap
                            </button>

                            <div className="mt-6 flex items-center justify-center gap-2 opacity-50">
                                <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em]">Hemen Deneyin</span>
                                <div className="w-1 h-1 bg-primary-400 rounded-full"></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* TEKLİFLER BÖLÜMÜ */}
            {currentUser && !currentUser.isAnonymous && (
                <div>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <FileText size={20} className="text-primary-500" />
                            <h3 className="font-black text-white italic text-xl tracking-tighter">Tekliflerim</h3>
                        </div>
                        {activeQuotes.length > 0 && (
                            <button onClick={() => navigate('/quotes')} className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">Tümünü Gör</button>
                        )}
                    </div>
                    <div className="space-y-3">
                        {activeQuotes.length > 0 ? (
                            activeQuotes.map(quote => <QuoteCard key={quote.id} quote={quote} />)
                        ) : (
                            <div className="glass-card p-6 rounded-2xl border border-white/5 text-center">
                                <p className="text-sm text-slate-500 font-medium italic">Henüz aktif bir teklifiniz bulunmuyor.</p>
                            </div>
                        )}
                        <button onClick={() => navigate('/service-request')} className="w-full glass-card p-4 rounded-2xl border border-dashed border-primary-500/50 flex items-center justify-center gap-2 text-primary-400 font-semibold active-scale hover:bg-primary-500/5 transition-all mt-2">
                            <CirclePlus size={20} /> Yeni Talep Oluştur
                        </button>
                    </div>
                </div>
            )}

            {/* RANDEVULAR BÖLÜMÜ */}
            {currentUser && upcomingAppointments.length > 0 && (
                <div>
                    <div className="flex justify-between items-center mb-4 px-1">
                        <div className="flex items-center gap-2">
                            <CalendarDays size={20} className="text-purple-400" />
                            <h3 className="font-black text-white italic text-xl tracking-tighter">Yaklaşan Randevular</h3>
                        </div>
                        <button onClick={() => navigate('/appointments')} className="text-[10px] font-black text-purple-400 uppercase tracking-widest hover:underline">Tümünü Gör</button>
                    </div>
                    <div className="space-y-3">
                        {upcomingAppointments.map(appointment => (
                            <div key={appointment.id} onClick={() => navigate('/appointments')} className="glass-card p-4 rounded-2xl border border-white/10 flex items-center justify-between active-scale cursor-pointer">
                                <div className="flex items-center gap-4">
                                    <div className="bg-purple-500/10 p-3 rounded-xl">
                                        <CalendarDays size={20} className="text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-white leading-tight">{appointment.service_type}</p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            {new Date(appointment.appointment_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <Badge type="info" className="text-[10px] font-black uppercase">Onaylı</Badge>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PREDICTIVE MAINTENANCE CARD */}
            {currentUser && currentVehicle && (
                <PredictiveMaintenanceCard
                    currentVehicle={currentVehicle}
                    t={t}
                    setActiveTab={(tab) => navigate(`/app/${tab}`)}
                    onShowHistory={() => setShowServiceHistory(true)}
                />
            )}

            {/* AI SUGGESTION CARD */}
            {currentUser && currentVehicle && (
                <AISuggestionCard vehicle={currentVehicle} />
            )}

            <div className="flex gap-4">
                <button onClick={() => openModal('sos')} className="flex-1 glass-card border border-red-500/20 p-5 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-red-500/10 transition-all active-scale shadow-lg group">
                    <TriangleAlert size={24} className="text-red-500 group-hover:animate-bounce" />
                    <span className="text-[10px] font-black text-red-400 tracking-[0.2em] uppercase">{t.sos}</span>
                </button>
                <button onClick={() => openModal('accident')} className="flex-1 glass-card border border-primary-500/20 p-5 rounded-[2rem] flex flex-col items-center justify-center gap-2 hover:bg-primary-500/10 transition-all active-scale shadow-lg group">
                    <ShieldAlert size={24} className="text-primary-500 group-hover:rotate-12 transition-transform" />
                    <span className="text-[10px] font-black text-primary-400 tracking-[0.2em] uppercase">KAZA BİLDİR</span>
                </button>
            </div>

            {/* NEW FEATURES: LIVE API WIDGETS */}
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="h-full">
                        <MarketPulse />
                    </div>
                    <div className="h-full">
                        <WeatherWidget />
                    </div>
                </div>
                <CurrencyTicker />
            </div>

            {/* SERVICE NAVIGATION */}
            <div>
                <div className="flex justify-between items-center mb-5 px-1">
                    <h3 className="font-black text-white italic text-xl tracking-tighter">{t.allServices}</h3>
                </div>
                <div className="grid grid-cols-4 gap-3">
                    {[
                        { key: 'campaigns', icon: Ticket, label: "Fırsat", color: "text-pink-500", bg: "bg-pink-500/10", route: '/app/campaigns' },
                        { key: 'parts', icon: ShoppingCart, label: t.parts, color: "text-primary-500", bg: "bg-primary-500/10", route: '/app/parts' },
                        { key: 'mechanics', icon: Wrench, label: "Usta", color: "text-accent-500", bg: "bg-accent-500/10", route: '/app/mechanics' },
                        { key: 'fuel', icon: Droplet, label: "Yakıt", color: "text-red-500", bg: "bg-red-500/10", route: '/app/fuel' },
                    ].map(item => (
                        <div key={item.key} onClick={() => navigate(item.route)} className="glass-card p-3.5 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 border border-white/5 hover:border-primary-500/30 transition-all cursor-pointer active-scale group">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.bg} group-hover:scale-110 transition duration-300`}>
                                <item.icon size={22} className={item.color} />
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter text-center">{item.label}</span>
                        </div>
                    ))}
                </div>
                {/* Secondary Quick Actions */}
                <div className="grid grid-cols-4 gap-3 mt-3">
                    {[
                        { key: 'wallet', icon: Wallet, label: "Cüzdan", color: "text-green-500", bg: "bg-green-500/10", route: '/app/wallet' },
                        { key: 'tender', icon: Gavel, label: "İhale", color: "text-amber-500", bg: "bg-amber-500/10", route: '/app/tender' },
                        { key: 'parking', icon: CircleParking, label: "Otopark", color: "text-blue-500", bg: "bg-blue-500/10", route: '/app/parking' },
                        { key: 'valet', icon: Key, label: "Vale", color: "text-purple-500", bg: "bg-purple-500/10", route: '/app/valet' },
                    ].map(item => (
                        <div key={item.key} onClick={() => navigate(item.route)} className="glass-card p-3.5 rounded-[1.8rem] flex flex-col items-center justify-center gap-2 border border-white/5 hover:border-primary-500/30 transition-all cursor-pointer active-scale group">
                            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${item.bg} group-hover:scale-110 transition duration-300`}>
                                <item.icon size={22} className={item.color} />
                            </div>
                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter text-center">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Vehicle Selector Modal */}
            {showVehicleSelector && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
                    <div className="relative w-full max-w-md">
                        <button onClick={() => setShowVehicleSelector(false)} className="absolute -top-12 right-0 text-white hover:text-red-500 transition">
                            <X size={24} />
                        </button>
                        <VehicleSearch onVehicleFound={handleVehicleFound} />
                    </div>
                </div>
            )}

            {/* Service History Modal */}
            <ServiceHistoryModal
                show={showServiceHistory}
                onClose={() => setShowServiceHistory(false)}
            />
        </div>
    );
};

export default CustomerHome;
