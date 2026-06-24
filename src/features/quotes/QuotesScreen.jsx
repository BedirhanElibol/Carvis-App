import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuote } from "../../context/QuoteContext";
import * as Icons from "lucide-react";
import QuoteCard from "./QuoteCard";

const QuotesScreen = () => {
  const navigate = useNavigate();
  const { quotes, loading } = useQuote();
  const [filter, setFilter] = useState("all"); // 'all', 'pending', 'accepted', 'rejected', 'expired'

  const filteredQuotes =
    filter === "all" ? quotes : quotes.filter((q) => q.status === filter);

  const filterOptions = [
    { value: "all", label: "Tümü", count: quotes.length },
    {
      value: "pending",
      label: "Beklemede",
      count: quotes.filter((q) => q.status === "pending").length,
    },
    {
      value: "accepted",
      label: "Kabul Edildi",
      count: quotes.filter((q) => q.status === "accepted").length,
    },
    {
      value: "rejected",
      label: "Reddedildi",
      count: quotes.filter((q) => q.status === "rejected").length,
    },
    {
      value: "expired",
      label: "Süresi Doldu",
      count: quotes.filter((q) => q.status === "expired").length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950/80 backdrop-blur-xl border-b border-black/10 dark:border-white/10 p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 glass-card rounded-xl flex items-center justify-center active-scale"
            >
              <Icons.ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">Tekliflerim</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {filteredQuotes.length} teklif
              </p>
            </div>
          </div>
          <Icons.Filter size={20} className="text-slate-500 dark:text-slate-400" />
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === option.value
                  ? "bg-primary-500 text-slate-900 dark:text-white"
                  : "glass-card text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white"
              }`}
            >
              {option.label} ({option.count})
            </button>
          ))}
        </div>
      </div>

      {/* Quote List */}
      <div className="p-5 space-y-3">
        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-slate-500 dark:text-slate-400 mt-4">Teklifler yükleniyor...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-slate-500 dark:text-slate-400">
              {filter === "all"
                ? "Henüz teklif bulunmuyor"
                : `${filterOptions.find((o) => o.value === filter)?.label} teklif yok`}
            </p>
          </div>
        ) : (
          filteredQuotes.map((quote) => (
            <QuoteCard key={quote.id} quote={quote} />
          ))
        )}
      </div>
    </div>
  );
};

export default QuotesScreen;
