import React, { useState, useEffect } from "react";
import { Search, Plus, FileText, Download, X, AlertCircle } from "lucide-react";
import { supabase } from "../../../supabaseClient";

export default function InvoiceListingView({ currentUser }) {
  const [invoices, setInvoices] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Form
  const [selectedOrderId, setSelectedOrderId] = useState("");
  const [taxRate, setTaxRate] = useState("20");

  const fetchData = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // 1. Fetch invoices
      const { data: invList, error: invErr } = await supabase
        .from("invoices")
        .select("*, orders:order_id(total_amount, status)")
        .eq("seller_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (!invErr && invList) {
        setInvoices(invList);
      }

      // 2. Fetch orders to invoice (completed/ready orders that aren't invoiced yet)
      const { data: ordList, error: ordErr } = await supabase
        .from("orders")
        .select("*")
        .eq("seller_id", currentUser.id);

      if (!ordErr && ordList) {
        // Filter out orders that already have an invoice
        const invoicedOrderIds = new Set(invList?.map(i => i.order_id).filter(Boolean) || []);
        const toInvoice = ordList.filter(o => !invoicedOrderIds.has(o.id));
        setOrders(toInvoice);
      }
    } catch (err) {
      console.error("Error fetching invoices:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser]);

  const handleCreateInvoice = async (e) => {
    e.preventDefault();
    if (!selectedOrderId) return;
    setError("");
    setActionLoading(true);

    try {
      const order = orders.find(o => o.id === selectedOrderId);
      if (!order) throw new Error("Seçili sipariş bulunamadı.");

      const invNumber = "FTR-" + new Date().getFullYear() + Math.floor(100000 + Math.random() * 900000);

      const { error } = await supabase
        .from("invoices")
        .insert([{
          order_id: selectedOrderId,
          seller_id: currentUser.id,
          invoice_number: invNumber,
          amount: Number(order.total_amount),
          tax_rate: Number(taxRate)
        }]);

      if (error) throw error;

      setIsModalOpen(false);
      setSelectedOrderId("");
      fetchData();
    } catch (err) {
      setError(err.message || "Fatura oluşturulamadı.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900 dark:text-white">Fatura Listeleme</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Kesilmiş faturalarınızı listeleyin veya yeni fatura oluşturun.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} /> Fatura Oluştur
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-8 text-center text-slate-500 text-xs">Yükleniyor...</div>
      ) : invoices.length === 0 ? (
        <div className="py-16 text-center text-slate-400 bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl">
          <FileText size={40} className="mx-auto mb-3 opacity-20" />
          <p className="font-bold text-xs">Kayıtlı fatura bulunmuyor.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-black/20 text-slate-500 uppercase tracking-widest text-[10px] font-bold border-b border-black/5 dark:border-white/5">
                  <th className="p-4">Fatura No</th>
                  <th className="p-4">Tarih</th>
                  <th className="p-4">Sipariş No</th>
                  <th className="p-4">KDV Dahil Tutar</th>
                  <th className="p-4">KDV Oranı</th>
                  <th className="p-4 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5 dark:divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">{inv.invoice_number}</td>
                    <td className="p-4 text-slate-500">{new Date(inv.created_at).toLocaleDateString("tr-TR")}</td>
                    <td className="p-4 font-mono text-slate-400">#{inv.order_id?.slice(0, 8) || "Direkt"}</td>
                    <td className="p-4 font-black text-slate-950 dark:text-white">₺{inv.amount}</td>
                    <td className="p-4 text-slate-500">%{inv.tax_rate}</td>
                    <td className="p-4 text-right">
                      <button className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg text-slate-600 dark:text-white transition-colors">
                        <Download size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-md rounded-xl p-6 relative">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black mb-4 uppercase">E-Fatura Kes</h3>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl mb-4 text-xs flex items-center gap-2"><AlertCircle size={14} />{error}</div>}
            
            {orders.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">Faturalandırılmamış tamamlanmış siparişiniz bulunmuyor.</p>
            ) : (
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Faturalandırılacak Sipariş</label>
                  <select
                    required
                    className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                  >
                    <option value="">Sipariş Seçin...</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>
                        Sipariş #{o.id.slice(0, 8)} - ₺{o.total_amount}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">KDV Oranı (%)</label>
                  <select
                    className="w-full bg-slate-50 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none"
                    value={taxRate}
                    onChange={(e) => setTaxRate(e.target.value)}
                  >
                    <option value="20">%20 (Standart Hizmet/Ürün)</option>
                    <option value="10">%10 (İndirimli Dilim)</option>
                    <option value="0">%0 (KDV Muaf)</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-xs uppercase tracking-widest transition-colors"
                >
                  {actionLoading ? "Kesiliyor..." : "Faturayı Kes ve Gönder"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
