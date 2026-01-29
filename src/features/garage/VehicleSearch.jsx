import React, { useState } from 'react';
import { Search, Car, HelpCircle, ShieldCheck, ChevronRight, Hash } from 'lucide-react';
import { Badge } from '../../components/Core';
import { useExternalData } from '../../hooks/useExternalData';
import { CAR_DATA } from '../../constants/mockData';

const VehicleSearch = ({ onVehicleFound }) => {
  const [searchMode, setSearchMode] = useState('manual'); // 'manual' or 'vin'
  const [vin, setVin] = useState('');
  const [loading, setLoading] = useState(false);

  // Manual Selection States
  const [selection, setSelection] = useState({
    brand: '',
    model: '',
    year: '',
    engine: ''
  });

  /* 
   * Agent: Frontend Specialist
   * Integration: Public API (NHTSA vPIC)
   */
  const { fetchVinDetails } = useExternalData();

  const handleVinSearch = async () => {
    if (vin.length < 17) {
      alert("Lütfen 17 haneli geçerli bir şase numarası giriniz.");
      return;
    }

    setLoading(true);

    // Call External API
    const data = await fetchVinDetails(vin);

    if (data) {
      // Success: Map API response to Component format
      onVehicleFound({
        brand: data.brand || 'Bilinmiyor',
        model: data.model || 'Bilinmiyor',
        year: data.year || '',
        engine: `${data.engine_cylinders || '4'} Silindir - ${data.fuel_type || 'Benzin'}`,
        plate: '34' + (Math.random() + 1).toString(36).substring(7).toUpperCase(), // Random plate for demo
        vin: vin
      });
    } else {
      alert("Araç bilgileri bulunamadı. Lütfen kontrol ediniz.");
    }

    setLoading(false);
  };

  const handleManualSubmit = () => {
    if (selection.brand && selection.model) {
      onVehicleFound({
        ...selection,
        plate: '34' + (Math.random() + 1).toString(36).substring(7).toUpperCase()
      });
    }
  };

  return (
    <div className="glass-card rounded-[2.5rem] p-8 border border-white/10 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in duration-500">
      {/* Design elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-primary-500/20 p-2.5 rounded-2xl">
            <Car size={24} className="text-primary-500" />
          </div>
          <div>
            <h2 className="text-xl font-black italic tracking-tighter uppercase text-white">ARACINIZI TANIMLAYIN</h2>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Doğru parça ve usta için %100 uyum</p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex p-1 bg-slate-950/50 rounded-2xl border border-white/5 mb-8">
          <button
            onClick={() => setSearchMode('manual')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'manual' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Manuel Seçim
          </button>
          <button
            onClick={() => setSearchMode('vin')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${searchMode === 'vin' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500'}`}
          >
            Şase No (VIN)
          </button>
        </div>

        {searchMode === 'vin' ? (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="text"
                maxLength={17}
                placeholder="17 haneli Şase No giriniz..."
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 pl-12 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600"
              />
            </div>

            <div className="bg-primary-500/5 border border-primary-500/20 p-4 rounded-2xl flex items-start gap-3">
              <ShieldCheck size={20} className="text-primary-500 shrink-0" />
              <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                <span className="text-white font-black uppercase">Carvis Uyarı:</span> Şase numarası, aracınızın tam parça katalog kodlarını (TecdDoc uyumlu) çözmemizi sağlar. Yanlış parça riskini sıfıra indirir.
              </p>
            </div>

            <button
              onClick={handleVinSearch}
              disabled={vin.length < 17 || loading}
              className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-30 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active-scale shadow-lg shadow-primary-900/40 flex items-center justify-center gap-3"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : "ARACI ÇÖZÜMLE"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in slide-in-from-left-4">
            {/* BRAND SELECTOR */}
            <select
              onChange={(e) => setSelection({ ...selection, brand: e.target.value, model: '' })}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary-500 appearance-none uppercase"
              value={selection.brand}
            >
              <option value="">MARKA SEÇİN</option>
              {CAR_DATA.map((car, index) => (
                <option key={index} value={car.brand}>{car.brand}</option>
              ))}
            </select>

            {/* MODEL SELECTOR (Dependent on Brand) */}
            <select
              onChange={(e) => setSelection({ ...selection, model: e.target.value })}
              className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary-500 appearance-none uppercase disabled:opacity-50"
              value={selection.model}
              disabled={!selection.brand}
            >
              <option value="">MODEL SEÇİN</option>
              {selection.brand && CAR_DATA.find(c => c.brand === selection.brand)?.models.map((model, index) => (
                <option key={index} value={model}>{model}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="YIL (ÖRN: 2023)"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600"
                onChange={(e) => setSelection({ ...selection, year: e.target.value })}
              />
              <input
                type="text"
                placeholder="MOTOR (ÖRN: 1.6 TDI)"
                className="w-full bg-slate-950 border border-white/10 rounded-2xl p-5 text-sm font-bold text-white outline-none focus:ring-2 focus:ring-primary-500 transition-all placeholder:text-slate-600"
                onChange={(e) => setSelection({ ...selection, engine: e.target.value })}
              />
            </div>

            <button
              onClick={handleManualSubmit}
              disabled={!selection.brand || !selection.model}
              className="w-full bg-white text-slate-950 hover:bg-slate-100 disabled:opacity-30 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active-scale shadow-xl flex items-center justify-center gap-3"
            >
              DEVAM ET <ChevronRight size={18} />
            </button>
          </div>
        )}

        <div className="mt-8 flex items-center justify-center gap-4 text-slate-600">
          <button className="flex items-center gap-1.5 hover:text-white transition-colors">
            <HelpCircle size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest leading-none">Şase No Nerede Yazar?</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehicleSearch;