import React, { useState } from "react";
import { useMessage } from "../../context/MessageContext";
import * as Icons from "lucide-react";
import ChatWindow from "./ChatWindow";
import { formatDistanceToNow } from "date-fns";
import { tr } from "date-fns/locale";

const MessageListScreen = () => {
  const { conversations, loading, activeConversation, fetchMessages } =
     useMessage();
   const [searchTerm, setSearchTerm] = useState("");
  const [mobileChatOpen, setMobileChatOpen] = useState(false);

  // Filter conversations
  const filteredConversations = conversations.filter((conv) => {
    const name = conv.user?.company_name || conv.user?.full_name || "İsimsiz";
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSelectConversation = (userId) => {
    fetchMessages(userId);
    setMobileChatOpen(true);
  };

  return (
    <div className="h-[calc(100vh-80px)] md:h-[calc(100vh-64px)] flex bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
      {/* Context Background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-900/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary-900/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Sidebar (Conversation List) */}
      <div
        className={` w-full md:w-96 bg-white dark:bg-slate-900/50 backdrop-blur-xl border-r border-black/5 dark:border-white/5 flex flex-col z-10 transition-transform duration-300 absolute md:relative inset-0 ${
          mobileChatOpen
            ? "-translate-x-full md:translate-x-0"
            : "translate-x-0"
        } `}
      >
        {/* Header */}
        <div className="p-4 border-b border-black/5 dark:border-white/5">
          <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter mb-4 flex items-center gap-2">
            <Icons.MessageSquare className="text-primary-500" /> Mesajlar
          </h1>
          <div className="relative group">
            <Icons.Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-hover:text-primary-400 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Sohbetlerde ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-black/10 dark:border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-primary-500/50 transition-all placeholder:text-slate-600"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {loading ? (
            <div className="flex justify-center py-10">
              <Icons.Loader2 className="animate-spin text-slate-600" />
            </div>
          ) : filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <button
                key={conv.userId}
                onClick={() => handleSelectConversation(conv.userId)}
                className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left group ${
                  activeConversation === conv.userId
                    ? "bg-primary-600/10 border border-primary-500/20 shadow-lg shadow-primary-900/20"
                    : "hover:bg-black/5 dark:bg-white/5 border border-transparent hover:border-black/5 dark:border-white/5"
                }`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 font-bold border border-black/5 dark:border-white/5">
                    {(conv.user?.full_name || "?").charAt(0).toUpperCase()}
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h3
                      className={`font-bold text-sm truncate ${
                        activeConversation === conv.userId
                          ? "text-primary-200"
                          : "text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {conv.user?.company_name ||
                        conv.user?.full_name ||
                        "İsimsiz Kullanıcı"}
                    </h3>
                    {conv.lastMessage && (
                      <span className="text-[10px] text-slate-500 whitespace-nowrap">
                        {formatDistanceToNow(
                          new Date(conv.lastMessage.created_at),
                          { addSuffix: false, locale: tr },
                        )}{" "}
                        önce
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[180px]">
                      {conv.lastMessage?.content || "Mesaj yok"}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary-600 text-slate-900 dark:text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[18px] text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
                <Icons.ChevronRight
                  size={14}
                  className={`text-slate-600 opacity-0 group-hover:opacity-100 transition-all ${
                    activeConversation === conv.userId
                      ? "opacity-100 text-primary-500"
                      : ""
                  }`}
                />
              </button>
            ))
          ) : (
            <div className="text-center py-10 px-4">
              <p className="text-sm text-slate-500">Konuşma bulunamadı.</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div
        className={` flex-1 z-20 absolute md:relative inset-0 w-full bg-slate-50 dark:bg-slate-950 transition-transform duration-300 ${
          mobileChatOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
        } `}
      >
        {activeConversation ? (
          <ChatWindow
            activeUserId={activeConversation}
            onBack={() => setMobileChatOpen(false)}
          />
        ) : (
          <div className="hidden md:flex flex-col items-center justify-center h-full text-slate-500">
            <div className="w-24 h-24 bg-white dark:bg-slate-900/50 rounded-full flex items-center justify-center mb-6 animate-pulse">
              <Icons.MessageSquare size={40} className="text-slate-700" />
            </div>
            <p className="text-lg font-medium">
              Bir sohbet seçin veya yeni mesaj başlatın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageListScreen;
