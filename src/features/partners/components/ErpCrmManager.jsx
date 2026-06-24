import React, { useState } from "react";
import * as Icons from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUI } from "../../../context/UIContext";
import { jsPDF } from "jspdf";

const initialStockData = [
  { id: "p1", name: "0W-30 Motor Yağı (1L)", code: "OIL-0W30", category: "Yağlar", qty: 24, minQty: 10, unitPrice: 380 },
  { id: "p2", name: "Brembo Ön Fren Balatası", code: "BRK-BRE-F", category: "Frenler", qty: 6, minQty: 8, unitPrice: 1850 },
  { id: "p3", name: "Bosch Karbonlu Polen Filtresi", code: "FIL-BOS-P", category: "Filtreler", qty: 12, minQty: 5, unitPrice: 420 },
  { id: "p4", name: "Varta 12V AGM Akü (74Ah)", code: "BAT-VAR-74", category: "Elektrik", qty: 4, minQty: 3, unitPrice: 4100 },
];

const completedInvoices = [
  { id: "INV-2026-104", client: "Ahmet Yılmaz", plate: "34 ABC 123", service: "Periyodik Bakım + Akü Değişimi", date: "2026-05-15", amount: 7300, partsUsed: ["0W-30 Motor Yağı (x4)", "Bosch Polen Filtresi", "Varta 12V AGM Akü"] },
  { id: "INV-2026-103", client: "Zeynep Kaya", plate: "06 DEF 456", service: "Ön Fren Balatası Değişimi", date: "2026-05-14", amount: 2600, partsUsed: ["Brembo Ön Fren Balatası"] },
  { id: "INV-2026-102", client: "Burak Demir", plate: "35 GHI 789", service: "Genel Teşhis ve Yağ Servisi", date: "2026-05-10", amount: 1950, partsUsed: ["0W-30 Motor Yağı (x4)"] },
];

const calendarSessions = [
  { id: "s1", client: "Mehmet Çelik", plate: "34 KRL 88", car: "BMW 320i (2020)", service: "Fren Hidrolik & Balata Değişimi", time: "09:30", status: "completed" },
  { id: "s2", client: "Esra Aslan", plate: "34 ESR 99", car: "Audi A4 (2018)", service: "Yıllık Periyodik Bakım", time: "11:00", status: "in-progress" },
  { id: "s3", client: "Murat Şahin", plate: "06 MST 34", car: "Volkswagen Golf (2021)", service: "Yağ & Polen Filtre Yenileme", time: "14:30", status: "pending" },
  { id: "s4", client: "Caner Usta", plate: "35 CNR 12", car: "Mercedes C200 (2019)", service: "AI Destekli Motor Teşhisi", time: "16:00", status: "pending" },
];

