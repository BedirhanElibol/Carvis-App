import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, Sparkles, Settings, Mic, Send, Trash2, Camera, Info, Wrench, AlertTriangle, DollarSign, CheckCircle2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAI } from '../../context/AIContext';
import { useUI } from '../../context/UIContext';
import { useGarage } from '../../context/GarageContext';
import { AI_SUGGESTIONS } from '../../constants/mockData';
import { useNavigate } from 'react-router-dom';
import { Badge } from '../../components/Core';
import AudioAnalyzer from './AudioAnalyzer';

// Özel Analiz Kartı Bileşeni - Premium Holographic Design
const DamageAnalysisCard = ({ data }) => (
    <div className="relative group overflow-hidden">
        {/* Holographic Border Glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-indigo-600 rounded-3xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>

        <div className="relative glass-card border border-white/10 bg-slate-900/80 p-6 rounded-3xl space-y-4 shadow-2xl backdrop-blur-3xl">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-primary-500 to-indigo-600 p-2.5 rounded-xl shadow-lg shadow-primary-900/40">
                        <Wrench size={18} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-black text-white italic uppercase text-[10px] tracking-widest">AI HASAR TEŞHİSİ</h3>
                        <p className="text-[8px] text-primary-400 font-bold uppercase tracking-[0.2em] mt-0.5">Sistem ID: #{Math.floor(Math.random() * 9000) + 1000}</p>
                    </div>
                </div>
                <Badge type={data.severity === 'Yüksek' ? 'error' : 'warning'} className="text-[8px] font-black uppercase tracking-widest px-3 py-1">
                    {data.severity} RİSK
                </Badge>
            </div>

            <div className="space-y-4">
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 hover:border-primary-500/30 transition-colors">
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse"></span>
                        Tespit Edilen Arıza
                    </p>
                    <p className="text-base font-black text-white italic tracking-tighter">{data.damageType}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Tahmini Maliyet</p>
                        <p className="text-lg font-black text-emerald-400 italic flex items-center gap-1">
                            {data.estimatedCost} <span className="text-[10px] not-italic">₺</span>
                        </p>
                    </div>
                    <div className="bg-gradient-to-br from-slate-950 to-slate-900 p-4 rounded-2xl border border-white/5">
                        <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest mb-1">Onarım Süresi</p>
                        <p className="text-lg font-black text-amber-400 italic">~2-4 Sa</p>
                    </div>
                </div>

                <div>
                    <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mb-2 px-1">Gerekli Yedek Parçalar</p>
                    <div className="flex flex-wrap gap-2">
                        {data.partsToReplace.map((part, i) => (
                            <span key={i} className="text-[10px] bg-primary-500/5 border border-primary-500/20 px-3 py-1.5 rounded-xl text-primary-300 font-bold tracking-tight">
                                {part}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/5 flex gap-4 items-start">
                    <div className="p-2 bg-primary-500/10 rounded-lg shrink-0">
                        <Info size={14} className="text-primary-500" />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed italic">"{data.aiComment}"</p>
                </div>
            </div>

            <button className="w-full bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all active-scale shadow-xl shadow-primary-900/40 border border-white/10 mt-2">
                YAKINDAKİ USTALARDAN TEKLİF TOPLA
            </button>
        </div>
    </div>
);

const AIChatScreen = () => {
    const navigate = useNavigate();
    const { messages, isTyping, analysisStatus, sendMessage, analyzeDamage, clearHistory } = useAI();
    const { t, showAlert } = useUI();
    const { currentVehicle } = useGarage();
    const [showAudioAnalyzer, setShowAudioAnalyzer] = useState(false);

    const [inputText, setInputText] = useState("");
    const messagesEndRef = useRef(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    const handleSend = async (textOverride = null) => {
        const text = textOverride || inputText;
        if (!text.trim() || isTyping) return;

        setInputText("");
        await sendMessage(text);
    };

    const handleVoiceInput = () => {
        showAlert("Sesli Asistan", "Sesli komut özelliği şu an geliştirme aşamasındadır.", "info");
    };

    const handleImageUpload = () => {
        // Örnek hasar analizi başlat (Simülasyon)
        const sampleImageUrl = "https://images.unsplash.com/photo-1623136859341-37d402127278?q=80&w=600&auto=format&fit=crop";
        analyzeDamage(sampleImageUrl);
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 relative overflow-hidden animate-fade-in">
            {/* Background elements */}
            <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] bg-primary-600/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 left-[-5%] w-[400px] h-[400px] bg-accent-600/5 rounded-full blur-[100px] pointer-events-none"></div>

            {/* Header */}
            <div className="glass-card px-5 py-6 border-b border-white/5 sticky top-0 z-20 flex justify-between items-center backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2.5 glass-card rounded-2xl text-slate-400 active-scale border border-white/10 hover:bg-white/5">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3.5">
                        <div className="relative">
                            <div className="absolute inset-0 bg-primary-500 blur-lg rounded-full opacity-50 animate-pulse"></div>
                            <div className="relative bg-gradient-to-br from-primary-400 to-primary-700 p-3 rounded-2xl shadow-2xl border border-white/10">
                                <Sparkles size={20} className="text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="font-black text-white italic tracking-tighter leading-none uppercase text-lg">CARVIS <span className="text-primary-400 not-italic uppercase text-[8px] ml-1 tracking-widest bg-primary-500/10 px-1.5 py-0.5 rounded border border-primary-500/20">AI Expert</span></h2>
                            <div className="flex items-center gap-1.5 mt-1.5">
                                <span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_#22c55e]"></span>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Sizin için hazır</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAudioAnalyzer(!showAudioAnalyzer)}
                        className={`p-2.5 glass-card rounded-xl transition-all border border-white/10 active-scale ${showAudioAnalyzer ? 'bg-primary-600 text-white' : 'text-slate-500 hover:text-white'}`}
                        title="Sesli Arıza Analizi"
                    >
                        <Activity size={18} />
                    </button>
                    <button onClick={clearHistory} title="Geçmişi Temizle" className="p-2.5 glass-card rounded-xl hover:bg-red-500/10 transition-all border border-white/10 active-scale text-slate-500 hover:text-red-500">
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Audio Analyzer Overlay */}
            {showAudioAnalyzer && (
                <div className="px-5 mb-4 animate-in slide-in-from-top-5">
                    <AudioAnalyzer />
                </div>
            )}

            {/* Damage Analysis Banner */}
            <div className="mx-5 mt-4 bg-primary-950/20 border border-primary-500/10 rounded-2xl p-4 flex items-center justify-between z-10 animate-fade-in group hover:border-primary-500/30 transition-all">
                <div className="flex items-center gap-3">
                    <div className="bg-primary-500/20 p-2.5 rounded-xl text-primary-400 group-hover:scale-110 transition-transform">
                        <Camera size={20} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-0.5">YENİ ÖZELLİK</p>
                        <p className="text-xs text-primary-100 font-bold">Hasar Analizi ve Masraf Tahmini</p>
                    </div>
                </div>
                <button onClick={handleImageUpload} className="bg-primary-600 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-900/40 active-scale">
                    ANALİZ ET
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 pb-40 relative z-0 no-scrollbar custom-scrollbar">
                {messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] ${m.type === 'analysis' ? 'w-full' : ''}`}>
                            {m.type === 'image' ? (
                                <div className="relative rounded-[2.5rem] overflow-hidden border-4 border-white/5 shadow-2xl group">
                                    <img src={m.imageUrl} alt="Damage" className="max-w-full h-64 object-cover w-full scale-105 group-hover:scale-110 transition-transform duration-1000" />

                                    {/* Scanning Animation Overlay */}
                                    {isTyping && (
                                        <div className="absolute inset-0 pointer-events-none">
                                            <div className="absolute inset-0 bg-primary-500/10 animate-pulse"></div>
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_20px_#3b82f6] animate-scan z-10"></div>
                                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_rgba(0,0,0,0.4)_100%)]"></div>
                                        </div>
                                    )}
                                </div>
                            ) : m.type === 'analysis' ? (
                                <DamageAnalysisCard data={m.data} />
                            ) : (
                                <div className={`p-4 rounded-3xl text-sm shadow-2xl relative ${m.sender === 'user'
                                    ? 'bg-primary-600 text-white rounded-tr-none shadow-primary-900/20'
                                    : 'glass-card border border-white/5 text-slate-100 rounded-tl-none backdrop-blur-xl'
                                    }`}>
                                    <p className="leading-relaxed font-medium">{m.text}</p>
                                    <div className="flex items-center justify-end gap-1.5 mt-2 opacity-30">
                                        <span className="text-[8px] font-black tracking-widest uppercase">
                                            {new Date(m.timestamp || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start animate-in fade-in">
                        <div className="glass-card border border-white/10 p-5 rounded-3xl rounded-tl-none flex items-center gap-4 shadow-2xl backdrop-blur-xl">
                            <div className="flex gap-1.5">
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce"></div>
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce delay-150"></div>
                                <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-bounce delay-300"></div>
                            </div>
                            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                                {analysisStatus === 'uploading' ? "Görsel Yükleniyor..." :
                                    analysisStatus === 'detecting' ? "Parçalar Tespit Ediliyor..." :
                                        analysisStatus === 'analyzing' ? "Hasar Derinliği Analiz Ediliyor..." :
                                            analysisStatus === 'finalizing' ? "Rapor Oluşturuluyor..." :
                                                "Uzman İnceliyor..."}
                            </span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Overlay */}
            <div className="p-5 glass-card border-t border-white/5 absolute bottom-0 w-full backdrop-blur-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.6)] z-20 pb-10">
                {/* Suggestions */}
                <div className="flex gap-2.5 overflow-x-auto pb-5 no-scrollbar">
                    {messages.length < 5 && AI_SUGGESTIONS.map((s, i) => (
                        <button
                            key={i}
                            onClick={() => handleSend(s)}
                            className="whitespace-nowrap bg-white/5 text-slate-400 text-[9px] font-black uppercase tracking-[0.15em] px-6 py-3.5 rounded-2xl border border-white/5 hover:border-primary-500/40 hover:text-primary-400 transition-all active-scale shadow-lg"
                        >
                            {s}
                        </button>
                    ))}
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex-1 bg-slate-950 border border-white/5 rounded-[2rem] flex items-center px-6 py-1 hover:border-primary-500/20 transition-all shadow-inner group">
                        <input
                            value={inputText}
                            onChange={e => setInputText(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSend()}
                            className="flex-1 bg-transparent border-none text-sm text-white outline-none py-4 placeholder-slate-700 font-medium"
                            placeholder="Aracın hakkında bir şey sor..."
                        />
                        <button onClick={handleVoiceInput} className="text-slate-600 hover:text-primary-500 transition-colors ml-2 p-2.5 rounded-full active-scale bg-white/5">
                            <Mic size={20} />
                        </button>
                    </div>
                    <button
                        onClick={() => handleSend()}
                        disabled={!inputText.trim() || isTyping}
                        className={cn(
                            "w-14 h-14 rounded-2xl transition-all shadow-2xl active-scale flex items-center justify-center group",
                            !inputText.trim() || isTyping
                                ? 'bg-slate-900 text-slate-700'
                                : 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-primary-900/40'
                        )}
                    >
                        <Send size={24} className={cn("transition-transform group-active:translate-x-1 group-active:-translate-y-1", !inputText.trim() || isTyping ? "" : "drop-shadow-[0_0_8px_white]")} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AIChatScreen;
