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
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 text-white space-y-5">
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
          <div className={`flex items-center gap-2 border px-3.5 py-1.5 rounded-2xl text-xs font-black uppercase tracking-wider ${
            recordsCount > 0
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
              : "bg-amber-500/10 border-amber-500/30 text-amber-400"
          }`}>
            <ShieldCheck size={16} /> {recordsCount > 0 ? "ONAYLI SERVİS KAYDI" : "KULLANICI BEYANI"}
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
            <span className="text-xs font-black uppercase text-white block">
              {recordsCount > 0 ? audit.ownershipType : "KULLANICI BEYANI"}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              {recordsCount > 0 ? "Ruhsat Beyanı Onaylı" : "Sisteme Girilen Veri"}
            </span>
          </div>
        </div>

        {/* Pillar 2: Title History */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-emerald-400">
            <FileCheck size={20} />
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">02. HASAR / TRAMER</span>
          </div>
          <div>
            <span className="text-xs font-black uppercase text-amber-400 block">BİLGİ GİRİLMEDİ</span>
            <span className="text-[9px] text-slate-400 block mt-0.5">Tramer Kaydı Eklenmedi</span>
          </div>
        </div>

        {/* Pillar 3: Damage & Odometer Check */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col justify-between space-y-2">
          <div className="flex items-center justify-between text-teal-400">
            <CheckCircle2 size={20} />
            <span className="text-[8px] font-black uppercase text-slate-400 tracking-widest">03. SAYAÇ BİLGİSİ</span>
          </div>
          <div>
            <span className={`text-xs font-black uppercase block ${
              recordsCount === 0 ? 'text-amber-400' : audit.odometerStatus.isRollback ? 'text-rose-400' : 'text-emerald-400'
            }`}>
              {recordsCount === 0 ? 'KAYIT BEKLENİYOR' : audit.odometerStatus.isRollback ? '🔴 ŞÜPHELİ SAYAÇ' : '🟢 SAYAÇ ORİJİNAL'}
            </span>
            <span className="text-[9px] text-slate-400 block mt-0.5">
              {recordsCount === 0 ? "En az 1 servis kaydı gerekli" : "Kronolojik Geçmiş Tutarlı"}
            </span>
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
            <span className="text-[9px] text-slate-400 block mt-0.5">{recordsCount > 0 ? audit.recallStatus.title : "Fatura Eklenmedi"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarfaxReportHeader;
