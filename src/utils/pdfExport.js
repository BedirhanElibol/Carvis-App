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
      logging: false,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById(elementId);
        if (clonedElement) {
          clonedElement.style.maxHeight = "none";
          clonedElement.style.height = "auto";
          clonedElement.style.overflow = "visible";
          clonedElement.style.borderRadius = "0";

          // Expand all scrollable children inside cloned element
          const scrollables = clonedElement.querySelectorAll(".overflow-y-auto, .overflow-x-auto, .overflow-hidden");
          scrollables.forEach((el) => {
            el.style.maxHeight = "none";
            el.style.height = "auto";
            el.style.overflow = "visible";
          });
        }
      },
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
