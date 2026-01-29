import React, { useState, useEffect, useRef } from 'react';
import { Mic, Square, Activity, AlertCircle, Check, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AudioAnalyzer = () => {
    const [isRecording, setIsRecording] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null); // null, 'normal', 'issue'
    const canvasRef = useRef(null);
    const animationRef = useRef(null);

    // Mock Simulation of Audio Visualization
    const startVisualization = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        const draw = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = 'rgba(255, 255, 255, 0)'; // Transparent
            ctx.fillRect(0, 0, width, height);

            const bars = 30;
            const barWidth = width / bars;

            for (let i = 0; i < bars; i++) {
                // Random height for visualization effect based on recording state
                const barHeight = isRecording
                    ? Math.random() * height * 0.8
                    : Math.max(2, Math.random() * 10);

                // Color gradient based on height
                const hue = isRecording ? (i * 10) % 360 : 200;
                ctx.fillStyle = `hsla(${hue}, 70%, 60%, 0.8)`;

                ctx.fillRect(i * barWidth, (height - barHeight) / 2, barWidth - 2, barHeight);
            }

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();
    };

    useEffect(() => {
        startVisualization();
        return () => cancelAnimationFrame(animationRef.current);
    }, [isRecording]); // Re-run when recording state changes to update visual intensity

    const handleToggleRecord = () => {
        if (isRecording) {
            // Stop recording -> Start Analyzing
            setIsRecording(false);
            setAnalyzing(true);

            // Simulate AI Analysis
            setTimeout(() => {
                setAnalyzing(false);
                // Random deterministic result for demo
                const isIssue = Math.random() > 0.7;
                setResult(isIssue ? 'issue' : 'normal');
            }, 3000);

        } else {
            // Start recording
            setResult(null);
            setIsRecording(true);
        }
    };

    return (
        <div className="glass-card p-6 rounded-3xl border border-white/5">
            <h3 className="font-black text-xl text-white mb-2 flex items-center gap-2">
                <Mic className="text-primary-400" />
                Sesli Arıza Tespiti
            </h3>
            <p className="text-xs text-slate-400 mb-6">
                Motor sesini dinletin, Carvis AI anormal sesleri (vuruntu, sürtünme, kayış sesi) analiz etsin.
            </p>

            {/* Visualizer Area */}
            <div className="h-32 bg-slate-900/50 rounded-2xl border border-white/5 mb-6 relative overflow-hidden flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={128}
                    className="w-full h-full object-cover opacity-80"
                />

                {analyzing && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                        <Loader2 className="animate-spin text-primary-500 mb-2" size={32} />
                        <span className="text-xs font-bold text-primary-400 animate-pulse">SES DALGALARI ANALİZ EDİLİYOR...</span>
                    </div>
                )}

                {result && !analyzing && (
                    <div className={`absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center backdrop-blur-md`}>
                        {result === 'normal' ? (
                            <>
                                <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                                    <Check className="text-green-500" size={24} />
                                </div>
                                <h4 className="font-bold text-green-400">Normal Motor Sesi</h4>
                                <p className="text-xs text-slate-400">Anormal bir rezonans tespit edilmedi.</p>
                            </>
                        ) : (
                            <>
                                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                                    <AlertCircle className="text-red-500" size={24} />
                                </div>
                                <h4 className="font-bold text-red-500">Düzensiz Rölanti Sesi</h4>
                                <p className="text-xs text-slate-400">Ateşleme sistemi kontrol edilmeli.</p>
                            </>
                        )}
                        <button
                            onClick={() => setResult(null)}
                            className="mt-3 text-xs text-white underline"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="flex justify-center">
                <button
                    onClick={handleToggleRecord}
                    disabled={analyzing}
                    className={`
                        w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
                        ${isRecording
                            ? 'bg-red-500 hover:bg-red-600 scale-110 shadow-red-500/30 ring-4 ring-red-500/20'
                            : 'bg-primary-600 hover:bg-primary-500 hover:scale-105 shadow-primary-500/30'
                        }
                    `}
                >
                    {isRecording ? <Square size={24} fill="white" className="text-white" /> : <Mic size={28} className="text-white" />}
                </button>
            </div>
            <p className="text-center text-xs text-slate-500 mt-3 font-bold uppercase tracking-wider">
                {isRecording ? 'Dinleniyor...' : result ? 'Analiz Tamamlandı' : 'Başlatmak için dokun'}
            </p>
        </div>
    );
};

export default AudioAnalyzer;
