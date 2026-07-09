import React, { useState } from "react";
import { ChevronRight, Crosshair, MapPin, Save, X } from "lucide-react";
import { TURKEY_CITIES } from "../../constants/turkeyCities";

const CITY_OPTIONS = Object.values(TURKEY_CITIES)
  .map((c) => c.city)
  .sort((a, b) => a.localeCompare(b, "tr"));

const CITY_TO_DISTRICTS = Object.values(TURKEY_CITIES).reduce((acc, curr) => {
  acc[curr.city] = [...curr.districts].sort((a, b) => a.localeCompare(b, "tr"));
  return acc;
}, {});

const LocationSelectModal = ({
  show,
  onClose,
  t,
  handleGetGPSLocation,
  handleManualLocationSelect,
  showAlert,
  currentLocation,
}) => {
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [isManual, setIsManual] = useState(false);

  if (!show || !t) return null;

  const cityOptions = CITY_OPTIONS;
  const districtOptions = city ? CITY_TO_DISTRICTS[city] || [] : [];

  const handleSelect = () => {
    if (!city || !district) {
      return showAlert(
        "Eksik Seçim",
        "Lütfen hem il hem de ilçe seçiniz.",
        "warning",
      );
    }
    handleManualLocationSelect(city, district);
  };

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950/60 z-[200] flex items-end sm:items-center justify-center backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white dark:bg-slate-900 w-full sm:w-[450px] p-8 rounded-t-[3rem] sm:rounded-[3rem] border-t sm:border border-black/10 dark:border-white/10 animate-in slide-in-from-bottom-full duration-500 shadow-[0_20px_100px_rgba(0,0,0,0.8)] relative overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/10 rounded-full blur-3xl -mr-10 -mt-10"></div>

        <div className="flex justify-between items-center mb-10 relative z-10">
          <div>
            <h3 className="font-black text-2xl text-slate-900 dark:text-white tracking-tighter uppercase font-sans">
              {t.locationSelect}
            </h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1 font-sans">
              Servis Bölgesini Belirleyin
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-black/5 dark:bg-white/5 p-3 rounded-2xl hover:bg-black/10 dark:bg-white/10 transition-all active-scale border border-black/5 dark:border-white/5"
          >
            <X size={20} className="text-slate-900 dark:text-white" />
          </button>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950/40 border border-black/5 dark:border-white/5 p-4 rounded-2xl mb-8 flex items-center gap-3 relative z-10">
          <div className="bg-primary-500/20 p-2 rounded-lg">
            <MapPin size={16} className="text-primary-500" />
          </div>
          <div className="flex-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5 font-sans">
              Aktif Konum
            </p>
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-none font-sans">
              {currentLocation || "Henüz Belirlenmedi"}
            </p>
          </div>
        </div>

        <div className="space-y-5 relative z-10">
          <button
            onClick={() => {
              handleGetGPSLocation();
            }}
            className="w-full bg-gradient-to-r from-primary-600/20 to-primary-900/10 border border-primary-500/20 p-5 rounded-3xl flex items-center gap-5 hover:bg-primary-500/20 transition-all group active-scale shadow-lg"
          >
            <div className="bg-primary-500 p-3.5 rounded-2xl shadow-[0_5px_15px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform">
              <Crosshair size={24} className="text-slate-900 dark:text-white" />
            </div>
            <div className="text-left">
              <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight font-sans">
                {t.currentLocation}
              </h4>
              <p className="text-[10px] text-primary-400 font-medium">
                En yakın usta ve parçaları bul
              </p>
            </div>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsManual(!isManual)}
              className={`w-full bg-black/5 dark:bg-white/5 border p-5 rounded-3xl flex items-center justify-between transition-all active-scale ${
                isManual
                  ? "border-primary-500 ring-2 ring-primary-500/20"
                  : "border-black/5 dark:border-white/5 hover:bg-black/10 dark:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-xl">
                  <MapPin size={20} className="text-slate-500 dark:text-slate-400" />
                </div>
                <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight font-sans">
                  {t.manualLocation}
                </h4>
              </div>
              <ChevronRight
                size={20}
                className={`text-slate-500 transition-transform duration-300 ${isManual ? "rotate-90" : ""}`}
              />
            </button>

            {isManual && (
              <div className="space-y-4 pt-6 animate-in slide-in-from-top-2 duration-300">
                <div className="relative group">
                  <select
                    aria-label={t.selectCity}
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      setDistrict("");
                    }}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4 outline-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer font-sans"
                  >
                    <option
                      value=""
                      disabled
                      className="bg-white dark:bg-slate-900 text-slate-500"
                    >
                      {t.selectCity}
                    </option>
                    {cityOptions.map((c) => (
                      <option
                        key={c}
                        value={c}
                        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none"
                  />
                </div>

                <div className="relative">
                  <select
                    aria-label={t.selectDistrict}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    disabled={!city}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-2xl p-4 outline-none text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all appearance-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    <option
                      value=""
                      disabled
                      className="bg-white dark:bg-slate-900 text-slate-500"
                    >
                      {t.selectDistrict}
                    </option>
                    {districtOptions.map((d) => (
                      <option
                        key={d}
                        value={d}
                        className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        {d}
                      </option>
                    ))}
                  </select>
                  <ChevronRight
                    size={16}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 rotate-90 pointer-events-none"
                  />
                </div>

                <button
                  onClick={handleSelect}
                  className="w-full bg-primary-600 hover:bg-primary-500 text-slate-900 dark:text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active-scale shadow-lg shadow-primary-900/20 flex items-center justify-center gap-3 mt-4 font-sans"
                >
                  <Save size={18} /> {t.save}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSelectModal;
