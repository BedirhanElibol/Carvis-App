import React, { useState } from "react";
import { Package, Send, Wrench } from "lucide-react";

/**
 * VehicleDemandForm Component
 * Renders a form to create a technical part or service demand for a specific vehicle.
 */
const VehicleDemandForm = ({
  vehicle,
  onSubmit,
  initialDemandType = "part",
  initialDescription = "",
}) => {
  const [demandType, setDemandType] = useState(initialDemandType); // 'part' veya 'service'
  const [description, setDescription] = useState(initialDescription);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl border border-slate-100 animate-slide-up">
      {/* Seçili Araç Özeti */}
      <div className="bg-blue-600 p-4 rounded-2xl mb-6 text-slate-900 dark:text-white shadow-lg shadow-blue-200">
        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
          Seçili Araç
        </p>
        <h4 className="font-bold text-lg">
          {vehicle.brand} {vehicle.model}
        </h4>
        <div className="flex justify-between mt-2 text-xs font-medium opacity-90">
          <span>{vehicle.engineCode}</span>
          <span>{vehicle.year}</span>
        </div>
      </div>

      <h2 className="text-xl font-black text-slate-900 mb-4 text-center uppercase tracking-tight">
        Ne Lazım?
      </h2>

      {/* Talep Türü Seçimi */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => setDemandType("part")}
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 ${
            demandType === "part"
              ? "border-blue-600 bg-blue-50"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <Package
            className={
              demandType === "part" ? "text-blue-600" : "text-slate-500 dark:text-slate-400"
            }
          />
          <span className="text-xs font-black uppercase">Yedek Parça</span>
        </button>

        <button
          onClick={() => setDemandType("service")}
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-2 ${
            demandType === "service"
              ? "border-blue-600 bg-blue-50"
              : "border-slate-100 bg-slate-50"
          }`}
        >
          <Wrench
            className={
              demandType === "service" ? "text-blue-600" : "text-slate-500 dark:text-slate-400"
            }
          />
          <span className="text-xs font-black uppercase">Usta / Servis</span>
        </button>
      </div>

      {/* Detay Açıklama */}
      <div className="mb-6">
        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase ml-2 mb-1 block">
          Talebinizi Açıklayın
        </label>
        <textarea
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={
            demandType === "part"
              ? "Örn: Ön fren balatası, Yağ filtresi..."
              : "Örn: Motor arıza lambası yanıyor, Periyodik bakım..."
          }
          className="w-full bg-slate-50 border-2 border-slate-100 p-4 rounded-2xl text-sm font-medium focus:border-blue-500 focus:bg-white outline-none transition-all resize-none"
        />
      </div>

      {/* Gönder Butonu */}
      <button
        onClick={() => onSubmit({ demandType, description })}
        className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white p-5 rounded-2xl font-black text-lg tracking-widest uppercase hover:bg-blue-600 transition-all flex items-center justify-center space-x-3 active:scale-95"
      >
        <Send size={20} />
        <span>Talebi Gönder</span>
      </button>
    </div>
  );
};

export default VehicleDemandForm;
