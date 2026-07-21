import React, { useMemo } from "react";
import { Activity, AlertTriangle, CheckCircle, Thermometer, TrendingDown } from "lucide-react";
import { motion } from "framer-motion";  

/**
 * PredictiveHealth Component
 * Analyzes vehicle data to provide a health score and risk assessment.
 */
const PredictiveHealth = ({ vehicle }) => {
  const assessment = useMemo(() => {
    if (!vehicle) return null;

    let score = 100;
    const risks = [];
    const currentKm = Number(vehicle.km) || 0;
    const vehicleAge = new Date().getFullYear() - (vehicle.year || 2020);

    // 1. Mileage Decay
    if (currentKm > 200000) {
      score -= 30;
      risks.push({
        part: "Motor Ömrü",
        risk: "Yüksek",
        message: "Motor kritik KM sınırında.",
      });
    } else if (currentKm > 100000) {
      score -= 15;
      risks.push({
        part: "Triger Kayışı",
        risk: "Orta",
        message: "Triger değişimi yaklaşıyor olabilir.",
      });
    }

    // 2. Age Decay
    score -= vehicleAge * 2;
    if (vehicleAge > 10) {
      risks.push({
        part: "Alt Takım",
        risk: "Düşük",
        message: "Metal yorgunluğu ve pas riski.",
      });
    }

    // 3. Maintenance Logic (Simulation)
    const kmSinceLastService = currentKm % 15000;
    if (kmSinceLastService > 13000) {
      score -= 20;
      risks.push({
        part: "Yağ Değişimi",
        risk: "Kritik",
        message: "Periyodik bakım zamanı geldi veya geçti.",
      });
    }

    // 4. Legal Compliance (Inspection & Insurance)
    if (vehicle.inspection_date) {
      const daysUntilInspection = Math.ceil(
        (new Date(vehicle.inspection_date) - new Date()) / (1000 * 60 * 60 * 24),
      );
      if (daysUntilInspection < 0) {
        score -= 25;
        risks.push({
          part: "TÜVTÜRK Muayene",
          risk: "Kritik",
          message: "Muayene süreniz dolmuş!",
        });
      } else if (daysUntilInspection < 30) {
        score -= 10;
        risks.push({
          part: "TÜVTÜRK Muayene",
          risk: "Yüksek",
          message: `Muayeneye ${daysUntilInspection} gün kaldı.`,
        });
      }
    }

    if (vehicle.insurance_expiry) {
      const daysUntilInsurance = Math.ceil(
        (new Date(vehicle.insurance_expiry) - new Date()) / (1000 * 60 * 60 * 24),
      );
      if (daysUntilInsurance < 0) {
        score -= 25;
        risks.push({
          part: "Trafik Sigortası",
          risk: "Kritik",
          message: "Sigortanızın süresi dolmuş!",
        });
      } else if (daysUntilInsurance < 15) {
        score -= 10;
        risks.push({
          part: "Trafik Sigortası",
          risk: "Yüksek",
          message: `Sigorta bitimine ${daysUntilInsurance} gün kaldı.`,
        });
      }
    }

    return {
      score: Math.max(0, Math.round(score)),
      risks,
      label:
        score > 85
          ? "Mükemmel"
          : score > 60
            ? "İyi"
            : score > 40
              ? "Riskli"
              : "Kritik",
    };
  }, [vehicle]);

  if (!vehicle || !assessment) return null;

  const getColor = (score) => {
    if (score > 85) return "text-emerald-500";
    if (score > 60) return "text-primary-500";
    if (score > 40) return "text-orange-500";
    return "text-red-500";
  };

  const getBg = (score) => {
    if (score > 85) return "bg-emerald-500";
    if (score > 60) return "bg-primary-500";
    if (score > 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 relative overflow-hidden">
      {/* Background Decoration */}
      <div
        className={`absolute -right-10 -top-10 w-40 h-40 ${getBg(assessment.score)}/10 rounded-full blur-3xl`}
      ></div>

      <div className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <h3 className="font-black text-xl text-slate-900 dark:text-white flex items-center gap-2 uppercase tracking-tighter">
            <Activity className="text-primary-400" /> Tahmini Sistem Skoru
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-sans">
            Girdiğiniz veriler baz alınarak hesaplanan tahmini skordur.
          </p>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-black ${getColor(assessment.score)}`}>
            {assessment.score}
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
            Puan
          </span>
        </div>
      </div>

      {/* Health Bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${assessment.score}%` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className={`h-full ${getBg(assessment.score)} shadow-xl`}
        />
      </div>

      {/* Risk Assessment */}
      <div className="space-y-3">
        {assessment.risks.length > 0 ? (
          assessment.risks.map((risk, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5"
            >
              {risk.risk === "Kritik" || risk.risk === "Yüksek" ? (
                <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
              ) : (
                <TrendingDown size={18} className="text-orange-400 shrink-0 mt-0.5" />
              )}
              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5 uppercase tracking-tight">
                  {risk.part} ({risk.risk} Risk)
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans">
                  {risk.message}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-teal-400">
            <CheckCircle size={20} />
            <span className="font-black text-sm uppercase tracking-widest">
              Harika! Önemli bir risk tespit edilmedi.
            </span>
          </div>
        )}
      </div>

      {assessment.score < 50 && (
        <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
          <button className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-500 border border-red-500/30 rounded-xl font-black text-xs uppercase tracking-[0.2em] transition flex items-center justify-center gap-2 animate-pulse">
            <Thermometer size={16} /> Acil Bakım Randevusu Al
          </button>
        </div>
      )}
    </div>
  );
};

export default PredictiveHealth;
