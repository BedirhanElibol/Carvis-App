import { useState, useCallback } from 'react';
import { decodeVin, getFuelPrices, getEVStations } from '../services/externalApis';

export const useExternalData = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchVinDetails = useCallback(async (vin) => {
        setLoading(true);
        setError(null);
        try {
            const data = await decodeVin(vin);
            return data;
        } catch (err) {
            setError(err.message || 'VIN Decode Failed');
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchFuelPrices = useCallback(async () => {
        setLoading(true);
        try {
            // Check LocalStorage cache first (Simple cache strategy)
            const cached = localStorage.getItem('carvis_fuel_prices');
            if (cached) {
                const { data, timestamp } = JSON.parse(cached);
                const isFresh = (new Date() - new Date(timestamp)) < 1000 * 60 * 60 * 6; // 6 Hours validity
                if (isFresh) {
                    setLoading(false);
                    return data;
                }
            }

            const data = await getFuelPrices();
            // Cache it
            localStorage.setItem('carvis_fuel_prices', JSON.stringify({
                data,
                timestamp: new Date().toISOString()
            }));

            return data;
        } catch (err) {
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchEVStations = useCallback(async (lat, lng) => {
        setLoading(true);
        try {
            const data = await getEVStations(lat, lng);
            return data;
        } catch (err) {
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchWeather = useCallback(async (lat, lng) => {
        // No caching for weather
        try {
            const result = await import('../services/externalApis').then(mod => mod.getWeather(lat, lng));
            return result;
        } catch (e) {
            console.error(e);
            return null;
        }
    }, []);

    const fetchExchangeRate = useCallback(async (base, target) => {
        try {
            const result = await import('../services/externalApis').then(mod => mod.getExchangeRates(base, target));
            return result;
        } catch (e) {
            console.error(e);
            return null;
        }
    }, []);

    return {
        loading,
        error,
        fetchVinDetails,
        fetchFuelPrices,
        fetchEVStations,
        fetchWeather,
        fetchExchangeRate
    };
};
