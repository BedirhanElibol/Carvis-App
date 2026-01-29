import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useUI } from './context/UIContext';
import { useNotification } from './context/NotificationContext';
import { AppRoutes } from './routes';
import AppHeader from './components/layout/AppHeader';
import { BottomNav } from './components/layout/BottomNav';

// Modals
import AuthLoginModal from './components/modals/AuthLoginModal';
import RegisterModal from './components/modals/RegisterModal';
import SellerRegistrationModal from './components/modals/SellerRegistrationModal';
import LocationSelectModal from './components/modals/LocationSelectModal';
import AlertModal from './components/modals/AlertModal';
import KVKKPolicyModal from './components/modals/KVKKPolicyModal';
import CartDrawer from './components/modals/CartDrawer';
import SOSPanicModal from './components/modals/SOSPanicModal';
import AccidentAssistantModal from './components/modals/AccidentAssistantModal';
import VehicleSearch from './features/garage/VehicleSearch';
import { useGarage } from './context/GarageContext';
import { X } from 'lucide-react';
import AIAssistant from './components/ai/AIAssistant';

const App = () => {
    const { alertState, closeAlert, showAlert, t, modals, openModal, closeModal, loginIntent, selectedLocation, setSelectedLocation } = useUI();
    const { showVehicleSelector, setShowVehicleSelector, addVehicle } = useGarage();
    const { requestNotificationPermission, unreadCount } = useNotification();
    const location = useLocation();

    // Bildirim izni iste (uygulama açıldığında)
    useEffect(() => {
        requestNotificationPermission();
    }, []);

    const isLanding = location.pathname === '/';
    const isSeller = location.pathname.startsWith('/seller');
    const isPartner = location.pathname.startsWith('/partner');
    const isAdmin = location.pathname.startsWith('/admin');
    
    // Hide global navs on specific layouts
    const hideGlobalNav = isLanding || isSeller || isPartner || isAdmin;

    return (
        <div className="w-full h-[100dvh] font-sans bg-slate-950 text-white relative selection:bg-orange-500/30 flex flex-col overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black"></div>
            </div>

            {/* Header - Only show inside App */}
            {!hideGlobalNav && (
                <AppHeader />
            )}

            {/* Main Content (Routes) - Make this scrollable */}
            <main className="flex-1 w-full relative overflow-y-auto custom-scrollbar">
                <AppRoutes />
            </main>

            {/* Bottom Nav - Only show inside App */}
            {!hideGlobalNav && (
                <BottomNav />
            )}

            {/* --- GLOBAL MODALS --- */}

            <AuthLoginModal
                show={modals.login}
                onClose={() => closeModal('login')}
                t={t}
                onSwitchToRegister={() => {
                    closeModal('login');
                    openModal('register');
                }}
                handleAuthSuccess={() => {
                    closeModal('login');
                }}
            />

            <RegisterModal
                show={modals.register}
                onClose={() => closeModal('register')}
                t={t}
                onSwitchToLogin={() => {
                    closeModal('register');
                    openModal('login');
                }}
                loginIntent={loginIntent}
            />

            <SellerRegistrationModal
                show={modals.seller}
                onClose={() => closeModal('seller')}
                t={t}
                onCompleteRegistration={() => {
                    closeModal('seller');
                }}
            />

            <LocationSelectModal
                show={modals.location}
                onClose={() => closeModal('location')}
                t={t}
                currentLocation={selectedLocation}
                handleGetGPSLocation={async () => {
                    if ("geolocation" in navigator) {
                        navigator.geolocation.getCurrentPosition(async (pos) => {
                            try {
                                const { latitude, longitude } = pos.coords;
                                // BigDataCloud Free Reverse Geocoding API (Client-side)
                                const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=tr`);
                                const data = await response.json();

                                const city = data.principalSubdivision || data.city;
                                const district = data.locality || data.district;

                                if (city && district) {
                                    setSelectedLocation(`${city}, ${district}`);
                                    showAlert("Konum Güncellendi", `GPS üzerinden tespit edildi: ${city}, ${district}`, "success");
                                } else {
                                    setSelectedLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                                    showAlert("Konum Alındı", "Koordinatlarınız başarıyla alındı.", "success");
                                }
                                closeModal('location');
                            } catch (error) {
                                console.error("Geocoding error:", error);
                                showAlert("Hata", "Konum bilgisi çözümlenemedi, lütfen manuel seçin.", "error");
                            }
                        }, (err) => {
                            if (err.code === 1) {
                                showAlert("İzin Reddedildi", "Lütfen tarayıcı ayarlarından konum izni verin.", "warning");
                            } else {
                                showAlert("Hata", "Konum alınırken bir sorun oluştu.", "error");
                            }
                        });
                    } else {
                        showAlert("Desteklenmiyor", "Tarayıcınız konum özelliğini desteklemiyor.", "error");
                    }
                }}
                handleManualLocationSelect={(city, district) => {
                    setSelectedLocation(`${city}, ${district}`);
                    closeModal('location');
                    showAlert("Konum Kaydedildi", `Yeni konumun: ${city}, ${district}`, "success");
                }}
                showAlert={showAlert}
            />

            <KVKKPolicyModal
                show={modals.kvkk}
                onClose={() => closeModal('kvkk')}
                t={t}
                onAgree={() => closeModal('kvkk')}
            />

            <CartDrawer />

            <SOSPanicModal
                show={modals.sos}
                onClose={() => closeModal('sos')}
                t={t}
            />

            <AccidentAssistantModal
                show={modals.accident}
                onClose={() => closeModal('accident')}
                t={t}
            />

            {/* AI Assistant (Global FAB) */}
            {!isLanding && <AIAssistant />}

            {/* Vehicle Selector Modal */}
            {showVehicleSelector && (
                <div className="fixed inset-0 bg-black/80 z-[110] flex items-center justify-center p-4 backdrop-blur-md animate-in fade-in">
                    <div className="relative w-full max-w-md">
                        <button onClick={() => setShowVehicleSelector(false)} className="absolute -top-12 right-0 text-white hover:text-red-500 transition">
                            <X size={24} />
                        </button>
                        <VehicleSearch onVehicleFound={async (data) => {
                            const { error } = await addVehicle({
                                brand: data.brand,
                                model: data.model,
                                plate: data.plate || '34RPD' + Math.floor(100 + Math.random() * 900),
                                km: data.km || '0',
                                engine_code: data.engine_code || '',
                            });

                            if (!error) {
                                setShowVehicleSelector(false);
                                showAlert("Başarılı", "Araç garajınıza eklendi.", "success");
                            } else {
                                showAlert("Hata", "Araç eklenirken bir sorun oluştu.", "error");
                            }
                        }} />
                    </div>
                </div>
            )}

            <AlertModal
                show={alertState.show}
                onClose={closeAlert}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
            />
        </div>
    );
};

export default App;