import React, { useState, useEffect } from "react";
import { Search, Filter, Truck, Calendar, ShoppingBag, Eye, RefreshCw, ChevronRight } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function OrderRecordsView({ currentUser }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, profiles:customer_id(full_name, phone_number, email)")
        .eq("seller_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setOrders(data);
      }
    } catch (err) {
      console.error("Error fetching order records:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser]);

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      fetchOrders();
      if (selectedOrder && selectedOrder.id === id) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    }
  };

  // Filter orders by tab & search query
  const filteredOrders = orders.filter((o) => {
    const matchesSearch = 
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.profiles?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "all") return true;
    if (activeTab === "new") return o.status === "pending";
    if (activeTab === "processing") return o.status === "processing" || o.status === "in_progress";
    if (activeTab === "shipped") return o.status === "shipped" || o.status === "ready";
    if (activeTab === "delivered") return o.status === "completed" || o.status === "delivered";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Sipariş & Kargo Yönetimi</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Gelen siparişlerin durumlarını güncelleyin ve kargo etiketlerini hazırlayın.</p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-black/5 dark:border-white/5 overflow-x-auto gap-2">
        {[
          { key: "all", label: "Tüm Siparişler", count: orders.length },
          { key: "new", label: "Yeni", count: orders.filter(o => o.status === "pending").length },
          { key: "processing", label: "İşleme Alınanlar", count: orders.filter(o => o.status === "processing" || o.status === "in_progress").length },
          { key: "shipped", label: "Taşıma / Hazır", count: orders.filter(o => o.status === "shipped" || o.status === "ready").length },
          { key: "delivered", label: "Teslim Edilenler", count: orders.filter(o => o.status === "completed" || o.status === "delivered").length },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === t.key
                ? "border-emerald-500 text-emerald-600 dark:text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            }`}
          >
            {t.label} ({t.count})
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 px-4 py-3 rounded-xl flex items-center gap-3">
          <Search size={16} className="text-slate-400" />
          <input
            type="text"
            placeholder="Sipariş numarası veya alıcı adı ile ara..."
            className="bg-transparent w-full outline-none text-xs text-slate-900 dark:text-white placeholder:text-slate-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          onClick={fetchOrders}
          className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 w-12 flex items-center justify-center rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* List / Table */}
      {loading ? (
        <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl">
          <ShoppingBag size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-bold text-xs">Sipariş kaydı bulunmuyor.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-black/20 text-slate-500 uppercase tracking-widest text-[10px] font-bold border-b border-black/5 dark:border-white/5">
                  <th className="p-4">Sipariş Detayı</th>
                  <th className="p-4">Alıcı Bilgileri</th>
                  <th className="p-4">Tutar</th>
                  <th className="p-4">Durum</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <p className="font-black text-slate-900 dark:text-white">#{o.id.slice(0, 8)}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Tarih: {new Date(o.created_at).toLocaleDateString("tr-TR")}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800 dark:text-slate-200">{o.profiles?.full_name || "Müşteri"}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">{o.profiles?.phone_number || "—"}</p>
                    </td>
                    <td className="p-4 font-black text-slate-900 dark:text-white">₺{o.total_amount}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                        o.status === "completed" || o.status === "delivered"
                          ? "bg-emerald-500/10 text-emerald-500"
                          : o.status === "pending"
                          ? "bg-amber-500/10 text-amber-500"
                          : "bg-blue-500/10 text-blue-500"
                      }`}>
                        {o.status === "pending" ? "Yeni" : 
                         o.status === "processing" || o.status === "in_progress" ? "İşlemde" : 
                         o.status === "shipped" || o.status === "ready" ? "Yolda/Hazır" : 
                         o.status === "completed" || o.status === "delivered" ? "Teslim Edildi" : o.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setSelectedOrder(o)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-white transition-colors"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Details Drawer/Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setSelectedOrder(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <Eye size={20} className="rotate-180" />
            </button>
            <h3 className="text-lg font-black mb-4 uppercase">Sipariş Detayı</h3>
            
            <div className="space-y-4">
              <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5 space-y-2">
                <p className="text-[10px] text-slate-500">SİPARİŞ NUMARASI</p>
                <p className="font-mono text-sm font-black text-slate-900 dark:text-white">{selectedOrder.id}</p>
                
                <p className="text-[10px] text-slate-500 mt-2">ALICI BİLGİLERİ</p>
                <p className="font-bold text-xs text-slate-950 dark:text-white">{selectedOrder.profiles?.full_name || "Müşteri"}</p>
                <p className="text-xs text-slate-500">{selectedOrder.profiles?.email || ""}</p>
              </div>

              <div className="flex justify-between items-center bg-emerald-500/5 p-4 rounded-2xl border border-emerald-500/10">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Toplam Ödeme</span>
                <span className="font-black text-lg text-emerald-500">₺{selectedOrder.total_amount}</span>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 uppercase">Sipariş Durumu Güncelle</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "processing")}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedOrder.status === "processing"
                        ? "bg-blue-600 border-blue-600 text-white"
                        : "bg-transparent border-black/10 dark:border-white/10 hover:bg-black/5"
                    }`}
                  >
                    İşleme Al
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "shipped")}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                      selectedOrder.status === "shipped"
                        ? "bg-amber-600 border-amber-600 text-white"
                        : "bg-transparent border-black/10 dark:border-white/10 hover:bg-black/5"
                    }`}
                  >
                    Kargoya Ver
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedOrder.id, "completed")}
                    className="col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Teslim Edildi Olarak İşaretle
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
