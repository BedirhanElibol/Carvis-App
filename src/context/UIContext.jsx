import React, { createContext, useContext, useState } from 'react';
import { TRANSLATIONS } from '../constants/translations';

const UIContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useUI = () => useContext(UIContext);

export const UIProvider = ({ children }) => {
    const [alertState, setAlertState] = useState({ show: false, title: '', message: '', type: 'info' });
    const [language, setLanguage] = useState('tr');
    const [isLoading, setIsLoading] = useState(false);

    // Global Modal States
    const [modals, setModals] = useState({
        login: false,
        register: false,
        seller: false,
        location: false,
        kvkk: false,
        sos: false,
        accident: false
    });
    const [loginIntent, setLoginIntent] = useState(null);
    const [selectedLocation, setSelectedLocation] = useState('Ankara, Ostim');

    const t = TRANSLATIONS[language];

    const showAlert = (title, message, type = 'info') => {
        setAlertState({ show: true, title, message, type });
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, show: false }));
    };

    const openModal = (modalName, intent = null) => {
        if (intent) setLoginIntent(intent);
        setModals(prev => ({ ...prev, [modalName]: true }));
    };

    const closeModal = (modalName) => {
        setModals(prev => ({ ...prev, [modalName]: false }));
        if (modalName === 'login' || modalName === 'register') setLoginIntent(null);
    };

    const toggleLanguage = () => {
        setLanguage(prev => prev === 'tr' ? 'en' : 'tr');
    };

    const value = {
        alertState,
        showAlert,
        closeAlert,
        language,
        setLanguage,
        toggleLanguage,
        t,
        isLoading,
        setIsLoading,
        modals,
        openModal,
        closeModal,
        loginIntent,
        selectedLocation,
        setSelectedLocation
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};
