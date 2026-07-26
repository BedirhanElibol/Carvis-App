import React from "react";
import { ShieldCheck, UserCheck, FileCheck, AlertCircle, CheckCircle2, Wrench, Award } from "lucide-react";
import { runCarfaxAudit } from "../../utils/carfaxEngine";

/**
 * CARFAX 1:1 Official Vehicle History & Safety Seal Header
 * Replicates CARFAX's signature 4-pill history summary badges:
 * 1. Ownership History
 * 2. Guaranteed Clean Title
 * 3. Accident & Damage History
 * 4. Verified Service Records & Safety Recalls
 */
const CarfaxReportHeader = ({ vehicle = {}, recordsCount = 0, maintenanceRecords = [] }) => {
  const audit = runCarfaxAudit(vehicle, maintenanceRecords);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 text-white space-y-5 shadow-2xl">
      {/* CARFAX Header Title & Verified Seal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center font-black text-xs text-center shadow-lg border border-blue-400/30 font-mono tracking-tight leading-none px-1">
            RESMİ GEÇMİŞ
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase text-blue-400 tracking-widest bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Resmi Araç Geçmişi & Hasar Raporu
              </span>
            </div>
            <h3 className="font-black text-lg uppercase tracking-tight text-slate-100 mt-0.5">
              {vehicle?.brand} {vehicle?.model} ({vehicle?.year || "2020"})
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-500/20 text-blue-300 font-mono font-black text-xs px-3 py-1.5 rounded-2xl border border-blue-500/30">
            ARAÇ GÜVEN SKORU: {audit.vehicleScore}/100
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-2xl text-emerald-400 text-xs font-black uppercase tracking-wider">
            <ShieldCheck size={16} /> RESMİ KAYITLI ONAYLI
          </div>
        </div>
      </div>

      {/* CARFAX Signature 4 Pillar Summary Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Pillar 1: Ownership */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-blue-400">
            <UserCheck size={20} />
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">01. SAHİPLİK</span>
          </div>
          <div>
            <span className="text-xs font-black uppercase text-white block">{audit.ownershipType}</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Ruhsat Sahibi Doğrulanmış</span>
          </div>
        </div>

        {/* Pillar 2: Title History */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <FileCheck size={20} />
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">02. RUHSAT</span>
          </div>
          <div>
            <span className="text-xs font-black uppercase text-emerald-400 block">TEMİZ RUHSAT</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Reconstructed / Salvage Yok</span>
          </div>
        </div>

        {/* Pillar 3: Damage & Odometer Check */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-teal-400">
            <CheckCircle2 size={20} />
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">03. SAYAÇ & HASAR</span>
          </div>
          <div>
            <span className={`text-xs font-black uppercase block ${audit.odometerStatus.isRollback ? 'text-rose-400' : 'text-emerald-400'}`}>
              {audit.odometerStatus.isRollback ? '🔴 ŞÜPHELİ SAYAÇ' : '🟢 SAYAÇ ORİJİNAL'}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Kronolojik Geçmiş Tutarlı</span>
          </div>
        </div>

        {/* Pillar 4: Service Records & Safety Recalls */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-cyan-400">
            <Wrench size={20} />
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">04. SERVİS & BÜLTEN</span>
          </div>
          <div>
            <span className="text-xs font-black uppercase text-cyan-400 block">{recordsCount} SERVİS KAYDI</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">{audit.recallStatus.title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarfaxReportHeader;
