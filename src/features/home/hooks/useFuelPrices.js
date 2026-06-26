import { useState, useEffect } from "react";
import { supabase } from "../../../supabaseClient";

export const useFuelPrices = () => {
  const [fuelPrices, setFuelPrices] = useState({
    istanbul: { benzin: 65.02, motorin: 67.46, lpg: 35.02 },
    ankara: { benzin: 65.99, motorin: 68.58, lpg: 35.56 },
    izmir: { benzin: 66.27, motorin: 68.85, lpg: 34.98 }
  });
  const [lastUpdated, setLastUpdated] = useState("Bugün, 12:00");

  useEffect(() => {
    const fetchLivePrices = async () => {
      try {
        const citiesConfig = [
          { name: "istanbul", code: 34, lpgRatio: 0.5386 },
          { name: "ankara", code: 6, lpgRatio: 0.5388 },
          { name: "izmir", code: 35, lpgRatio: 0.5278 }
        ];

        const updatedPrices = {
          istanbul: { benzin: 65.02, motorin: 67.46, lpg: 35.02 },
          ankara: { benzin: 65.99, motorin: 68.58, lpg: 35.56 },
          izmir: { benzin: 66.27, motorin: 68.85, lpg: 34.98 }
        };

        const fetchWithProxy = async (targetUrl) => {
          const proxies = [
            (url) => `https://corsproxy.io/?url=${encodeURIComponent(url)}`,
            (url) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
            (url) => `https://thingproxy.freeboard.io/fetch/${url}`,
            (url) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`
          ];

          for (const getProxyUrl of proxies) {
            try {
              const controller = new AbortController();
              const timeoutId = setTimeout(() => controller.abort(), 5000);

              const res = await fetch(getProxyUrl(targetUrl), { signal: controller.signal });
              clearTimeout(timeoutId);

              if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data) && data.length > 0) {
                  return data;
                }
              }
            } catch {
              // Fail silently, try next proxy
            }
          }
          throw new Error("All proxies failed to fetch");
        };

        for (const city of citiesConfig) {
          try {
            let data = null;

            // Tier 1: Local development proxy (Vite dev server)
            if (import.meta.env.DEV) {
              try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 3000);
                const localUrl = `/api/opet/fuelprices/prices?provinceCode=${city.code}&nocache=${Date.now()}`;
                const res = await fetch(localUrl, { signal: controller.signal });
                clearTimeout(timeoutId);
                if (res.ok) {
                  const jsonData = await res.json();
                  if (Array.isArray(jsonData) && jsonData.length > 0) {
                    data = jsonData;
                  }
                }
              } catch {
                // Fallback to next tier
              }
            }

            // Tier 2: Supabase Edge Function (Server-side fetch to bypass CORS)
            if (!data) {
              try {
                const { data: edgeData, error: edgeError } = await supabase.functions.invoke('fuel-prices', {
                  method: 'GET',
                  queryParams: { city: city.name }
                });

                if (!edgeError && edgeData && edgeData.results) {
                  const benzinObj = edgeData.results.find(r => r.name.includes("Benzin"));
                  const motorinObj = edgeData.results.find(r => r.name.includes("Dizel") || r.name.includes("Motorin"));
                  const lpgObj = edgeData.results.find(r => r.name.includes("LPG") || r.name.includes("Otogaz"));

                  if (benzinObj && motorinObj) {
                    updatedPrices[city.name] = {
                      benzin: benzinObj.price,
                      motorin: motorinObj.price,
                      lpg: lpgObj ? lpgObj.price : Math.round((benzinObj.price * city.lpgRatio) * 100) / 100
                    };
                    continue; // Successfully retrieved and parsed from Edge Function, move to next city
                  }
                }
              } catch {
                // Fallback to next tier
              }
            }

            // Tier 3: Client-side proxies (Fallback)
            if (!data) {
              const targetUrl = `https://api.opet.com.tr/api/fuelprices/prices?provinceCode=${city.code}&nocache=${Date.now()}`;
              data = await fetchWithProxy(targetUrl);
            }

            if (data) {
              let targetDistrict = data.find(d =>
                d.districtName === "ALTINDAĞ" ||
                d.districtName === "KADIKÖY" ||
                d.districtName === "MERKEZ" ||
                d.districtName === "KONAK"
              ) || data[0];

              if (targetDistrict && targetDistrict.prices) {
                const benzinObj = targetDistrict.prices.find(p => p.productShortName === "KURS");
                const motorinObj = targetDistrict.prices.find(p => p.productShortName === "MT_ULT");

                if (benzinObj && motorinObj) {
                  const benzin = benzinObj.amount;
                  const motorin = motorinObj.amount;
                  const lpg = Math.round((benzin * city.lpgRatio) * 100) / 100;

                  updatedPrices[city.name] = { benzin, motorin, lpg };
                }
              }
            }
          } catch {
            // Fail silently to avoid console flooding
          }
        }

        setFuelPrices(updatedPrices);
        const now = new Date();
        const formattedDate = `Bugün, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setLastUpdated(formattedDate);
      } catch (err) {
        console.error("Live prices fetch failed:", err);
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { fuelPrices, lastUpdated };
};
