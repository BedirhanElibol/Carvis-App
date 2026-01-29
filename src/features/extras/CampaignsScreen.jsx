import React, { useState, useEffect } from 'react';
import { Ticket, Loader2, Copy, ArrowLeft } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { useUI } from '../../context/UIContext';
import { useNavigate } from 'react-router-dom';

// Mock campaigns if DB is empty
const MOCK_CAMPAIGNS = [
    { id: 1, code: 'CARVIS20', description: '%20 İndirim - İlk Siparişinize Özel', discount_type: 'percentage', discount_value: 20, valid_until: '2026-03-01' },
    { id: 2, code: 'YAKIT50', description: '50₺ Yakıt İndirimi', discount_type: 'fixed', discount_value: 50, valid_until: '2026-02-15' },
    { id: 3, code: 'SERVIS100', description: '100₺ Servis Kuponu', discount_type: 'fixed', discount_value: 100, valid_until: '2026-02-28' },
    { id: 4, code: 'BAKIM15', description: '%15 Periyodik Bakım İndirimi', discount_type: 'percentage', discount_value: 15, valid_until: '2026-04-01' },
];

const CampaignsScreen = () => {
    const { t, showAlert } = useUI();
    const navigate = useNavigate();
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                const { data, error } = await supabase
                    .from('coupons')
                    .select('*')
                    .eq('is_active', true);

                if (error) throw error;
                setCoupons(data?.length > 0 ? data : MOCK_CAMPAIGNS);
            } catch (error) {
                console.error("Kupon hatası:", error);
                setCoupons(MOCK_CAMPAIGNS);
            } finally {
                setLoading(false);
            }
        };
        fetchCoupons();
    }, []);

    const copyCoupon = (code) => {
        navigator.clipboard.writeText(code);
        showAlert("Kopyalandı", `${code} kodu panoya kopyalandı!`, "success");
    };

    if (!t) return null;

    return (
        <div className="p-5 pb-32 space-y-4 min-h-screen bg-slate-950">
            {/* Header */}
            <div className="flex items-center gap-4 mb-4">
                <button onClick={() => navigate(-1)} className="p-2.5 glass-card rounded-xl text-white active-scale border border-white/10">
                    <ArrowLeft size={20} />
                </button>
                <h3 className="font-black text-2xl text-white italic flex items-center gap-2">
                    <Ticket size={28} className="text-orange-500" /> {t.campaignsTitle || "Fırsatlar"}
                </h3>
            </div>

            {loading ? (
                <div className="text-center py-10"><Loader2 className="animate-spin mx-auto text-orange-500" size={32} /></div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-10 text-slate-400">Aktif kampanya bulunamadı.</div>
            ) : (
                <div className="space-y-4">
                    {coupons.map(coupon => (
                        <div key={coupon.id} className="glass-card rounded-2xl border border-white/10 shadow-xl overflow-hidden relative group">
                            <div className="absolute left-0 top-0 bottom-0 w-2 bg-gradient-to-b from-orange-500 to-red-600"></div>

                            <div className="p-5 pl-7">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-black text-lg text-white">{coupon.description}</h4>
                                        <p className="text-xs text-slate-400 mt-1">Son Tarih: {new Date(coupon.valid_until).toLocaleDateString('tr-TR')}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-black text-2xl text-orange-500">
                                            {coupon.discount_type === 'percentage' ? `%${coupon.discount_value}` : `${coupon.discount_value}₺`}
                                        </span>
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">İndirim</span>
                                    </div>
                                </div>

                                <div className="mt-4 flex gap-3 items-center bg-slate-800/50 p-3 rounded-xl border border-dashed border-slate-600">
                                    <code className="font-mono font-bold text-orange-400 text-lg flex-1 text-center tracking-widest">
                                        {coupon.code}
                                    </code>
                                    <button onClick={() => copyCoupon(coupon.code)} className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-500 transition shadow-lg active-scale">
                                        <Copy size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-orange-500/20 rounded-full blur-2xl opacity-50 pointer-events-none"></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CampaignsScreen;
