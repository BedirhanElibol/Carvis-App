/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { useAuth } from "./AuthContext";
import { useUI } from "./UIContext";

const SellerContext = createContext();

export const useSeller = () => useContext(SellerContext);

export const SellerProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { showAlert } = useUI();
  const [proTab, setProTab] = useState("dashboard");
  const [sellerProducts, setSellerProducts] = useState([]);
  const [sellerOrders, setSellerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addingProduct, setAddingProduct] = useState(false);

  const fetchSellerData = useCallback(async () => {
    if (!currentUser?.id) return;
    setLoading(true);
    try {
      const [ordersResult, productsResult] = await Promise.all([
        supabase
          .from("orders")
          .select("*")
          .eq("seller_id", currentUser.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("products")
          .select("*")
          .eq("seller_id", currentUser.id)
          .order("created_at", { ascending: false }),
      ]);

      if (!ordersResult.error) setSellerOrders(ordersResult.data || []);
      if (!productsResult.error) setSellerProducts(productsResult.data || []);
    } catch (error) {
      console.error("Seller data fetch error:", error);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      fetchSellerData();
    }
  }, [currentUser, fetchSellerData]);

  const addProduct = async (productData) => {
    if (!currentUser) return false;
    setAddingProduct(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .insert([
          {
            seller_id: currentUser.id,
            name: productData.name,
            brand: productData.brand,
            category: productData.category,
            price: parseFloat(productData.price),
            stock: parseInt(productData.stock) || 0,
            description: productData.description || "",
            certified: productData.certified || false,
            image_url: productData.image_url || null,
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique violation
          throw new Error("Bu marka ve isimde bir ilanınız zaten mevcut.");
        }
        throw error;
      }
      setSellerProducts((prev) => [data, ...prev]);
      showAlert("Başarılı", "Ürün başarıyla eklendi!", "success");
      return true;
    } catch (error) {
      console.error("Add product error:", error);
      showAlert("Hata", error.message || "Ürün eklenirken bir sorun oluştu.", "error");
      return false;
    } finally {
      setAddingProduct(false);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);
      if (error) throw error;
      setSellerProducts((prev) => prev.filter((p) => p.id !== productId));
      showAlert("Silindi", "Ürün silindi.", "success");
    } catch (err) {
      console.error("Delete product error:", err);
      showAlert("Hata", "Ürün silinirken hata oluştu.", "error");
    }
  };

  const submitQuote = async (serviceRequestId, quoteData) => {
    if (!currentUser) return false;
    try {
      const { error } = await supabase.from("quotes").insert([
        {
          service_request_id: serviceRequestId,
          seller_id: currentUser.id,
          customer_id: quoteData.customer_id,
          price: parseFloat(quoteData.price),
          description: quoteData.description,
          warranty_months: parseInt(quoteData.warranty_months) || 0,
          status: "pending",
        },
      ]);

      if (error) {
        if (error.code === '23505') {
           throw new Error("Bu hizmet talebine zaten bir teklif verdiniz.");
        }
        throw error;
      }
      showAlert(
        "Teklif Gönderildi",
        "Teklifiniz müşteriye iletildi!",
        "success",
      );
      return true;
    } catch (error) {
      console.error("Submit quote error:", error);
      showAlert("Hata", error.message || "Teklif gönderilirken sorun oluştu.", "error");
      return false;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      setSellerOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
      showAlert("Güncellendi", `Sipariş durumu: ${newStatus}`, "success");
      return true;
    } catch (error) {
      console.error("Update order status error:", error);
      showAlert("Hata", "Durum güncellenirken bir sorun oluştu.", "error");
      return false;
    }
  };

  const value = {
    proTab,
    setProTab,
    sellerProducts,
    sellerOrders,
    loading,
    addingProduct,
    addProduct,
    deleteProduct,
    submitQuote,
    fetchSellerData,
    updateOrderStatus,
  };

  return (
    <SellerContext.Provider value={value}>{children}</SellerContext.Provider>
  );
};
