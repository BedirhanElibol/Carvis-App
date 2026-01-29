import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const MapContext = createContext();

export const useMap = () => useContext(MapContext);

export const MapProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { showAlert } = useUI();

    const [nearbyProviders, setNearbyProviders] = useState([]);
    const [activeSOS, setActiveSOS] = useState(null);
    const [userLocation, setUserLocation] = useState({ lat: 39.9675, lng: 32.7485 }); // Varsayılan: Ankara Ostim
    const [loadingMap, setLoadingMap] = useState(false);

    // Gerçek konum takibi (Gelişmiş İzin Kontrolü)
    useEffect(() => {
        const getGeoLocation = () => {
            if (!("geolocation" in navigator)) return;

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                },
                (error) => {
                    console.log('Location access declined by user or environment.');
                }
            );
        };

        // Permission Policy kontrolü (Büyük tarayıcılarda ihlali önlemek için)
        if (navigator.permissions && navigator.permissions.query) {
            navigator.permissions.query({ name: 'geolocation' }).then((result) => {
                if (result.state === 'granted' || result.state === 'prompt') {
                    getGeoLocation();
                } else {
                    console.log('Geolocation is blocked by permission policy/settings. Using default location.');
                }
            }).catch(() => {
                // Query desteklenmiyorsa direkt dene
                getGeoLocation();
            });
        } else {
            getGeoLocation();
        }
    }, []);

    const fetchNearbyProviders = async () => {
        // Guest check
        if (!currentUser || currentUser.id.toString().startsWith('guest-')) {
            setNearbyProviders([]);
            return;
        }

        setLoadingMap(true);
        try {
            // Try fetching active providers
            let { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('is_active_provider', true);

            // Fallback if column doesn't exist (Schema mismatch)
            if (error && error.code === '42703') {
                console.warn("Schema mismatch: is_active_provider missing. Fetching all profiles.");
                const fallback = await supabase.from('profiles').select('*');
                data = fallback.data;
                error = fallback.error;
            }

            if (error) throw error;
            setNearbyProviders(data || []);
        } catch (error) {
            console.error('Fetch providers error:', error);
        } finally {
            setLoadingMap(false);
        }
    };

    const createSOSRequest = async (type, description) => {
        if (!currentUser) return;

        try {
            const { data, error } = await supabase
                .from('emergency_requests')
                .insert([{
                    customer_id: currentUser.id,
                    lat: userLocation.lat,
                    lng: userLocation.lng,
                    emergency_type: type,
                    description: description,
                    status: 'searching'
                }])
                .select()
                .single();

            if (error) throw error;
            setActiveSOS(data);
            showAlert("SOS Gönderildi", "Yakındaki yardım ekipleri bilgilendirildi.", "success");
            return data;
        } catch (error) {
            console.error('SOS Creation Error:', error);
            showAlert("Hata", "Talep oluşturulamadı.", "error");
        }
    };

    const cancelSOS = async (id) => {
        try {
            const { error } = await supabase
                .from('emergency_requests')
                .update({ status: 'cancelled' })
                .eq('id', id);

            if (error) throw error;
            setActiveSOS(null);
            showAlert("İptal Edildi", "Yardım talebiniz iptal edildi.", "info");
        } catch (error) {
            console.error('Cancel SOS error:', error);
        }
    };

    // Real-time SOS takibi
    useEffect(() => {
        if (!currentUser) return;

        const channel = supabase
            .channel('sos_realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'emergency_requests',
                },
                (payload) => {
                    console.log('SOS Değişikliği:', payload);
                    if (payload.new.customer_id === currentUser.id) {
                        setActiveSOS(payload.new);
                        if (payload.new.status === 'assigned') {
                            showAlert("Yardım Yolda!", "Bir ekip talebinizi kabul etti.", "success");
                        }
                    }
                }
            )
            .subscribe();

        return () => supabase.removeChannel(channel);
    }, [currentUser]);

    const value = {
        nearbyProviders,
        activeSOS,
        userLocation,
        loadingMap,
        fetchNearbyProviders,
        createSOSRequest,
        cancelSOS
    };

    return (
        <MapContext.Provider value={value}>
            {children}
        </MapContext.Provider>
    );
};
