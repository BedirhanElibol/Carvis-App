import React, { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import * as Icons from "lucide-react";
import { useUI } from "../../context/UIContext";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";

const SERVICE_PACKAGES = [
  {
    id: "standard",
    title: "Standart Vale",
    price: 250,
    eta: "12 dk",
    description:
      "Aracınız teslim alınır, güvenli park alanına çekilir ve anahtar korumalı kasada tutulur.",
  },
  {
    id: "vip",
    title: "VIP Vale",
    price: 450,
    eta: "8 dk",
    description:
      "Öncelikli teslim alma, iç temizlik kontrolü ve teslim öncesi hızlı durum raporu içerir.",
  },
  {
    id: "night",
    title: "Gece Modu",
    price: 320,
    eta: "15 dk",
    description:
      "Geç saat teslimleri için özel güvenlik eşliğinde vale hizmeti sunar.",
  },
];

const STATUS_STEPS = [
  "Talep oluşturuldu",
  "Vale yönlendirildi",
  "Araç teslim alındı",
  "Güvenli alana park edildi",
];

const ValetScreen = () => {
  const navigate = useNavigate();
  const { selectedLocation, showAlert } = useUI();
  const { currentUser } = useAuth();
  const [selectedPackage, setSelectedPackage] = useState(SERVICE_PACKAGES[0]);
  const [pickupPoint, setPickupPoint] = useState(selectedLocation);
  const [note, setNote] = useState("");
  const [activeRequest, setActiveRequest] = useState(null);
  const [loadingRequest, setLoadingRequest] = useState(false);

  const packageSummary = useMemo(
    () => ({
      serviceFee: selectedPackage.price,
      protectionFee: 45,
      total: selectedPackage.price + 45,
    }),
    [selectedPackage],
  );

  const getActiveStepIndex = (status) => {
    switch (status) {
      case "pending": return 0;
      case "accepted": return 1;
      case "picked_up": return 2;
      case "parked": return 3;
      case "completed": return 3;
      default: return 0;
    }
  };

  const fetchActiveRequest = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from("valet_bookings")
        .select("*, valet:profiles!valet_bookings_valet_id_fkey(full_name, phone_number)")
        .eq("customer_id", currentUser.id)
        .not("status", "in", '("completed","cancelled")')
        .order("created_at", { ascending: false })
        .limit(1);

      if (!error && data && data.length > 0) {
        const req = data[0];
        setActiveRequest({
          id: req.id,
          createdAt: new Date(req.created_at),
          pickupPoint: req.pickup_point,
          note: req.note,
          package: SERVICE_PACKAGES.find(p => p.id === req.package_id) || SERVICE_PACKAGES[0],
          code: req.verification_code || "----",
          driver: req.valet?.full_name || "Atanıyor...",
          phone: req.valet?.phone_number || "---",
          plate: "Carvis Güvenceli",
          status: req.status
        });
      } else {
        setActiveRequest(null);
      }
    } catch (err) {
      console.error("Fetch active request error:", err);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser?.id) return;

    fetchActiveRequest();

    const channel = supabase
      .channel(`valet_customer_${currentUser.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "valet_bookings",
          filter: `customer_id=eq.${currentUser.id}`,
        },
        () => {
          fetchActiveRequest();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchActiveRequest]);

  const handleRequest = async () => {
    if (!currentUser) {
      showAlert("Giriş Gerekli", "Vale çağırmak için lütfen giriş yapın.", "warning");
      return;
    }
    if (!pickupPoint || !pickupPoint.trim()) {
      showAlert(
        "Konum Gerekli",
        "Vale çağırmak için teslim noktasını girin.",
        "warning",
      );
      return;
    }

    const code = String(1000 + Math.floor(Math.random() * 9000));
    setLoadingRequest(true);

    try {
      const { data, error } = await supabase
        .from("valet_bookings")
        .insert([
          {
            customer_id: currentUser.id,
            pickup_point: pickupPoint,
            note: note.trim(),
            package_id: selectedPackage.id,
            price: packageSummary.total,
            verification_code: code,
            status: "pending"
          }
        ])
        .select()
        .single();

      if (error) throw error;

      setActiveRequest({
        id: data.id,
        createdAt: new Date(data.created_at),
        pickupPoint: data.pickup_point,
        note: data.note,
        package: selectedPackage,
        code: data.verification_code,
        driver: "Atanıyor...",
        phone: "---",
        plate: "---",
        status: "pending"
      });

      showAlert(
        "Vale Yönlendirildi",
        `${selectedPackage.title} talebiniz alındı. En kısa sürede bir vale atanacaktır.`,
        "success",
      );
    } catch (err) {
      console.error("Create valet booking error:", err);
      showAlert("Hata", "Vale talebi oluşturulamadı.", "error");
    } finally {
      setLoadingRequest(false);
    }
  };

  const handleCancel = async () => {
    if (!activeRequest) return;
    try {
      const { error } = await supabase
        .from("valet_bookings")
        .update({ status: "cancelled" })
        .eq("id", activeRequest.id);

      if (error) throw error;
      setActiveRequest(null);
      showAlert("Talep İptal Edildi", "Vale çağrınız iptal edildi.", "info");
    } catch (err) {
      console.error("Cancel valet request error:", err);
      showAlert("Hata", "Talep iptal edilemedi.", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24">
      <div className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-950/85 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-5 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale border border-black/10 dark:border-white/10"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-black">
                Carvis Vale
              </p>
              <h1 className="text-xl font-black tracking-tighter">
                Anında Vale Çağır
              </h1>
            </div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-black uppercase tracking-widest">
            7/24 Aktif
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        <section className="glass-card rounded-[2rem] border border-black/10 dark:border-white/10 p-6 overflow-hidden relative">
          <div className="absolute -top-16 right-[-40px] w-40 h-40 bg-primary-500/20 rounded-full blur-3xl" />
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mb-2">
                Teslim Noktası
              </p>
              <p className="text-lg font-black">
                {pickupPoint || "Konum seçilmedi"}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mb-2">
                Tahmini Ulaşım
              </p>
              <p className="text-lg font-black text-primary-400">
                {selectedPackage.eta}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black mb-2">
                Toplam Tutar
              </p>
              <p className="text-lg font-black text-emerald-400">
                ₺{packageSummary.total.toLocaleString("tr-TR")}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              Paket Seçimi
            </h2>
            <span className="text-xs text-slate-500">
              Hizmet detayını seçin
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {SERVICE_PACKAGES.map((pkg) => {
              const isActive = selectedPackage.id === pkg.id;
              return (
                <button
                  key={pkg.id}
                  onClick={() => setSelectedPackage(pkg)}
                  className={`text-left rounded-[1.75rem] border p-5 transition-all active-scale ${
                    isActive
                      ? "bg-primary-600/10 border-primary-500/40 shadow-lg shadow-primary-950/20"
                      : "glass-card border-black/5 dark:border-white/5 hover:border-white/15"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-base font-black">
                          {pkg.title}
                        </span>
                        {isActive && (
                          <Icons.BadgeCheck
                            size={16}
                            className="text-primary-400"
                          />
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                        {pkg.description}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        ₺{pkg.price}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">{pkg.eta}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-card rounded-[2rem] border border-black/5 dark:border-white/5 p-5 space-y-4">
          <h2 className="text-sm font-black uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
            Talep Detayları
          </h2>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Teslim Noktası
            </label>
            <div className="mt-2 flex items-center gap-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-black/10 dark:border-white/10 px-4 py-3">
              <Icons.MapPin size={18} className="text-primary-400" />
              <input
                value={pickupPoint || ""}
                onChange={(event) => setPickupPoint(event.target.value)}
                placeholder="Örn: Zorlu Center ana giriş"
                className="w-full bg-transparent outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-600"
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">
              Vale Notu
            </label>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="Anahtar teslim detayı, kat bilgisi veya araç konumu ekleyin"
              className="mt-2 w-full bg-white dark:bg-slate-900/80 rounded-2xl border border-black/10 dark:border-white/10 px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-600 outline-none resize-none"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-4 py-3">
              <p className="text-slate-500 uppercase font-black tracking-widest mb-1">
                Hizmet
              </p>
              <p className="text-slate-900 dark:text-white font-bold">₺{selectedPackage.price}</p>
            </div>
            <div className="rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 px-4 py-3">
              <p className="text-slate-500 uppercase font-black tracking-widest mb-1">
                Koruma
              </p>
              <p className="text-slate-900 dark:text-white font-bold">
                ₺{packageSummary.protectionFee}
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
              <p className="text-emerald-400 uppercase font-black tracking-widest mb-1">
                Toplam
              </p>
              <p className="text-emerald-300 font-bold">
                ₺{packageSummary.total}
              </p>
            </div>
          </div>
          <button
            onClick={handleRequest}
            disabled={loadingRequest}
            className="w-full rounded-2xl bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white font-black py-4 uppercase tracking-[0.25em] transition-all active-scale shadow-xl shadow-primary-950/30 disabled:opacity-50"
          >
            {loadingRequest ? "Çağırılıyor..." : "Vale Çağır"}
          </button>
        </section>

        {activeRequest && (
          <section className="glass-card rounded-[2rem] border border-primary-500/20 p-5 space-y-5">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-primary-400 font-black mb-2">
                  Aktif Talep
                </p>
                <h2 className="text-2xl font-black tracking-tighter">
                  {activeRequest.package.title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Doğrulama kodunuz:{" "}
                  <span className="text-slate-900 dark:text-white font-black">
                    #{activeRequest.code}
                  </span>
                </p>
              </div>
              <div className="rounded-2xl bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 text-sm">
                <p className="text-slate-500 uppercase tracking-widest font-black mb-1">
                  Vale Bilgisi
                </p>
                <p className="font-bold">{activeRequest.driver}</p>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  {activeRequest.phone} • {activeRequest.plate}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {STATUS_STEPS.map((step, index) => (
                <div
                  key={step}
                  className={`rounded-2xl border px-4 py-4 ${
                    index <= getActiveStepIndex(activeRequest.status)
                      ? "bg-primary-500/10 border-primary-500/20 text-slate-900 dark:text-white shadow-md shadow-primary-950/20"
                      : "bg-black/5 dark:bg-white/5 border-black/5 dark:border-white/5 text-slate-500"
                  }`}
                >
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2">
                    Adım {index + 1}
                  </p>
                  <p className="text-sm font-bold leading-snug">{step}</p>
                </div>
              ))}
            </div>

            <div className="rounded-[1.75rem] bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest font-black mb-1">
                  Teslim Notu
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  {activeRequest.note || "Ek not paylaşılmadı."}
                </p>
              </div>
              <button
                onClick={handleCancel}
                className="rounded-xl px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 font-bold text-sm hover:bg-red-500/20 transition-colors"
              >
                Talebi İptal Et
              </button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ValetScreen;
