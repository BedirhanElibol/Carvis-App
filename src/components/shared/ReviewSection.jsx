import React, { useState } from "react";
import * as Icons from "lucide-react";
import StarRating from "./StarRating";
import { triggerHaptic } from "../../utils/haptics";

const MOCK_REVIEWS = [
  {
    id: 1,
    user: "Ahmet Y.",
    rating: 5,
    date: "2024-03-15",
    text: "Kaliteli ürün, hızlı kargo. Aracıma birebir uydu.",
    likes: 12,
    verified: true,
  },
  {
    id: 2,
    user: "Mehmet K.",
    rating: 4,
    date: "2024-03-10",
    text: "Fiyat/performans açısından gayet iyi. Montajı kolay.",
    likes: 8,
    verified: true,
  },
  {
    id: 3,
    user: "Elif S.",
    rating: 5,
    date: "2024-02-28",
    text: "Orijinal parça kalitesinde, tavsiye ederim.",
    likes: 5,
    verified: false,
  },
  {
    id: 4,
    user: "Can D.",
    rating: 3,
    date: "2024-02-20",
    text: "Ürün iyi ama kutu hasarlı geldi. Satıcı ile iletişime geçtim, çözüm sundu.",
    likes: 3,
    verified: true,
  },
];

const ReviewSection = () => {
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [newText, setNewText] = useState("");
  const [reviews] = useState(MOCK_REVIEWS);

  const avgRating =
    reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct:
      (reviews.filter((r) => r.rating === star).length / reviews.length) * 100,
  }));

  const handleSubmitReview = () => {
    if (!newRating || !newText.trim()) return;
    triggerHaptic("success");
    setShowWriteReview(false);
    setNewRating(0);
    setNewText("");
  };

  return (
    <div className="space-y-5">
      {/* Summary Header */}
      <div className="glass-card p-5 rounded-[2rem] border border-white/5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-white uppercase text-sm tracking-tight flex items-center gap-2">
            <Icons.MessageSquare size={16} className="text-primary-500" />{" "}
            Değerlendirmeler
          </h3>
          <button
            onClick={() => setShowWriteReview(!showWriteReview)}
            className="bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-all"
          >
            Yorum Yaz
          </button>
        </div>
        <div className="flex gap-6">
          {/* Average Rating */}
          <div className="text-center">
            <p className="text-4xl font-black text-white">
              {avgRating.toFixed(1)}
            </p>
            <StarRating rating={avgRating} readOnly size={14} />
            <p className="text-[10px] text-slate-500 font-bold mt-1">
              {reviews.length} yorum
            </p>
          </div>
          {/* Distribution Bars */}
          <div className="flex-1 space-y-1.5">
            {ratingDistribution.map(({ star, count, pct }) => {
              const widthStyle = { width: `${pct}%` };
              return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-500 w-3">
                  {star}
                </span>
                <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-400 rounded-full transition-all duration-500"
                    style={widthStyle}
                  />
                </div>
                <span className="text-[10px] font-bold text-slate-600 w-5">
                  {count}
                </span>
              </div>
            )})}
          </div>
        </div>
      </div>

      {/* Write Review Form */}
      {showWriteReview && (
        <div className="glass-card p-5 rounded-[2rem] border border-primary-500/20 animate-in slide-in-from-top-3 space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Puanınız
          </p>
          <StarRating rating={newRating} onRate={setNewRating} size={28} />
          <textarea
            placeholder="Deneyiminizi paylaşın..."
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            rows={3}
            className="w-full bg-slate-950 border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-primary-500 transition-all placeholder:text-slate-700 resize-none"
          />
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-slate-800 text-slate-400 px-4 py-2.5 rounded-xl text-[10px] font-bold">
              <Icons.Camera size={14} /> Fotoğraf Ekle
            </button>
            <button
              onClick={handleSubmitReview}
              disabled={!newRating || !newText.trim()}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-500 disabled:opacity-30 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Icons.Send size={14} /> Gönder
            </button>
          </div>
        </div>
      )}

      {/* Review List */}
      <div className="space-y-3">
        {reviews.map((review) => (
          <div
            key={review.id}
            className="glass-card p-4 rounded-2xl border border-white/5 space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <Icons.User size={14} className="text-slate-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">
                      {review.user}
                    </span>
                    {review.verified && (
                      <span className="text-[8px] font-black bg-green-500/10 text-green-400 px-1.5 py-0.5 rounded border border-green-500/20">
                        ✓ ALICI
                      </span>
                    )}
                  </div>
                  <p className="text-[9px] text-slate-600">
                    {new Date(review.date).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
              <StarRating rating={review.rating} readOnly size={12} />
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {review.text}
            </p>
            <button className="flex items-center gap-1.5 text-slate-600 hover:text-primary-400 transition-colors">
              <Icons.ThumbsUp size={12} />
              <span className="text-[10px] font-bold">{review.likes}</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewSection;
