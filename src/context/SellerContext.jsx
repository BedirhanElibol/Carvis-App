import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { useUI } from './UIContext';

const SellerContext = createContext();

export const useSeller = () => useContext(SellerContext);

export const SellerProvider = ({ children }) => {
    const { currentUser } = useAuth();
    const { showAlert } = useUI();

    const [proTab, setProTab] = useState('dashboard');
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [sellerProducts, setSellerProducts] = useState([]);
    const [sellerOrders, setSellerOrders] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (currentUser && currentUser.user_metadata?.role === 'seller') {
            fetchSellerData();
        }
    }, [currentUser]);

    const fetchSellerData = async () => {
        setLoading(true);
        try {
            // Gerçek siparişleri çek (Satıcıya ait olanlar)
            const { data: ordersData, error: ordersError } = await supabase
                .from('orders')
                .select('*')
                .eq('seller_id', currentUser.id)
                .order('created_at', { ascending: false });

            if (ordersError) throw ordersError;
            setSellerOrders(ordersData || []);

            // Şimdilik ürünler tablosu yoksa boş kalsın veya mock'tan gelsin
            setSellerProducts([]);
        } catch (error) {
            console.error('Seller data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        proTab,
        setProTab,
        isAddingProduct,
        setIsAddingProduct,
        sellerProducts,
        sellerOrders,
        loading,
        fetchSellerData
    };

    return (
        <SellerContext.Provider value={value}>
            {children}
        </SellerContext.Provider>
    );
};
