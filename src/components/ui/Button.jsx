import React from "react";
import { motion } from "framer-motion";  
import { cn } from "../../lib/utils";
import * as Icons from "lucide-react";
export const Button = ({
  className,
  variant = "primary",
  size = "md",
  isLoading = false,
  children,
  ...props
}) => {
  const variants = {
    primary:
      "bg-primary-600 text-slate-900 dark:text-white hover:bg-primary-500 shadow-primary-900/20 border border-primary-500/50",
    secondary:
      "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:bg-slate-700 border border-black/10 dark:border-white/10",
    ghost: "bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:text-white hover:bg-black/5 dark:bg-white/5",
    danger:
      "bg-red-600 text-slate-900 dark:text-white hover:bg-red-500 shadow-red-900/20",
    glass: "glass-card text-slate-900 dark:text-white hover:bg-black/10 dark:bg-white/10 border-black/10 dark:border-white/10",
    outline:
      "border border-slate-600 text-slate-600 dark:text-slate-300 hover:border-slate-400 hover:text-slate-800 dark:text-slate-100",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs min-h-[44px] sm:min-h-[32px]",
    md: "px-5 py-2.5 text-sm min-h-[48px] sm:min-h-[40px]",
    lg: "px-8 py-4 text-base min-h-[56px] sm:min-h-[48px]",
    icon: "p-2 aspect-square min-h-[44px] min-w-[44px] sm:min-h-[40px] sm:min-w-[40px]",
  };
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={cn(
        "rounded-2xl font-bold transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {" "}
      {isLoading && <Icons.Loader2 className="animate-spin" size={16} />}{" "}
      {children}{" "}
    </motion.button>
  );
};
