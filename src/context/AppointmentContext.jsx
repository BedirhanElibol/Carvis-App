/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback , useMemo } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

const AppointmentContext = createContext();

export const useAppointment = () => {
  const context = useContext(AppointmentContext);
  if (!context) {
    throw new Error("useAppointment must be used within AppointmentProvider");
  }
  return context;
};

export const AppointmentProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from("appointments")
        .select(
          `
                    *,
                    customer:customer_id(id, full_name, email),
                    seller:seller_id(id, full_name, email, company_name),
                    vehicle:vehicle_id(id, brand, model, plate),
                    quote:quote_id(id, price)
                `
        )
        .or(`customer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
        .order("appointment_date", { ascending: true });

      if (error) {
        if (
          error.code === "PGRST301" ||
          error.code === "42P01" ||
          error.message.includes("404") ||
          error.code === "42501"
        ) {
          console.warn("Appointments table missing or inaccessible. Returning empty list.");
          setAppointments([]);
          return;
        }
        throw error;
      }
      setAppointments(data || []);
    } catch (error) {
      if (error.code !== "42501") {
        console.error("Error fetching appointments:", error);
        if (!error.message?.includes("404")) {
          showAlert("Hata", "Randevular yüklenirken bir sorun oluştu.", "error");
        }
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, showAlert]);

  const subscribeToAppointments = useCallback(() => {
    if (!currentUser?.id) return () => {};
    const channel = supabase
      .channel("appointments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `customer_id=eq.${currentUser.id}`,
        },
        () => {
          fetchAppointments();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "appointments",
          filter: `seller_id=eq.${currentUser.id}`,
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, fetchAppointments]);

  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous && currentUser.id) {
      fetchAppointments();
      const unsubscribe = subscribeToAppointments();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else {
      setLoading(false);
    }
  }, [currentUser, fetchAppointments, subscribeToAppointments]);

  const createAppointment = async (appointmentData) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .insert([
          {
            ...appointmentData,
            status: "pending",
          },
        ])
        .select(
          `
                    *,
                    customer:customer_id(id, full_name, email),
                    seller:seller_id(id, full_name, email, company_name),
                    vehicle:vehicle_id(id, brand, model, plate)
                `
        )
        .single();

      if (error) throw error;
      setAppointments((prev) => [...prev, data]);

      // Bildirim gönder
      await supabase.from("notifications").insert([
        {
          user_id: appointmentData.seller_id,
          type: "appointment",
          title: "Yeni Randevu Talebi",
          message: `${appointmentData.service_type} için yeni randevu talebi aldınız.`,
          appointment_id: data.id,
        },
      ]);

      return { data, error: null };
    } catch (error) {
      console.error("Error creating appointment:", error);
      showAlert("Hata", "Randevu oluşturulurken bir sorun oluştu.", "error");
      return { data: null, error };
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      const { data, error } = await supabase
        .from("appointments")
        .update({
          status,
          completed_at: status === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", appointmentId)
        .select()
        .single();

      if (error) throw error;
      setAppointments((prev) =>
        prev.map((apt) => (apt.id === appointmentId ? { ...apt, ...data } : apt))
      );
      return { data, error: null };
    } catch (error) {
      console.error("Error updating appointment:", error);
      showAlert("Hata", "Randevu güncellenirken bir sorun oluştu.", "error");
      return { data: null, error };
    }
  };

  const fetchSlots = useCallback(async (sellerId) => {
    try {
      const { data, error } = await supabase
        .from("appointment_slots")
        .select("*")
        .eq("seller_id", sellerId)
        .eq("is_active", true)
        .order("day_of_week", { ascending: true })
        .order("start_time", { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error fetching slots:", error);
      return { data: null, error };
    }
  }, []);

  const checkAvailability = async (sellerId, date) => {
    try {
      const { data: existingApts, error } = await supabase
        .from("appointments")
        .select("appointment_date")
        .eq("seller_id", sellerId)
        .not("status", "eq", "cancelled")
        .gte("appointment_date", `${date}T00:00:00`)
        .lte("appointment_date", `${date}T23:59:59`);

      if (error) throw error;
      return { data: existingApts, error: null };
    } catch (error) {
      console.error("Error checking availability:", error);
      return { data: null, error };
    }
  };

  const value = useMemo(() => ({

    appointments,
    loading,
    createAppointment,
    updateAppointmentStatus,
    fetchAppointments,
    fetchSlots,
    checkAvailability,
  
  }), [appointments, loading, createAppointment, updateAppointmentStatus, fetchAppointments, fetchSlots, checkAvailability]);

  return <AppointmentContext.Provider value={value}>{children}</AppointmentContext.Provider>;
};
