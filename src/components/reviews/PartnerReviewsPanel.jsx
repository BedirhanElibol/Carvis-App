import React, { useState, useEffect, useCallback } from 'react';
import { Star, MessageSquare, User, ThumbsUp, RefreshCw } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const StarDisplay = ({ rating }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={12}
        className={s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}
      />
    ))}
  </div>
);

const PartnerReviewsPanel = ({ partnerId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ avg: 0, total: 0, dist: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } });

  const fetchReviews = useCallback(async () => {
    if (!partnerId) return;
    setLoading(true);
    try {
      // Fetch from dedicated reviews table
      const { data: reviewData } = await supabase
        .from('reviews')
        .select('*, reviewer:reviewer_id(full_name, user_metadata)')
        .eq('seller_id', partnerId)
        .order('created_at', { ascending: false })
        .limit(20);

      // Also fetch from orders table (ratings submitted via ReviewModal)
      const { data: orderData } = await supabase
        .from('orders')
        .select('id, rating, review_comment, created_at, customer:customer_id(full_name)')
        .eq('seller_id', partnerId)
        .not('rating', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);

      // Merge both sources
      const fromReviews = (reviewData || []).map(r => ({
        id: `rev-${r.id}`,
        rating: r.rating,
        comment: r.comment,
        reviewerName: r.reviewer?.full_name || r.reviewer?.user_metadata?.full_name || 'Anonim Kullanıcı',
        createdAt: r.created_at,
        source: 'reviews',
      }));

      const fromOrders = (orderData || []).map(o => ({
        id: `ord-${o.id}`,
        rating: o.rating,
        comment: o.review_comment,
        reviewerName: o.customer?.full_name || 'Anonim Müşteri',
        createdAt: o.created_at,
        source: 'orders',
      }));

      const combined = [...fromReviews, ...fromOrders]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setReviews(combined);

      // Calculate stats
      if (combined.length > 0) {
        const avg = combined.reduce((sum, r) => sum + r.rating, 0) / combined.length;
        const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        combined.forEach(r => { dist[r.rating] = (dist[r.rating] || 0) + 1; });
        setStats({ avg: avg.toFixed(1), total: combined.length, dist });
      }
    } catch (err) {
      console.error('PartnerReviewsPanel fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [partnerId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RefreshCw size={24} className="animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-slate-900 dark:text-slate-100">
      {/* Stats Header */}
      {reviews.length > 0 && (
        <div className="glass-card p-6 rounded-3xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-slate-900/40">
          <div className="flex gap-6 items-center">
            <div className="text-center">
              <p className="text-5xl font-mono font-black text-slate-900 dark:text-white tracking-tighter">{stats.avg}</p>
              <div className="mt-1 flex justify-center">
                <StarDisplay rating={Math.round(parseFloat(stats.avg))} />
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest mt-2">{stats.total} Değerlendirme</p>
            </div>
            <div className="flex-1 space-y-1">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = stats.dist[star] || 0;
                const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                return (
                  <div key={star} className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 w-3">{star}</span>
                    <Star size={10} className="text-amber-400 fill-amber-400 shrink-0" />
                    <div className="flex-1 h-1.5 bg-slate-200 dark:bg-slate-950/40 border border-black/5 dark:border-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-400 rounded-full transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 w-6">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 glass-card border border-black/5 dark:border-white/5 bg-white/50 dark:bg-slate-900/40 rounded-3xl">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-950/40 border border-black/5 dark:border-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={28} className="text-slate-500 dark:text-slate-400" />
          </div>
          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">Henüz değerlendirme yok</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">İlk hizmeti tamamladıktan sonra yorumlar burada görünecek.</p>
        </div>
      ) : (
        <AnimatePresence>
          {reviews.map((review, idx) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass-card p-5 rounded-3xl border border-black/5 dark:border-white/5 bg-white/50 dark:bg-slate-900/40 hover:border-black/10 dark:hover:border-white/10 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-full flex items-center justify-center shrink-0 shadow-md">
                    <User size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 dark:text-white">{review.reviewerName}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <StarDisplay rating={review.rating} />
              </div>
              {review.comment && (
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/40 border border-black/5 dark:border-white/5 rounded-xl p-3.5 italic">
                  "{review.comment}"
                </p>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default PartnerReviewsPanel;
