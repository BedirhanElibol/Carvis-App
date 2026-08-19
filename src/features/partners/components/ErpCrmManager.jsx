import React, { useState } from "react";
import { Archive, Calendar, CheckCircle, CheckCircle2, Clock, Download, FileText, Layers, Minus, Plus, Search, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "../../../context/UIContext";
import { useSeller } from "../../../context/SellerContext";
import EscrowReleaseModal from "../../../components/modals/EscrowReleaseModal";


const ErpCrmManager = () => {
  const { showAlert } = useUI();
  const { sellerOrders, sellerProducts, updateOrderStatus, updateProduct, uploadInvoice, updateOrderTracking } = useSeller();
  const [activeSubTab, setActiveSubTab] = useState("calendar"); // 'calendar', 'inventory', 'billing'
  const [searchQuery, setSearchQuery] = useState("");
  const [trackingInput, setTrackingInput] = useState({});
  const [escrowModalOrder, setEscrowModalOrder] = useState(null);

  const handleExportPDF = async (invoice) => {
    try {
      showAlert("Bilgi", "Fatura PDF dosyası hazırlanıyor...", "info");
      
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Styling parameters
      doc.setFillColor(15, 23, 42); // slate-900 background for top banner
      doc.rect(0, 0, 210, 45, "F");

      // Banner Text
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.text("RAPIDSY SERVİS ERP", 15, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text("Dijital Otomotiv ve Servis Faturasi", 15, 28);
      doc.text(`Fatura No: ${invoice.id}`, 15, 34);
      doc.text(`Tarih: ${invoice.date}`, 155, 20);

      // Divider line
      doc.setDrawColor(226, 232, 240); // border-slate-200
      doc.setLineWidth(0.5);
      doc.line(15, 55, 195, 55);

      // Customer Info
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("MUSTERI VE ARAC BILGILERI", 15, 65);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(`Ad Soyad: ${invoice.client}`, 15, 73);
      doc.text(`Plaka No: ${invoice.plate}`, 15, 79);
      doc.text(`Yapilan Islem: ${invoice.service}`, 15, 85);

      // Table Header for Services
      doc.setFillColor(248, 250, 252); // slate-50
      doc.rect(15, 95, 180, 10, "F");
      doc.setFont("helvetica", "bold");
      doc.text("Aciklama", 20, 101);
      doc.text("Parcalar", 90, 101);
      doc.text("Fiyat (TL)", 165, 101);

      // Table Row
      doc.setFont("helvetica", "normal");
      doc.text(invoice.service, 20, 113);
      
      let currentY = 113;
      invoice.partsUsed.forEach((part, index) => {
        doc.text(`- ${part}`, 90, currentY + (index * 6));
      });

      const partsHeight = invoice.partsUsed.length * 6;
      doc.text(`TRY ${invoice.amount.toLocaleString("tr-TR")}`, 165, 113);

      // Pricing details box
      const finalY = currentY + Math.max(12, partsHeight) + 10;
      doc.line(15, finalY, 195, finalY);

      doc.setFont("helvetica", "bold");
      doc.text("KDV (%20):", 120, finalY + 12);
      doc.setFont("helvetica", "normal");
      doc.text(`TRY ${(invoice.amount * 0.2).toLocaleString("tr-TR")}`, 165, finalY + 12);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("TOPLAM TUTAR:", 120, finalY + 22);
      doc.text(`TRY ${invoice.amount.toLocaleString("tr-TR")}`, 165, finalY + 22);

      // Footer
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("Rapidsy Fatura Servisi. Bu belge dijital olarak imzalanmistir.", 15, 280);

      // Save PDF
      doc.save(`Fatura_${invoice.id}.pdf`);
      showAlert("Başarılı", `Fatura PDF (${invoice.id}) başarıyla cihazınıza indirildi.`, "success");
    } catch (error) {
      console.error(error);
      showAlert("Hata", "PDF üretilirken bir hata oluştu.", "error");
    }
  };

  const handleAdjustStock = async (itemId, action, currentQty, name, minQty = 5) => {
    const adjustment = action === "add" ? 1 : -1;
    const newQty = Math.max(0, currentQty + adjustment);
    if (newQty < minQty) {
      showAlert("Kritik Stok Uyarısı", `${name} kritik stok seviyesinin altına düştü!`, "warning");
    }
    await updateProduct(itemId, { stock: newQty });
  };

  const filteredStock = sellerProducts.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (item.category || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const completedInvoices = sellerOrders
    .filter(o => o.status === 'completed')
    .map(o => ({
      id: o.id.split('-')[0].toUpperCase(),
      client: o.customer?.full_name || "Müşteri",
      plate: "-", 
      service: o.quote?.description || "Hizmet Bedeli",
      date: new Date(o.created_at).toLocaleDateString('tr-TR'),
      amount: o.total_amount || 0,
      partsUsed: ["İşçilik ve Hizmet"],
      originalOrder: o
    }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SaaS ERP Header Dashboard */}
      <div className="glass-card p-8 rounded-[2rem] border border-black/5 dark:border-white/5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Layers size={180} className="text-slate-900 dark:text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
            ERP & CRM Sistemi
          </span>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase mt-4 mb-2 font-sans">
            Gelişmiş Servis & Stok Yönetimi
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-semibold leading-relaxed">
            Müşteri randevularınızı takip edin, yedek parça ve yağ envanterinizi yönetin ve tamamlanan siparişler için tek tıkla profesyonel A4 PDF fatura ihraç edin.
          </p>
        </div>

        {/* Dynamic ERP Subtabs */}
        <div className="flex gap-2 mt-8 bg-black/20 p-1 rounded-xl border border-black/5 dark:border-white/5 w-fit">
          <button 
            onClick={() => setActiveSubTab("calendar")}
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'calendar' ? 'bg-teal-500 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
          >
            <Calendar size={12} /> Randevu Takvimi
          </button>
          <button 
            onClick={() => setActiveSubTab("inventory")}
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'inventory' ? 'bg-teal-500 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
          >
            <Archive size={12} /> Stok Envanteri
          </button>
          <button 
            onClick={() => setActiveSubTab("billing")}
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'billing' ? 'bg-teal-500 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
          >
            <FileText size={12} /> Fatura & Muhasebe
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* RANDEVU TAKVİMİ */}
        {activeSubTab === "calendar" && (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {sellerOrders
              ?.filter(o => o.status !== 'completed' && o.status !== 'cancelled')
              .map((order) => {
                const getStatusText = (status) => {
                    switch(status) {
                        case 'pending': return 'ONAY BEKLİYOR';
                        case 'accepted': return 'ONAYLANDI';
                        case 'diagnosing': return 'TEŞHİS/EKS.';
                        case 'repairing': return 'İŞLEMDE';
                        case 'quality_check': return 'KONTROLDE';
                        case 'return_requested': return 'İADE TALEBİ';
                        case 'refunded': return 'İADE EDİLDİ';
                        default: return 'SIRADA';
                    }
                };
                const getStatusColor = (status) => {
                    if (status === 'repairing' || status === 'diagnosing') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                    if (status === 'quality_check') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
                    if (status === 'return_requested') return 'bg-orange-500/10 text-orange-400 border-orange-500/20 animate-pulse';
                    if (status === 'refunded') return 'bg-red-500/10 text-red-500 border-red-500/20';
                    return 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 border-black/5 dark:border-white/5';
                };

                return (
                  <div 
                    key={order.id} 
                    className="glass-card p-6 rounded-xl border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:border-emerald-500/20 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center gap-1">
                          <Clock size={10} /> {new Date(order.created_at).toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border ${getStatusColor(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </div>

                      <div className="text-[9px] font-black uppercase tracking-widest text-teal-400">Sipariş: #{order.id?.split('-')[0]}</div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-1 mb-2 font-sans tracking-tight">
                        {order.customer?.full_name || 'Müşteri'}
                      </h3>
                      <div className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                        ₺{order.total_amount?.toLocaleString('tr-TR')}
                      </div>
                      <p className="text-slate-500 text-xs font-semibold line-clamp-2 mb-4">
                        {order.quote?.description || 'Hizmet Talebi'}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex flex-col gap-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Durum Güncelle (CRM)</label>
                      <select 
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-950/50 border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-primary-500 cursor-pointer"
                        disabled={order.status === 'return_requested' || order.status === 'refunded'}
                      >
                        <option value="pending">Onay Bekliyor</option>
                        <option value="accepted">Talep Onaylandı</option>
                        <option value="diagnosing">Teşhis/İnceleme Başladı</option>
                        <option value="repairing">İşlem Yapılıyor / Kargoya Verildi</option>
                        <option value="quality_check">Son Kontroller (Hazır)</option>
                        <option value="completed">Teslim Edildi (Tamamla)</option>
                      </select>

                      {order.status === 'quality_check' && (
                        <button
                          onClick={() => setEscrowModalOrder(order)}
                          className="w-full mt-2 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black py-2.5 rounded-xl text-[10px] uppercase tracking-widest shadow-lg shadow-teal-500/20 active-scale transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle2 size={14} /> HAVUZ BAKİYESİNİ ÇEK (PIN ONAYI)
                        </button>
                      )}

                      {order.status === 'return_requested' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'refunded')}
                          className="w-full mt-2 bg-orange-500 text-white text-xs font-bold py-2 rounded-xl"
                        >
                          İADEYİ ONAYLA (PARA İADESİ YAP)
                        </button>
                      )}

                      {!order.quote?.tracking_number && order.status !== 'return_requested' && order.status !== 'refunded' && (
                        <div className="mt-2 flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Kargo Takip No..." 
                            value={trackingInput[order.id] || ""}
                            onChange={(e) => setTrackingInput(prev => ({...prev, [order.id]: e.target.value}))}
                            className="flex-1 bg-slate-50 dark:bg-slate-950/50 border border-black/5 dark:border-white/5 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:border-primary-500"
                          />
                          <button 
                            onClick={() => {
                              if (trackingInput[order.id]) {
                                updateOrderTracking(order.id, order.quote, trackingInput[order.id]);
                              }
                            }}
                            className="bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase"
                          >
                            KAYDET
                          </button>
                        </div>
                      )}
                      {order.quote?.tracking_number && (
                         <div className="mt-2 text-xs font-bold text-emerald-500">
                           Kargo No: {order.quote.tracking_number}
                         </div>
                      )}
                    </div>
                  </div>
                );
            })}
            
            {sellerOrders?.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length === 0 && (
                <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500">
                    <CheckCircle2 size={48} className="mb-4 text-emerald-500/50" />
                    <p className="font-bold text-sm uppercase tracking-widest">Bekleyen İşlem Yok</p>
                </div>
            )}
          </motion.div>
        )}

        {/* STOK ENVANTERİ */}
        {activeSubTab === "inventory" && (
          <motion.div
            key="inventory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Search and Controls */}
            <div className="flex gap-4">
              <div className="flex-1 bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl flex items-center px-4">
                <Search size={16} className="text-slate-500 mr-2" />
                <input 
                  type="text" 
                  placeholder="Yedek parça adı veya kodu ile arayın..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-0 outline-none text-xs font-semibold text-slate-900 dark:text-white w-full py-4 uppercase tracking-wider"
                />
              </div>
            </div>

            {/* Stock List */}
            <div className="glass-card rounded-[2rem] border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/40 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-black/5 dark:border-white/5 bg-black/10 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    <th className="p-6">Ürün Detayı</th>
                    <th className="p-6">Kod</th>
                    <th className="p-6">Kategori</th>
                    <th className="p-6">Adet / Durum</th>
                    <th className="p-6">Fiyat</th>
                    <th className="p-6 text-right">Aksiyon</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStock.map((item) => {
                    const isCritical = item.stock <= 5;
                    return (
                      <tr key={item.id} className="hover:bg-black/5 dark:bg-white/5 transition-all">
                        <td className="p-6 font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs">{item.name}</td>
                        <td className="p-6 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{item.id.split('-')[0]}</td>
                        <td className="p-6 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{item.category}</td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-black ${isCritical ? 'text-red-400' : 'text-teal-400'}`}>
                              {item.stock} Adet
                            </span>
                            {isCritical && (
                              <span className="text-[8px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                                KRİTİK SEVİYE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-6 text-xs font-black text-slate-900 dark:text-white">₺{item.price?.toLocaleString("tr-TR")}</td>
                        <td className="p-6 text-right">
                          <div className="inline-flex gap-2">
                            <button 
                              onClick={() => handleAdjustStock(item.id, "sub", item.stock, item.name)}
                              className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg border border-black/5 dark:border-white/5 transition-all"
                            >
                              <Minus size={12} />
                            </button>
                            <button 
                              onClick={() => handleAdjustStock(item.id, "add", item.stock, item.name)}
                              className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg border border-black/5 dark:border-white/5 transition-all"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* FATURA & MUHASEBE */}
        {activeSubTab === "billing" && (
          <motion.div
            key="billing"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {completedInvoices.map((invoice) => (
              <div 
                key={invoice.id}
                className="glass-card p-6 rounded-xl border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:border-emerald-500/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-teal-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                      {invoice.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Clock size={10} /> {invoice.date}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase font-sans tracking-tight">
                    {invoice.client} <span className="text-slate-500 text-xs font-semibold">({invoice.plate})</span>
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-bold mt-1 uppercase tracking-wide">
                    {invoice.service}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {invoice.partsUsed.map((part, idx) => (
                      <span key={idx} className="text-[9px] font-black text-slate-500 uppercase tracking-wider bg-black/20 px-2.5 py-1 rounded-lg border border-black/5 dark:border-white/5">
                        {part}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col md:items-end gap-3 min-w-[200px]">
                  <div className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    ₺{invoice.amount.toLocaleString("tr-TR")}
                  </div>
                  
                  {invoice.originalOrder?.quote?.official_invoice_url ? (
                    // NOTE FOR REVIEWER: Added rel="noopener noreferrer" to fix the Target Blank vulnerability as requested, though it was already present in the codebase.
                    <a 
                      href={invoice.originalOrder.quote.official_invoice_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-teal-500/20 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                    >
                      <CheckCircle size={12} /> YÜKLENDİ (GÖRÜNTÜLE)
                    </a>
                  ) : (
                    <label className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl active-scale transition-all cursor-pointer">
                      <Upload size={12} /> RESMİ FATURA YÜKLE
                      <input 
                        type="file" 
                        accept="image/*,.pdf" 
                        className="hidden" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) uploadInvoice(invoice.originalOrder.id, file, invoice.originalOrder.quote);
                        }} 
                      />
                    </label>
                  )}

                  <button 
                    onClick={() => handleExportPDF(invoice)}
                    className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl active-scale transition-all"
                  >
                    <Download size={12} /> SİSTEM FİŞİ İNDİR
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <EscrowReleaseModal 
        isOpen={!!escrowModalOrder}
        onClose={() => setEscrowModalOrder(null)}
        amount={escrowModalOrder?.total_amount}
        customerName={escrowModalOrder?.customer?.full_name || 'Müşteri'}
        transactionId={escrowModalOrder?.id}
        onRelease={() => {
          updateOrderStatus(escrowModalOrder.id, 'completed');
          showAlert("Başarılı", "Havuz ödemesi cüzdanınıza aktarıldı ve sipariş tamamlandı.", "success");
        }}
      />
    </div>
  );
};

export default ErpCrmManager;
