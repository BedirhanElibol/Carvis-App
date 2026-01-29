import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const GarageContext = createContext();

export const useGarage = () => {
    const context = useContext(GarageContext);
    if (!context) throw new Error("useGarage must be used within GarageProvider");
    return context;
};

export const GarageProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { showAlert } = useUI();
    const [vehicles, setVehicles] = useState([]);
    const [currentVehicle, setCurrentVehicle] = useState(null);
    const [maintenanceRecords, setMaintenanceRecords] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser || currentUser.isAnonymous || !currentUser.id) {
            setVehicles([]);
            setCurrentVehicle(null);
            setMaintenanceRecords([]);
            setLoading(false);
            return;
        }

        fetchVehicles();

        // Real-time: Araç listesi değiştiğinde
        const vehicleChannel = supabase
            .channel('garage_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'vehicles',
                    filter: `user_id=eq.${currentUser.id}`,
                },
                () => fetchVehicles()
            )
            .subscribe();

        // Real-time: Bakım kayıtları değiştiğinde
        const maintenanceChannel = supabase
            .channel('maintenance_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'maintenance_records',
                    filter: `user_id=eq.${currentUser.id}`,
                },
                () => {
                    if (currentVehicle) fetchMaintenanceRecords(currentVehicle.id);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(vehicleChannel);
            supabase.removeChannel(maintenanceChannel);
        };
    }, [currentUser]);

    // Araç seçildiğinde bakım kayıtlarını getir
    useEffect(() => {
        if (currentVehicle) {
            fetchMaintenanceRecords(currentVehicle.id);
        } else {
            setMaintenanceRecords([]);
        }
    }, [currentVehicle]);

    const fetchVehicles = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .select('*')
                .eq('user_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) {
                if (error.code === 'PGRST301' || error.code === '42P01' || error.message?.includes('404')) {
                    console.warn("Vehicles table missing or inaccessible. Returning empty list.");
                    setVehicles([]);
                    return;
                }
                throw error;
            }
            setVehicles(data || []);
            if (data?.length > 0 && !currentVehicle) setCurrentVehicle(data[0]);
        } catch (error) {
            console.error('Error fetching vehicles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaintenanceRecords = async (vehicleId) => {
        try {
            const { data, error } = await supabase
                .from('maintenance_records')
                .select('*')
                .eq('vehicle_id', vehicleId)
                .order('service_date', { ascending: false });

            if (error) throw error;
            setMaintenanceRecords(data || []);
        } catch (error) {
            console.error('Error fetching maintenance records:', error);
        }
    };

    const addVehicle = async (vehicleData) => {
        try {
            const { data, error } = await supabase
                .from('vehicles')
                .insert([{
                    user_id: currentUser.id,
                    ...vehicleData
                }])
                .select()
                .single();

            if (error) throw error;
            setVehicles(prev => [data, ...prev]);
            return { data, error: null };
        } catch (error) {
            console.error('Error adding vehicle:', error);
            return { data: null, error };
        }
    };

    const addMaintenanceRecord = async (recordData) => {
        if (!currentVehicle) return { error: 'No vehicle selected' };
        try {
            const { data, error } = await supabase
                .from('maintenance_records')
                .insert([{
                    user_id: currentUser.id,
                    vehicle_id: currentVehicle.id,
                    ...recordData
                }])
                .select()
                .single();

            if (error) throw error;
            setMaintenanceRecords(prev => [data, ...prev]);

            // Eğer bakım kaydı KM bilgisini güncelliyorsa aracı da güncelle
            if (recordData.km && Number(recordData.km) > Number(currentVehicle.km)) {
                await updateVehicleKm(currentVehicle.id, recordData.km);
            }

            return { data, error: null };
        } catch (error) {
            console.error('Error adding maintenance record:', error);
            return { data: null, error };
        }
    };

    const updateVehicleKm = async (id, newKm) => {
        try {
            const { error } = await supabase
                .from('vehicles')
                .update({ km: newKm })
                .eq('id', id);
            if (error) throw error;
            setCurrentVehicle(prev => prev.id === id ? { ...prev, km: newKm } : prev);
        } catch (error) {
            console.error('Error updating vehicle KM:', error);
        }
    };

    const deleteVehicle = async (id) => {
        try {
            const { error } = await supabase
                .from('vehicles')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setVehicles(prev => prev.filter(v => v.id !== id));
            if (currentVehicle?.id === id) setCurrentVehicle(vehicles.find(v => v.id !== id) || null);
            return { error: null };
        } catch (error) {
            console.error('Error deleting vehicle:', error);
            return { error };
        }
    };

    const getMaintenanceStatus = (vehicle) => {
        if (!vehicle) return null;
        const currentKm = Number(vehicle.km) || 0;

        // Intervals (Industry Standards)
        const intervals = {
            oil: 10000,
            brakes: 30000,
            tires: 50000
        };

        const calcLife = (km, interval) => {
            const remaining = interval - (km % interval);
            return Math.max(0, Math.min(100, (remaining / interval) * 100));
        };

        return [
            { id: 'oil', label: 'Motor Yağı', value: calcLife(currentKm, intervals.oil), color: 'text-primary-400' },
            { id: 'brakes', label: 'Fren Balataları', value: calcLife(currentKm, intervals.brakes), color: 'text-accent-400' },
            { id: 'tires', label: 'Lastik Ömrü', value: calcLife(currentKm, intervals.tires), color: 'text-emerald-400' }
        ];
    };

    const value = {
        vehicles,
        currentVehicle,
        setCurrentVehicle,
        maintenanceRecords,
        loading,
        fetchVehicles,
        addVehicle,
        addMaintenanceRecord,
        deleteVehicle,
        getMaintenanceStatus
    };

    return (
        <GarageContext.Provider value={value}>
            {children}
        </GarageContext.Provider>
    );
};
