import React from "react";
import { motion } from "framer-motion";  
import { cn } from "../../lib/utils";
export const Card = ({ className, children, ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        "glass-card p-5 rounded-[2rem] border border-black/5 dark:border-white/5 relative overflow-hidden",
        className,
      )}
      {...props}
    >
      {" "}
      {/* Ambient Background Glow */}{" "}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary-600/5 rounded-full blur-3xl pointer-events-none" />{" "}
      <div className="relative z-10"> {children} </div>{" "}
    </motion.div>
  );
};
