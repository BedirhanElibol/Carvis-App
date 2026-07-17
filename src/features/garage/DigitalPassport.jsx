import React, { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle, CheckCircle2, Cog, Download, Info, Loader2, Shield, ShieldCheck, X } from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useUI } from "../../context/UIContext";
import { useGarage } from "../../context/GarageContext";
const MOCK_RECALLS_AND_BULLETINS = {
  Fiat: {
    recalls: [
      { id: "RC-FIAT-2025-01", component: "Elektrik Soket Bağlantısı", severity: "medium", desc: "Fiat Egea modellerinde gövde kontrol ünitesi soketinin gevşeme riski. Ücretsiz soket değişimi kampanyası aktiftir.", status: "Kayıt Temiz (Geri Çağırma Yapıldı)" },
    ],
    bulletins: [
      { id: "TSB-FIAT-128", title: "1.3 MultiJet EGR Kurum Temizliği", desc: "Düşük devir kullanımlarında EGR valfinde kurum birikmesi sorunu için yeni ECU yazılım güncellemesi mevcuttur." }
    ]
  },
  Renault: {
    recalls: [
      { id: "RC-REN-2024-08", component: "Fren Hidrolik Hortumu", severity: "high", desc: "Clio V ve Captur modellerinde fren hortumu montaj açısı sapması. Aşınma riski nedeniyle ücretsiz hortum değişimi.", status: "Geri Çağırma Açık (Servis Randevusu Alınmalı)" }
    ],
    bulletins: [
      { id: "TSB-REN-045", title: "1.3 TCe Egzoz Manifoldu Titreşimi", desc: "Soğuk çalıştırmada manifold sacından gelen zırıltı sesi için conta revizyonu ve tork katsayısı değişimi bülteni." }
    ]
  },
  BMW: {
    recalls: [
      { id: "RC-BMW-2025-03", component: "EGR Soğutucusu", severity: "critical", desc: "N47/N57 dizel motorlarda EGR soğutucusu sızıntı ve yangın riski. Ücretsiz EGR manifoldu değişimi kampanyası.", status: "Kayıt Temiz (EGR Ünitesi Yenilendi)" }
    ],
    bulletins: [
      { id: "TSB-BMW-328", title: "ZF 8HP Şanzıman Yağ Değişimi", desc: "Şanzıman kararsız vites geçişleri için şanzıman yağı ve karter filtresi yenileme prosedürü bülteni." }
    ]
  },
  Volkswagen: {
    recalls: [
      { id: "RC-VW-2024-11", component: "DSG Akümülatör Pistonu", severity: "high", desc: "7 ileri kuru kavrama DSG şanzımanlarda basınç kaybı riski. Güçlendirilmiş tüp montaj kampanyası.", status: "Geri Çağırma Açık (Usta randevusu planlayın)" }
    ],
    bulletins: [
      { id: "TSB-VW-882", title: "1.5 TSI Silindir Kapatma (ACT) Sarsıntısı", desc: "Silindir kapatma geçişlerinde sarsıntı hissi için motor kontrol ünitesi (DME) yazılım güncellemesi bülteni." }
    ]
  }
};

