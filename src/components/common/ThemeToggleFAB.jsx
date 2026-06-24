import React from 'react';
import { useUI } from '../../context/UIContext';
import { Sun, Moon } from 'lucide-react';

const ThemeToggleFAB = () => {
    const { theme, toggleTheme } = useUI();

    return (
        <button
            onClick={toggleTheme}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-black/10 dark:border-white/10 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300"
            aria-label="Toggle Theme"
        >
            {theme === "dark" ? (
                <Sun size={24} className="text-yellow-400" />
            ) : (
                <Moon size={24} className="text-slate-700" />
            )}
        </button>
    );
};

export default ThemeToggleFAB;
