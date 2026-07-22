import React, { createContext, useContext, useState, useMemo, useCallback } from "react";
import { callRealGeminiAPI, analyzeVehicleDamage } from "../utils/aiUtils";
import { useGarage } from "./GarageContext";
import { useUI } from "./UIContext";
import { supabase } from "../supabaseClient";

const AIContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error("useAI must be used within AIProvider");
  }
  return context;
};

export const AIProvider = ({ children }) => {
  const { currentVehicle } = useGarage();
  const { showAlert } = useUI();
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      text: "Merhaba! Ben Rapidsy AI asistanınız. Aracınızla ilgili her türlü teknik soruyu sorabilir, arıza tespiti yapmamı isteyebilir veya yedek parça tavsiyesi alabilirsiniz. Size nasıl yardımcı olabilirim?",
      sender: "bot",
      timestamp: new Date(),
    },
  ]);
  const [analysisStatus, setAnalysisStatus] = useState(null); // 'uploading', 'detecting', 'analyzing', 'finalizing'
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;

    const userMessage = {
      id: Date.now(),
      text,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    const lowerText = text.toLowerCase();
    let botContext = "";
    let searchKeyword = "";
    if (lowerText.includes("fren") || lowerText.includes("balata")) searchKeyword = "fren";
    else if (lowerText.includes("yağ")) searchKeyword = "yağ";
    else if (lowerText.includes("akü")) searchKeyword = "akü";

    if (searchKeyword && (lowerText.includes("balata") || lowerText.includes("yağ") || lowerText.includes("akü") || lowerText.includes("parça"))) {
      const { data: partData } = await supabase.from("products").select("name, brand, price").ilike("name", `%${searchKeyword}%`).limit(3);
      if (partData?.length > 0) {
        botContext = `\nVEREBİLECEĞİN GERÇEK ÜRÜN ÖNERİLERİ (Kullanıcıya bunlardan bahset): ${partData.map(p => `${p.brand} ${p.name} (${p.price} TL)`).join(", ")}`;
      }
    } else if (lowerText.includes("usta") || lowerText.includes("servis") || lowerText.includes("tamir")) {
      const { data: shopData } = await supabase.from("mechanic_shops").select("shop_name, specialties, rating").limit(3);
      if (shopData?.length > 0) {
        botContext = `\nVEREBİLECEĞİN GERÇEK SERVİS ÖNERİLERİ: ${shopData.map(s => `${s.shop_name} (${s.specialties?.[0] || "Genel Bakım"}, Puan: ${s.rating || "Yeni"})`).join(", ")}`;
      }
    }

    const vehicleContext = currentVehicle ? `Araç: ${currentVehicle.brand} ${currentVehicle.model}` : "";
    const finalVehicleContext = vehicleContext + botContext;

    // Chat history for context (last 5 messages)
    const history = messages
      .slice(-5)
      .map((m) => `${m.sender === "user" ? "Kullanıcı" : "Asistan"}: ${m.text}`)
      .join("\n");

    try {
      const response = await callRealGeminiAPI(text, finalVehicleContext, history);
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      showAlert("AI Hatası", "Bağlantı sorunu yaşanıyor.", "error");
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Üzgünüm, şu an bağlantı sorunu yaşıyorum. Lütfen tekrar dener misiniz?",
          sender: "bot",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }, [currentVehicle, messages, showAlert]);

  const analyzeDamage = useCallback(async (imageUrl) => {
    setIsTyping(true);
    setAnalysisStatus("uploading");
    setMessages((prev) => [
      ...prev,
      {
        id: "damage-upload-" + Date.now(),
        type: "image",
        imageUrl: imageUrl,
        sender: "user",
        timestamp: new Date(),
      },
    ]);

    try {
      setAnalysisStatus("analyzing");
      const data = await analyzeVehicleDamage(imageUrl, currentVehicle);
      
      setAnalysisStatus("finalizing");
      const analysisResult = {
        id: "analysis-" + Date.now(),
        type: "analysis",
        sender: "bot",
        timestamp: new Date(),
        data: data
      };
      setMessages((prev) => [...prev, analysisResult]);
    } catch (error) {
      console.error("Analysis error:", error);
      showAlert("Hata", "Görsel analiz edilemedi.", "error");
    } finally {
      setAnalysisStatus(null);
      setIsTyping(false);
    }
  }, [currentVehicle, showAlert]);

  const clearHistory = useCallback(() => {
    setMessages([
      {
        id: "welcome",
        text: "Sohbet sıfırlandı. Yeni bir konuda yardımcı olabilirim!",
        sender: "bot",
        timestamp: new Date(),
      },
    ]);
  }, []);

  const value = useMemo(() => ({
    messages,
    isTyping,
    analysisStatus,
    sendMessage,
    analyzeDamage,
    clearHistory,
  }), [messages, isTyping, analysisStatus, sendMessage, analyzeDamage, clearHistory]);

  return (
    <AIContext.Provider value={value}>
      {children}
    </AIContext.Provider>
  );
};