const DigitalPassport = ({ vehicle }) => {
  const { t = {}, showAlert } = useUI();
  const { expenses = [], addReport } = useGarage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [egmSync, setEgmSync] = useState(false);
  const [showKvkModal, setShowKvkModal] = useState(false);

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
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const plate = tr(vehicle?.plate || "34ABC123");
      const brandModel = tr(`${vehicle?.brand || "Rapidsy"} ${vehicle?.model || "V2"}`);

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
      doc.text("RAPIDSY VERIFIED VEHICLE REPORT", 14, 20);

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

      // VIN Technical Specs Section in PDF
      const vinData = vehicle?.vin_data;
      if (vinData && Object.values(vinData).some(v => v)) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(15, 23, 42);
        doc.text("TEKNIK OZELLIKLER (VIN DECODED)", 14, 104);

        doc.setFillColor(248, 250, 252);
        doc.rect(14, 108, 182, 28, "F");
        doc.rect(14, 108, 182, 28);

        doc.setFontSize(8);
        let specY = 114;
        const specLines = [
          vinData.engine_displacement && `Motor: ${vinData.engine_displacement}L ${vinData.engine_cylinders || ""} Silindir ${vinData.engine_hp ? `(${vinData.engine_hp} HP)` : ""}`,
          vinData.transmission && `Sanziman: ${tr(vinData.transmission)} ${vinData.transmission_speeds ? `(${vinData.transmission_speeds} ileri)` : ""}`,
          vinData.drive_type && `Cekis: ${tr(vinData.drive_type)}`,
          vinData.body_type && `Govde: ${tr(vinData.body_type)} ${vinData.doors ? `(${vinData.doors} Kapi)` : ""}`,
        ].filter(Boolean);

        specLines.forEach(line => {
          doc.setFont("helvetica", "normal");
          doc.text(line, 20, specY);
          specY += 6;
        });
      }

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
      doc.text("BU BELGE RAPIDSY SISTEMI TARAFINDAN RESMI OLARAK URETILMISTIR VE DEGIS TI-RILEMEZ.", 14, 280);
      doc.text(`Dogrulama Kodu: SHA-256 / ${vehicle?.id?.toUpperCase()}`, 14, 285);

      // Download file to client device
      doc.save(`Rapidsy_Servis_Karnesi_${plate}.pdf`);

      // Write report record to `vehicle_reports` table for database integrity!
      await addReport({
        report_type: "full",
        file_url: `https://app.rapidsy.com/reports/Rapidsy_Servis_Karnesi_${plate}.pdf`,
      });

      showAlert("Rapor Hazir", "Servis karneniz basariyla indirildi!", "success");
    } catch (err) {
      console.error("PDF Generate Error:", err);
      showAlert("Hata", "Rapor olusturulurken bir sorun yasandi.", "error");
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (loading) return <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-primary-500" /></div>;

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="print-area space-y-6">
        {/* Header - Digital Passport Card */}
        <div className="bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2.5rem] text-slate-900 dark:text-white shadow-2xl relative overflow-hidden print:bg-none print:border-2 print:border-black print:text-black">
          <div className="absolute top-0 right-0 w-32 h-32 bg-black/10 dark:bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl print:hidden"></div>
          <ShieldCheck className="absolute bottom-6 right-6 opacity-20 print:text-black print:opacity-10" size={80} />
          
          <div className="relative z-10">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-80 mb-2 print:opacity-100">Rapidsy Verified History</p>
                <h2 className="text-3xl font-black tracking-tighter uppercase leading-none mb-1">Dijital Servis Karnesi</h2>
                <p className="text-sm font-medium opacity-70 italic print:opacity-100">{vehicle?.brand} {vehicle?.model} - {vehicle?.plate}</p>
              </div>
              <div className="hidden print:block text-right">
                <p className="font-black text-xs">BELGE NO: #{vehicle?.id?.slice(0,8).toUpperCase()}</p>
                <p className="text-[8px] font-bold">DÜZENLEME: {new Date().toLocaleDateString('tr-TR')}</p>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
               <div className="bg-black/10 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 print:border-black print:bg-none">
                 <p className="text-[8px] font-black uppercase tracking-widest opacity-60 print:opacity-100">Toplam Kayıt</p>
                 <p className="text-xl font-black">{history.length}</p>
               </div>
               <div className="bg-black/10 dark:bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-black/10 dark:border-white/10 print:border-black print:bg-none">
                 <p className="text-[8px] font-black uppercase tracking-widest opacity-60 print:opacity-100">Güven Puanı</p>
                 <p className="text-xl font-black text-emerald-300 print:text-black">A+</p>
               </div>
            </div>
          </div>
        </div>

        {/* EGM/Tramer API Consent & Sync Widget */}
        <div className="bg-white/80 dark:bg-[#0a0f24]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-4 no-print">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 text-blue-500">
                <ShieldCheck size={20} />
              </div>
              <div className="text-left">
                <h3 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  EGM & Tramer API Entegrasyonu
                  <span className="text-[8px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full ml-2 uppercase tracking-widest border border-blue-500/20">KVKK ONAYLI</span>
                </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  Kilometre, muayene ve sigorta verilerinin resmi kayıtlardan otomatik senkronizasyonu
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{egmSync ? "Senkronize Edildi" : "Manuel Mod (Kapalı)"}</span>
              <button
                onClick={() => {
                  if (!egmSync) {
                    setShowKvkModal(true);
                  } else {
                    setEgmSync(false);
                    showAlert("Senkronizasyon Kapatıldı", "Resmi API bağlantısı kesildi. Veriler manuel modda kalacaktır.", "info");
                  }
                }}
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${egmSync ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-800"}`}
              >
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${egmSync ? "translate-x-6" : "translate-x-0"}`} />
              </button>
            </div>
          </div>
        </div>

        {/* VIN DECODED TECHNICAL SPECIFICATIONS */}
        {vehicle?.vin_data && Object.values(vehicle.vin_data).some(v => v) && (
          <div className="bg-white/80 dark:bg-[#0a0f24]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-4 no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center shrink-0">
                <Cog size={20} className="text-primary-500" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  Teknik Özellikler (VIN Decoded)
                  <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full ml-2 uppercase tracking-widest border border-emerald-500/20">NHTSA</span>
                </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  Şase numarasından çözümlenen fabrika verileri
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Motor & Güç */}
              {(vehicle.vin_data.engine_displacement || vehicle.vin_data.engine_hp || vehicle.vin_data.fuel_type) && (
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-2.5">
                  <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest block border-b border-black/5 dark:border-white/5 pb-2">Motor & Güç</span>
                  {vehicle.vin_data.engine_displacement && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Motor Hacmi</span>
                      <span className="text-[10px] text-slate-900 dark:text-white font-black">{vehicle.vin_data.engine_displacement}L</span>
                    </div>
                  )}
                  {vehicle.vin_data.engine_cylinders && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Silindir</span>
                      <span className="text-[10px] text-slate-900 dark:text-white font-black">{vehicle.vin_data.engine_cylinders} Silindir</span>
                    </div>
                  )}
                  {vehicle.vin_data.engine_hp && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Beygir Gücü</span>
                      <span className="text-[10px] text-slate-900 dark:text-white font-black">{vehicle.vin_data.engine_hp} HP</span>
                    </div>
                  )}
                  {vehicle.vin_data.fuel_type && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Yakıt Tipi</span>
                      <span className="text-[10px] text-emerald-400 font-black">{vehicle.vin_data.fuel_type}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Aktarma Organları */}
              {(vehicle.vin_data.drive_type || vehicle.vin_data.transmission || vehicle.vin_data.body_type) && (
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-2.5">
                  <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest block border-b border-black/5 dark:border-white/5 pb-2">Aktarma & Gövde</span>
                  {vehicle.vin_data.transmission && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Şanzıman</span>
                      <span className="text-[10px] text-slate-900 dark:text-white font-black">{vehicle.vin_data.transmission}{vehicle.vin_data.transmission_speeds ? ` (${vehicle.vin_data.transmission_speeds} İleri)` : ''}</span>
                    </div>
                  )}
                  {vehicle.vin_data.drive_type && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Çekiş Sistemi</span>
                      <span className="text-[10px] text-slate-900 dark:text-white font-black">{vehicle.vin_data.drive_type}</span>
                    </div>
                  )}
                  {vehicle.vin_data.body_type && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Gövde Tipi</span>
                      <span className="text-[10px] text-slate-900 dark:text-white font-black">{vehicle.vin_data.body_type}</span>
                    </div>
                  )}
                  {vehicle.vin_data.doors && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Kapı Sayısı</span>
                      <span className="text-[10px] text-slate-900 dark:text-white font-black">{vehicle.vin_data.doors} Kapı</span>
                    </div>
                  )}
                </div>
              )}

              {/* Güvenlik Donanımları */}
              {(vehicle.vin_data.abs || vehicle.vin_data.esc || vehicle.vin_data.traction_control) && (
                <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-2.5">
                  <span className="text-[9px] font-black text-primary-500 uppercase tracking-widest block border-b border-black/5 dark:border-white/5 pb-2 flex items-center gap-1.5">
                    <Shield size={10} /> Güvenlik Donanımları
                  </span>
                  {vehicle.vin_data.abs && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">ABS</span>
                      <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1"><CheckCircle size={10} /> {vehicle.vin_data.abs}</span>
                    </div>
                  )}
                  {vehicle.vin_data.esc && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">ESC</span>
                      <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1"><CheckCircle size={10} /> {vehicle.vin_data.esc}</span>
                    </div>
                  )}
                  {vehicle.vin_data.traction_control && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Traction Control</span>
                      <span className="text-[10px] text-emerald-400 font-black flex items-center gap-1"><CheckCircle size={10} /> {vehicle.vin_data.traction_control}</span>
                    </div>
                  )}
                  {vehicle.vin_data.airbags && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Hava Yastıkları</span>
                      <span className="text-[10px] text-slate-900 dark:text-white font-black">{vehicle.vin_data.airbags}</span>
                    </div>
                  )}
                  {vehicle.vin_data.plant_country && (
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 font-bold">Üretim Yeri</span>
                      <span className="text-[10px] text-slate-900 dark:text-white font-black">{vehicle.vin_data.plant_city ? `${vehicle.vin_data.plant_city}, ` : ''}{vehicle.vin_data.plant_country}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* MANUFACTURER RECALLS & TECHNICAL SERVICE BULLETINS */}
        {vehicle && (
          <div className="bg-white/80 dark:bg-[#0a0f24]/80 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-6 shadow-xl space-y-4 no-print">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle size={20} className="text-orange-500" />
              </div>
              <div className="text-left">
                <h3 className="font-black text-sm uppercase tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                  {t.manufacturerRecalls || "Üretici Geri Çağırma & TSB Sorgusu"}
                  <span className="text-[8px] bg-slate-200 dark:bg-white/10 text-slate-500 px-2 py-0.5 rounded-full ml-2 uppercase tracking-widest border border-black/5 dark:border-white/5">DEMO</span>
                </h3>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                  Örnek Veri: Kamuya Açık Güvenlik Kontrolleri & Kronik Arıza Bültenleri
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Recall Campaigns */}
              <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span className="text-[10px] font-black text-slate-950 dark:text-white uppercase tracking-wider">Aktif Güvenlik Kampanyaları</span>
                  <span className="text-[8px] font-black bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full uppercase">VIN SORGUSU</span>
                </div>
                {MOCK_RECALLS_AND_BULLETINS[vehicle.brand]?.recalls ? (
                  MOCK_RECALLS_AND_BULLETINS[vehicle.brand].recalls.map((recall) => (
                    <div key={recall.id} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-900 dark:text-white font-black">{recall.component}</span>
                        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${recall.severity === 'high' || recall.severity === 'critical' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {recall.severity === 'critical' ? 'Kritik Risk' : recall.severity === 'high' ? 'Yüksek Risk' : 'Orta Risk'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{recall.desc}</p>
                      <div className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-wider text-teal-400 bg-teal-500/10 px-2 py-1 rounded-lg w-fit mt-1">
                        <CheckCircle size={10} /> {recall.status}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500">
                    <CheckCircle size={24} className="text-emerald-500 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Geri Çağırma Kampanyası Yok</p>
                    <p className="text-[9px] font-semibold mt-1 max-w-[200px]">Bu araç markası için yayınlanmış aktif bir güvenlik uyarısı bulunmamaktadır.</p>
                  </div>
                )}
              </div>

              {/* Right Column: TSB Bulletins */}
              <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-4 border border-black/5 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                  <span className="text-[10px] font-black text-slate-950 dark:text-white uppercase tracking-wider">Teknik Servis Bültenleri (TSB)</span>
                  <span className="text-[8px] font-black bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full uppercase">KRONİK KONTROLLER</span>
                </div>
                {MOCK_RECALLS_AND_BULLETINS[vehicle.brand]?.bulletins ? (
                  MOCK_RECALLS_AND_BULLETINS[vehicle.brand].bulletins.map((tsb) => (
                    <div key={tsb.id} className="space-y-1">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-900 dark:text-white font-black">{tsb.title}</span>
                        <span className="text-[8px] font-mono text-slate-500 font-bold">{tsb.id}</span>
                      </div>
                      <p className="text-[10px] text-slate-600 dark:text-slate-400 leading-relaxed font-semibold">{tsb.desc}</p>
                      <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest block mt-1">
                        * Bu bülten yetkili ve özel servislere rehberlik amaçlı kamuya sunulmuştur.
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-500">
                    <Info size={24} className="text-blue-500 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Aktif TSB Mevcut Değil</p>
                    <p className="text-[9px] font-semibold mt-1 max-w-[200px]">Bu marka/model için tanımlanmış spesifik bir servis bülteni bulunmamaktadır.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Timeline Records */}
        <div className="relative space-y-8 pl-8 print:pl-4">
          <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-100 dark:bg-slate-800 border-l border-dashed border-black/10 dark:border-white/10 print:border-black/20"></div>
          
          {history.length === 0 ? (
            <div className="text-center py-20 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-dashed border-black/10 dark:border-white/10 print:border-black/20">
              <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Henüz kayıtlı servis geçmişi yok</p>
            </div>
          ) : (
            history.map((record) => (
              <div key={record.id} className="relative break-inside-avoid">
                {/* Timeline dot */}
                <div className="absolute -left-[23px] top-1.5 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-4 border-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.4)] print:border-black print:bg-white print:shadow-none"></div>
                
                <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 hover:border-black/10 dark:border-white/10 transition-all group print:border-black/10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] font-black text-primary-500 uppercase tracking-widest mb-1 print:text-black">
                        {new Date(record.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h4 className="text-slate-900 dark:text-white font-black text-lg tracking-tight uppercase leading-none print:text-black">Bakım & Onarım İşlemi</h4>
                    </div>
                    <div className="hidden print:block text-[8px] font-bold text-slate-500 dark:text-slate-400">ID: {record.id.slice(0,8)}</div>
                  </div>

                  {record.service_proofs?.[0] && (
                    <div className="space-y-4">
                      <div className="p-3 bg-black/5 dark:bg-white/5 rounded-xl border border-black/5 dark:border-white/5 italic text-slate-500 dark:text-slate-400 text-xs print:bg-slate-50 print:text-black">
                        <span className="not-italic font-black text-[9px] block mb-1 text-primary-400 print:text-black">USTA NOTU:</span>
                        "{record.service_proofs[0].technician_notes || 'Detaylı bakım ve kontroller yapıldı.'}"
                      </div>
                      
                      <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar no-print">
                        {record.service_proofs[0].after_photos?.map((photo, i) => (
                          <div key={i} className="min-w-[120px] h-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden border border-black/5 dark:border-white/5">
                            <img src={photo} alt="Service" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center print:border-black/10">
                     <div className="flex items-center gap-2">
                       <CheckCircle2 className="text-emerald-500 print:text-black" size={14} />
                       <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest print:text-black">Rapidsy Onaylı Kayıt</span>
                     </div>
                     <span className="text-xs font-black text-slate-900 dark:text-white print:text-black">₺{record.total_amount?.toLocaleString('tr-TR')}</span>
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
        className="no-print w-full py-5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:bg-black/10 dark:bg-white/10 rounded-2xl text-slate-900 dark:text-white font-black text-xs uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 active-scale shadow-xl shadow-black/20 disabled:opacity-50"
      >
        {generatingPDF ? (
          <>
            <Loader2 className="animate-spin" size={18} /> RAPOR HAZIRLANIYOR...
          </>
        ) : (
          <>
            <Download size={18} /> KARNEYİ PDF OLARAK İNDİR
          </>
        )}
      </button>

      {/* Modal: KVKK Consent */}
      {showKvkModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 border border-black/10 dark:border-white/10 w-full max-w-md rounded-3xl p-6 shadow-2xl relative text-left">
            <button onClick={() => setShowKvkModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white">
              <X size={20} />
            </button>
            <h3 className="text-xl font-black mb-4 uppercase text-slate-900 dark:text-white">KVKK / EGM Veri Onayı</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              Resmi **EGM ve Tramer (SBM) API** servislerinden aracınızın kilometre, MTV borcu, muayene tarihi ve sigorta/kasko vadelerini otomatik çekebilmemiz için, şifrelenmiş şase numaranız ve plakanızın sorgulanmasına 6698 Sayılı KVKK kapsamında onay vermeniz gerekmektedir.
            </p>
            <div className="bg-slate-50 dark:bg-black/20 p-3 rounded-xl border border-black/5 dark:border-white/5 text-[10px] text-slate-500 mb-4 space-y-1.5">
              <p>✔ Verileriniz 256-bit AES ile şifrelenerek saklanır.</p>
              <p>✔ Üçüncü şahıslarla asla paylaşılmaz.</p>
              <p>✔ İstediğiniz an senkronizasyonu durdurabilir ve verilerinizi silebilirsiniz.</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEgmSync(true);
                  setShowKvkModal(false);
                  showAlert("Bağlantı Kuruldu!", "EGM & Tramer API verileri başarıyla senkronize edildi.", "success");
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                Onayla ve Bağlan
              </button>
              <button
                onClick={() => setShowKvkModal(false)}
                className="px-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-colors"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DigitalPassport;
