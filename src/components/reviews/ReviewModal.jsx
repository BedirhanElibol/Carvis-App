import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, X, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';

const ReviewModal = ({ isOpen, onClose, order, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    if (!isOpen || !order) return null;

    const handleSubmit = async () => {
        if (rating === 0) return;
        
        setIsSubmitting(true);
        try {
            // Update order with rating and comment
            const { error } = await supabase
                .from('orders')
                .update({ 
                    rating: rating,
                    review_comment: comment 
                })
                .eq('id', order.id);

            if (error) throw error;

            // In a real app, you would also trigger an RPC to update seller's average rating here

            setIsSuccess(true);
            setTimeout(() => {
                onSuccess?.();
                onClose();
                setIsSuccess(false);
                setRating(0);
                setComment('');
            }, 2000);
            
        } catch (error) {
            console.error('Review Submit Error:', error);
            alert("Değerlendirme kaydedilirken bir hata oluştu.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60"
                />
                
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-xl border border-white/10 overflow-hidden"
                >
                    {isSuccess ? (
                        <div className="p-8 text-center flex flex-col items-center">
                            <motion.div 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-6"
                            >
                                <CheckCircle2 size={40} />
                            </motion.div>
                            <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Teşekkürler!</h3>
                            <p className="text-slate-500 dark:text-slate-400">
                                Değerlendirmeniz iş ortağımıza iletildi. Rapidsy Trust ağına katkıda bulunduğunuz için teşekkür ederiz.
                            </p>
                        </div>
                    ) : (
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Hizmeti Değerlendirin</h3>
                                    <p className="text-sm text-slate-500">Sipariş No: #{order.id?.split('-')[0]}</p>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                    <X size={20} className="text-slate-500" />
                                </button>
                            </div>

                            <div className="flex flex-col items-center py-6">
                                <div className="flex gap-2 mb-4">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onMouseEnter={() => setHoveredRating(star)}
                                            onMouseLeave={() => setHoveredRating(0)}
                                            onClick={() => setRating(star)}
                                            className="transition-transform hover:scale-[1.02] active:scale-95"
                                        >
                                            <Star 
                                                size={40} 
                                                className={`transition-colors duration-200 ${
                                                    (hoveredRating || rating) >= star 
                                                        ? 'fill-yellow-400 text-yellow-400' 
                                                        : 'text-slate-300 dark:text-slate-700'
                                                }`} 
                                            />
                                        </button>
                                    ))}
                                </div>
                                <p className="text-sm font-bold text-slate-400">
                                    {rating === 0 ? "Deneyiminizi puanlayın" : 
                                     rating === 5 ? "Mükemmel!" : 
                                     rating >= 3 ? "İyi" : "Kötü"}
                                </p>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Deneyiminizi Anlatın (İsteğe Bağlı)</label>
                                <textarea 
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Bu hizmet hakkında ne düşünüyorsunuz?"
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-slate-900 dark:text-white resize-none h-24 focus:border-primary-500 outline-none transition-colors"
                                />
                            </div>

                            <button 
                                onClick={handleSubmit}
                                disabled={rating === 0 || isSubmitting}
                                className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase transition-all ${
                                    rating > 0 
                                        ? 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-600/20 active-scale' 
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting ? 'Gönderiliyor...' : 'Değerlendirmeyi Gönder'}
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
};

export default ReviewModal;
