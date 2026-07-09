import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { TRANSLATIONS } from "../constants/translations";

const UIContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
  const [alertState, setAlertState] = useState({
    show: false,
    title: "",
    message: "",
    type: "info",
  });

  // Dil tespiti ve normalizasyonu (en-US -> en, tr-TR -> tr)
  const [language, setLanguageState] = useState(() => {
    try {
      const savedLang = localStorage.getItem("rapidsy_lang");
      if (savedLang && TRANSLATIONS[savedLang]) return savedLang;
      const browserLang = navigator.language?.split("-")[0] || "tr";
      return TRANSLATIONS[browserLang] ? browserLang : "tr";
    } catch {
      return "tr";
    }
  });

  // Tema yönetimi
  const [theme, setTheme] = useState(() => {
    try {
      const savedTheme = localStorage.getItem("rapidsy_theme");
      if (savedTheme) return savedTheme;
      return "dark"; // Default to dark based on original design
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("rapidsy_theme", theme);
  }, [theme]);

  const setLanguage = (langOrUpdater) => {
    setLanguageState((prev) => {
      const newLang = typeof langOrUpdater === "function" ? langOrUpdater(prev) : langOrUpdater;
      if (TRANSLATIONS[newLang]) {
        localStorage.setItem("rapidsy_lang", newLang);
        return newLang;
      }
      return prev;
    });
  };

  const [isLoading, setIsLoading] = useState(false);

  // Global Modal States
  const [modals, setModals] = useState({
    login: false,
    register: false,
    seller: false,
    location: false,
    kvkk: false,
    sos: false,
    accident: false,
    updatePassword: false,
  });

  const [loginIntent, setLoginIntent] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState("Ankara, Ostim");

  // Çeviri nesnesi (Eğer dil bulunamazsa varsayılan olarak Türkçe göster)
  const t = TRANSLATIONS[language] || TRANSLATIONS["tr"];

  const showAlert = (title, message, type = "info") => {
    setAlertState({ show: true, title, message, type });
  };

  const closeAlert = () => {
    setAlertState((prev) => ({ ...prev, show: false }));
  };

  const openModal = (modalName, intent = null) => {
    if (intent) setLoginIntent(intent);
    setModals((prev) => ({ ...prev, [modalName]: true }));
  };

  const closeModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: false }));
    if (modalName === "login" || modalName === "register") setLoginIntent(null);
  };

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === "tr" ? "en" : "tr"));
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const value = useMemo(() => ({

    alertState,
    showAlert,
    closeAlert,
    language,
    setLanguage,
    toggleLanguage,
    theme,
    toggleTheme,
    t,
    isLoading,
    setIsLoading,
    modals,
    openModal,
    closeModal,
    loginIntent,
    selectedLocation,
    setSelectedLocation,
  
  }), [alertState, showAlert, closeAlert, language, toggleLanguage, theme, toggleTheme, t, isLoading, modals, openModal, closeModal, loginIntent, selectedLocation]);

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
