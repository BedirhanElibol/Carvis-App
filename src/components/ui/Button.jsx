import React from 'react';
import { motion } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

export const Button = ({
    className,
    variant = "primary",
    size = "md",
    isLoading = false,
    children,
    ...props
}) => {
    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-500 shadow-xl shadow-primary-900/20 border border-primary-500/50",
        secondary: "bg-slate-800 text-white hover:bg-slate-700 border border-white/10",
        ghost: "bg-transparent text-slate-400 hover:text-white hover:bg-white/5",
        danger: "bg-red-600 text-white hover:bg-red-500 shadow-xl shadow-red-900/20",
        glass: "glass-card text-white hover:bg-white/10 border-white/10",
        outline: "border border-slate-600 text-slate-300 hover:border-slate-400 hover:text-slate-100"
    };

    const sizes = {
        sm: "px-3 py-1.5 text-xs",
        md: "px-5 py-2.5 text-sm",
        lg: "px-8 py-4 text-base",
        icon: "p-2 aspect-square"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className={cn(
                "rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
                variants[variant],
                sizes[size],
                className
            )}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {isLoading && <Loader2 className="animate-spin" size={16} />}
            {children}
        </motion.button>
    );
};
