import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const OrderContext = createContext();

export const useOrder = () => {
    const context = useContext(OrderContext);
    if (!context) throw new Error("useOrder must be used within OrderProvider");
    return context;
};

export const OrderProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { showAlert } = useUI();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser || currentUser.isAnonymous || !currentUser.id) {
            setOrders([]);
            setLoading(false);
            return;
        }

        fetchOrders();

        // Real-time subscription for order updates
        const channel = supabase
            .channel('order_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                    filter: `customer_id=eq.${currentUser.id}`,
                },
                (payload) => {
                    console.log('Order change detected:', payload);
                    fetchOrders();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUser]);

    const fetchOrders = async () => {
        if (!currentUser?.id) return;

        // Prevent guest users from hitting real DB
        if (currentUser.id.toString().startsWith('guest-')) {
            setOrders([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    seller:seller_id(id, full_name, company_name, avatar_url),
                    quote:quote_id(id, price, description, warranty_months)
                `)
                .eq('customer_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const createOrderFromQuote = async (quote) => {
        if (!currentUser?.id || !quote) {
            return { data: null, error: new Error('Missing user or quote') };
        }

        try {
            const { data, error } = await supabase
                .from('orders')
                .insert([{
                    customer_id: currentUser.id,
                    quote_id: quote.id,
                    seller_id: quote.seller_id,
                    total_amount: quote.price,
                    status: 'paid' // Triggers commission calculation via DB trigger
                }])
                .select()
                .single();

            if (error) throw error;

            // Update the quote status to 'completed' or similar if needed
            await supabase
                .from('quotes')
                .update({ status: 'accepted' })
                .eq('id', quote.id);

            setOrders(prev => [data, ...prev]);
            return { data, error: null };

        } catch (error) {
            console.error('Error creating order:', error);
            return { data: null, error };
        }
    };

    const getOrderById = (orderId) => {
        return orders.find(o => o.id === orderId);
    };

    const value = {
        orders,
        loading,
        fetchOrders,
        createOrderFromQuote,
        getOrderById
    };

    return (
        <OrderContext.Provider value={value}>
            {children}
        </OrderContext.Provider>
    );
};
