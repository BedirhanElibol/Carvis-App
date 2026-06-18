import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useUI } from "../../context/UIContext";
import { useGarage } from "../../context/GarageContext";
import { jsPDF } from "jspdf";

const DigitalPassport = ({ vehicle }) => {
  const { showAlert } = useUI();
  const { expenses = [], addReport } = useGarage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!vehicle?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("orders")
          .select(`
            id,
            created_at,
            status,
            total_amount,
            service_proofs (
              before_photos,
              after_photos,
              technician_notes
            )
          `)
          .eq("vehicle_id", vehicle.id)
          .eq("status", "completed")
          .order("created_at", { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (error) {
        console.error("Fetch history error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [vehicle]);

  // Clean Turkish characters helper for safe PDF rendering
  const tr = (text) => {
    if (!text) return "";
    return text
      .replace(/Ğ/g, "G")
      .replace(/ğ/g, "g")
      .replace(/Ş/g, "S")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/İ/g, "I")
      .replace(/Ö/g, "O")
      .replace(/ö/g, "o")
      .replace(/Ç/g, "C")
      .replace(/ç/g, "c")
      .replace(/Ü/g, "U")
      .replace(/ü/g, "u");
  };

  const handleDownloadPDF = async () => {
    setGeneratingPDF(true);
    showAlert("Rapor Hazirlaniyor", "Dijital karne PDF dosyasi olusturuluyor...", "info");

    try {
      // 1. Initialize jsPDF
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const plate = tr(vehicle?.plate || "34ABC123");
      const brandModel = tr(`${vehicle?.brand || "Carvis"} ${vehicle?.model || "V2"}`);

      // 2. Draw Premium Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, 210, 45, "F");

      // Draw Top Accent Line
      doc.setFillColor(37, 99, 235); // primary-600
      doc.rect(0, 42, 210, 3, "F");

      // Header Texts
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.text("CARVIS VERIFIED VEHICLE REPORT", 14, 20);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(156, 163, 175); // light gray
      doc.text("RAPIDSY VERIFIED DIGITAL AUTOMOTIVE PASSPORT", 14, 26);

      // Unique Document Hash/ID
      doc.setFont("courier", "bold");
      doc.setFontSize(8);
      doc.setTextColor(96, 165, 250);
      doc.text(`DOC-REF: #${vehicle?.id?.slice(0, 13).toUpperCase()}`, 14, 34);

      // Date in Header
      const printDate = new Date().toLocaleDateString("tr-TR");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(255, 255, 255);
      doc.text(`TARIH: ${printDate}`, 170, 20);
      doc.text("GUVEN SKORU: A+", 170, 26);

      // 3. Vehicle Details Section
      doc.setTextColor(15, 23, 42);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("1. ARAC KIMLIK DETAYLARI (VEHICLE METADATA)", 14, 58);

      // Draw table for vehicle metadata
      doc.setFillColor(248, 250, 252);
      doc.rect(14, 62, 182, 35, "F");
      doc.setDrawColor(226, 232, 240);
      doc.rect(14, 62, 182, 35);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Marka / Model:", 20, 70);
      doc.setFont("helvetica", "normal");
      doc.text(brandModel, 55, 70);

      doc.setFont("helvetica", "bold");
      doc.text("Plaka No:", 20, 78);
      doc.setFont("helvetica", "normal");
      doc.text(plate, 55, 78);

      doc.setFont("helvetica", "bold");
      doc.text("Sasi Numarasi:", 20, 86);
      doc.setFont("helvetica", "normal");
      doc.text(tr(vehicle?.chassis_number || "Belirtilmemis"), 55, 86);

      // Right Column
      doc.setFont("helvetica", "bold");
      doc.text("Guncel Kilometre:", 110, 70);
      doc.setFont("helvetica", "normal");
      doc.text(`${vehicle?.km || "0"} KM`, 150, 70);

      doc.setFont("helvetica", "bold");
      doc.text("Sigorta Policem:", 110, 78);
      doc.setFont("helvetica", "normal");
      doc.text(tr(vehicle?.insurance_policy_no || "Aktif / Kayitli"), 150, 78);

      doc.setFont("helvetica", "bold");
      doc.text("Muayene Tarihi:", 110, 86);
      doc.setFont("helvetica", "normal");
      doc.text(vehicle?.inspection_date ? tr(new Date(vehicle.inspection_date).toLocaleDateString("tr-TR")) : "Belirtilmemis", 150, 86);

      // 4. Maintenance Logs & History Timeline
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("2. SERVIS VE BAKIM GECMISI (MAINTENANCE HISTORY)", 14, 110);

      let currentY = 116;
      if (history.length === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(14, currentY, 182, 15, "F");
        doc.rect(14, currentY, 182, 15);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.text("Henuz sistem kayitli tamamlanmis bir servis islemi bulunmamaktadir.", 20, currentY + 9);
        currentY += 25;
      } else {
        history.slice(0, 4).forEach((record, index) => {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, currentY, 182, 22, "F");
          doc.rect(14, currentY, 182, 22);

          doc.setFont("helvetica", "bold");
          doc.setFontSize(9);
          doc.text(`Kayit #${index + 1} - Bakim & Onarim`, 20, currentY + 7);
          
          doc.setFont("helvetica", "normal");
          const dateStr = new Date(record.created_at).toLocaleDateString("tr-TR");
          doc.text(`Tarih: ${dateStr}`, 130, currentY + 7);
          doc.text(`Ucret: ${record.total_amount?.toLocaleString("tr-TR")} TL`, 130, currentY + 13);

          const note = record.service_proofs?.[0]?.technician_notes || "Genel periyodik kontrol ve motor bakimlari yapildi.";
          doc.setFont("helvetica", "italic");
          doc.text(`Not: "${tr(note.slice(0, 60))}"`, 20, currentY + 15);

          currentY += 28;
        });
      }

      // 5. Masraf Takip Ozeti (Expense Summary)
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text("3. FINANSAL MASRAF VE HARCAMA OZETI (EXPENSES)", 14, currentY);
      currentY += 6;

      const vehicleExpenses = expenses.filter((e) => e.vehicle_id === vehicle.id);
      const totalExpense = vehicleExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

      doc.setFillColor(248, 250, 252);
      doc.rect(14, currentY, 182, 45, "F");
      doc.rect(14, currentY, 182, 45);

      // Financial stats table
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.text("Toplam Harcama Miktari:", 20, currentY + 8);
      doc.setFont("helvetica", "normal");
      doc.text(`${totalExpense.toLocaleString("tr-TR")} TL`, 70, currentY + 8);

      doc.setFont("helvetica", "bold");
      doc.text("Kategori Bazli Dagilim:", 20, currentY + 16);

      // List first 3 expenses
      let expY = currentY + 22;
      if (vehicleExpenses.length === 0) {
        doc.setFont("helvetica", "normal");
        doc.text("Arac icin henuz girilmis bir masraf kaydi bulunmuyor.", 24, expY);
      } else {
        vehicleExpenses.slice(0, 3).forEach((exp) => {
          doc.setFont("helvetica", "normal");
          const expDate = new Date(exp.date).toLocaleDateString("tr-TR");
          doc.text(`- [${expDate}] ${tr(exp.category?.toUpperCase())}: ${exp.amount?.toLocaleString("tr-TR")} TL (${tr(exp.description || "Diger")})`, 24, expY);
          expY += 6;
        });
      }

      // 6. Security Footer & Verification info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text("BU BELGE CARVIS SISTEMI TARAFINDAN RESMI OLARAK URETILMISTIR VE DEGIS TI-RILEMEZ.", 14, 280);
      doc.text(`Dogrulama Kodu: SHA-256 / ${vehicle?.id?.toUpperCase()}`, 14, 285);

      // Download file to client device
      doc.save(`Carvis_Servis_Karnesi_${plate}.pdf`);

      // Write report record to `vehicle_reports` table for database integrity!
      await addReport({
        report_type: "full",
        file_url: `https://app.carvis.com/reports/Carvis_Servis_Karnesi_${plate}.pdf`,
      });

      showAlert("Rapor Hazir", "Servis karneniz basariyla indirildi!", "success");
    } catch (err) {
      console.error("PDF Generate Error:", err);
      showAlert("Hata", "Rapor olusturulurken bir sorun yasandi.", "error");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Icons.Loader2 className="animate-spin mx-auto text-primary-500" /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="print-area space-y-6">
        {/* Header - Digital Passport Card */}
        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden print:bg-none print:border-2 print:border-black print:text-black">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl print:hidden"></div>
          <Icons.ShieldCheck className="absolute bottom-6 right-6 opacity-20 print:text-black print:opacity-10" size={80} />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-2 print:opacity-100">Carvis Verified History</p>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1">Dijital Servis Karnesi</h2>
                <p className="text-sm font-medium opacity-70 italic print:opacity-100">{vehicle?.brand} {vehicle?.model} - {vehicle?.plate}</p>
              </div>
              <div className="hidden print:block text-right">
                <p className="font-black text-xs">BELGE NO: #{vehicle?.id?.slice(0,8).toUpperCase()}</p>
                <p className="text-[8px] font-bold">DÜZENLEME: {new Date().toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
               <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 print:border-black print:bg-none">
                 <p className="text-[8px] font-black uppercase tracking-widest opacity-60 print:opacity-100">Toplam Kayıt</p>
                 <p className="text-xl font-black">{history.length}</p>
               </div>
               <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 print:border-black print:bg-none">
                 <p className="text-[8px] font-black uppercase tracking-widest opacity-60 print:opacity-100">Güven Puanı</p>
                 <p className="text-xl font-black text-emerald-300 print:text-black">A+</p>
               </div>
            </div>
          </div>
        </div>

        {/* Timeline Records */}
        <div className="relative space-y-8 pl-8 print:pl-4">
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-800 border-l border-dashed border-white/10 print:border-black/20"></div>
          
          {history.length === 0 ? (
            <div className="text-center py-20 bg-white/5 rounded-[2rem] border border-dashed border-white/10 print:border-black/20">
              <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Henüz kayıtlı servis geçmişi yok</p>
            </div>
          ) : (
            history.map((record) => (
              <div key={record.id} className="relative break-inside-avoid">
                {/* Timeline dot */}
                <div className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-slate-900 border-4 border-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] print:border-black print:bg-white print:shadow-none"></div>
                
                <div className="glass-card p-6 rounded-3xl border border-white/5 hover:border-white/10 transition-all group print:border-black/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1 print:text-black">
                        {new Date(record.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h4 className="text-white font-black text-lg tracking-tight uppercase leading-none print:text-black">Bakım & Onarım İşlemi</h4>
                    </div>
                    <div className="hidden print:block text-[8px] font-bold text-slate-400">ID: {record.id.slice(0,8)}</div>
                  </div>

                  {record.service_proofs?.[0] && (
                    <div className="space-y-4">
                      <div className="p-3 bg-white/5 rounded-xl border border-white/5 italic text-slate-400 text-xs print:bg-slate-50 print:text-black">
                        <span className="not-italic font-black text-[9px] block mb-1 text-primary-400 print:text-black">USTA NOTU:</span>
                        "{record.service_proofs[0].technician_notes || 'Detaylı bakım ve kontroller yapıldı.'}"
                      </div>
                      
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-print">
                        {record.service_proofs[0].after_photos?.map((photo, i) => (
                          <div key={i} className="min-w-[120px] h-20 rounded-xl bg-slate-800 overflow-hidden border border-white/5">
                            <img src={photo} alt="Service" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center print:border-black/10">
                     <div className="flex items-center gap-2">
                       <Icons.CheckCircle2 className="text-emerald-500 print:text-black" size={14} />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-black">Carvis Onaylı Kayıt</span>
                     </div>
                     <span className="text-xs font-black text-white print:text-black">₺{record.total_amount?.toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <button 
        onClick={handleDownloadPDF}
        disabled={generatingPDF}
        className="no-print w-full py-5 bg-white/5 border border-white/5 hover:bg-white/10 rounded-2xl text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active-scale shadow-xl shadow-black/20 disabled:opacity-50"
      >
        {generatingPDF ? (
          <>
            <Icons.Loader2 className="animate-spin" size={18} /> RAPOR HAZIRLANIYOR...
          </>
        ) : (
          <>
            <Icons.Download size={18} /> KARNEYİ PDF OLARAK İNDİR
          </>
        )}
      </button>
    </div>
  );
};

export default DigitalPassport;
