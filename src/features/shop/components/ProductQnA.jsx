import React, { useState } from 'react';
import { MessageCircle, Star } from 'lucide-react';

const ProductQnA = ({ winnerOffer, qnaList, asking, onAskQuestion }) => {
    const [newQuestion, setNewQuestion] = useState("");

    const handleAsk = () => {
        if (!newQuestion.trim()) return;
        onAskQuestion(newQuestion, winnerOffer.sellerId).then((success) => {
            if (success) {
                setNewQuestion("");
                alert("Sorunuz satıcıya iletildi!");
            }
        });
    };

    return (
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-2xl space-y-6">
            <div className="flex justify-between items-end">
                <div>
                    <h4 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Star size={20} className="text-orange-400 fill-orange-400" /> Ürün Yorumları</h4>
                    <p className="text-xs text-slate-500 mt-1">Bu ürün için yapılan değerlendirmeler</p>
                </div>
                <div className="text-right">
                    <span className="font-black text-3xl text-slate-900">0.0</span>
                    <span className="text-sm text-slate-500">/5</span>
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center flex flex-col items-center justify-center">
                    <MessageCircle size={32} className="text-slate-300 mb-2" />
                    <p className="text-sm text-slate-500 font-medium">Bu ürün için henüz değerlendirme bulunmuyor.</p>
                    <p className="text-xs text-slate-400 mt-1">İlk değerlendirmeyi yapan siz olun.</p>
                </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                <h5 className="font-bold text-sm text-slate-800">Satıcıya Soru Sor</h5>
                <div className="flex flex-col gap-2">
                    <textarea 
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Ürün hakkında merak ettiklerinizi sorun..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary-500 resize-none h-20"
                    />
                    <button 
                        onClick={handleAsk} 
                        disabled={asking || !newQuestion.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all disabled:opacity-50"
                    >
                        {asking ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <MessageCircle size={18} />} 
                        {asking ? "Gönderiliyor..." : "Soruyu Gönder"}
                    </button>
                    <p className="text-[10px] text-center text-slate-400">Sorularınız satıcı {winnerOffer.seller} firmasına iletilecektir.</p>
                </div>
            </div>
            
            {qnaList.length > 0 && (
                <div className="pt-6 border-t border-slate-100 space-y-4">
                    <h5 className="font-bold text-sm text-slate-800 mb-2 flex items-center gap-2"><MessageCircle size={16} className="text-primary-500"/> Geçmiş Sorular & Cevaplar</h5>
                    <div className="space-y-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                        {qnaList.map((qna, i) => (
                            <div key={i} className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-3">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase">Soru:</span>
                                    <p className="text-sm text-slate-700 font-medium mt-0.5">{qna.question}</p>
                                </div>
                                {qna.answer ? (
                                    <div className="pl-4 border-l-2 border-primary-500">
                                        <span className="text-[10px] font-black text-primary-500 uppercase">Satıcı Cevabı:</span>
                                        <p className="text-sm text-slate-800 font-medium mt-0.5">{qna.answer}</p>
                                    </div>
                                ) : (
                                    <div className="pl-4 border-l-2 border-slate-300">
                                        <span className="text-[10px] font-black text-slate-400 uppercase">Cevap Bekleniyor</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductQnA;
