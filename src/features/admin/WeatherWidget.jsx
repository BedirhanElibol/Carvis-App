import React, { useEffect, useState } from 'react';
import { Cloud, Wind, Droplets, MapPin } from 'lucide-react';
import { useExternalData } from '../../hooks/useExternalData';

const WeatherWidget = () => {
    const { fetchWeather } = useExternalData();
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        // Istanbul Coordinates
        const loadWeather = async () => {
            const data = await fetchWeather(41.0082, 28.9784);
            setWeather(data);
        };
        loadWeather();
    }, [fetchWeather]);

    if (!weather) return (
        <div className="glass-card p-4 rounded-2xl border border-white/5 h-32 flex items-center justify-center animate-pulse">
            <Cloud className="text-slate-600" />
        </div>
    );

    return (
        <div className="glass-card p-5 rounded-2xl border border-white/5 relative overflow-hidden group">
            {/* Background Gradient based on is_day */}
            <div className={`absolute inset-0 opacity-20 ${weather.is_day ? 'bg-gradient-to-br from-blue-400 to-yellow-200' : 'bg-gradient-to-br from-indigo-900 to-purple-900'}`}></div>

            <div className="relative z-10 flex justify-between items-start">
                <div>
                    <h3 className="text-3xl font-black text-white">{weather.temp}°C</h3>
                    <p className="text-sm font-bold text-slate-300 flex items-center gap-1">
                        <MapPin size={12} /> İstanbul
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs font-black text-white uppercase tracking-widest bg-white/10 px-2 py-1 rounded-lg backdrop-blur-md inline-block">
                        {weather.condition}
                    </p>
                </div>
            </div>

            <div className="mt-4 flex gap-4 text-xs font-medium text-slate-300">
                <div className="flex items-center gap-1">
                    <Droplets size={12} className="text-blue-400" /> %{weather.humidity} Nem
                </div>
                <div className="flex items-center gap-1">
                    <Wind size={12} className="text-slate-400" /> {weather.wind} km/s
                </div>
            </div>
        </div>
    );
};

export default WeatherWidget;
