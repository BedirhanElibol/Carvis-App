import { useState, useCallback } from "react";
import {
  decodeVin,
  getFuelPrices,
  getEVStations,
} from "../services/externalApis";

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
      setError(err.message || "VIN Decode Failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFuelPrices = useCallback(async (city = "istanbul") => {
    setLoading(true);
    const cacheKey = `carvis_fuel_prices_${city.toLowerCase().split(",")[0].trim()}`;
    try {
      // Check LocalStorage cache first
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        const isFresh = new Date() - new Date(timestamp) < 1000 * 60 * 30; // 30 Minutes validity
        if (isFresh) {
          setLoading(false);
          return data;
        }
      }
      const data = await getFuelPrices(city);
      // Cache it
      localStorage.setItem(
        cacheKey,
        JSON.stringify({ data, timestamp: new Date().toISOString() }),
      );
      return data;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchEVStations = useCallback(async (lat, lng) => {
    const cacheKey = `carvis_ev_stations_${lat.toFixed(2)}_${lng.toFixed(2)}`;
    setLoading(true);
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (new Date() - new Date(timestamp) < 1000 * 60 * 60) {
          // 1 Hour
          setLoading(false);
          return data;
        }
      }
      const data = await getEVStations(lat, lng);
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ data, timestamp: new Date().toISOString() }),
      );
      return data;
    } catch (err) {
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchWeather = useCallback(async (lat, lng, cityName = null) => {
    const cityKey = cityName ? cityName.toLowerCase().split(",")[0].trim() : `${lat.toFixed(2)}_${lng.toFixed(2)}`;
    const cacheKey = `carvis_weather_${cityKey}`;
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        // Only use cache if data is NOT null and within 30 minutes
        if (data && new Date() - new Date(timestamp) < 1000 * 60 * 30) {
          return data;
        }
        // Clear stale or null cache
        sessionStorage.removeItem(cacheKey);
      }
      const result = await import("../services/externalApis").then((mod) =>
        mod.getWeather(lat, lng, cityName),
      );
      // Only cache valid results
      if (result) {
        sessionStorage.setItem(
          cacheKey,
          JSON.stringify({ data: result, timestamp: new Date().toISOString() }),
        );
      }
      return result;
    } catch (e) {
      console.error(e);
      return null;
    }
  }, []);

  const fetchExchangeRate = useCallback(async (base, target) => {
    try {
      const result = await import("../services/externalApis").then((mod) =>
        mod.getExchangeRates(base, target),
      );
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
    fetchExchangeRate,
  };
};
