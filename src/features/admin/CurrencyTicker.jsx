import React, { useEffect, useState } from "react";
import * as Icons from "lucide-react";
import { useExternalData } from "../../hooks/useExternalData";
const CurrencyTicker = () => {
  const { fetchExchangeRate } = useExternalData();
  const [rates, setRates] = useState({ usd: null, eur: null });
  useEffect(() => {
    const loadRates = async () => {
      const usd = await fetchExchangeRate("USD", "TRY");
      const eur = await fetchExchangeRate("EUR", "TRY");
      setRates({ usd, eur });
    };
    loadRates();
  }, [fetchExchangeRate]);
  return (
    <div className="glass-card p-4 rounded-2xl border border-black/5 dark:border-white/5 flex items-center justify-between gap-4">
      {" "}
      <div className="flex items-center gap-2">
        {" "}
        <div className="bg-green-500/10 p-2 rounded-lg text-green-400">
          {" "}
          <Icons.DollarSign size={16} />{" "}
        </div>{" "}
        <div>
          {" "}
          <p className="text-[10px] text-slate-500 font-black uppercase">
            USD/TRY
          </p>{" "}
          <p className="text-slate-900 dark:text-white font-bold">
            {rates.usd ? `₺${rates.usd.rate.toFixed(2)}` : "..."}
          </p>{" "}
        </div>{" "}
      </div>{" "}
      <div className="w-[1px] h-8 bg-black/10 dark:bg-white/10"></div>{" "}
      <div className="flex items-center gap-2">
        {" "}
        <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400">
          {" "}
          <Icons.Euro size={16} />{" "}
        </div>{" "}
        <div>
          {" "}
          <p className="text-[10px] text-slate-500 font-black uppercase">
            EUR/TRY
          </p>{" "}
          <p className="text-slate-900 dark:text-white font-bold">
            {rates.eur ? `₺${rates.eur.rate.toFixed(2)}` : "..."}
          </p>{" "}
        </div>{" "}
      </div>{" "}
    </div>
  );
};
export default CurrencyTicker;
