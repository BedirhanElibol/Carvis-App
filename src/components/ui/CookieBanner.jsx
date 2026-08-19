import React, { useState, useEffect } from "react";
import { Cookie, X, Check, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CookieBanner = () => {
  const [show, setShow] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const consent = localStorage.getItem("rapidsy_cookie_consent");
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = (type) => {
    localStorage.setItem("rapidsy_cookie_consent", JSON.stringify({
      acceptedAt: new Date().toISOString(),
      type: type || "all"
    }));
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-50 animate-slide-up">
      <div className="bg-slate-900/95 dark:bg-[#0a0f24]/95 border border-black/10 dark:border-white/10 p-4 md:p-5 rounded-xl text-white font-sans">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
              <Cookie size={20} />
            </div>
            <div>
              <h4 className="font-black text-sm uppercase tracking-wider text-white">Çerez ve Gizlilik Bildirimi</h4>
              <p className="text-[10px] text-slate-400 font-medium">KVKK & 6698 Sayılı Kanun Uyumlu</p>
            </div>
          </div>
          <button
            onClick={() => handleAccept("necessary")}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Kapat"
          >
            <X size={16} />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed mb-4">
          Rapidsy, size en iyi deneyimi sunmak, oturum bilgilerinizi güvenle saklamak ve servis performansını ölçmek için çerezler (cookies) kullanmaktadır. Detaylar için{" "}
          <button
            onClick={() => navigate("/privacy-policy")}
            className="text-cyan-400 underline font-semibold bg-transparent border-none p-0 cursor-pointer"
          >
            Gizlilik Politikamızı
          </button>{" "}
          inceleyebilirsiniz.
        </p>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => handleAccept("all")}
            className="flex-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs py-2.5 px-4 rounded-xl transition-all shadow-lg active-scale flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
          >
            <Check size={14} /> Tümünü Kabul Et
          </button>
          <button
            onClick={() => handleAccept("necessary")}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs py-2.5 px-3.5 rounded-xl transition-all border border-white/5 cursor-pointer uppercase tracking-wider"
          >
            Zorunlu Çerezler
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;
