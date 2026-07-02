/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

const MapContext = createContext();

export const useMap = () => useContext(MapContext);

const CITY_COORDINATES = {
  "Ankara, Ostim": { lat: 39.9675, lng: 32.7485 },
  "Istanbul, Maslak": { lat: 41.1105, lng: 29.021 },
  "Izmir, Bornova": { lat: 38.4622, lng: 27.2161 },
  "Antalya, Merkez": { lat: 36.8841, lng: 30.7056 },
};

export const MapProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { showAlert, selectedLocation } = useUI();
  const [nearbyProviders, setNearbyProviders] = useState([]);
  const [activeSOS, setActiveSOS] = useState(null);
  const [userLocation, setUserLocation] = useState(
    CITY_COORDINATES[selectedLocation] || CITY_COORDINATES["Ankara, Ostim"]
  );
  const [loadingMap, setLoadingMap] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState("loading"); // 'loading', 'granted', 'denied'

  // Sync location when UI selectedLocation changes
  useEffect(() => {
    if (CITY_COORDINATES[selectedLocation]) {
      setUserLocation(CITY_COORDINATES[selectedLocation]);
    }
  }, [selectedLocation]);

  // Gerçek konum takibi (Gelişmiş İzin Kontrolü)
  useEffect(() => {
    const getGeoLocation = () => {
      if (!("geolocation" in navigator)) {
        console.warn("Geolocation not supported. Using fallback.");
        setPermissionStatus("denied");
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setPermissionStatus("granted");
        },
        (error) => {
          console.warn("Location access blocked (likely HTTP context). Using Fallback.", error);
          // Fallback to a default city if in development/IP context
          setPermissionStatus("granted"); // Pretend granted to allow app flow
          setUserLocation(CITY_COORDINATES["Ankara, Ostim"]);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    };

    // Permission Policy kontrolü
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions
        .query({ name: "geolocation" })
        .then((result) => {
          if (result.state === "granted") {
            setPermissionStatus("granted");
            getGeoLocation();
          } else if (result.state === "prompt") {
            setPermissionStatus("loading");
            getGeoLocation();
          } else {
            setPermissionStatus("denied");
          }
          result.onchange = () => {
            if (result.state === "granted") {
              setPermissionStatus("granted");
              getGeoLocation();
            } else {
              setPermissionStatus("denied");
            }
          };
        })
        .catch(() => {
          getGeoLocation();
        });
    } else {
      getGeoLocation();
    }
  }, []); // Removed showAlert from dependencies as it's not used in this specific logic and causes unnecessary re-runs

  const fetchNearbyProviders = useCallback(async () => {
    // Guest check
    if (!currentUser || currentUser.id.toString().startsWith("guest-")) {
      setNearbyProviders([]);
      return;
    }

    setLoadingMap(true);
    try {
      // 1. Fetch profiles with all specialized data joined
      // Using Supabase deep join: profiles -> specialized_tables
      // 1. Fetch profiles with all specialized data joined
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          valet_profiles!id(*),
          parking_profiles!id(*),
          mechanic_shops!seller_id(*),
          parts_profiles!id(*)
        `)
        .eq("is_active_provider", true);

      if (error) throw error;
      
      // 2. Add quick categorization helper for the UI
      const enrichedData = (data || []).map(profile => ({
        ...profile,
        specialized: profile.valet_profiles?.[0] || 
                     profile.parking_profiles?.[0] || 
                     profile.mechanic_shops?.[0] || 
                     profile.parts_profiles?.[0] || {}
      }));

      setNearbyProviders(enrichedData);
    } catch (error) {
      console.error("Fetch providers error:", error);
      // Fallback to empty to prevent UI crash
      setNearbyProviders([]);
    } finally {
      setLoadingMap(false);
    }
  }, [currentUser]);

  const createSOSRequest = async (type, description) => {
    if (!currentUser) return;
    try {
      const { data, error } = await supabase
        .from("emergency_requests")
        .insert([
          {
            customer_id: currentUser.id,
            lat: userLocation.lat,
            lng: userLocation.lng,
            emergency_type: type,
            description: description,
            status: "searching",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setActiveSOS(data);
      showAlert("SOS Gönderildi", "Yakındaki yardım ekipleri bilgilendirildi.", "success");
      return data;
    } catch (error) {
      console.error("SOS Creation Error:", error);
      showAlert("Hata", "Talep oluşturulamadı.", "error");
    }
  };

  const cancelSOS = async (id) => {
    try {
      const { error } = await supabase
        .from("emergency_requests")
        .update({ status: "cancelled" })
        .eq("id", id);

      if (error) throw error;
      setActiveSOS(null);
      showAlert("İptal Edildi", "Yardım talebiniz iptal edildi.", "info");
    } catch (error) {
      console.error("Cancel SOS error:", error);
    }
  };

  // Real-time SOS takibi
  useEffect(() => {
    if (!currentUser) return;
    const channel = supabase
      .channel("sos_realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "emergency_requests",
        },
        (payload) => {
          console.log("SOS Değişikliği:", payload);
          if (payload.new.customer_id === currentUser.id) {
            setActiveSOS(payload.new);
            if (payload.new.status === "assigned") {
              showAlert("Yardım Yolda!", "Bir ekip talebinizi kabul etti.", "success");
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, showAlert]);

  const value = {
    nearbyProviders,
    activeSOS,
    userLocation,
    loadingMap,
    permissionStatus,
    fetchNearbyProviders,
    createSOSRequest,
    cancelSOS,
    retryLocation: () => {
      setPermissionStatus("loading");
      // Re-run permission check logic
      window.location.reload();
    },
    bypassPermission: () => {
      if (window.location.hostname === "localhost") {
        setPermissionStatus("granted");
      } else {
        console.warn("Bypass is only available in development mode.");
      }
    },
  };

  return <MapContext.Provider value={value}>{children}</MapContext.Provider>;
};
