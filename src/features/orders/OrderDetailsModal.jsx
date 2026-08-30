import React, { useState, useEffect } from "react";
import { BellRing, Image, ShieldCheck, Truck, X, AlertCircle } from "lucide-react";
import ServiceTimeline from "./ServiceTimeline";
import { supabase } from "../../supabaseClient";
import { useUI } from "../../context/UIContext";
import EscrowPinModal from "../../components/modals/EscrowPinModal";
import DisputeCenterModal from "../disputes/components/DisputeCenterModal";

const OrderDetailsModal = ({ show, onClose, order }) => {
  const { showAlert } = useUI();
  const [localOrder, setLocalOrder] = useState(order);
  const [isReturning, setIsReturning] = useState(false);
  const [showEscrowPin, setShowEscrowPin] = useState(false);
  const [showDisputeModal, setShowDisputeModal] = useState(false);

  useEffect(() => {
    setLocalOrder(order);
  }, [order]);

  const handleReturnRequest = async () => {
    if(!window.confirm("Bu siparişi iptal/iade etmek istediğinize emin misiniz?")) return;
    setIsReturning(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status: 'return_requested' })
        .eq("id", localOrder.id)
        .select()
        .single();
      if (error) throw error;
      setLocalOrder(data);
      showAlert("Başarılı", "İptal/İade talebiniz satıcıya iletildi.", "success");
    } catch (error) {
      console.error("Return request error:", error);
      showAlert("Hata", "İade talebi oluşturulamadı.", "error");
    } finally {
      setIsReturning(false);
    }
  };

  const handleAcceptApproval = async (itemId) => {
    try {
      const item = localOrder.pending_approval_items.find(i => i.id === itemId);
      if (!item) return;

      const updatedItems = localOrder.pending_approval_items.map(i => 
        i.id === itemId ? { ...i, status: 'accepted' } : i
      );

      const newTotal = Number(localOrder.total_amount || 0) + Number(item.price);

      const { data, error } = await supabase
        .from("orders")
        .update({ 
          pending_approval_items: updatedItems,
          total_amount: newTotal
        })
        .eq("id", localOrder.id)
        .select()
        .single();

      if (error) throw error;
      setLocalOrder(data);
      showAlert("Başarılı", "Ek işlem onaylandı ve toplam tutar güncellendi.", "success");
    } catch (error) {
      console.error("Accept approval error:", error);
      showAlert("Hata", "Onay işlemi başarısız oldu.", "error");
    }
  };

  if (!show || !localOrder) return null;

  // Real evidence from DB or Fallback
  const proofs = localOrder.service_proofs?.[0] || {};
  const beforePhotos = proofs.before_photos || [];
  const afterPhotos = proofs.after_photos || [];
  const technicianNotes = proofs.technician_notes || "";

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-lg rounded-xl border border-black/10 dark:border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-lg">Sipariş Detayı</h3>
            <p className="text-xs text-slate-500">
              #{localOrder.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/10 dark:bg-white/10 rounded-full transition text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-6 custom-scrollbar">
          {/* Status Badge */}
          <div className="bg-primary-900/20 border border-primary-500/20 p-4 rounded-2xl flex items-center gap-3">
            <div className="bg-primary-500/20 p-2.5 rounded-xl">
              <ShieldCheck className="text-primary-400" size={24} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">
                DOĞRUDAN PARTNER EŞLEŞMESİ (%0 KOMİSYON)
              </p>
              <p className="text-sm text-slate-900 dark:text-white font-medium">
                Ödeme doğrudan partner dükkanında/konumunda tamamlanır. Carvis komisyon almaz.
              </p>
            </div>
          </div>

          {/* Live Approvals Section (Competitive Advantage) */}
          {localOrder.pending_approval_items?.filter(i => i.status === 'pending').length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-[2rem] space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <BellRing size={18} className="text-amber-500 animate-bounce" />
                <h4 className="text-amber-500 font-black text-xs uppercase tracking-widest">ONAYINIZ BEKLENİYOR</h4>
              </div>
              {localOrder.pending_approval_items.filter(i => i.status === 'pending').map(item => (
                <div key={item.id} className="bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-black/5 dark:border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-slate-900 dark:text-white font-black text-xs uppercase">{item.title}</p>
                    <p className="text-amber-500 font-mono font-bold text-sm">₺{item.price}</p>
                  </div>
                  <button 
                    onClick={() => handleAcceptApproval(item.id)}
                    className="bg-amber-600 hover:bg-amber-500 text-slate-900 dark:text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active-scale"
                  >
                    ONAYLA
                  </button>
                </div>
              ))}
              <p className="text-[9px] text-slate-500 font-medium leading-tight">
                * Ustanız servis sırasında bu ek işlemlerin gerekli olduğunu tespit etti. Onayınız olmadan işleme devam edilmeyecektir.
              </p>
            </div>
          )}

          {/* Timeline */}
          <div className="space-y-4">
            <h4 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest px-1">
              İşlem Akışı
            </h4>
            <ServiceTimeline status={localOrder.status} />
          </div>

          {/* Evidence Photos */}
          <div className="space-y-4">
            <h4 className="text-slate-900 dark:text-white font-black text-xs uppercase tracking-widest px-1">
              Servis Kanıtları
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                  ÖNCE
                </p>
                <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
                  {beforePhotos[0] ? (
                    <img
                      src={beforePhotos[0]}
                      className="w-full h-full object-cover"
                      alt="Before"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Image size={24} />
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
                  SONRA
                </p>
                <div className="h-32 bg-white dark:bg-slate-900 rounded-2xl border border-black/5 dark:border-white/5 overflow-hidden">
                  {afterPhotos[0] ? (
                    <img
                      src={afterPhotos[0]}
                      className="w-full h-full object-cover"
                      alt="After"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-700">
                      <Image size={24} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Technician Notes */}
          <div className="bg-white dark:bg-slate-900/50 p-5 rounded-xl border border-black/5 dark:border-white/5">
            <h4 className="text-primary-400 font-black text-[10px] uppercase tracking-widest mb-2">
              Usta Notları
            </h4>
            <p className="text-sm text-slate-600 dark:text-slate-300 italic leading-relaxed">
              "{technicianNotes || "Henüz not girilmemiş."}"
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="bg-black/5 dark:bg-white/5 p-6 rounded-xl border border-black/5 dark:border-white/5">
             <div className="flex justify-between items-center mb-2">
               <span className="text-xs text-slate-500 uppercase font-black">Sipariş Toplamı</span>
               <span className="text-xl font-mono font-black text-slate-900 dark:text-white">₺{localOrder.total_amount?.toLocaleString('tr-TR')}</span>
             </div>
             <div className="flex justify-between items-center">
               <span className="text-[10px] text-slate-600 uppercase font-bold">Ödeme Durumu</span>
               <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">KARTLA GÜVENLİ</span>
             </div>
             
             {localOrder.status !== 'completed' && localOrder.status !== 'cancelled' && localOrder.status !== 'refunded' && (
               <button 
                 onClick={() => setShowEscrowPin(true)}
                 className="w-full mt-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-white font-black py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-teal-500/20 active-scale transition-all flex items-center justify-center gap-2"
               >
                 <ShieldCheck size={16} /> ÖDEME ONAY ŞİFRESİNİ GÖRÜNTÜLE
               </button>
             )}

             {localOrder.status !== 'completed' && localOrder.status !== 'cancelled' && localOrder.status !== 'refunded' && !localOrder.is_escrow_blocked && (
               <button 
                 onClick={() => setShowDisputeModal(true)}
                 className="w-full mt-2 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-slate-900 transition-all py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
               >
                 <AlertCircle size={14} /> KUSURLU HİZMET BİLDİR / DESTEK AL
               </button>
             )}

             {localOrder.is_escrow_blocked && (
               <div className="w-full mt-2 text-center text-amber-600 dark:text-amber-400 text-[10px] font-black uppercase tracking-widest bg-amber-500/10 py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-amber-500/20">
                 <AlertCircle size={14} /> Ödeme Carvis Güvencesiyle Donduruldu
               </div>
             )}
          </div>

          {/* Tracking & Returns */}
          {(localOrder.quote?.tracking_number || localOrder.status === 'completed' || localOrder.status === 'repairing' || localOrder.status === 'paid' || localOrder.status === 'return_requested') && (
             <div className="bg-slate-100 dark:bg-slate-900/80 p-5 rounded-xl border border-black/5 dark:border-white/5 flex flex-col gap-3">
               {localOrder.quote?.tracking_number && (
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2 text-primary-500">
                     <Truck size={20} />
                     <span className="text-[10px] font-black uppercase tracking-widest">Kargo Takip No:</span>
                   </div>
                   <span className="text-sm font-mono font-bold text-slate-900 dark:text-white bg-black/5 dark:bg-white/5 px-3 py-1 rounded-lg">
                     {localOrder.quote.tracking_number}
                   </span>
                 </div>
               )}
               
               {localOrder.status !== 'return_requested' && localOrder.status !== 'refunded' && localOrder.status !== 'cancelled' && (
                 <button
                   onClick={handleReturnRequest}
                   disabled={isReturning}
                   className="w-full mt-2 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all py-3 rounded-2xl font-black text-xs uppercase tracking-widest disabled:opacity-50"
                 >
                   {isReturning ? "İşleniyor..." : "İPTAL / İADE TALEP ET"}
                 </button>
               )}
               {localOrder.status === 'return_requested' && (
                 <div className="mt-2 text-center text-orange-500 text-[10px] font-black uppercase tracking-widest bg-orange-500/10 py-2 rounded-xl">
                   İade talebiniz inceleniyor...
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
      
      <EscrowPinModal
        isOpen={showEscrowPin}
        onClose={() => setShowEscrowPin(false)}
        amount={localOrder.total_amount}
        providerName={localOrder.seller?.company_name || 'Servis Sağlayıcı'}
        pinCode="482159" 
      />

      <DisputeCenterModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        orderId={localOrder.id}
        customerId={localOrder.customer_id}
        sellerId={localOrder.seller_id}
        sellerName={localOrder.seller?.full_name || localOrder.seller?.company_name || 'Servis Sağlayıcı'}
        onDisputeOpened={(_data) => {
          setLocalOrder(prev => ({ ...prev, is_escrow_blocked: true }));
          showAlert("Başarılı", "Bildiriminiz kaydedildi. Ödemeniz Carvis Güvencesi altında donduruldu.", "success");
        }}
      />
    </div>
  );
};

export default OrderDetailsModal;
