import React, { useState } from "react";
import { X, CheckCircle2, AlertTriangle, AlertOctagon, Camera, Wrench, ShieldCheck, Zap, ArrowRight, Loader2 } from "lucide-react";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";

/**
 * DigitalInspectionModal (DVI - Digital Vehicle Inspection)
 * Displays mechanic's photo-backed inspection report to customer for explicit 1-click repair approval.
 */
const DigitalInspectionModal = ({ isOpen, inspectionData, onClose, onApproved }) => {
  const { showAlert } = useUI();
  const { currentUser } = useAuth();
  const [approving, setApproving] = useState(false);

  if (!isOpen || !inspectionData) return null;

  const {
    id,
    mechanic_name = "Carvis Yetkili Özel Servis",
    vehicle_info = "Mercedes-Benz SLK-Class (34 CVS 202)",
    items = [
      { part: "Ön Fren Balataları", status: "red", note: "Aşınma sınırı aşılmış, disk sürtme riski yüksek.", cost: 1850, photo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=400&q=80" },
      { part: "Motor Yağı & Filtre", status: "yellow", note: "Yağ ömrü %15 kalmış, periyodik değişim önerilir.", cost: 1200, photo: null },
      { part: "Fren Hidroliği", status: "green", note: "Nem ve kaynama noktası ideal seviyede.", cost: 0, photo: null },
    ],
    total_estimated_cost = 3050,
    created_at = new Date().toLocaleDateString("tr-TR")
  } = inspectionData;

  const handleApproveRepair = async () => {
    setApproving(true);

    try {
      if (currentUser?.id) {
        // Create an order in Supabase for approved repair
        await supabase.from("orders").insert([
          {
            customer_id: currentUser.id,
            total_amount: total_estimated_cost,
            payment_method: "Kredi Kartı / Escrow",
            status: "processing",
            pending_approval_items: items,
            created_at: new Date().toISOString()
          }
        ]);
      }

      showAlert(
        "Onarım Onaylandı!",
        "Ustanız bilgilendirildi ve yedek parça siparişiniz başlatıldı. İşlem durumunu Siparişlerim ekranından takip edebilirsiniz.",
        "success"
      );

      if (onApproved) onApproved();
      onClose();
    } catch (err) {
      console.error("DVI approval error:", err);
      showAlert("Hata", "Onay işlemi tamamlanırken bir hata oluştu.", "error");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] text-slate-900 dark:text-white">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-black/5 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Camera size={24} />
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-teal-400 tracking-widest bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                DVI Fotoğraflı Usta Muayene Raporu
              </span>
              <h3 className="font-black text-lg uppercase tracking-tight mt-1">{mechanic_name}</h3>
              <p className="text-xs font-bold text-slate-500">{vehicle_info} • {created_at}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer border-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Inspection Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.map((item, idx) => {
            const isRed = item.status === "red";
            const isYellow = item.status === "yellow";
            const isGreen = item.status === "green";

            const badgeBg = isRed ? "bg-red-500/10 text-red-500 border-red-500/30" : isYellow ? "bg-amber-500/10 text-amber-500 border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
            const BadgeIcon = isRed ? AlertOctagon : isYellow ? AlertTriangle : CheckCircle2;

            return (
              <div key={idx} className="p-5 rounded-3xl bg-slate-50 dark:bg-white/5 border border-black/5 dark:border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 ${badgeBg}`}>
                      <BadgeIcon size={12} />
                      {isRed ? "ACİL DEĞİŞMELİ" : isYellow ? "YAKINDA DEĞİŞMELİ" : "DURUMU İYİ"}
                    </span>
                    <h4 className="font-black text-sm uppercase">{item.part}</h4>
                  </div>
                  {item.cost > 0 && (
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white">₺{item.cost.toLocaleString()}</span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed italic bg-white dark:bg-slate-950/40 p-3 rounded-2xl border border-black/5 dark:border-white/5">
                  "{item.note}"
                </p>

                {item.photo && (
                  <div className="relative rounded-2xl overflow-hidden border border-black/10 dark:border-white/10 max-h-48">
                    <img src={item.photo} alt={item.part} className="w-full h-48 object-cover" />
                    <span className="absolute bottom-2 left-2 text-[9px] font-black uppercase text-white bg-black/60 px-2 py-0.5 rounded backdrop-blur">
                      📷 Usta Tarafından Çekilen Muayene Fotoğrafı
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Summary & 1-Click Action */}
        <div className="p-6 border-t border-black/5 dark:border-white/10 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">Tahmini Toplam Onarım Tutar</span>
            <span className="text-2xl font-black font-mono text-slate-900 dark:text-white">₺{total_estimated_cost.toLocaleString()}</span>
          </div>

          <div className="flex gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-5 py-3.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-2xl text-xs font-black uppercase tracking-wider cursor-pointer border-none"
            >
              Kapat / Düşüneceğim
            </button>
            <button
              onClick={handleApproveRepair}
              disabled={approving}
              className="px-6 py-3.5 bg-teal-500 hover:bg-emerald-500 text-slate-950 rounded-2xl text-xs font-black uppercase tracking-wider shadow-xl flex items-center justify-center gap-2 cursor-pointer border-none disabled:opacity-50"
            >
              {approving ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
              {approving ? "İŞLENİYOR..." : "ONAYLA VE ONARIMI BAŞLAT"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalInspectionModal;
