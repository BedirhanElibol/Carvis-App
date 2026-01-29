import React, { createContext, useContext, useState, useEffect } from 'react';
import { callRealGeminiAPI } from '../utils/aiUtils';
import { useGarage } from './GarageContext';
import { useUI } from './UIContext';

const AIContext = createContext();

export const useAI = () => {
    const context = useContext(AIContext);
    if (!context) {
        throw new Error('useAI must be used within AIProvider');
    }
    return context;
};

export const AIProvider = ({ children }) => {
    const { currentVehicle } = useGarage();
    const { showAlert } = useUI();
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            text: "Merhaba! Ben Rapidsy AI asistanınız. Aracınızla ilgili her türlü teknik soruyu sorabilir, arıza tespiti yapmamı isteyebilir veya yedek parça tavsiyesi alabilirsiniz. Size nasıl yardımcı olabilirim?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [analysisStatus, setAnalysisStatus] = useState(null); // 'uploading', 'detecting', 'analyzing', 'finalizing'
    const [isTyping, setIsTyping] = useState(false);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = {
            id: Date.now(),
            text,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setIsTyping(true);

        const vehicleContext = currentVehicle ?
            `Kullanıcının aracı: ${currentVehicle.brand} ${currentVehicle.model} (${currentVehicle.km} KM).` :
            "Kullanıcının henüz bir aracı yok.";

        // Chat history for context (last 5 messages)
        const history = messages.slice(-5).map(m => `${m.sender === 'user' ? 'Kullanıcı' : 'Asistan'}: ${m.text}`).join('\n');

        try {
            const response = await callRealGeminiAPI(text, vehicleContext, history);

            const botMessage = {
                id: Date.now() + 1,
                text: response,
                sender: 'bot',
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error("AI Error:", error);
            showAlert('AI Hatası', 'Bağlantı sorunu yaşanıyor.', 'error');
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: "Üzgünüm, şu an bağlantı sorunu yaşıyorum. Lütfen tekrar dener misiniz?",
                sender: 'bot',
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const analyzeDamage = async (imageUrl) => {
        setIsTyping(true);
        setAnalysisStatus('uploading');

        setMessages(prev => [...prev, {
            id: 'damage-upload-' + Date.now(),
            type: 'image',
            imageUrl: imageUrl,
            sender: 'user',
            timestamp: new Date()
        }]);

        // Stage 1: Uploading -> Detecting (1.5s)
        setTimeout(() => {
            setAnalysisStatus('detecting');

            // Stage 2: Detecting -> Analyzing (2s)
            setTimeout(() => {
                setAnalysisStatus('analyzing');

                // Stage 3: Analyzing -> Finalizing (1.5s)
                setTimeout(() => {
                    setAnalysisStatus('finalizing');

                    // Stage 4: Final Report (1s)
                    setTimeout(() => {
                        const analysisResult = {
                            id: 'analysis-' + Date.now(),
                            type: 'analysis',
                            sender: 'bot',
                            timestamp: new Date(),
                            data: {
                                damageType: "Kaporta ve Tampon Deformasyonu",
                                severity: "Kritik",
                                estimatedCost: "7.500 ₺ - 12.000 ₺",
                                partsToReplace: ["Ön Tampon", "Sol Far Grubu", "Tampon Köpüğü"],
                                aiComment: "Görsel analize göre sol ön panelde ciddi yapısal hasar tespit edildi. Şasi uçları kontrol edilmeli. Far ayaklarında kırılma mevcut, güvenli sürüş için değişimi zorunludur."
                            }
                        };
                        setMessages(prev => [...prev, analysisResult]);
                        setAnalysisStatus(null);
                        setIsTyping(false);
                    }, 1000);
                }, 1500);
            }, 2000);
        }, 1500);
    };

    const clearHistory = () => {
        setMessages([
            {
                id: 'welcome',
                text: "Sohbet sıfırlandı. Yeni bir konuda yardımcı olabilirim!",
                sender: 'bot',
                timestamp: new Date()
            }
        ]);
    };

    return (
        <AIContext.Provider value={{ messages, isTyping, analysisStatus, sendMessage, analyzeDamage, clearHistory }}>
            {children}
        </AIContext.Provider>
    );
};
