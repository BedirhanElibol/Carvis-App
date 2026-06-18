/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

const PaymentContext = createContext();

export const usePayment = () => {
  const context = useContext(PaymentContext);
  if (!context) {
    throw new Error("usePayment must be used within PaymentProvider");
  }
  return context;
};

export const PaymentProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState({ balance: 0, currency: "TRY" });
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    if (!currentUser?.id || currentUser.isAnonymous) return;
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
                    *,
                    customer:customer_id(id, full_name, email),
                    seller:seller_id(id, full_name, email, company_name),
                    quote:quote_id(id, price, description)
                `
        )
        .or(`customer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code !== "42501" && error.code !== "42703") {
          console.error("Error fetching orders:", error);
          showAlert("Hata", "Siparişler yüklenirken bir sorun oluştu.", "error");
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
  }, [currentUser?.id, currentUser?.isAnonymous, showAlert]);

  const fetchWallet = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const { data: rows } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", currentUser.id)
        .limit(1);

      if (rows && rows.length > 0) {
        setWallet(rows[0]);
      } else {
        setWallet({ balance: 0, currency: "TRY" });
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  }, [currentUser?.id]);

  const fetchTransactions = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const { data, error } = await supabase
        .from("wallet_transactions")
        .select("*")
        .eq("wallet_id", currentUser.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (!error) {
        setTransactions(data || []);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (!currentUser || currentUser.isAnonymous || !currentUser.id) {
      setOrders([]);
      setWallet({ balance: 0, currency: "TRY" });
      setTransactions([]);
      setLoading(false);
      return;
    }

    fetchOrders();
    fetchWallet();
    fetchTransactions();

    const channel = supabase
      .channel("payment_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchOrders()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${currentUser.id}`,
        },
        () => fetchWallet()
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallet_transactions",
          filter: `wallet_id=eq.${currentUser.id}`,
        },
        () => fetchTransactions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchOrders, fetchWallet, fetchTransactions]);

  const createOrder = async (quoteId, sellerId) => {
    try {
      const { data: quote, error: quoteError } = await supabase
        .from("quotes")
        .select("price")
        .eq("id", quoteId)
        .single();

      if (quoteError) throw quoteError;

      const { data, error } = await supabase
        .from("orders")
        .insert([
          {
            customer_id: currentUser.id,
            seller_id: sellerId,
            quote_id: quoteId,
            total_amount: quote.price,
            commission_rate: parseFloat(import.meta.env.VITE_COMMISSION_RATE || "0.05"),
            status: "pending",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setOrders((prev) => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error("Error creating order:", error);
      showAlert("Hata", "Sipariş oluşturulamadı.", "error");
      return { data: null, error };
    }
  };

  const initiatePayment = async (orderId) => {
    try {
      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { orderId },
      });
      return { data, error };
    } catch (error) {
      console.error("Error initiating payment:", error);
      return { data: null, error };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({
          status,
          paid_at: status === "paid" ? new Date().toISOString() : null,
          completed_at: status === "completed" ? new Date().toISOString() : null,
        })
        .eq("id", orderId)
        .select()
        .single();

      if (error) throw error;
      setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...data } : o)));
      return { data, error: null };
    } catch (error) {
      console.error("Error updating status:", error);
      return { data: null, error };
    }
  };

  const sellerBalance = {
    available_balance: orders
      .filter((o) => o.seller_id === currentUser?.id && o.status === "paid")
      .reduce((sum, o) => sum + (o.total_amount || 0), 0),
  };

  const value = {
    orders,
    wallet,
    transactions,
    loading,
    sellerBalance,
    createOrder,
    initiatePayment,
    updateOrderStatus,
    fetchOrders,
    fetchWallet,
    fetchTransactions,
  };

  return <PaymentContext.Provider value={value}>{children}</PaymentContext.Provider>;
};
