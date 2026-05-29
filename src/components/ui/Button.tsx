"use client";
import React from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, ...props }, ref) => {
    
    const baseStyles = "relative inline-flex items-center justify-center gap-2 font-bold transition-all duration-300 ease-out focus:outline-none disabled:opacity-50 disabled:pointer-events-none overflow-hidden group";
    
    const variants = {
      primary: "bg-white text-black hover:bg-gray-200 border border-transparent shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]",
      secondary: "bg-[#111] text-white border border-[#333] hover:border-[#555] hover:bg-[#1a1a1a]",
      outline: "bg-transparent text-white border border-[#333] hover:bg-white/5 hover:border-white/20",
      ghost: "bg-transparent text-gray-300 hover:text-white hover:bg-white/10",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-xs rounded-lg",
      md: "px-5 py-2.5 text-sm rounded-xl",
      lg: "px-8 py-4 text-base rounded-2xl",
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={twMerge(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        
        {/* Glow effect on hover for primary */}
        {variant === "primary" && (
          <div className="absolute inset-0 -z-10 bg-white/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        {/* Border gradient for secondary/outline */}
        {(variant === "secondary" || variant === "outline") && (
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-700 -translate-x-full" />
        )}

        {children}
      </motion.button>
    );
  }
);
Button.displayName = "Button";