const ErpCrmManager = () => {
  const { showAlert } = useUI();
  const [stock, setStock] = useState(initialStockData);
  const [activeSubTab, setActiveSubTab] = useState("calendar"); // 'calendar', 'inventory', 'billing'
  const [searchQuery, setSearchQuery] = useState("");

  const handleExportPDF = (invoice) => {
    try {
      showAlert("Bilgi", "Fatura PDF dosyası hazırlanıyor...", "info");
      
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
      doc.text("CARVIS B2B ERP", 15, 20);

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
      doc.text("Carvis B2B ERP Fatura Servisi. Bu belge dijital olarak imzalanmistir.", 15, 280);

      // Save PDF
      doc.save(`Fatura_${invoice.id}.pdf`);
      showAlert("Başarılı", `Fatura PDF (${invoice.id}) başarıyla cihazınıza indirildi.`, "success");
    } catch (error) {
      console.error(error);
      showAlert("Hata", "PDF üretilirken bir hata oluştu.", "error");
    }
  };

  const handleAdjustStock = (itemId, action) => {
    setStock(prev => prev.map(item => {
      if (item.id === itemId) {
        const adjustment = action === "add" ? 1 : -1;
        const newQty = Math.max(0, item.qty + adjustment);
        if (newQty < item.minQty) {
          showAlert("Kritik Stok Uyarısı", `${item.name} kritik stok seviyesinin altına düştü!`, "warning");
        }
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const filteredStock = stock.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    item.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* SaaS ERP Header Dashboard */}
      <div className="glass-card p-8 rounded-[2rem] border border-black/5 dark:border-white/5 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Icons.Layers size={180} className="text-slate-900 dark:text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400 bg-emerald-500/10 px-4 py-1.5 rounded-full border border-emerald-500/20">
            B2B ERP & CRM Sistemi
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
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'calendar' ? 'bg-emerald-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
          >
            <Icons.Calendar size={12} /> Randevu Takvimi
          </button>
          <button 
            onClick={() => setActiveSubTab("inventory")}
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'inventory' ? 'bg-emerald-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
          >
            <Icons.Archive size={12} /> Stok Envanteri
          </button>
          <button 
            onClick={() => setActiveSubTab("billing")}
            className={`px-6 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-2 ${activeSubTab === 'billing' ? 'bg-emerald-600 text-slate-900 dark:text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 dark:text-white'}`}
          >
            <Icons.FileText size={12} /> Fatura & Muhasebe
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
            className="grid grid-cols-1 md:grid-cols-4 gap-6"
          >
            {calendarSessions.map((session) => (
              <div 
                key={session.id} 
                className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:border-emerald-500/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase flex items-center gap-1">
                      <Icons.Clock size={10} /> {session.time}
                    </span>
                    <span className={`px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest ${
                      session.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : session.status === 'in-progress'
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          : 'bg-black/5 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/5'
                    }`}>
                      {session.status === 'completed' ? 'TAMAMLANDI' : session.status === 'in-progress' ? 'İŞLEMDE' : 'SIRADA'}
                    </span>
                  </div>

                  <div className="text-[9px] font-black uppercase tracking-widest text-emerald-400">{session.plate}</div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase mt-1 mb-2 font-sans tracking-tight">
                    {session.client}
                  </h3>
                  <div className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                    {session.car}
                  </div>
                  <p className="text-slate-500 text-xs font-semibold">
                    {session.service}
                  </p>
                </div>

                {session.status !== 'completed' && (
                  <button 
                    onClick={() => showAlert("Başarılı", "İşlem başarıyla başlatıldı/tamamlandı.", "success")}
                    className="w-full mt-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all"
                  >
                    GÜNCELLE
                  </button>
                )}
              </div>
            ))}
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
                <Icons.Search size={16} className="text-slate-500 mr-2" />
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
                    const isCritical = item.qty <= item.minQty;
                    return (
                      <tr key={item.id} className="hover:bg-black/5 dark:bg-white/5 transition-all">
                        <td className="p-6 font-black text-slate-900 dark:text-white uppercase tracking-tight text-xs">{item.name}</td>
                        <td className="p-6 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">{item.code}</td>
                        <td className="p-6 text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">{item.category}</td>
                        <td className="p-6">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-black ${isCritical ? 'text-red-400' : 'text-emerald-400'}`}>
                              {item.qty} Adet
                            </span>
                            {isCritical && (
                              <span className="text-[8px] font-black uppercase text-red-500 bg-red-500/10 border border-red-500/20 px-2.5 py-0.5 rounded-full">
                                KRİTİK SEVİYE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-6 text-xs font-black text-slate-900 dark:text-white">₺{item.unitPrice.toLocaleString("tr-TR")}</td>
                        <td className="p-6 text-right">
                          <div className="inline-flex gap-2">
                            <button 
                              onClick={() => handleAdjustStock(item.id, "sub")}
                              className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg border border-black/5 dark:border-white/5 transition-all"
                            >
                              <Icons.Minus size={12} />
                            </button>
                            <button 
                              onClick={() => handleAdjustStock(item.id, "add")}
                              className="p-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white rounded-lg border border-black/5 dark:border-white/5 transition-all"
                            >
                              <Icons.Plus size={12} />
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
                className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 bg-white dark:bg-slate-900/50 hover:border-emerald-500/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-xl">
                      {invoice.id}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1">
                      <Icons.Clock size={10} /> {invoice.date}
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
                  <button 
                    onClick={() => handleExportPDF(invoice)}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.2)] active-scale transition-all"
                  >
                    <Icons.Download size={12} /> FATURA PDF İNDİR
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ErpCrmManager;
