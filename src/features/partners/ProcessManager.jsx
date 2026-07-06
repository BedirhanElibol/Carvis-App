import React, { useState, useRef } from "react";
import { Camera, CheckCircle2, ChevronRight, ClipboardList, Clock, Loader2, Lock, Plus, Search, ShieldCheck, Wrench } from "lucide-react";
import { EscrowService } from "../../services/EscrowService";
import { supabase } from "../../supabaseClient";
import { useUI } from "../../context/UIContext";

const ProcessManager = ({ currentStatus, onUpdateStatus, orderId }) => {
  const { showAlert } = useUI();
  const [uploading, setUploading] = useState(false);
  const [technicianNote, setTechnicianNote] = useState("");
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [newApproval, setNewApproval] = useState({ title: "", price: "", description: "" });
  const steps = [
    {
      id: "pending",
      label: "Talep Alındı",
      next: "diagnosing",
      action: "Teşhise Başla",
      icon: ClipboardList,
    },
    {
      id: "diagnosing",
      label: "Teşhis Ediliyor",
      next: "repairing",
      action: "Onarımı Başlat",
      icon: Search,
    },
    {
      id: "repairing",
      label: "Onarılıyor",
      next: "quality_check",
      action: "Kontrole Gönder",
      icon: Wrench,
    },
    {
      id: "quality_check",
      label: "Son Kontrol",
      next: "pending_approval",
      action: "Müşteri Onayına Gönder",
      icon: ShieldCheck,
    },
    {
      id: "pending_approval",
      label: "Onay Bekliyor",
      next: null,
      action: null,
      icon: Lock,
    },
    {
      id: "completed",
      label: "Teslim Edildi",
      next: null,
      action: null,
      icon: CheckCircle2,
    },
  ];

  const currentStep = steps.find((s) => s.id === currentStatus) || steps[0];

  const fileRef = useRef(null);

  const handleNextStep = async () => {
    if (!currentStep.next) return;
    setUploading(true);
    await onUpdateStatus(currentStep.next);
    setUploading(false);
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file && orderId) {
      setUploading(true);
      try {
        const extension = file.name.split(".").pop() || "jpg";
        const filePath = `${orderId}/${Date.now()}.${extension}`;
        const { error: uploadError } = await supabase.storage
          .from("service-proofs")
          .upload(filePath, file, { upsert: false });

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("service-proofs")
          .getPublicUrl(filePath);

        await EscrowService.submitProof(
          orderId,
          [publicUrlData.publicUrl],
          technicianNote || "İşlem başarıyla tamamlandı ve kontroller yapıldı.",
        );
        setTechnicianNote("");
      } catch (error) {
        console.error("Proof upload error:", error);
      } finally {
        setUploading(false);
      }
    }
  };

  const handleRequestApproval = async () => {
    if (!newApproval.title || !newApproval.price) return;
    setUploading(true);
    try {
      const { data: orderData } = await supabase
        .from("orders")
        .select("pending_approval_items")
        .eq("id", orderId)
        .single();

      const items = orderData?.pending_approval_items || [];
      const updatedItems = [
        ...items,
        {
          id: Date.now(),
          ...newApproval,
          status: "pending",
          created_at: new Date().toISOString()
        }
      ];

      const { error } = await supabase
        .from("orders")
        .update({ pending_approval_items: updatedItems })
        .eq("id", orderId);

      if (error) throw error;
      
      setShowApprovalForm(false);
      setNewApproval({ title: "", price: "", description: "" });
      showAlert("Başarılı", "Onay talebi müşteriye gönderildi.", "success");
    } catch (error) {
      console.error("Approval request error:", error);
      showAlert("Hata", "Onay talebi gönderilemedi.", "error");
    } finally {
      setUploading(false);
    }
  };

  if (currentStatus === "pending_approval") {
    return (
      <div className="bg-primary-500/10 border border-primary-500/20 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-primary-400 group">
        <div className="w-16 h-16 rounded-3xl bg-primary-950 flex items-center justify-center border border-primary-500/20 shadow-2xl">
          <Clock size={32} className="animate-pulse" />
        </div>
        <div className="text-center">
           <span className="font-black uppercase text-[10px] tracking-[0.3em] font-sans block mb-1">
             İŞLEM TAMAMLANDI - ONAY BEKLENİYOR
           </span>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest max-w-[200px]">
             Müşteri onayı verdiğinde ödeme serbest bırakılacak.
           </p>
        </div>
      </div>
    );
  }

  if (currentStatus === "completed") {
    return (
      <div className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[2rem] flex flex-col items-center justify-center gap-4 text-teal-400 group">
        <div className="w-16 h-16 rounded-3xl bg-emerald-950 flex items-center justify-center border border-emerald-500/20 shadow-2xl">
          <CheckCircle2 size={32} />
        </div>
        <div className="text-center">
           <span className="font-black uppercase text-[10px] tracking-[0.3em] font-sans block mb-1">
             HAKEDİŞ SERBEST BIRAKILDI
           </span>
           <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
             Tutar bakiyenize başarıyla eklendi.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900/50 border border-black/10 dark:border-white/10 p-6 rounded-[2rem] backdrop-blur-3xl">
      <div className="flex justify-between items-start mb-6">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-center text-primary-400">
            {(() => {
              const Icon = currentStep.icon;
              return <Icon size={24} />;
            })()}
          </div>
          <div>
            <p className="text-[9px] uppercase tracking-[0.25em] text-slate-500 font-black mb-1 font-sans">
              ŞU ANKİ AŞAMA
            </p>
            <h4 className="text-slate-900 dark:text-white font-black text-lg tracking-tight uppercase leading-none font-sans">
              {currentStep.label}
            </h4>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5 px-2 py-1 bg-primary-500/10 rounded-lg border border-primary-500/20 mb-2">
            <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span>
            <span className="text-[8px] font-black text-primary-400 font-sans">
              CANLI
            </span>
          </div>
        </div>
      </div>

      <div className="mb-6 space-y-2">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Teknik Not / Açıklama</label>
        <textarea 
          value={technicianNote}
          onChange={(e) => setTechnicianNote(e.target.value)}
          placeholder="Yapılan işlemler hakkında kısa bir not bırakın..."
          className="w-full bg-slate-50 dark:bg-slate-950/50 border border-black/5 dark:border-white/5 rounded-2xl p-4 text-xs text-slate-900 dark:text-white font-bold outline-none focus:border-primary-500/50 transition-all min-h-[80px]"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-2 py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 border border-black/5 dark:border-white/5 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white text-[10px] font-black uppercase tracking-widest transition-all active-scale font-sans"
        >
          <Camera size={20} />
          FOTOĞRAF EKLE
        </button>
        <input aria-label="Fotoğraf Ekle"
          type="file"
          ref={fileRef}
          onChange={handlePhotoUpload}
          accept="image/*"
          capture="environment"
          className="hidden"
        />
        <button
          onClick={handleNextStep}
          disabled={uploading}
          className="flex flex-col items-center justify-center gap-2 py-4 bg-gradient-to-br from-primary-600 to-primary-600 hover:from-primary-500 hover:to-primary-500 text-slate-900 dark:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-primary-900/40 active-scale disabled:opacity-50 font-sans"
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <ChevronRight size={20} />
              {currentStep.action}
            </>
          )}
        </button>
      </div>

      {/* Live Approval Section */}
      <div className="mt-6 pt-6 border-t border-black/5 dark:border-white/5">
        {!showApprovalForm ? (
          <button 
            onClick={() => setShowApprovalForm(true)}
            className="w-full py-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-[10px] font-black uppercase tracking-widest hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} /> EK İŞLEM/PARÇA ONAYI İSTE
          </button>
        ) : (
          <div className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-amber-500/20 space-y-4 animate-in fade-in zoom-in-95">
            <h5 className="text-amber-500 text-[10px] font-black uppercase tracking-widest">Yeni Onay Talebi</h5>
            <input 
              placeholder="İşlem/Parça Adı"
              value={newApproval.title}
              onChange={e => setNewApproval({...newApproval, title: e.target.value})}
              className="w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
            />
            <div className="grid grid-cols-2 gap-2">
              <input 
                type="number"
                placeholder="Fiyat (TL)"
                value={newApproval.price}
                onChange={e => setNewApproval({...newApproval, price: e.target.value})}
                className="w-full bg-white dark:bg-slate-900 border border-black/5 dark:border-white/5 rounded-xl p-3 text-xs text-slate-900 dark:text-white"
              />
              <button 
                onClick={handleRequestApproval}
                disabled={uploading}
                className="bg-amber-600 text-slate-900 dark:text-white rounded-xl font-black text-[10px] uppercase tracking-widest"
              >
                GÖNDER
              </button>
            </div>
            <button 
              onClick={() => setShowApprovalForm(false)}
              className="w-full text-slate-500 text-[8px] font-black uppercase tracking-widest"
            >
              İPTAL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProcessManager;
