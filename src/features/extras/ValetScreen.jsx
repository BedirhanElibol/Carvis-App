import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../supabaseClient";

const DEFAULT_VALETS = [
  {
    id: "v1",
    name: "Elite Valet İstanbul",
    area: "Beşiktaş, Şişli, Nişantaşı",
    rating: 4.9,
    reviews: 312,
    eta: "8 dk",
    price: "₺120",
    badge: "premium",
    features: ["Sigortalı", "GPS Takip", "Fotoğraflı Teslim", "7/24"],
    available: true,
  },
  {
    id: "v2",
    name: "Hızlı Vale Servisi",
    area: "Kadıköy, Üsküdar, Ataşehir",
    rating: 4.7,
    reviews: 189,
    eta: "12 dk",
    price: "₺90",
    badge: "onaylı",
    features: ["GPS Takip", "Fotoğraflı Teslim"],
    available: true,
  },
  {
    id: "v3",
    name: "Anadolu Yakası Vale",
    area: "Maltepe, Kartal, Pendik",
    rating: 4.5,
    reviews: 87,
    eta: "20 dk",
    price: "₺75",
    badge: "standart",
    features: ["GPS Takip"],
    available: true,
  },
];

const badgeConfig = {
  premium: { label: "Premium", color: "text-amber-500", bg: "bg-amber-500/10" },
  onaylı: { label: "Onaylı", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  standart: { label: "Standart", color: "text-blue-500", bg: "bg-blue-500/10" },
};

export default function ValetScreen() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [valets, setValets] = useState(DEFAULT_VALETS);
  const [selected, setSelected] = useState(null);
  const [includeWash, setIncludeWash] = useState(false);
  const [booked, setBooked] = useState(false);

  useEffect(() => {
    const fetchValets = async () => {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .or("role.eq.valet,role.eq.partner")
          .eq("application_status", "approved");

        if (!error && data && data.length > 0) {
          const mapped = data.map((p, idx) => ({
            id: p.id,
            name: p.company_name || p.full_name || `Vale Hizmeti #${idx + 1}`,
            area: p.address || "Tüm İstanbul Bölgeleri",
            rating: p.rating_avg || 4.8,
            reviews: p.review_count || 45,
            eta: "10-15 dk",
            price: "₺120",
            badge: idx === 0 ? "premium" : "onaylı",
            features: ["Sigortalı", "GPS Takip", "Fotoğraflı Teslim"],
            available: true
          }));
          setValets(mapped);
        }
      } catch (err) {
        console.warn("Valet fetch error:", err);
      }
    };
    fetchValets();
  }, []);

  const handleBook = async () => {
    if (!selected) return;
    if (currentUser?.id) {
      try {
        await supabase.from("appointments").insert([
          {
            customer_id: currentUser.id,
            service_type: `Akıllı Vale (${selected.name})${includeWash ? " + Eko Yıkama" : ""}`,
            appointment_date: new Date().toISOString(),
            status: "pending"
          }
        ]);
      } catch (err) {
        console.warn("Valet appointment insert fallback:", err);
      }
    }
    setBooked(true);
  };

  if (booked) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#030712] flex items-center justify-center p-6">
        <div className="bg-white dark:bg-[#0a0f24]/85 border border-emerald-500/30 rounded-3xl p-10 text-center max-w-sm w-full shadow-2xl">
          <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Vale Çağrıldı!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            <span className="font-bold text-slate-700 dark:text-slate-200">{selected?.name}</span> talebinizi aldı.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            Tahmini varış: <span className="font-black text-amber-500">{selected?.eta}</span>
          </p>
          <div className="bg-slate-50 dark:bg-black/20 rounded-2xl p-4 mb-6 text-left border border-black/5 dark:border-white/5 text-sm">
            <div className="flex justify-between mb-2">
              <span className="text-slate-500">Ücret</span>
              <span className="font-black text-slate-900 dark:text-white">{selected?.price}</span>
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 border-t border-black/5 dark:border-white/5 pt-2 mt-1">
              <span>Ödeme → Araç tesliminde (Escrow)</span>
              <Shield size={12} className="text-emerald-500 mt-0.5" />
            </div>
          </div>
          <button
            onClick={() => navigate("/application/home")}
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-white py-3 rounded-2xl font-black transition-all"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-[#0a0f24]/80 backdrop-blur-xl border-b border-black/5 dark:border-white/5 px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-slate-100 dark:bg-white/5 rounded-xl flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-black uppercase tracking-tight flex items-center gap-2">
              <Key size={18} className="text-amber-400" />
              Akıllı Vale
            </h1>
            <p className="text-[10px] text-slate-500 font-medium">Hızlı ve güvenli vale hizmeti çağır</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="px-5 py-3 space-y-3">
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
          <Shield size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-600 dark:text-amber-400 uppercase tracking-wide mb-1">Rapidsy Güvencesi</p>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Ücret araç teslim edilene kadar Escrow havuzunda tutulur. Teslim fotoğrafı alınır, GPS ile takip edilir.
            </p>
          </div>
        </div>

        {/* VALE + EKO YIKAMA UPSELL BANNER */}
        <div
          onClick={() => setIncludeWash(!includeWash)}
          className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between active-scale ${
            includeWash
              ? "bg-cyan-500/10 border-cyan-500/50 ring-2 ring-cyan-500/20"
              : "bg-white dark:bg-[#0a0f24]/85 border-black/5 dark:border-white/10 hover:border-cyan-500/30"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${includeWash ? "bg-cyan-500 text-slate-950" : "bg-cyan-500/10 text-cyan-400"}`}>
              🧼
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black uppercase text-slate-900 dark:text-white">Vale + Eko Yıkama Ekleyin</h4>
                <span className="text-[9px] bg-cyan-500/20 text-cyan-300 font-bold px-2 py-0.5 rounded-full border border-cyan-500/30">+200 TL</span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Aracınız valedeyken otoparkta susuz bio-cila ile pırıl pırıl temizlensin.</p>
            </div>
          </div>
          <label aria-label="Vale + Eko Yıkama Ekleyin" className="cursor-pointer">
            <input
              type="checkbox"
              checked={includeWash}
              onChange={() => {}}
              className="w-5 h-5 accent-cyan-500 rounded cursor-pointer"
            />
          </label>
        </div>
      </div>

      {/* Valet List */}
      <div className="px-5 space-y-4">
        <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Çevrenizdeki Vale Hizmetleri</h2>
        {valets.map((valet) => {
          const badge = badgeConfig[valet.badge];
          const isSelected = selected?.id === valet.id;

          return (
            <button
              key={valet.id}
              onClick={() => valet.available && setSelected(isSelected ? null : valet)}
              disabled={!valet.available}
              className={`w-full text-left bg-white dark:bg-[#0a0f24]/85 border rounded-3xl p-5 shadow-sm transition-all ${
                !valet.available
                  ? "opacity-50 cursor-not-allowed border-black/5 dark:border-white/5"
                  : isSelected
                  ? "border-amber-500/50 ring-2 ring-amber-500/20"
                  : "border-black/5 dark:border-white/5 hover:border-black/10 dark:hover:border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-11 h-11 bg-amber-500/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Car size={20} className="text-amber-500" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-black text-sm text-slate-900 dark:text-white">{valet.name}</h3>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${badge.bg} ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                      <MapPin size={10} /> {valet.area}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">{valet.rating}</span>
                      <span className="text-[10px] text-slate-400">({valet.reviews} değerlendirme)</span>
                    </div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-black text-base text-slate-900 dark:text-white">{valet.price}</p>
                  <div className="flex items-center gap-1 justify-end mt-1 text-[11px] text-slate-500">
                    <Clock size={10} />
                    {valet.eta}
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-1">
                {valet.features.map((f) => (
                  <span key={f} className="text-[9px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400">
                    {f}
                  </span>
                ))}
              </div>

              {!valet.available && (
                <p className="text-[10px] font-black text-red-500 mt-2 uppercase">Şu an müsait değil</p>
              )}
            </button>
          );
        })}
      </div>

      {/* CTA */}
      {selected && (
        <div className="fixed bottom-6 left-0 right-0 px-5 z-30">
          <button
            onClick={handleBook}
            className="w-full max-w-lg mx-auto flex items-center justify-between bg-amber-500 hover:bg-amber-400 text-white px-6 py-4 rounded-2xl font-black shadow-2xl shadow-amber-500/40 transition-all"
          >
            <div>
              <p className="text-sm">{selected.name} · {selected.price}</p>
              <p className="text-[11px] opacity-80">Tahmini varış: {selected.eta}</p>
            </div>
            <div className="flex items-center gap-2">
              Vale Çağır <ChevronRight size={18} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
