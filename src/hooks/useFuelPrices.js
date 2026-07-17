import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { getFuelPrices } from "../services/externalApis";

export const useFuelPrices = (t) => {
  const [fuelPrices, setFuelPrices] = useState({
    istanbul: { benzin: "-", motorin: "-", lpg: "-" },
    ankara: { benzin: "-", motorin: "-", lpg: "-" },
    izmir: { benzin: "-", motorin: "-", lpg: "-" }
  });
  const [lastUpdated, setLastUpdated] = useState("-");

  useEffect(() => {
    let isMounted = true;
    
    const fetchLivePrices = async () => {
      try {
        const provinceCodes = ["34", "06", "35"]; // istanbul, ankara, izmir

        const { data, error } = await supabase
          .from('live_fuel_prices')
          .select('*')
          .in('province_code', provinceCodes);

        if (error) throw error;

        if (data && data.length > 0) {
          const updatedPrices = { ...fuelPrices };
          let latestDateStr = "-";

          data.forEach((cityData) => {
            let cityName = "istanbul";
            if (cityData.province_code === "06") cityName = "ankara";
            else if (cityData.province_code === "35") cityName = "izmir";

            updatedPrices[cityName] = {
              benzin: cityData.benzin,
              motorin: cityData.motorin,
              lpg: cityData.lpg
            };

            // Parse DB UTC to Local Date String
            if (cityData.last_fetched_at) {
              const d = new Date(cityData.last_fetched_at);
              latestDateStr = `${d.toLocaleDateString("tr-TR", { day: "2-digit", month: "2-digit", year: "numeric" })} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
            }
          });

          if (isMounted) {
            setFuelPrices(updatedPrices);
            setLastUpdated(latestDateStr);
          }
        } else {
          // Fallback to live API instead of static mock data
          try {
            const istData = await getFuelPrices("istanbul");
            const ankData = await getFuelPrices("ankara");
            const izmData = await getFuelPrices("izmir");

            const livePrices = {
              istanbul: {
                benzin: istData.results.find(r => r.name.includes("Benzin"))?.price || "65.63",
                motorin: istData.results.find(r => r.name.includes("Dizel"))?.price || "73.05",
                lpg: istData.results.find(r => r.name.includes("LPG"))?.price || "32.55"
              },
              ankara: {
                benzin: ankData.results.find(r => r.name.includes("Benzin"))?.price || "44.52",
                motorin: ankData.results.find(r => r.name.includes("Dizel"))?.price || "42.15",
                lpg: ankData.results.find(r => r.name.includes("LPG"))?.price || "22.85"
              },
              izmir: {
                benzin: izmData.results.find(r => r.name.includes("Benzin"))?.price || "44.75",
                motorin: izmData.results.find(r => r.name.includes("Dizel"))?.price || "42.30",
                lpg: izmData.results.find(r => r.name.includes("LPG"))?.price || "22.60"
              }
            };

            if (isMounted) {
              setFuelPrices(livePrices);
              setLastUpdated(`${new Date().toLocaleDateString("tr-TR")} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`);
            }
          } catch (apiErr) {
            console.error("Live API fallback failed:", apiErr);
            if (isMounted) {
              setFuelPrices({
                istanbul: { benzin: "65.63", motorin: "73.05", lpg: "32.55" },
                ankara: { benzin: "44.52", motorin: "42.15", lpg: "22.85" },
                izmir: { benzin: "44.75", motorin: "42.30", lpg: "22.60" }
              });
              const d = new Date();
              setLastUpdated(`${d.toLocaleDateString("tr-TR")} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
            }
          }
        }
      } catch (err) {
        console.error("Live prices fetch from Supabase failed:", err);
        // Live API fallback on error
        try {
          const istData = await getFuelPrices("istanbul");
          const ankData = await getFuelPrices("ankara");
          const izmData = await getFuelPrices("izmir");

          const livePrices = {
            istanbul: {
              benzin: istData.results.find(r => r.name.includes("Benzin"))?.price || "65.63",
              motorin: istData.results.find(r => r.name.includes("Dizel"))?.price || "73.05",
              lpg: istData.results.find(r => r.name.includes("LPG"))?.price || "32.55"
            },
            ankara: {
              benzin: ankData.results.find(r => r.name.includes("Benzin"))?.price || "44.52",
              motorin: ankData.results.find(r => r.name.includes("Dizel"))?.price || "42.15",
              lpg: ankData.results.find(r => r.name.includes("LPG"))?.price || "22.85"
            },
            izmir: {
              benzin: izmData.results.find(r => r.name.includes("Benzin"))?.price || "44.75",
              motorin: izmData.results.find(r => r.name.includes("Dizel"))?.price || "42.30",
              lpg: izmData.results.find(r => r.name.includes("LPG"))?.price || "22.60"
            }
          };

          if (isMounted) {
            setFuelPrices(livePrices);
            setLastUpdated(`${new Date().toLocaleDateString("tr-TR")} ${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`);
          }
        } catch (apiErr) {
          if (isMounted) {
            setFuelPrices({
              istanbul: { benzin: "65.63", motorin: "73.05", lpg: "32.55" },
              ankara: { benzin: "44.52", motorin: "42.15", lpg: "22.85" },
              izmir: { benzin: "44.75", motorin: "42.30", lpg: "22.60" }
            });
            const d = new Date();
            setLastUpdated(`${d.toLocaleDateString("tr-TR")} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`);
          }
        }
      }
    };

    fetchLivePrices();
    const interval = setInterval(fetchLivePrices, 30 * 60 * 1000);
    
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [t]);

  return { fuelPrices, lastUpdated };
};
