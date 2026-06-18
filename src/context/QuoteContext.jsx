/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

const QuoteContext = createContext();

export const useQuote = () => {
  const context = useContext(QuoteContext);
  if (!context) {
    throw new Error("useQuote must be used within QuoteProvider");
  }
  return context;
};

export const QuoteProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(false);

  // Kullanıcı rolüne göre teklifleri getir
  const fetchQuotes = useCallback(async () => {
    if (!currentUser?.id || currentUser.isAnonymous) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("quotes")
        .select(
          `
                    *,
                    customer:profiles!quotes_customer_id_fkey(full_name, phone_number),
                    seller:profiles!quotes_seller_id_fkey(full_name, company_name, seller_rating, experience_years),
                    service_request:service_requests(*)
                `
        )
        .or(`customer_id.eq.${currentUser.id},seller_id.eq.${currentUser.id}`)
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code !== "42501" && error.code !== "42703") {
          console.error("Error fetching quotes:", error);
          showAlert("Sistem Hatası", `Teklifler yüklenirken hata oluştu: ${error.message}`, "error");
        }
        setQuotes([]);
        return;
      }
      setQuotes(data || []);
    } catch (error) {
      console.error("Quotes Exception:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, currentUser?.isAnonymous, showAlert]);

  // Yeni teklif oluştur (Satıcı)
  const createQuote = async (quoteData) => {
    if (!currentUser) throw new Error("User not authenticated");
    try {
      const { data, error } = await supabase
        .from("quotes")
        .insert([
          {
            seller_id: currentUser.id,
            ...quoteData,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      // Listeyi güncelle
      await fetchQuotes();
      return { data, error: null };
    } catch (error) {
      console.error("Error creating quote:", error);
      showAlert("Hata", "Teklif oluşturulurken bir hata oluştu.", "error");
      return { data: null, error };
    }
  };

  // Teklifi kabul et (Müşteri)
  const acceptQuote = async (quoteId) => {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .update({ status: "accepted", accepted_at: new Date().toISOString() })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      // Listeyi güncelle
      await fetchQuotes();
      return { data, error: null };
    } catch (error) {
      console.error("Error accepting quote:", error);
      showAlert("Hata", "Teklif kabul edilirken bir hata oluştu.", "error");
      return { data: null, error };
    }
  };

  // Teklifi reddet (Müşteri)
  const rejectQuote = async (quoteId) => {
    try {
      const { data, error } = await supabase
        .from("quotes")
        .update({ status: "rejected" })
        .eq("id", quoteId)
        .select()
        .single();

      if (error) throw error;
      // Listeyi güncelle
      await fetchQuotes();
      return { data, error: null };
    } catch (error) {
      console.error("Error rejecting quote:", error);
      showAlert("Hata", "Teklif reddedilirken bir hata oluştu.", "error");
      return { data: null, error };
    }
  };

  // Realtime subscription (Yeni teklif geldiğinde otomatik güncelle)
  useEffect(() => {
    if (!currentUser) return;
    fetchQuotes();

    // Realtime dinleyici
    const channel = supabase
      .channel("quotes_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "quotes",
          filter: `customer_id=eq.${currentUser.id}`,
        },
        () => {
          fetchQuotes(); // Listeyi yenile
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUser, fetchQuotes]);

  const value = {
    quotes,
    loading,
    createQuote,
    acceptQuote,
    rejectQuote,
    refreshQuotes: fetchQuotes,
  };

  return <QuoteContext.Provider value={value}>{children}</QuoteContext.Provider>;
};
