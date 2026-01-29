import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const MessageContext = createContext();

export const useMessage = () => {
    const context = useContext(MessageContext);
    if (!context) {
        throw new Error('useMessage must be used within MessageProvider');
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

    // Konuşmaları getir
    useEffect(() => {
        if (currentUser && !currentUser.isAnonymous && currentUser.id) {
            fetchConversations();
            subscribeToMessages();
        } else {
            setConversations([]);
            setLoading(false);
        }
    }, [currentUser]);

    const fetchConversations = async () => {
        try {
            // Kullanıcının tüm mesajlarını getir ve konuşmalara grupla
            const { data, error } = await supabase
                .from('messages')
                .select(`
          *,
          sender:sender_id(id, full_name, email, company_name, seller_rating),
          receiver:receiver_id(id, full_name, email, company_name, seller_rating)
        `)
                .or(`sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id}`)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Konuşmaları grupla (her kullanıcı için son mesaj)
            const conversationMap = new Map();

            data?.forEach(message => {
                const otherUserId = message.sender_id === currentUser.id
                    ? message.receiver_id
                    : message.sender_id;

                if (!conversationMap.has(otherUserId)) {
                    conversationMap.set(otherUserId, {
                        userId: otherUserId,
                        user: message.sender_id === currentUser.id ? message.receiver : message.sender,
                        lastMessage: message,
                        unreadCount: 0,
                    });
                }

                // Okunmamış mesaj sayısını hesapla
                if (message.receiver_id === currentUser.id && !message.is_read) {
                    conversationMap.get(otherUserId).unreadCount++;
                }
            });

            setConversations(Array.from(conversationMap.values()));
        } catch (error) {
            console.error('Error fetching conversations:', error);
            showAlert('Hata', 'Konuşmalar yüklenirken bir sorun oluştu.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (otherUserId) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select(`
          *,
          sender:sender_id(id, full_name, email, company_name, seller_rating),
          receiver:receiver_id(id, full_name, email, company_name, seller_rating)
        `)
                .or(`and(sender_id.eq.${currentUser.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${currentUser.id})`)
                .order('created_at', { ascending: true });

            if (error) throw error;
            setMessages(data || []);
            setActiveConversation(otherUserId);

            // Okunmamış mesajları okundu işaretle
            await markAsRead(otherUserId);
        } catch (error) {
            console.error('Error fetching messages:', error);
            showAlert('Hata', 'Mesajlar alınırken bir sorun oluştu.', 'error');
        }
    };

    const sendMessage = async (receiverId, content, quoteId = null, orderId = null) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .insert([{
                    sender_id: currentUser.id,
                    receiver_id: receiverId,
                    content,
                    quote_id: quoteId,
                    order_id: orderId,
                    is_read: false,
                }])
                .select(`
          *,
          sender:sender_id(id, full_name, email, company_name, seller_rating),
          receiver:receiver_id(id, full_name, email, company_name, seller_rating)
        `)
                .single();

            if (error) throw error;

            // Mesajı listeye ekle
            setMessages(prev => [...prev, data]);

            // Konuşmaları güncelle
            await fetchConversations();

            return { data, error: null };
        } catch (error) {
            console.error('Error sending message:', error);
            showAlert('Hata', 'Mesaj gönderilemedi.', 'error');
            return { data: null, error };
        }
    };

    const markAsRead = async (senderId) => {
        try {
            const { error } = await supabase
                .from('messages')
                .update({ is_read: true, read_at: new Date().toISOString() })
                .eq('sender_id', senderId)
                .eq('receiver_id', currentUser.id)
                .eq('is_read', false);

            if (error) throw error;

            // Konuşmaları güncelle
            await fetchConversations();
        } catch (error) {
            console.error('Error marking messages as read:', error);
        }
    };

    const subscribeToMessages = () => {
        const channel = supabase
            .channel('messages')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `receiver_id=eq.${currentUser.id}`,
                },
                (payload) => {
                    console.log('New message received:', payload);

                    // Eğer aktif konuşmadaysa, mesajı ekle
                    if (payload.new.sender_id === activeConversation) {
                        setMessages(prev => [...prev, payload.new]);
                        markAsRead(payload.new.sender_id);
                    }

                    // Konuşmaları güncelle
                    fetchConversations();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    };

    const value = {
        conversations,
        messages,
        loading,
        activeConversation,
        fetchMessages,
        sendMessage,
        markAsRead,
    };

    return (
        <MessageContext.Provider value={value}>
            {children}
        </MessageContext.Provider>
    );
};
