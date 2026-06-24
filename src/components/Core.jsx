import React from "react";
import * as Icons from "lucide-react";

import ReviewsModal from "./modals/ReviewsModal";
import { useUI } from "../context/UIContext";

export const Skeleton = ({ className, variant = "rect" }) => {
  const baseClass = "animate-pulse bg-slate-100 dark:bg-slate-800/50";
  const variants = {
    rect: "rounded-2xl",
    circle: "rounded-full",
    text: "rounded-md h-4 w-3/4",
  };
  return <div className={`${baseClass} ${variants[variant]} ${className}`} />;
};

export const SpecialistCard = ({ specialist }) => {
  const { t } = useUI();
  const [showReview, setShowReview] = React.useState(false);
  const name =
    specialist.company_name ||
    specialist.full_name ||
    specialist.name ||
    specialist.shop || t.anonymousShop;
    
  const rating = specialist.rating_avg || 4.8;
  const reviewCount = specialist.review_count || Math.floor(Math.random() * 100) + 12;
  const isVerified = specialist.is_verified || specialist.verified || true;

  return (
    <div className="glass-card p-6 rounded-[2.5rem] border border-black/10 dark:border-white/10 shadow-2xl mb-5 mx-1 relative overflow-hidden group hover:border-primary-500/30 transition-all active-scale-[0.98]">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl group-hover:bg-primary-600/10 transition-colors"></div>
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-black/5 dark:border-white/5 shadow-xl">
             <Icons.Wrench size={24} className="text-primary-400" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-xl tracking-tighter leading-tight">{name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={rating} count={reviewCount} size={10} />
            </div>
          </div>
        </div>
        {isVerified && (
          <Badge type="info" className="scale-90 origin-right">{t.verifiedMechanic}</Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
        <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-3 border border-black/5 dark:border-white/5">
          <p className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-widest">{t.experience}</p>
          <p className="text-xs font-black text-primary-400 uppercase">{t.experienceYears}</p>
        </div>
        <div className="bg-black/5 dark:bg-white/5 rounded-2xl p-3 border border-black/5 dark:border-white/5">
          <p className="text-[9px] text-slate-500 font-black uppercase mb-1 tracking-widest">{t.location}</p>
          <p className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase">ANKARA / OSTİM</p>
        </div>
      </div>

      <div className="flex gap-3 relative z-10">
        <button className="flex-1 bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest active-scale transition-all shadow-xl shadow-primary-900/20">
          {t.requestQuote}
        </button>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            setShowReview(true);
          }}
          className="p-4 glass-card border border-black/10 dark:border-white/10 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all active-scale"
        >
          <Icons.Star size={18} />
        </button>
        <button className="p-4 glass-card border border-black/10 dark:border-white/10 rounded-2xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white transition-all active-scale">
          <Icons.MessageSquare size={18} />
        </button>
      </div>

      <ReviewsModal 
        isOpen={showReview} 
        onClose={() => setShowReview(false)} 
        targetId={specialist.id || "mock-mechanic"} 
        targetType="mechanic"
        targetName={name}
      />
    </div>
  );
};

export const RapidsyLogoIcon = ({ className }) => (
  <svg
    viewBox="0 0 100 60"
    className={className}
    fill="none"
    stroke="url(#vibrantGradient)"
    strokeWidth="5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <defs>
      <linearGradient id="vibrantGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#2dd4bf" /> {/* Teal 400 */}
        <stop offset="100%" stopColor="#3b82f6" /> {/* Blue 500 */}
      </linearGradient>
    </defs>
    <path d="M10 35 L20 20 H50 L60 35 H85 V50 H15 V35 Z" fill="url(#vibrantGradient)" fillOpacity="0.1" />
    <circle cx="25" cy="50" r="8" fill="url(#vibrantGradient)" stroke="none" />
    <circle cx="75" cy="50" r="8" fill="url(#vibrantGradient)" stroke="none" />
    <path
      d="M65 10 L68 18 L76 21 L68 24 L65 32 L62 24 L54 21 L62 18 Z"
      fill="url(#vibrantGradient)"
      stroke="none"
    />
    <path
      d="M80 5 L82 10 L87 12 L82 14 L80 19 L78 14 L73 12 L78 10 Z"
      fill="url(#vibrantGradient)"
      stroke="none"
      opacity="0.7"
    />
  </svg>
);

export const ModernCard = ({ children, className, onClick }) => (
  <div
    onClick={onClick}
    className={`glass-card border border-black/10 dark:border-white/10 p-5 rounded-3xl shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 cursor-pointer ${className}`}
  >
    {children}
  </div>
);

export const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  color = "primary",
}) => {
  const colors = {
    primary:
      "bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary-900/30",
    accent:
      "bg-gradient-to-br from-accent-500 to-accent-700 shadow-accent-900/30",
    red: "bg-gradient-to-br from-red-500 to-red-700 shadow-red-900/30",
    slate: "glass-card hover:bg-black/10 dark:bg-white/10 shadow-lg border border-black/10 dark:border-white/10",
  };
  return (
    <button
      onClick={onClick}
      className={`${colors[color]} text-slate-900 dark:text-white p-5 rounded-[2rem] shadow-xl flex flex-col items-center justify-center gap-2 flex-1 hover:scale-[1.03] active:scale-95 transition-all duration-300`}
    >
      <div className="p-2 bg-black/10 dark:bg-white/10 rounded-xl">
        <Icon size={22} className="text-slate-900 dark:text-white" />
      </div>
      <span className="font-black text-[10px] tracking-widest uppercase">
        {label}
      </span>
    </button>
  );
};

export const Badge = ({ children, type, className }) => {
  const styles = {
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    info: "bg-primary-500/20 text-primary-400 border-primary-500/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
    neutral: "bg-slate-500/20 text-slate-500 dark:text-slate-400 border-slate-500/30",
    verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  };
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-tighter ${styles[type] || styles.neutral} flex items-center gap-1 ${className}`}
    >
      {children}
    </span>
  );
};

export const RapidsyLogo = ({ className = "w-64 h-auto" }) => (
  <div className="flex items-center gap-2 group cursor-pointer font-sans uppercase">
    <img
      src={logo}
      alt="Rapidsy Logo"
      className="h-12 md:h-16 w-auto max-w-[250px] md:max-w-[320px] object-contain drop-shadow-md transition-transform duration-500 group-hover:scale-[1.4] scale-[1.35] origin-left -ml-2 md:-ml-4"
    />
  </div>
);

export const StarRating = ({ rating = 0, count = 0, size = 12 }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Icons.Star
            key={star}
            size={size}
            className={
              star <= Math.round(rating)
                ? "text-amber-400 fill-amber-400"
                : "text-slate-700"
            }
          />
        ))}
      </div>
      {count > 0 && (
        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest font-sans">
          ({count})
        </span>
      )}
    </div>
  );
};
