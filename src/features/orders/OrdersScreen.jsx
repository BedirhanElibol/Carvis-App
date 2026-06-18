import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { supabase } from "../../supabaseClient";
import { useUI } from "../../context/UIContext";
import { useOrder } from "../../context/OrderContext";
import OrderDetailsModal from "./OrderDetailsModal";
import EmptyState from "../../components/shared/EmptyState";
import { SkeletonList } from "../../components/ui/SkeletonCard";
import { triggerHaptic } from "../../utils/haptics";

const OrdersScreen = () => {
  const navigate = useNavigate();
  const { orders, loading, fetchOrders } = useOrder();
  const { showAlert } = useUI();
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return {
          icon: Icons.Clock,
          color: "text-yellow-400",
          bg: "bg-yellow-500/10",
          label: "Beklemede",
        };
      case "paid":
        return {
          icon: Icons.CheckCircle,
          color: "text-green-400",
          bg: "bg-green-500/10",
          label: "ÖÖdendi",
        };
      case "completed":
        return {
          icon: Icons.CheckCircle,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          label: "Tamamlandıı",
        };
      case "cancelled":
        return {
          icon: Icons.XCircle,
          color: "text-red-400",
          bg: "bg-red-500/10",
          label: "İİptal Edildi",
        };
      case "refunded":
        return {
          icon: Icons.XCircle,
          color: "text-orange-400",
          bg: "bg-orange-500/10",
          label: "İİade Edildi",
        };
      // New Transparent Eye Statuses
      case "diagnosing":
        return {
          icon: Icons.Wrench,
          color: "text-emerald-400",
          bg: "bg-emerald-500/10",
          label: "Teşhis Ediliyor",
        };
      case "repairing":
        return {
          icon: Icons.Wrench,
          color: "text-blue-400",
          bg: "bg-blue-500/10",
          label: "Onarılıyor",
        };
      case "quality_check":
        return {
          icon: Icons.CheckCircle,
          color: "text-cyan-400",
          bg: "bg-cyan-500/10",
          label: "Son Kontroller",
        };
      default:
        return {
          icon: Icons.Clock,
          color: "text-slate-400",
          bg: "bg-slate-500/10",
          label: status,
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24 font-sans">
      <OrderDetailsModal
        show={!!selectedOrder}
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-950/80 backdrop-blur-xl border-b border-white/10 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale transition-all border border-white/5"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold font-sans uppercase tracking-tighter">
                Siparişşlerim
              </h1>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest font-sans">
                {orders.length} Siparişş
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchOrders();
              triggerHaptic("light");
            }}
            className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale transition-all border border-white/5"
          >
            <Icons.RefreshCw
              size={18}
              className={
                loading ? "animate-spin text-primary-500" : "text-slate-400"
              }
            />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {loading ? (
          <SkeletonList count={3} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Icons.ShoppingBag}
            title="Henüz Siparişşiniz Yok"
            subtitle="Teklifleri kabul ettiğinizde veya marketplace üzerinden ürün aldığınızda siparişleriniz burada listelenir."
            actionLabel="Alışverişe Başla"
            onAction={() => navigate("/app/parts")}
          />
        ) : (
          orders.map((order) => {
            const config = getStatusConfig(order.status);
            const StatusIcon = config.icon;
            return (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className="glass-card p-5 rounded-3xl border border-white/5 cursor-pointer hover:border-primary-500/30 transition-all group overflow-hidden relative"
              >
                {/* Gradient highlight for active orders */}
                {(order.status === "diagnosing" ||
                  order.status === "repairing") && (
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all pointer-events-none"></div>
                )}
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mb-1">
                        Teslimat #{String(order.id).slice(0, 8)}
                      </p>
                      <p className="font-bold text-lg text-white font-sans">
                        {order.seller?.company_name ||
                          order.seller?.full_name ||
                          "Servis Sağlayıcı"}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 ${config.bg} ${config.color} px-3 py-1.5 rounded-xl border border-white/5 text-xs font-bold shadow-lg font-sans`}
                    >
                      <StatusIcon size={14} />
                      {config.label}
                    </div>
                  </div>
                  {order.quote && (
                    <div className="bg-slate-900/50 p-3 rounded-xl border border-white/5 mb-4">
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {order.quote.description}
                      </p>
                    </div>
                  )}
                  <div className="flex items-end justify-between pt-4 border-t border-white/5 mt-2">
                    <div className="flex flex-col gap-2">
                      {order.status === "paid" ? (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            triggerHaptic("heavy");
                            const { data, error } = await supabase.rpc('rpc_confirm_order_delivery', { p_order_id: order.id });
                            if (error) {
                              console.error(error);
                              showAlert("Hata", error.message, "error");
                            } else if (data && data.success) {
                              showAlert("Başarılı", data.message, "success");
                              fetchOrders();
                            }
                          }}
                          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active-scale shadow-lg shadow-emerald-900/20 border border-emerald-400/20 font-sans"
                        >
                          <Icons.CheckCircle size={14} />
                          Hizmeti Onayla
                        </button>
                      ) : order.status === "completed" ? (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 uppercase tracking-wider font-sans">
                          <Icons.ShieldCheck size={12} /> İşlem Tamamlandıı
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">
                          {order.product_photo && (
                            <img
                              src={order.product_photo}
                              alt="Ürün"
                              className="w-16 h-16 rounded-xl object-cover"
                            />
                          )}
                          İşlem Bekleniyor
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-0.5 font-sans">
                        Toplam Tutar
                      </p>
                      <p className="text-2xl font-black text-white tracking-tighter font-sans">
                        ₺
                        {order.total_amount?.toLocaleString("tr-TR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-primary-400 font-bold uppercase tracking-widest group-hover:text-primary-300 transition-colors font-sans">
                    <span>Detaylı İzleme İçin Tıklayın</span>
                    <Icons.ArrowRight size={14} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default OrdersScreen;
