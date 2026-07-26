import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Clock, Wrench, Package, Truck, Droplet, Star, MapPin, Navigation, Compass } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../../supabaseClient';

const statusConfig = {
    pending: { label: 'Onay Bekliyor', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    accepted: { label: 'Onaylandı', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    in_progress: { label: 'İşlemde', icon: Wrench, color: 'text-teal-500', bg: 'bg-teal-500/10' },
    completed: { label: 'Tamamlandı', icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
    cancelled: { label: 'İptal Edildi', icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10' },
};

const getRoleIcon = (role) => {
    switch (role) {
        case 'mechanic': return Wrench;
        case 'carwash': return Droplet;
        case 'parts': return Package;
        case 'valet': return Truck;
        default: return Wrench;
    }
};

const RecenterMap = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.lat && center.lng) {
            map.flyTo([center.lat, center.lng], 14, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

// Custom Marker Icons for map tracking
const providerMarkerIcon = L.divIcon({
    className: 'custom-order-provider-marker',
    html: `
      <div class="relative w-10 h-10 flex items-center justify-center animate-bounce">
        <div class="absolute inset-0 bg-orange-600 rounded-full rotate-45 border-2 border-white shadow-lg"></div>
        <div class="absolute z-10 w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-[10px]">
          🚚
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

const userMarkerIcon = L.divIcon({
    className: 'custom-order-user-marker',
    html: `
      <div class="relative w-10 h-10 flex items-center justify-center">
        <div class="absolute inset-0 bg-teal-500 rounded-full rotate-45 border-2 border-white shadow-lg"></div>
        <div class="absolute z-10 w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-white font-black text-[10px]">
          📍
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40]
});

const LiveOrderStatus = ({ order }) => {
    const [showMap, setShowMap] = useState(false);
    const [providerCoords, setProviderCoords] = useState(null);
    const [userLocation, setUserLocation] = useState({ lat: 41.0082, lng: 28.9784 });

    useEffect(() => {
        if (!order || !order.seller_id) return;
        
        // Initial setup from order.seller coordinates
        if (order.seller && order.seller.lat && order.seller.lng) {
            setProviderCoords({ lat: Number(order.seller.lat), lng: Number(order.seller.lng) });
        } else {
            // Mock provider coordinates near Istanbul central if missing, for demonstration
            setProviderCoords({ lat: 41.015, lng: 28.985 });
        }

        // Get user position if GPS available
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                },
                (err) => console.error("User location query error:", err),
                { timeout: 5000 }
            );
        }

        // Supabase real-time channel subscription to profiles update
        const channel = supabase
            .channel(`live-tracking-${order.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'profiles',
                    filter: `id=eq.${order.seller_id}`
                },
                (payload) => {
                    if (payload.new && payload.new.lat && payload.new.lng) {
                        setProviderCoords({
                            lat: Number(payload.new.lat),
                            lng: Number(payload.new.lng)
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [order]);

    if (!order) return null;

    const currentStatus = statusConfig[order.status] || statusConfig.pending;
    const RoleIcon = getRoleIcon(order.seller_role);
    const isMobileProvider = ['mechanic', 'carwash', 'valet'].includes(order.seller_role);
    const canTrack = isMobileProvider && ['accepted', 'in_progress'].includes(order.status);

    // Progress percentage based on status
    const getProgress = (status) => {
        switch (status) {
            case 'pending': return 25;
            case 'accepted': return 50;
            case 'in_progress': return 75;
            case 'completed': return 100;
            case 'cancelled': return 0;
            default: return 0;
        }
    };

    const titleUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
    const attribution = '&copy; OpenStreetMap';

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl border border-slate-100 dark:border-slate-800"
        >
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        <RoleIcon className="text-primary-500" size={20} />
                        Hizmet Durumu
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Sipariş No: #{order.id?.split('-')[0]}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${currentStatus.bg} ${currentStatus.color}`}>
                    {currentStatus.label}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
                <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${getProgress(order.status)}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute top-0 left-0 h-full ${order.status === 'cancelled' ? 'bg-red-500' : 'bg-primary-500'}`}
                />
            </div>

            {/* Status Details (CRM Update from Seller) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-start gap-4">
                <div className={`p-3 rounded-full ${currentStatus.bg} ${currentStatus.color}`}>
                    <currentStatus.icon size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">
                        {order.status === 'completed' ? 'İşlem Tamamlandı' : 'Son Güncelleme'}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        {order.status_details || "Hizmet sağlayıcıdan güncelleme bekleniyor..."}
                    </p>
                    
                    {order.rating && (
                        <div className="flex items-center gap-1 mt-3 text-yellow-500">
                            {[...Array(order.rating)].map((_, i) => (
                                <Star key={i} size={14} fill="currentColor" />
                            ))}
                            <span className="text-xs font-bold text-slate-500 ml-1">Sizin Değerlendirmeniz</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Live GPS Map Tracking Toggle */}
            {canTrack && (
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <button
                        onClick={() => setShowMap(!showMap)}
                        className="w-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active-scale transition-all border border-black/5 dark:border-white/5"
                    >
                        <Compass size={14} className={showMap ? "animate-spin text-primary-500" : "text-slate-500"} />
                        {showMap ? "Haritayı Gizle" : "Sağlayıcıyı Canlı Takip Et"}
                    </button>

                    <AnimatePresence>
                        {showMap && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 280 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden mt-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-inner"
                            >
                                <div className="h-full w-full relative">
                                    <MapContainer
                                        center={[userLocation.lat, userLocation.lng]}
                                        zoom={13}
                                        scrollWheelZoom={true}
                                        className="w-full h-full"
                                        zoomControl={false}
                                    >
                                        <TileLayer attribution={attribution} url={titleUrl} />
                                        <RecenterMap center={providerCoords || userLocation} />

                                        {/* User Location Marker */}
                                        <Marker position={[userLocation.lat, userLocation.lng]} icon={userMarkerIcon}>
                                            <Popup>
                                                <div className="text-xs font-bold text-slate-900">Sizin Konumunuz</div>
                                            </Popup>
                                        </Marker>

                                        {/* Provider Location Marker */}
                                        {providerCoords && (
                                            <Marker position={[providerCoords.lat, providerCoords.lng]} icon={providerMarkerIcon}>
                                                <Popup>
                                                    <div className="text-xs font-bold text-slate-900">
                                                        {order.seller?.company_name || order.seller?.full_name || "Hizmet Ekibi"}
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        )}
                                    </MapContainer>
                                    
                                    {/* Premium Map Edge Shadow Overlay */}
                                    <div className="absolute inset-0 pointer-events-none shadow-xl z-[400]"></div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </motion.div>
    );
};

export default LiveOrderStatus;
