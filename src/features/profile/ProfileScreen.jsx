import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, User, LogIn, Car, ClipboardList, Package, CalendarDays, LogOut, X, ShoppingBag } from 'lucide-react';
import { Badge } from '../../components/Core';
import { useUI } from '../../context/UIContext';
import { useAuth } from '../../context/AuthContext';
import { useGarage } from '../../context/GarageContext';
import PredictiveHealth from '../ai/PredictiveHealth';

// Modals
import SettingsModal from '../../components/modals/SettingsModal';
import OrdersModal from '../../components/modals/OrdersModal';
import AppointmentsModal from '../../components/modals/AppointmentsModal';
import ServiceHistoryModal from '../../components/modals/ServiceHistoryModal';
import AuthLoginModal from '../../components/modals/AuthLoginModal';
import VehicleSearch from '../garage/VehicleSearch';

const ProfileScreen = () => {
    const navigate = useNavigate();
    const { t, showAlert } = useUI();
    const { currentUser, handleLogout } = useAuth();
    const { vehicles, currentVehicle, loading: garageLoading, addVehicle, deleteVehicle } = useGarage();

    // Modal States
    const [showSettings, setShowSettings] = useState(false);
    const [showVehicleSelector, setShowVehicleSelector] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showServiceHistoryModal, setShowServiceHistoryModal] = useState(false);
    const [serviceHistoryCount, setServiceHistoryCount] = useState(0);

    if (!t) return null;

    const userPhoto = currentUser?.user_metadata?.avatar_url || currentUser?.photoURL;
    const userName = currentUser?.user_metadata?.full_name || currentUser?.displayName || t.welcome;

    const vehicleCount = vehicles?.length || 0;

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
        <div className="p-5 space-y-6 pb-32 animate-fade-in relative">
            <div className="absolute top-[-5%] left-[-5%] w-[40%] h-[40%] bg-primary-600/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="flex justify-between items-center">
                <h3 className="font-black text-3xl text-white italic tracking-tighter">{t.profile}</h3>
                <button onClick={() => setShowSettings(true)} className="p-3 glass-card rounded-2xl hover:bg-white/10 shadow-2xl transition-all border border-white/10 active-scale">
                    <Settings size={22} className="text-slate-400" />
                </button>
            </div>

            <div className="glass-card p-6 rounded-[2.5rem] border border-white/10 shadow-2xl flex items-center gap-5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                <div className="w-20 h-20 bg-gradient-to-tr from-primary-600 to-accent-600 rounded-[2rem] flex items-center justify-center text-white shadow-xl p-0.5 border border-white/20 relative">
                    {userPhoto ? <img src={userPhoto} className="w-full h-full rounded-[2rem] object-cover relative z-10" alt="Profile" /> : <User size={40} className="relative z-10" />}
                </div>
                <div>
                    <h4 className="font-black text-xl text-white italic leading-none mb-1">{userName}</h4>
                    <p className="text-xs text-slate-500 font-medium mb-2">{currentUser?.email || "Misafir Kullanıcı"}</p>
                    {!currentUser || currentUser.isAnonymous ? (
                        <button onClick={() => { setShowLoginModal(true); setShowVehicleSelector(false); }} className="text-[10px] font-black bg-accent-600/20 text-accent-500 px-3 py-1.5 rounded-full flex items-center gap-1.5 hover:bg-accent-600/30 transition-all uppercase tracking-widest">
                            <LogIn size={12} /> {t.loginTitle}
                        </button>
                    ) : (
                        <Badge type="success" className="text-[9px] px-3 py-1 font-black">Giriş Yapıldı</Badge>
                    )}
                </div>
            </div>

            {/* AI Predictive Maintenance Module */}
            {currentVehicle && <PredictiveHealth vehicle={currentVehicle} />}

            <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setShowVehicleSelector(true)} className="glass-card p-5 rounded-[2rem] border border-white/5 hover:border-accent-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden">
                    <div className="bg-accent-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-accent-500/10"><Car size={24} className="text-accent-500" /></div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest">{t.myGarage}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold">{vehicleCount} Araç</p>
                </button>

                <button onClick={() => setShowServiceHistoryModal(true)} className="glass-card p-5 rounded-[2rem] border border-white/5 hover:border-primary-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden">
                    <div className="bg-primary-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-primary-500/10"><ClipboardList size={24} className="text-primary-500" /></div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest">{t.serviceHistory}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold">{serviceHistoryCount} Kayıt</p>
                </button>

                <button onClick={() => navigate('/quotes')} className="glass-card p-5 rounded-[2rem] border border-white/5 hover:border-blue-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden">
                    <div className="bg-blue-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/10"><Package size={24} className="text-blue-400" /></div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest">{t.myQuotes}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold">Teklifleri Gör</p>
                </button>

                <button onClick={() => navigate('/appointments')} className="glass-card p-5 rounded-[2rem] border border-white/5 hover:border-purple-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden">
                    <div className="bg-purple-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-purple-500/10"><CalendarDays size={24} className="text-purple-400" /></div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest">{t.myAppointments}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold">Takip Et</p>
                </button>

                <button onClick={() => navigate('/orders')} className="glass-card p-5 rounded-[2rem] border border-white/5 hover:border-green-500/30 transition-all text-left group shadow-xl active-scale relative overflow-hidden">
                    <div className="bg-green-500/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-4 border border-green-500/10"><ShoppingBag size={24} className="text-green-400" /></div>
                    <h4 className="font-black text-white text-xs uppercase tracking-widest">{t.myOrders}</h4>
                    <p className="text-[10px] text-slate-500 mt-1 font-bold">Takip Et</p>
                </button>
            </div>

            <div className="pt-4 px-4">
                <button onClick={handleLogout} className="w-full glass-card border-red-500/30 text-red-500 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:bg-red-500/10 transition-all active-scale shadow-2xl flex items-center justify-center gap-3">
                    <LogOut size={20} /> {t.logout}
                </button>
                <p className="text-center text-[10px] font-black text-slate-700 tracking-[0.3em] uppercase pt-10 opacity-30">Rapidsy v2.0 - Premium Edition</p>
            </div>

            {/* MODALS */}
            <SettingsModal
                show={showSettings}
                onClose={() => setShowSettings(false)}
                t={t}
                currentUser={currentUser}
                showAlert={showAlert}
            />

            {showLoginModal && (
                <AuthLoginModal
                    show={showLoginModal}
                    onClose={() => setShowLoginModal(false)}
                    t={t}
                />
            )}

            {/* Vehicle Selector Modal Wrapper */}
            {showVehicleSelector && (
                <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
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
                show={showServiceHistoryModal}
                onClose={() => setShowServiceHistoryModal(false)}
                t={t}
            />
        </div>
    );
};

export default ProfileScreen;
