
export const generateInvoicePDF = async (order, seller) => {
  const { jsPDF } = await import("jspdf");
  await import("jspdf-autotable");
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(22);
  doc.setTextColor(14, 165, 233); // Primary Color
  doc.text("CARVIS", 14, 20);
  
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("E-Fatura (Bilgi Amacli)", 14, 28);
  
  // Seller Info (Right aligned)
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(seller?.user_metadata?.full_name || "Is Ortamigiz", 140, 20);
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text("Satici ID: " + (seller?.id || "Bilinmiyor").substring(0, 8), 140, 26);
  
  // Invoice Details
  const invoiceNum = `INV-${new Date().getFullYear()}${(new Date().getMonth()+1).toString().padStart(2, '0')}-${Math.floor(Math.random() * 10000)}`;
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text(`Fatura No: ${invoiceNum}`, 14, 45);
  doc.text(`Tarih: ${new Date().toLocaleDateString("tr-TR")}`, 14, 52);
  
  // Customer Info
  doc.text("Musteri:", 140, 45);
  doc.text("ID: " + (order.customer_id || "Bilinmiyor").substring(0, 8), 140, 52);

  // Table
  const tableData = [
    ["1", order.quote_id ? "Servis / Yedek Parca Hizmeti" : "Hizli Tahsilat", "1", `${order.total_amount} TL`, `${order.total_amount} TL`]
  ];

  doc.autoTable({
    startY: 65,
    head: [["Sira", "Aciklama", "Miktar", "Birim Fiyat", "Toplam"]],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [14, 165, 233] },
  });

  // Totals
  const finalY = doc.lastAutoTable.finalY || 65;
  const kdvAmount = (order.total_amount * 0.18).toFixed(2);
  const subTotal = (order.total_amount - kdvAmount).toFixed(2);

  doc.text(`Ara Toplam: ${subTotal} TL`, 140, finalY + 10);
  doc.text(`KDV (%18): ${kdvAmount} TL`, 140, finalY + 18);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Genel Toplam: ${order.total_amount} TL`, 140, finalY + 28);

  // Footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(150, 150, 150);
  doc.text("Bizi tercih ettiginiz icin tesekkur ederiz.", 105, 280, null, null, "center");
  doc.text("Bu belge Carvis uzerinden otomatik olusturulmustur.", 105, 286, null, null, "center");

  doc.save(`${invoiceNum}.pdf`);
};
