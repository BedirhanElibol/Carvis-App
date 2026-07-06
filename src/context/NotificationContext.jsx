/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback , useMemo } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within NotificationProvider");
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Bildirimleri getir
  const fetchNotifications = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) {
        if (
          error.code === "PGRST301" ||
          error.code === "42P01" ||
          error.message?.includes("404") ||
          error.code === "42501"
        ) {
          console.warn("Notifications table missing or inaccessible. Returning empty list.");
          setNotifications([]);
          setUnreadCount(0);
          return;
        }
        throw error;
      }
      setNotifications(data || []);
      setUnreadCount(data?.filter((n) => !n.is_read).length || 0);
    } catch (error) {
      if (error.code !== "42501") {
        console.error("Error fetching notifications:", error);
        if (!error.message?.includes("404")) {
          showAlert("Hata", "Bildirimler yüklenirken bir sorun oluştu.", "error");
        }
      }
    }
  }, [currentUser?.id, showAlert]);

  // Bildirimi okundu olarak işaretle
  const markAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;

      // Listeyi güncelle
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      showAlert("Hata", "Bildirim güncellenirken bir sorun oluştu.", "error");
    }
  };

  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = async () => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", currentUser.id)
        .eq("is_read", false);

      if (error) throw error;

      // Listeyi güncelle
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Bildirim sil
  const deleteNotification = async (notificationId) => {
    try {
      const { error } = await supabase
        .from("notifications")
        .delete()
        .eq("id", notificationId);

      if (error) throw error;
      // Listeyi güncelle
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Realtime subscription (Yeni bildirim geldiğinde otomatik güncelle)
  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous || !currentUser.id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    fetchNotifications();

    // Realtime dinleyici
    const channel = supabase
      .channel("notifications_changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          console.log("New notification:", payload);
          // Yeni bildirimi listeye ekle
          setNotifications((prev) => [payload.new, ...prev]);
          setUnreadCount((prev) => prev + 1);

          // In-app alert (Toast) göster
          showAlert(payload.new.title, payload.new.message, payload.new.type || "info");

          // Tarayıcı bildirimi göster (izin varsa)
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: "/logo.png",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchNotifications, showAlert]);

  // Tarayıcı bildirim izni iste
  const requestNotificationPermission = async () => {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  };

  const value = useMemo(() => ({

    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications: fetchNotifications,
    requestNotificationPermission,
  
  }), [notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, fetchNotifications, requestNotificationPermission]);

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};
