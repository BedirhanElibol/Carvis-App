import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useExternalData } from "../../hooks/useExternalData";
import { useUI } from "../../context/UIContext";

const WeatherWidget = () => {
  const { fetchWeather } = useExternalData();
  const { selectedLocation } = useUI();
  const FALLBACK_WEATHER = {
    temp: "--",
    humidity: "--",
    wind: "--",
    condition: "Bağlantı Yok",
    is_day: true,
  };

  const [weather, setWeather] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const loadWeather = async () => {
      const data = await fetchWeather(0, 0, selectedLocation);
      if (!cancelled) {
        setWeather(data || FALLBACK_WEATHER);
      }
    };
    loadWeather();
    // Safety timeout: show fallback after 6s to prevent infinite spinner
    const timer = setTimeout(() => {
      if (!cancelled) setWeather((prev) => prev || FALLBACK_WEATHER);
    }, 6000);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchWeather, selectedLocation]);

  if (!weather) {
    return (
      <div className="glass-card p-4 rounded-2xl border border-black/5 dark:border-white/5 h-32 flex items-center justify-center animate-pulse">
        <Icons.Cloud className="text-slate-600" />
      </div>
    );
  }

  return (
    <div className="glass-card p-5 rounded-2xl border border-black/5 dark:border-white/5 relative overflow-hidden group">
      {/* Background Gradient based on is_day */}
      <div
        className={`absolute inset-0 opacity-20 ${weather.is_day ? "bg-gradient-to-br from-blue-400 to-yellow-200" : "bg-gradient-to-br from-slate-800 to-slate-950"}`}
      ></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h3 className="text-3xl font-black text-slate-900 dark:text-white font-sans uppercase">
            {weather.temp}°C
          </h3>
          <p className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1 font-sans">
            <Icons.MapPin size={12} /> {selectedLocation.split(",")[0]}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest bg-black/10 dark:bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md inline-block font-sans">
            {weather.condition}
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-1 font-sans">
          <Icons.Droplets size={12} className="text-blue-400" /> %
          {weather.humidity} Nem
        </div>
        <div className="flex items-center gap-1 font-sans">
          <Icons.Wind size={12} className="text-slate-500 dark:text-slate-400" /> {weather.wind}{" "}
          km/s
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;
