import React, { useEffect, useState } from "react";
import { Truck, CheckCircle, Navigation, Clock, AlertTriangle } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useUI } from "../../context/UIContext";

const TowTruckDashboard = () => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to new emergency requests
    const sub = supabase.channel('public:emergency_requests')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'emergency_requests' }, payload => {
        fetchRequests();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    // Get all requests that are searching and paid
    const { data, error } = await supabase
      .from("emergency_requests")
      .select("*, profiles:customer_id(full_name, phone)")
      .in("status", ["paid_searching", "accepted"])
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Filter for this specific tow truck if accepted
      const filtered = data.filter(r => r.status === 'paid_searching' || r.assigned_provider_id === currentUser.id);
      setRequests(filtered);
    }
    setLoading(false);
  };

  const acceptRequest = async (id) => {
    const { error } = await supabase
      .from("emergency_requests")
      .update({ 
        status: "accepted", 
        assigned_provider_id: currentUser.id 
      })
      .eq("id", id);
      
    if (error) {
      showAlert("Hata", "Talep kabul edilemedi: " + error.message, "error");
    } else {
      showAlert("Başarılı", "Çekici talebini üzerinize aldınız. Lütfen yola çıkın.", "success");
      fetchRequests();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Acil Çekici İstasyon Paneli</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Havuzdaki çekici çağrıları ve aktif operasyonlarınız.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-40 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-12 text-center text-slate-500">
          <Truck size={48} className="mx-auto mb-4 opacity-50" />
          <p>Şu an bölgenizde aktif çekici çağrısı bulunmuyor.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map(req => (
            <div key={req.id} className="bg-white dark:bg-[#0a0f24] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm flex flex-col relative overflow-hidden">
              {req.status === 'accepted' && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  SİZİN ÜZERİNİZDE
                </div>
              )}
              
              <div className="flex items-start gap-4 mb-4 mt-2">
                <div className="w-12 h-12 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{req.price} TL</h3>
                  <p className="text-sm text-slate-500 line-clamp-2">{req.description}</p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-3 mb-4 text-xs font-medium space-y-2">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-slate-400" />
                  <span>{new Date(req.created_at).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Navigation size={14} className="text-slate-400" />
                  <span>{req.lat.toFixed(4)}, {req.lng.toFixed(4)} (Tahmini 10 KM)</span>
                </div>
              </div>

              {req.status === 'paid_searching' ? (
                <button 
                  onClick={() => acceptRequest(req.id)}
                  className="w-full mt-auto bg-slate-900 hover:bg-black dark:bg-white dark:text-black dark:hover:bg-slate-200 text-white font-bold py-3 rounded-xl transition-all"
                >
                  İşi Kabul Et
                </button>
              ) : (
                <div className="mt-auto space-y-3">
                  <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-sm font-bold flex items-center justify-between">
                    <span>Müşteri: {req.profiles?.full_name || 'Gizli Müşteri'}</span>
                    <span>{req.profiles?.phone || '05xx xxx xx xx'}</span>
                  </div>
                  <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition-all flex justify-center items-center gap-2">
                    <CheckCircle size={18} />
                    İşi Teslim Ettim
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TowTruckDashboard;
