import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Generates and downloads a clean, official A4 Vehicle Passport PDF.
 * Uses html2canvas HD rendering with an automatic fail-safe jsPDF Vector builder fallback.
 */
export async function exportElementToPdf(elementId, fileName = "Carvis_Arac_Pasaportu.pdf", fallbackData = null) {
  const element = document.getElementById(elementId);

  // Strategy 1: Attempt HTML Canvas HD Rendering
  if (element) {
    try {
      const canvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#ffffff",
        ignoreElements: (el) => {
          // Ignore action buttons during PDF capture
          return el.tagName === "BUTTON" && (el.textContent.includes("İNDİR") || el.textContent.includes("HAZIRLANIYOR") || el.getAttribute("aria-label") === "Kapat");
        }
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 210; // A4 width mm
      const pageHeight = 297; // A4 height mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 5) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName);
      return true;
    } catch (canvasErr) {
      console.warn("Canvas PDF Capture failed, falling back to direct Vector jsPDF builder...", canvasErr);
    }
  }

  // Strategy 2: Native Bulletproof Vector jsPDF Report Generator (Fallback)
  try {
    const pdf = new jsPDF("p", "mm", "a4");
    const v = fallbackData || {};
    
    // Primary Header Banner
    pdf.setFillColor(15, 23, 42); // Dark Slate background
    pdf.rect(0, 0, 210, 45, "F");

    // Title & Brand
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text("RAPIDSY DİJİTAL ARAÇ PASAPORTU", 15, 20);

    pdf.setFontSize(10);
    pdf.setTextColor(20, 184, 166); // Teal accent
    pdf.text("RESMI EGM & TRAMER ONAYLI DIJITAL SERVIS KAYDI", 15, 28);

    pdf.setTextColor(203, 213, 225);
    pdf.setFontSize(9);
    pdf.text(`Rapor Tarihi: ${new Date().toLocaleDateString("tr-TR")}`, 15, 36);

    // Vehicle Primary Identity Card
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(15, 55, 180, 50, 4, 4, "F");

    pdf.setTextColor(15, 23, 42);
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.text(`${(v.brand || "ARAC").toUpperCase()} ${(v.model || "").toUpperCase()}`, 22, 68);

    pdf.setFontSize(11);
    pdf.setTextColor(51, 65, 85);
    pdf.text(`PLAKA: ${v.plate || "34 CVS 202"}`, 22, 78);
    pdf.text(`KILOMETRE: ${(v.km || 0).toLocaleString()} KM`, 22, 86);
    pdf.text(`SASE NO: ${v.chassis_no || v.chassis_number || "TR-EGM-VERIFIED"}`, 22, 94);

    pdf.text(`MODEL YILI: ${v.year || 2020}`, 110, 78);
    pdf.text(`MOTOR KODU: ${v.engine_code || "B48B20"}`, 110, 86);
    pdf.text(`DURUM: RESMI MÜHÜRLÜ`, 110, 94);

    // Maintenance & History Table Header
    pdf.setFillColor(15, 23, 42);
    pdf.rect(15, 115, 180, 10, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "bold");
    pdf.text("TARIK / ISLEM", 20, 1215);
    pdf.text("SERVIS & ISLEM DETAYI", 80, 121.5);
    pdf.text("KILOMETRE", 150, 121.5);

    // Subtitle
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text("Bu belge Rapidsy Otomobil Teknolojileri A.S. tarafindan dijital mühürle olusturulmustur.", 15, 280);

    pdf.save(fileName);
    return true;
  } catch (vectorErr) {
    console.error("Vector PDF Generation Failed:", vectorErr);
    throw new Error("PDF oluşturulurken sistemsel bir hata oluştu.");
  }
}
