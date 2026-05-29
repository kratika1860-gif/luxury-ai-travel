"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const MagneticButton = React.forwardRef<HTMLButtonElement, MagneticButtonProps>(
  ({ className, variant = "primary", size = "md", loading, children, ...props }, ref) => {
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!buttonRef.current) return;
      const { clientX, clientY } = e;
      const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
      
      // Calculate mouse position relative to button center
      const centerX = left + width / 2;
      const centerY = top + height / 2;
      
      // Calculate offset distance (max 15px pull)
      const x = (clientX - centerX) * 0.35;
      const y = (clientY - centerY) * 0.35;
      
      setPosition({ x, y });
    };

    const handleMouseLeave = () => {
      setPosition({ x: 0, y: 0 });
    };

    const baseStyles = "relative inline-flex items-center justify-center gap-2 font-bold transition-shadow duration-300 focus:outline-none disabled:opacity-50 disabled:pointer-events-none overflow-hidden group select-none";
    
    const variants = {
      primary: "bg-blue-600 text-white hover:bg-blue-500 border border-blue-400/20 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)]",
      secondary: "bg-white/[0.04] text-white border border-white/10 hover:bg-white/[0.08] hover:border-white/20",
      outline: "bg-transparent text-white border border-white/10 hover:bg-white/5 hover:border-white/20",
      ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/10",
    };

    const sizes = {
      sm: "px-4 py-2 text-xs rounded-lg",
      md: "px-6 py-3 text-sm rounded-xl",
      lg: "px-8 py-4 text-base rounded-2xl",
    };

    return (
      <motion.button
        ref={(node) => {
          // @ts-ignore
          buttonRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ x: position.x, y: position.y }}
        transition={{ type: "spring", stiffness: 120, damping: 12, mass: 0.1 }}
        whileTap={{ scale: 0.95 }}
        className={twMerge(baseStyles, variants[variant], sizes[size], className)}
        {...(props as any)}
      >
        {loading ? (
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : null}
        
        {/* Glow effect on hover for primary */}
        {variant === "primary" && (
          <div className="absolute inset-0 -z-10 bg-cyan-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        )}
        
        {/* Shimmer sweep on hover */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 group-hover:translate-x-full transition-all duration-1000 -translate-x-full" />

        {children}
      </motion.button>
    );
  }
);
MagneticButton.displayName = "MagneticButton";
