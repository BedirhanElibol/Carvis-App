import React, { useState, useEffect, useRef } from 'react';
import { useMessage } from '../../context/MessageContext';
import { useAuth } from '../../context/AuthContext';
import { Send, Image, Paperclip, CheckCheck, Loader2, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';

const ChatWindow = ({ activeUserId, onBack }) => {
    const { messages, sendMessage, fetchMessages, loading: msgLoading } = useMessage();
    const { currentUser } = useAuth();
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);
    const [sending, setSending] = useState(false);

    // Initial fetch
    useEffect(() => {
        if (activeUserId) {
            fetchMessages(activeUserId);
            // Realtime is handled in Context
        }
    }, [activeUserId]);

    // Auto-scroll logic
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        setSending(true);
        const { error } = await sendMessage(activeUserId, newMessage);
        setSending(false);

        if (!error) {
            setNewMessage('');
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950/50 backdrop-blur-md relative">
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center gap-3 bg-slate-900/50">
                <button onClick={onBack} className="md:hidden p-2 -ml-2 text-slate-400 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                        {/* Initials could be better but simplified for now */}
                        MSG
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">Sohbet</h3>
                        <p className="text-[10px] text-green-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            Çevrimiçi
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-4">
                {msgLoading && messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin text-primary-500" />
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        const isMe = msg.sender_id === currentUser.id;
                        return (
                            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm relative group ${isMe
                                        ? 'bg-primary-600 text-white rounded-br-none'
                                        : 'bg-slate-800 text-slate-200 rounded-bl-none border border-white/5'
                                    }`}>
                                    <p>{msg.content}</p>
                                    <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-primary-200' : 'text-slate-500'}`}>
                                        <span>{format(new Date(msg.created_at), 'HH:mm')}</span>
                                        {isMe && <CheckCheck size={12} className={msg.is_read ? 'text-blue-200' : 'text-primary-300/50'} />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/5 bg-slate-900/50">
                <form onSubmit={handleSend} className="flex items-center gap-2">
                    <button type="button" className="p-2.5 text-slate-400 hover:text-white transition-colors">
                        <Paperclip size={20} />
                    </button>
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Mesajınızı yazın..."
                        className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-600"
                    />
                    <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="p-3 bg-primary-600 hover:bg-primary-500 text-white rounded-xl shadow-lg shadow-primary-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all active-scale"
                    >
                        {sending ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatWindow;
