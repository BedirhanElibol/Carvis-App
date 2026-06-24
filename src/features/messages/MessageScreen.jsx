import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMessage } from "../../context/MessageContext";
import { useAuth } from "../../context/AuthContext";
import * as Icons from "lucide-react";

const MessageScreen = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { messages, fetchMessages, sendMessage } = useMessage();
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (userId) {
      fetchMessages(userId);
    }
  }, [userId, fetchMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSending(true);
    const { error } = await sendMessage(userId, messageText.trim());
    if (!error) {
      setMessageText("");
    }
    setSending(false);
  };

  const otherUser =
    messages.length > 0
      ? messages[0]?.sender_id === currentUser?.id
        ? messages[0]?.receiver
        : messages[0]?.sender
      : null;

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white relative">
      {/* Context Background for Premium vibe */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[10%] left-[-20%] w-[500px] h-[500px] bg-primary-500/5 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[400px] h-[400px] bg-accent-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-50 dark:bg-slate-950/40 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 glass-card rounded-2xl flex items-center justify-center active-scale border border-black/5 dark:border-white/5"
            >
              <Icons.ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center border border-black/10 dark:border-white/10 shadow-lg font-black text-primary-500">
                {otherUser?.full_name?.[0]?.toUpperCase() ||
                  otherUser?.company_name?.[0]?.toUpperCase() ||
                  "?"}
              </div>
              <div>
                <h1 className="text-sm font-black text-slate-900 dark:text-white truncate w-32 tracking-tighter uppercase font-sans">
                  {otherUser?.company_name ||
                    otherUser?.full_name ||
                    "Yükleniyor..."}
                </h1>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest font-sans">
                    Çevrimiçi
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/5">
              <Icons.Smartphone size={18} />
            </button>
            <button className="w-10 h-10 glass-card rounded-xl flex items-center justify-center text-slate-500 dark:text-slate-400 border border-black/5 dark:border-white/5">
              <Icons.MoreVertical size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Safe Trading Banner */}
      <div className="mx-4 mt-2 bg-primary-950/20 border border-primary-500/20 rounded-2xl p-3 flex items-center gap-3 z-10">
        <div className="bg-primary-500/20 p-2 rounded-xl text-primary-400">
          <Icons.ShieldCheck size={18} />
        </div>
        <p className="text-[10px] text-primary-100 font-medium leading-tight font-sans">
          Güvenliğiniz için ödemelerinizi uygulama dışından yapmayınız.
        </p>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center opacity-50 space-y-4">
            <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-black/5 dark:border-white/5 shadow-2xl">
              <Icons.Send size={32} className="text-slate-700 -rotate-12" />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 font-sans">
              Sohbeti Başlatın
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.sender_id === currentUser?.id;
            const showDate =
              index === 0 ||
              new Date(messages[index - 1].created_at).toDateString() !==
                new Date(message.created_at).toDateString();
            return (
              <div key={message.id} className="space-y-4">
                {showDate && (
                  <div className="flex items-center justify-center my-6">
                    <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest border border-black/5 dark:border-white/5 font-sans">
                      {new Date(message.created_at).toLocaleDateString(
                        "tr-TR",
                        { day: "numeric", month: "long" },
                      )}
                    </div>
                  </div>
                )}
                <div
                  className={`flex ${isOwn ? "justify-end" : "justify-start"} animate-in slide-in-from-bottom-2 duration-300`}
                >
                  <div
                    className={`max-w-[80%] space-y-1 ${isOwn ? "items-end" : "items-start"} flex flex-col`}
                  >
                    <div
                      className={`rounded-3xl px-4 py-3 shadow-2xl ${
                        isOwn
                          ? "bg-primary-600 text-slate-900 dark:text-white rounded-br-none shadow-primary-900/20"
                          : "bg-black/5 dark:bg-white/5 backdrop-blur-xl border border-black/10 dark:border-white/10 text-slate-800 dark:text-slate-100 rounded-bl-none shadow-black/40"
                      }`}
                    >
                      <p className="text-sm font-medium leading-relaxed font-sans">
                        {message.content}
                      </p>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 px-2 ${isOwn ? "flex-row" : "flex-row-reverse"}`}
                    >
                      <span className="text-[9px] font-black text-slate-500 uppercase font-sans">
                        {new Date(message.created_at).toLocaleTimeString(
                          "tr-TR",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </span>
                      {isOwn && (
                        <div className="text-primary-500">
                          {message.is_read ? (
                            <Icons.CheckCheck size={12} />
                          ) : (
                            <Icons.Check size={12} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-4 bg-slate-50 dark:bg-slate-950/60 backdrop-blur-3xl border-t border-black/5 dark:border-white/5 z-20 pb-8">
        <form onSubmit={handleSend} className="flex items-center gap-3">
          <div className="flex-1 relative group">
            <input
              type="text"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Bir mesaj yazın..."
              className="w-full bg-white dark:bg-slate-900/80 border border-black/10 dark:border-white/10 rounded-[2rem] px-5 py-4 text-sm font-medium focus:border-primary-500/50 focus:outline-none transition-all pr-12 placeholder-slate-600 font-sans"
              disabled={sending}
            />
          </div>
          <button
            type="submit"
            disabled={sending || !messageText.trim()}
            className="bg-primary-600 w-14 h-14 rounded-[2rem] flex items-center justify-center active-scale disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-primary-900/40 transition-all hover:bg-primary-500"
          >
            {sending ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <Icons.Send size={22} className="text-slate-900 dark:text-white -mr-1" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default MessageScreen;
