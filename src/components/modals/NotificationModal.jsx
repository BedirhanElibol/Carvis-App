import React, { useState, useEffect } from "react";
import { BellOff, Loader2, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";

const NotificationModal = ({ show, onClose, t }) => {
  const { currentUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!show || !currentUser) return;

    const fetchNotifications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error && data) {
        setNotifications(data);
      }
      setLoading(false);
    };

    fetchNotifications();

    // Real-time subscription
    const channel = supabase
      .channel("notification_modal")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUser.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [show, currentUser]);

  if (!show || !t) return null;

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Az önce";
    if (mins < 60) return `${mins} dk önce`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} saat önce`;
    const days = Math.floor(hours / 24);
    return `${days} gün önce`;
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[75] flex items-start justify-center pt-20 p-4 backdrop-blur-sm animate-in slide-in-from-top-10">
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg font-sans text-slate-900 dark:text-white">{t.notifications}</h3>
          <button
            onClick={onClose}
            className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 shadow-md"
          >
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-primary-500" size={24} />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff size={32} className="text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-bold">Bildiriminiz bulunmuyor.</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className="flex gap-3 items-start border-b border-slate-100 dark:border-slate-800 pb-3 last:border-0 bg-white dark:bg-slate-900 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition shadow-md"
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 ${
                    n.type === "success"
                      ? "bg-green-500"
                      : n.type === "warning"
                        ? "bg-amber-500"
                        : "bg-blue-500"
                  }`}
                ></div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-white font-sans">{n.title}</h4>
                  <p className="text-xs text-slate-500 font-sans">{n.message}</p>
                  <span className="text-[10px] text-slate-600 dark:text-slate-300">
                    {formatTime(n.created_at)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationModal;
