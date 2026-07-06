/* eslint-disable react-refresh/only-export-components */
import React, { createContext,
  useContext,
  useState,
  useEffect,
  useCallback, useMemo } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";

const GarageContext = createContext();

export const useGarage = () => {
  const context = useContext(GarageContext);
  if (!context) throw new Error("useGarage must be used within GarageProvider");
  return context;
};

export const GarageProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [currentVehicle, setCurrentVehicle] = useState(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmittingVehicle, setIsSubmittingVehicle] = useState(false);
  const [isSubmittingMaintenance, setIsSubmittingMaintenance] = useState(false);

  const fetchVehicles = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code !== "42501")
          console.error("Error fetching vehicles:", error);
        setVehicles([]);
        return;
      }
      setVehicles(data || []);
      if (data?.length > 0 && !currentVehicle) setCurrentVehicle(data[0]);
    } catch (error) {
      console.error("Garage Fetch Error:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentVehicle]);

  const fetchMaintenanceRecords = useCallback(async (vehicleId) => {
    if (!vehicleId) return;
    try {
      const { data, error } = await supabase
        .from("maintenance_records")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code !== "PGRST204" && error.code !== "42501") {
          console.error("Error fetching maintenance records:", error);
        }
        setMaintenanceRecords([]);
        return;
      }
      setMaintenanceRecords(data || []);
    } catch (error) {
      console.error("Maintenance Fetch Error:", error);
      setMaintenanceRecords([]);
    }
  }, []);

  const fetchExpenses = useCallback(async (vehicleId) => {
    if (!vehicleId) return;
    try {
      const { data, error } = await supabase
        .from("vehicle_expenses")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("date", { ascending: false });

      if (error) {
        if (error.code !== "PGRST204" && error.code !== "42501") {
          console.error("Error fetching expenses:", error);
        }
        setExpenses([]);
        return;
      }
      setExpenses(data || []);
    } catch (error) {
      console.error("Expenses Fetch Error:", error);
      setExpenses([]);
    }
  }, []);

  const fetchDocuments = useCallback(async (vehicleId) => {
    if (!vehicleId) return;
    try {
      const { data, error } = await supabase
        .from("vehicle_documents")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code !== "PGRST204" && error.code !== "42501") {
          console.error("Error fetching documents:", error);
        }
        setDocuments([]);
        return;
      }
      setDocuments(data || []);
    } catch (error) {
      console.error("Documents Fetch Error:", error);
      setDocuments([]);
    }
  }, []);

  const fetchReports = useCallback(async (vehicleId) => {
    if (!vehicleId) return;
    try {
      const { data, error } = await supabase
        .from("vehicle_reports")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code !== "PGRST204" && error.code !== "42501") {
          console.error("Error fetching reports:", error);
        }
        setReports([]);
        return;
      }
      setReports(data || []);
    } catch (error) {
      console.error("Reports Fetch Error:", error);
      setReports([]);
    }
  }, []);

  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous || !currentUser.id) {
      setVehicles([]);
      setCurrentVehicle(null);
      setMaintenanceRecords([]);
      setExpenses([]);
      setDocuments([]);
      setReports([]);
      setLoading(false);
      return;
    }

    fetchVehicles();

    // Real-time: Araç listesi değiştiğinde
    const vehicleChannel = supabase
      .channel("garage_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "vehicles",
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => fetchVehicles(),
      )
      .subscribe();

    // Real-time: Bakım kayıtları değiştiğinde
    const maintenanceChannel = supabase
      .channel("maintenance_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "maintenance_records",
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => {
          if (currentVehicle) fetchMaintenanceRecords(currentVehicle.id);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(vehicleChannel);
      supabase.removeChannel(maintenanceChannel);
    };
  }, [currentUser, currentVehicle, fetchVehicles, fetchMaintenanceRecords]);

  // Araç seçildiğinde bakım, harcama, belge ve raporları getir
  useEffect(() => {
    if (currentVehicle) {
      fetchMaintenanceRecords(currentVehicle.id);
      fetchExpenses(currentVehicle.id);
      fetchDocuments(currentVehicle.id);
      fetchReports(currentVehicle.id);
    } else {
      setMaintenanceRecords([]);
      setExpenses([]);
      setDocuments([]);
      setReports([]);
    }
  }, [currentVehicle, fetchMaintenanceRecords, fetchExpenses, fetchDocuments, fetchReports]);

  const addVehicle = async (vehicleData) => {
    setIsSubmittingVehicle(true);
    try {
      const { data, error } = await supabase
        .from("vehicles")
        .insert([{ user_id: currentUser.id, ...vehicleData }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error("Bu plakaya sahip bir araç zaten kayıtlı.");
        }
        throw error;
      }
      setVehicles((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error("Error adding vehicle:", error);
      return { data: null, error };
    } finally {
      setIsSubmittingVehicle(false);
    }
  };

  const addMaintenanceRecord = async (recordData) => {
    if (!currentVehicle) return { error: "No vehicle selected" };
    setIsSubmittingMaintenance(true);
    try {
      const { data, error } = await supabase
        .from("maintenance_records")
        .insert([
          {
            user_id: currentUser.id,
            vehicle_id: currentVehicle.id,
            ...recordData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setMaintenanceRecords((prev) => [data, ...prev]);

      // Eğer bakım kaydı KM bilgisini güncelliyorsa aracı da güncelle
      if (recordData.km && Number(recordData.km) > Number(currentVehicle.km)) {
        await updateVehicleKm(currentVehicle.id, recordData.km);
      }
      return { data, error: null };
    } catch (error) {
      console.error("Error adding maintenance record:", error);
      return { data: null, error };
    } finally {
      setIsSubmittingMaintenance(false);
    }
  };

  const addExpense = async (expenseData) => {
    if (!currentVehicle) return { error: "No vehicle selected" };
    try {
      const { data, error } = await supabase
        .from("vehicle_expenses")
        .insert([
          {
            user_id: currentUser.id,
            vehicle_id: currentVehicle.id,
            ...expenseData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setExpenses((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error("Error adding expense:", error);
      return { data: null, error };
    }
  };

  const addDocument = async (docData) => {
    if (!currentVehicle) return { error: "No vehicle selected" };
    try {
      const { data, error } = await supabase
        .from("vehicle_documents")
        .insert([
          {
            user_id: currentUser.id,
            vehicle_id: currentVehicle.id,
            ...docData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setDocuments((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error("Error adding document:", error);
      return { data: null, error };
    }
  };

  const addReport = async (reportData) => {
    if (!currentVehicle) return { error: "No vehicle selected" };
    try {
      const { data, error } = await supabase
        .from("vehicle_reports")
        .insert([
          {
            user_id: currentUser.id,
            vehicle_id: currentVehicle.id,
            ...reportData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setReports((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error("Error adding report:", error);
      return { data: null, error };
    }
  };

  const updateVehicleKm = async (id, newKm) => {
    try {
      const { error } = await supabase
        .from("vehicles")
        .update({ km: newKm })
        .eq("id", id);

      if (error) throw error;
      setCurrentVehicle((prev) =>
        prev.id === id ? { ...prev, km: newKm } : prev,
      );
    } catch (error) {
      console.error("Error updating vehicle KM:", error);
    }
  };

  const updateVehicleDates = async (id, dates) => {
    try {
      const { error } = await supabase
        .from("vehicles")
        .update({
          inspection_date: dates.inspectionDate,
          insurance_expiry: dates.insuranceExpiry,
          last_mileage: dates.lastMileage,
          reminder_enabled: dates.reminderEnabled,
          health_score: dates.healthScore !== undefined ? dates.healthScore : 100,
          chassis_number: dates.chassisNumber || null,
          insurance_policy_no: dates.insurancePolicyNo || null,
          inspection_expiry_date: dates.inspectionExpiryDate || dates.inspectionDate || null,
          insurance_expiry_date: dates.insuranceExpiryDate || dates.insuranceExpiry || null,
          last_tire_change: dates.lastTireChange || null,
          last_battery_change: dates.lastBatteryChange || null,
          last_oil_change: dates.lastOilChange || null,
        })
        .eq("id", id);

      if (error) throw error;
      
      const updatedVehicle = { 
        ...currentVehicle, 
        inspection_date: dates.inspectionDate,
        insurance_expiry: dates.insuranceExpiry,
        last_mileage: dates.lastMileage,
        reminder_enabled: dates.reminderEnabled,
        health_score: dates.healthScore !== undefined ? dates.healthScore : 100,
        chassis_number: dates.chassisNumber || null,
        insurance_policy_no: dates.insurancePolicyNo || null,
        inspection_expiry_date: dates.inspectionExpiryDate || dates.inspectionDate || null,
        insurance_expiry_date: dates.insuranceExpiryDate || dates.insuranceExpiry || null,
        last_tire_change: dates.lastTireChange || null,
        last_battery_change: dates.lastBatteryChange || null,
        last_oil_change: dates.lastOilChange || null,
      };

      setVehicles(prev => prev.map(v => v.id === id ? updatedVehicle : v));
      if (currentVehicle?.id === id) setCurrentVehicle(updatedVehicle);
      
      return { success: true };
    } catch (error) {
      console.error("Error updating vehicle dates:", error);
      return { success: false, error };
    }
  };

  const deleteVehicle = async (id) => {
    try {
      const { error } = await supabase.from("vehicles").delete().eq("id", id);

      if (error) throw error;
      setVehicles((prev) => prev.filter((v) => v.id !== id));
      if (currentVehicle?.id === id)
        setCurrentVehicle(vehicles.find((v) => v.id !== id) || null);
      return { error: null };
    } catch (error) {
      console.error("Error deleting vehicle:", error);
      return { error };
    }
  };

  const getMaintenanceStatus = (vehicle) => {
    if (!vehicle) return null;
    const currentKm = Number(vehicle.km) || 0;

    // Intervals (Industry Standards)
    const intervals = { oil: 10000, brakes: 30000, tires: 50000 };

    const calcLife = (km, interval) => {
      const remaining = interval - (km % interval);
      return Math.max(0, Math.min(100, (remaining / interval) * 100));
    };

    return [
      {
        id: "oil",
        label: "Motor Yağı",
        value: calcLife(currentKm, intervals.oil),
        color: "text-primary-400",
      },
      {
        id: "brakes",
        label: "Fren Balataları",
        value: calcLife(currentKm, intervals.brakes),
        color: "text-accent-400",
      },
      {
        id: "tires",
        label: "Lastik Ömrü",
        value: calcLife(currentKm, intervals.tires),
        color: "text-teal-400",
      },
    ];
  };

  const value = useMemo(() => ({

    vehicles,
    currentVehicle,
    setCurrentVehicle,
    maintenanceRecords,
    expenses,
    documents,
    reports,
    loading,
    isSubmittingVehicle,
    isSubmittingMaintenance,
    fetchVehicles,
    addVehicle,
    updateVehicleDates,
    addMaintenanceRecord,
    addExpense,
    addDocument,
    addReport,
    deleteVehicle,
    getMaintenanceStatus,
  
  }), [vehicles, currentVehicle, maintenanceRecords, expenses, documents, reports, loading, isSubmittingVehicle, isSubmittingMaintenance, addVehicle, updateVehicleDates, addExpense, addDocument, addReport, deleteVehicle, getMaintenanceStatus]);

  return (
    <GarageContext.Provider value={value}>{children}</GarageContext.Provider>
  );
};
