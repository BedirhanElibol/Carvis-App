import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Converts a DOM element (Vehicle Passport Modal) into a high-quality PDF document and downloads it.
 */
export async function exportElementToPdf(elementId, fileName = "Carvis_Arac_Pasaportu.pdf") {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error("PDF'e dönüştürülecek alan bulunamadı.");
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution (HD)
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#090d16", // Dark theme background
      logging: false,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(fileName);
    return true;
  } catch (error) {
    console.error("PDF Export error:", error);
    throw error;
  }
}
