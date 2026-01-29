import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Image as ImageIcon, Mic, Loader2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { AIService } from '../../services/ai/AIService';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';

const AIAssistant = () => {
    const { currentUser } = useAuth();
    const { showAlert } = useUI();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'ai', content: `Merhaba ${currentUser?.user_metadata?.full_name?.split(' ')[0] || ''}! Ben Carvis AI. Aracınızla ilgili neyi merak ediyorsunuz?` }
    ]);
    const [inputText, setInputText] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        const userMsg = { role: 'user', content: inputText };
        setMessages(prev => [...prev, userMsg]);
        setInputText('');
        setIsTyping(true);

        try {
            // AI Response Delay Simulation happens in Service
            const response = await AIService.chat(userMsg.content);
            setMessages(prev => [...prev, response]);

            // Check for Diagnosis Trigger
            if (response.content.includes("analiz")) {
                const diagnosis = await AIService.diagnoseIssue(userMsg.content);
                if (diagnosis.success && diagnosis.data.urgency === 'critical') {
                    setMessages(prev => [...prev, {
                        role: 'ai',
                        content: `⚠️ **DİKKAT:** ${diagnosis.data.title} şüphesi var. Tahmini masraf: ${diagnosis.data.estimatedCost}. En yakın servisten randevu almamı ister misin?`,
                        isAlert: true
                    }]);
                }
            }

        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: "Üzgünüm, şu an bağlantımda bir sorun var." }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickPrompt = (text) => {
        setInputText(text);
        // Optional: Auto send
        // handleSendMessage(); 
    };

    return (
        <>
            {/* Floating Action Button */}
            {!isOpen && (
                <motion.button
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-24 right-6 z-50 w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full shadow-lg shadow-purple-900/40 flex items-center justify-center text-white border-2 border-white/20"
                >
                    <Sparkles size={28} className="animate-pulse" />
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                </motion.button>
            )}

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        className="fixed bottom-24 right-6 z-50 w-[90%] max-w-sm h-[600px] max-h-[70vh] glass-card rounded-3xl border border-white/10 flex flex-col shadow-2xl overflow-hidden bg-slate-900/95"
                    >
                        {/* Header */}
                        <div className="p-4 bg-gradient-to-r from-indigo-600 to-purple-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-md">
                                    <Bot size={24} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-white text-lg font-outfit">Carvis AI</h3>
                                    <p className="text-xs text-indigo-200 flex items-center gap-1">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Online
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition text-white">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-950/50">
                            {messages.map((msg, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`
                                        max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed
                                        ${msg.role === 'user'
                                            ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-tr-none'
                                            : msg.isAlert
                                                ? 'bg-red-500/10 border border-red-500/50 text-red-100 rounded-tl-none'
                                                : 'bg-white/5 border border-white/10 text-slate-200 rounded-tl-none'
                                        }
                                    `}>
                                        {msg.role === 'ai' && !msg.isAlert && <Sparkles size={14} className="inline mr-2 text-purple-400" />}
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none flex gap-1">
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                                        <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Prompts */}
                        {messages.length < 3 && (
                            <div className="px-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
                                <button onClick={() => handleQuickPrompt("Arıza lambası nedir?")} className="whitespace-nowrap px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 transition">
                                    🔴 Arıza Lambası
                                </button>
                                <button onClick={() => handleQuickPrompt("Motordan ses geliyor")} className="whitespace-nowrap px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 transition">
                                    🔊 Motor Sesi
                                </button>
                                <button onClick={() => handleQuickPrompt("Lastik basıncı kaç olmalı?")} className="whitespace-nowrap px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-slate-300 transition">
                                    💨 Lastik Basıncı
                                </button>
                            </div>
                        )}

                        {/* Input Area */}
                        <div className="p-4 bg-slate-900 border-t border-white/10">
                            <div className="relative flex items-center gap-2">
                                <button className="p-3 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition">
                                    <ImageIcon size={20} />
                                </button>
                                <input
                                    type="text"
                                    placeholder="Bir sorun yazın..."
                                    className="flex-1 bg-black/30 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputText.trim() || isTyping}
                                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition shadow-lg shadow-indigo-900/30"
                                >
                                    {isTyping ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AIAssistant;
