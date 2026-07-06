/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback , useMemo } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

const MessageContext = createContext();

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error("useMessage must be used within MessageProvider");
  }
  return context;
};

export const MessageProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState(null);

  const fetchConversations = useCallback(async () => {
    if (!currentUser?.id || currentUser.isAnonymous) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
                    *,
                    sender:sender_id(id, full_name, role),
                    receiver:receiver_id(id, full_name, role)
                `
        )
        .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "42501" || error.message?.includes("404")) {
          setConversations([]);
          return;
        }
        throw error;
      }

      const conversationMap = new Map();
      data?.forEach((message) => {
        const otherUserId =
          message.sender_id === currentUser.id ? message.receiver_id : message.sender_id;
        if (!conversationMap.has(otherUserId)) {
          conversationMap.set(otherUserId, {
            userId: otherUserId,
            user: message.sender_id === currentUser.id ? message.receiver : message.sender,
            lastMessage: message,
            unreadCount: 0,
          });
        }
        if (message.receiver_id === currentUser.id && !message.is_read) {
          conversationMap.get(otherUserId).unreadCount++;
        }
      });
      setConversations(Array.from(conversationMap.values()));
    } catch (error) {
      if (error.code !== "42501") {
        console.error("Error fetching conversations:", error);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.isAnonymous]);

  const markAsRead = useCallback(async (senderId) => {
    if (!currentUser?.id) return;
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("sender_id", senderId)
        .eq("receiver_id", currentUser.id)
        .eq("is_read", false);

      setConversations((prev) =>
        prev.map((conv) => (conv.userId === senderId ? { ...conv, unreadCount: 0 } : conv))
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  }, [currentUser?.id]);

  const subscribeToMessages = useCallback(() => {
    if (!currentUser?.id) return () => {};
    const channel = supabase
      .channel("messages_realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUser.id}`,
        },
        (payload) => {
          if (payload.new.sender_id === activeConversation) {
            setMessages((prev) => [...prev, payload.new]);
            markAsRead(payload.new.sender_id);
          }
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser?.id, activeConversation, fetchConversations, markAsRead]);

  useEffect(() => {
    if (currentUser && !currentUser.isAnonymous && currentUser.id) {
      fetchConversations();
      const unsubscribe = subscribeToMessages();
      return () => {
        if (unsubscribe) unsubscribe();
      };
    } else {
      setConversations([]);
      setLoading(false);
    }
  }, [currentUser, fetchConversations, subscribeToMessages]);

  const fetchMessages = async (otherUserId) => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from("messages")
        .select(
          `
                    *,
                    sender:sender_id(id, full_name),
                    receiver:receiver_id(id, full_name)
                `
        )
        .or(
          `and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser.id})`
        )
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      setActiveConversation(otherUserId);
      await markAsRead(otherUserId);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (receiverId, content) => {
    if (!currentUser?.id) return { error: "Auth required" };
    try {
      const { data, error } = await supabase
        .from("messages")
        .insert([
          {
            sender_id: currentUser.id,
            receiver_id: receiverId,
            content,
            is_read: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setMessages((prev) => [...prev, data]);
      fetchConversations();
      return { data, error: null };
    } catch (error) {
      console.error("Error sending message:", error);
      showAlert("Hata", "Mesaj gönderilemedi.", "error");
      return { data: null, error };
    }
  };

  const value = useMemo(() => ({

    conversations,
    messages,
    loading,
    activeConversation,
    fetchMessages,
    sendMessage,
    markAsRead,
  
  }), [conversations, messages, loading, activeConversation, fetchMessages, sendMessage, markAsRead]);

  return <MessageContext.Provider value={value}>{children}</MessageContext.Provider>;
};
