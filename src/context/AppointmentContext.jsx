import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const AppointmentContext = createContext();

export const useAppointment = () => {
    const context = useContext(AppointmentContext);
    if (!context) {
        throw new Error('useAppointment must be used within AppointmentProvider');
    }
    return context;
};

export const AppointmentProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { showAlert } = useUI();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser && !currentUser.isAnonymous && currentUser.id) {
            fetchAppointments();
            subscribeToAppointments();
        } else {
            setLoading(false);
        }
    }, [currentUser]);

    const fetchAppointments = async () => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .select(`
          *,
          customer:customer_id(id, full_name, email),
          seller:seller_id(id, full_name, email, company_name),
          vehicle:vehicle_id(id, brand, model, plate),
          quote:quote_id(id, price)
        `)
                .or(`customer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
                .order('appointment_date', { ascending: true });

            if (error) {
                // Table missing (404) or RLS blocked (403)
                if (error.code === 'PGRST301' || error.code === '42P01' || error.message.includes('404')) {
                    console.warn("Appointments table missing or inaccessible. Returning empty list.");
                    setAppointments([]);
                    return;
                }
                throw error;
            }
            setAppointments(data || []);
        } catch (error) {
            console.error('Error fetching appointments:', error);
            // Don't show alert for missing table, just log it
            if (!error.message?.includes('404')) {
                showAlert('Hata', 'Randevular yüklenirken bir sorun oluştu.', 'error');
            }
        } finally {
            setLoading(false);
        }
    };

    const createAppointment = async (appointmentData) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .insert([{
                    ...appointmentData,
                    status: 'pending',
                }])
                .select(`
          *,
          customer:customer_id(id, full_name, email),
          seller:seller_id(id, full_name, email, company_name),
          vehicle:vehicle_id(id, brand, model, plate)
        `)
                .single();

            if (error) throw error;

            setAppointments(prev => [...prev, data]);

            // Bildirim gönder
            await supabase
                .from('notifications')
                .insert([{
                    user_id: appointmentData.seller_id,
                    type: 'appointment',
                    title: 'Yeni Randevu Talebi',
                    message: `${appointmentData.service_type} için yeni randevu talebi aldınız.`,
                    appointment_id: data.id,
                }]);

            return { data, error: null };
        } catch (error) {
            console.error('Error creating appointment:', error);
            showAlert('Hata', 'Randevu oluşturulurken bir sorun oluştu.', 'error');
            return { data: null, error };
        }
    };

    const updateAppointmentStatus = async (appointmentId, status) => {
        try {
            const { data, error } = await supabase
                .from('appointments')
                .update({
                    status,
                    completed_at: status === 'completed' ? new Date().toISOString() : null
                })
                .eq('id', appointmentId)
                .select()
                .single();

            if (error) throw error;

            setAppointments(prev =>
                prev.map(apt => apt.id === appointmentId ? { ...apt, ...data } : apt)
            );

            return { data, error: null };
        } catch (error) {
            console.error('Error updating appointment:', error);
            showAlert('Hata', 'Randevu güncellenirken bir sorun oluştu.', 'error');
            return { data: null, error };
        }
    };

    const subscribeToAppointments = () => {
        const channel = supabase
            .channel('appointments')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                    filter: `customer_id=eq.${currentUser.id}`,
                },
                (payload) => {
                    console.log('Appointment change:', payload);
                    fetchAppointments();
                }
            )
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'appointments',
                    filter: `seller_id=eq.${currentUser.id}`,
                },
                (payload) => {
                    console.log('Appointment change:', payload);
                    fetchAppointments();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const value = {
        appointments,
        loading,
        createAppointment,
        updateAppointmentStatus,
        fetchAppointments,
    };

    return (
        <AppointmentContext.Provider value={value}>
            {children}
        </AppointmentContext.Provider>
    );
};
