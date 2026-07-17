import React, { useState, useEffect } from "react";
import { Package, ShoppingBag, AlertTriangle, ChevronRight, BarChart2, Star, Check, Plus, X, AlertCircle } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function PartsDashboardView({ currentUser }) {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("active"); // active, history
  
  // Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Form states
  const [productForm, setProductForm] = useState({
    name: "",
    oem: "",
    price: "",
    stock: ""
  });

  const [stats, setStats] = useState({
    totalSales: 0,
    productCount: 0,
    lowStockCount: 0,
    buyBoxWin: "88%"
  });

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // 1. Fetch products
      const { data: prodData } = await supabase
        .from("products")
        .select("*")
        .eq("seller_id", currentUser.id);

      setProducts(prodData || []);

      // 2. Fetch pending shipments/orders
      const { data: ordData } = await supabase
        .from("orders")
        .select("*, profiles:customer_id(full_name, phone)")
        .eq("seller_id", currentUser.id)
        .order("created_at", { ascending: false });

      setOrders(ordData || []);

      const completed = ordData?.filter(o => ["shipped", "completed", "payout_processed"].includes(o.status)) || [];
      const totalRevenue = completed.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) || 0;
      const lowStock = prodData?.filter(p => p.stock < 10).length || 0;

      setStats({
        totalSales: totalRevenue,
        productCount: prodData?.length || 0,
        lowStockCount: lowStock,
        buyBoxWin: "88%"
      });
    } catch (err) {
      console.error("Parts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleShipOrder = async (id) => {
    const { error } = await supabase
      .from("orders")
      .update({ status: "shipped" })
      .eq("id", id);
    if (!error) fetchData();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setError("");
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from("products")
        .insert([{
          seller_id: currentUser.id,
          name: productForm.name,
          oem_number: productForm.oem,
          price: Number(productForm.price),
          stock: Number(productForm.stock)
        }]);

      if (error) throw error;
      setIsProductModalOpen(false);
      setProductForm({ name: "", oem: "", price: "", stock: "" });
      fetchData();
    } catch (err) {
      setError(err.message || "Ürün eklenemedi.");
    } finally {
      setActionLoading(false);
    }
  };

  const lowStockList = products.filter(p => p.stock < 10);
  
  // Filtered orders list by tab
  const filteredOrders = orders.filter(o => {
    if (activeTab === "active") {
      return ["pending", "processing"].includes(o.status);
    } else {
      return ["shipped", "completed", "payout_processed"].includes(o.status);
    }
  });

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Parça Tedarikçi Paneli</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Stok envanterinizi güncelleyin ve parça siparişlerini yönetin.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsProductModalOpen(true)}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <Plus size={16} /> Yeni Ürün Ekle
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Toplam Satış Ciro", value: `₺${stats.totalSales.toLocaleString("tr-TR")}`, icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Envanter Ürünleri", value: stats.productCount, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Kritik Stok Uyarısı", value: stats.lowStockCount, icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10" },
          { label: "Buy Box Kazanma", value: stats.buyBoxWin, icon: BarChart2, color: "text-teal-500", bg: "bg-teal-500/10" },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between shadow-sm">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{s.label}</p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{s.value}</h3>
            </div>
            <div className={`p-4 rounded-xl ${s.bg}`}>
              <s.icon size={24} className={s.color} />
            </div>
          </div>
        ))}
      </div>

      {/* Tabs Menu */}
      <div className="flex border-b border-black/5 dark:border-white/5 pb-px">
        <button
          onClick={() => setActiveTab("active")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "active"
              ? "text-emerald-500"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
          }`}
        >
          Aktif Siparişler
          {activeTab === "active" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-4 px-6 text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === "history"
              ? "text-emerald-500"
              : "text-slate-400 hover:text-slate-600 dark:hover:text-white"
          }`}
        >
          Geçmiş / Gönderilen Siparişler
          {activeTab === "history" && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500 rounded-full" />
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping & Orders Queue */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              {activeTab === "active" ? "Kargo Bekleyen Siparişler" : "Tamamlanan Siparişler"}
            </h3>
            <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${activeTab === "active" ? "bg-emerald-500/10 text-emerald-500" : "bg-slate-500/10 text-slate-500"}`}>
              {activeTab === "active" ? "HAZIRLANIYOR" : "GÖNDERİLDİ"}
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <ShoppingBag size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">Gösterilecek sipariş bulunmuyor.</p>
            </div>
          ) : (
            <div className="divide-y divide-black/5 dark:divide-white/5">
              {filteredOrders.map((order) => (
                <div key={order.id} className="py-4 flex justify-between items-center group">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{order.profiles?.full_name || "Müşteri"}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Sipariş No: #{order.id.slice(0, 8)} · Tutar: ₺{order.total_amount} · Durum: <span className="font-bold text-slate-600 dark:text-slate-300 uppercase text-[9px]">{order.status}</span></p>
                  </div>
                  <div className="flex items-center gap-3">
                    {activeTab === "active" && (
                      <button
                        onClick={() => handleShipOrder(order.id)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1.5"
                      >
                        <Check size={14} /> Kargoya Ver
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-3xl p-6 space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Kritik Stok Seviyesi</h3>
            <span className="bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-[10px] font-bold">UYARI</span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-500">Yükleniyor...</div>
          ) : lowStockList.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Package size={40} className="mx-auto mb-3 opacity-20" />
              <p className="font-bold text-sm">Kritik stok seviyesinde ürün yok.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {lowStockList.slice(0, 4).map((p) => (
                <div key={p.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-black/20 border border-black/5 dark:border-white/5 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900 dark:text-white">{p.name}</h4>
                      <p className="text-[10px] text-slate-500 mt-0.5">OEM: {p.oem_number || "Belirtilmedi"}</p>
                    </div>
                    <span className="text-[10px] font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded">
                      Stok: {p.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal: Yeni Ürün Ekle */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative">
            <button onClick={() => setIsProductModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black mb-4 uppercase">Ürün Ekle</h3>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"><AlertCircle size={14} />{error}</div>}
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Ürün Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Ön Fren Balatası"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">OEM Kodu</label>
                  <input
                    type="text"
                    placeholder="Örn: 5188849"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={productForm.oem}
                    onChange={(e) => setProductForm({ ...productForm, oem: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fiyat (₺)</label>
                  <input
                    type="number"
                    required
                    placeholder="850"
                    className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stok Miktarı</label>
                <input
                  type="number"
                  required
                  placeholder="Örn: 25"
                  className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors"
              >
                {actionLoading ? "Ekleniyor..." : "Ürünü Envantere Ekle"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
