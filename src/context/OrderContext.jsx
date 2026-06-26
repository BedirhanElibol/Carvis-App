/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";

const OrderContext = createContext();

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) throw new Error("useOrder must be used within OrderProvider");
  return context;
};

export const OrderProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!currentUser?.id || currentUser.isAnonymous) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
                    *,
                    seller:seller_id(id, full_name, company_name, avatar_url),
                    quote:quote_id(id, price, description, warranty_months)
                `,
        )
        .eq("customer_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code !== "42501" && error.code !== "42703") {
          console.error("Error fetching orders:", error);
        }
        setOrders([]);
        return;
      }
      setOrders(data || []);
    } catch (error) {
      console.error("Orders Exception:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.isAnonymous]);

  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous || !currentUser.id) {
      setOrders([]);
      setLoading(false);
      return;
    }

    fetchOrders().catch(console.error);

    // Real-time subscription for order updates
    const channel = supabase
      .channel("order_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `customer_id=eq.${currentUser.id}`,
        },
        () => {
          fetchOrders().catch(console.error);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchOrders]);

  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  const createOrderFromQuote = async (quote) => {
    if (!currentUser?.id || !quote) {
      return { data: null, error: new Error("Missing user or quote") };
    }
    setIsCreatingOrder(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: currentUser.id,
            quote_id: quote.id,
            seller_id: quote.seller_id,
            total_amount: quote.price,
            status: "paid", // Triggers commission calculation via DB trigger
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error("Bu teklif için zaten bir sipariş oluşturdunuz.");
        }
        throw error;
      }

      // Update the quote status to 'accepted'
      const { error: updateError } = await supabase
        .from("quotes")
        .update({ status: "accepted" })
        .eq("id", quote.id);

      if (updateError) throw updateError;

      setOrders((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error("Error creating order:", error);
      return { data: null, error };
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const getOrderById = (orderId) => {
    return orders.find((o) => o.id === orderId);
  };

  const value = {
    orders,
    loading,
    isCreatingOrder,
    fetchOrders,
    createOrderFromQuote,
    getOrderById,
  };

  return (
    <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
  );
};
