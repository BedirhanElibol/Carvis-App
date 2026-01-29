import React from 'react';
import { Car, Search, MapPin, Wrench, Package, Truck, Star, Sparkles, User, Store } from 'lucide-react';
import logo from '../assets/logo.png';

export const SpecialistCard = ({ specialist }) => {
    const name = specialist.company_name || specialist.full_name || specialist.name || specialist.shop;
    const experience = specialist.experience_years || (specialist.rating ? Math.floor(specialist.rating * 2) : 5);
    const specialties = specialist.specialties || [];
    const brands = specialist.brands_expertise || ["Tüm Markalar"];
    const isVerified = specialist.is_verified || specialist.verified;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-4 mx-2">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="font-bold text-gray-900 text-lg">{name}</h3>
                    <p className="text-orange-600 text-xs font-bold uppercase tracking-wider">{experience} Yıllık Tecrübe</p>
                </div>
                {isVerified && (
                    <span className="bg-blue-50 text-blue-600 text-[10px] px-2 py-1 rounded-full font-bold border border-blue-100">ONAYLI USTA</span>
                )}
            </div>

            <div className="space-y-3">
                <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Uzmanlık Alanları</p>
                    <div className="flex flex-wrap gap-1">
                        {specialties.map(s => (
                            <span key={s} className="bg-gray-50 text-gray-700 text-[11px] px-2 py-1 rounded-lg border border-gray-200">{s}</span>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase mb-1">Uzman Markalar</p>
                    <div className="flex flex-wrap gap-1">
                        {brands.map(b => (
                            <span key={b} className="bg-orange-50 text-orange-700 text-[11px] px-2 py-1 rounded-lg border border-orange-100">{b}</span>
                        ))}
                    </div>
                </div>
            </div>

            <button className="w-full mt-4 bg-gray-900 text-white py-3 rounded-xl text-sm font-bold active:scale-95 transition-all shadow-lg shadow-gray-200">
                Teklif İste
            </button>
        </div>
    );
};

export const RapidsyLogoIcon = ({ className }) => (
    <svg viewBox="0 0 100 60" className={className} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 35 L20 20 H50 L60 35 H85 V50 H15 V35 Z" />
        <circle cx="25" cy="50" r="8" fill="currentColor" stroke="none" />
        <circle cx="75" cy="50" r="8" fill="currentColor" stroke="none" />
        <path d="M65 10 L68 18 L76 21 L68 24 L65 32 L62 24 L54 21 L62 18 Z" fill="currentColor" stroke="none" />
        <path d="M80 5 L82 10 L87 12 L82 14 L80 19 L78 14 L73 12 L78 10 Z" fill="currentColor" stroke="none" opacity="0.7" />
    </svg>
);

export const ModernCard = ({ children, className, onClick }) => (
    <div onClick={onClick} className={`glass-card dark:glass-card-light border border-white/10 p-5 rounded-3xl shadow-2xl hover:shadow-primary-500/20 transition-all duration-500 cursor-pointer ${className}`}>
        {children}
    </div>
);

export const ActionButton = ({ icon: Icon, label, onClick, color = "primary" }) => {
    const colors = {
        primary: "bg-gradient-to-br from-primary-500 to-primary-700 shadow-primary-900/30",
        accent: "bg-gradient-to-br from-accent-500 to-accent-700 shadow-accent-900/30",
        red: "bg-gradient-to-br from-red-500 to-red-700 shadow-red-900/30",
        slate: "glass-card hover:bg-white/10 shadow-lg border border-white/10",
    };
    return (
        <button onClick={onClick} className={`${colors[color]} text-white p-5 rounded-[2rem] shadow-xl flex flex-col items-center justify-center gap-2 flex-1 hover:scale-[1.03] active:scale-95 transition-all duration-300`}>
            <div className="p-2 bg-white/10 rounded-xl">
                <Icon size={22} className="text-white" />
            </div>
            <span className="font-black text-[10px] tracking-widest uppercase">{label}</span>
        </button>
    );
};

export const Badge = ({ children, type, className }) => {
    const styles = {
        success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
        warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
        info: "bg-primary-500/20 text-primary-400 border-primary-500/30",
        danger: "bg-red-500/20 text-red-400 border-red-500/30",
        neutral: "bg-slate-500/20 text-slate-400 border-slate-500/30",
        verified: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30"
    };
    return (<span className={`px-2.5 py-1 rounded-full text-[9px] font-black border uppercase tracking-tighter ${styles[type] || styles.neutral} flex items-center gap-1 ${className}`}>{children}</span>);
};

export const RapidsyLogo = ({ className = "w-64 h-auto" }) => (
    <div className="flex items-center gap-2 group cursor-pointer">
        <img src={logo} alt="Rapidsy Logo" className={`${className} object-contain`} />
    </div>
);
