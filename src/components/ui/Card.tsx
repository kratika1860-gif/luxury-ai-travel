"use client";
import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  tilt?: boolean;
  glow?: boolean;
  noise?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, tilt = false, glow = false, noise = false, ...props }, ref) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tilt) return;
      if (!cardRef.current) return;
      
      const card = cardRef.current;
      const box = card.getBoundingClientRect();
      const x = e.clientX - box.left;
      const y = e.clientY - box.top;
      
      const centerX = box.width / 2;
      const centerY = box.height / 2;
      
      const rotateXVal = ((y - centerY) / centerY) * -5;
      const rotateYVal = ((x - centerX) / centerX) * 5;
      
      setRotateX(rotateXVal);
      setRotateY(rotateYVal);
    };

    const handleMouseLeave = () => {
      if (!tilt) return;
      setRotateX(0);
      setRotateY(0);
      setIsHovered(false);
    };

    return (
      <motion.div
        ref={(node) => {
          // @ts-ignore
          cardRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        className={twMerge(
          "relative rounded-3xl border border-[#222] bg-[#0a0a0a]/80 backdrop-blur-xl overflow-hidden shadow-soft transition-colors duration-500",
          glow && "hover:border-[#444] hover:shadow-glow",
          className
        )}
        style={{
          transformStyle: "preserve-3d",
        }}
        animate={{
          rotateX: tilt ? rotateX : 0,
          rotateY: tilt ? rotateY : 0,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        {...(props as any)}
      >
        {/* Glow orb that follows mouse */}
        {glow && isHovered && (
          <div
            className="absolute -inset-px opacity-30 transition-opacity duration-300 pointer-events-none rounded-3xl"
            style={{
              background: `radial-gradient(400px circle at ${
                tilt && cardRef.current
                  ? (rotateY / 5) * (cardRef.current.offsetWidth / 2) + cardRef.current.offsetWidth / 2
                  : "50%"
              }px ${
                tilt && cardRef.current
                  ? (rotateX / -5) * (cardRef.current.offsetHeight / 2) + cardRef.current.offsetHeight / 2
                  : "50%"
              }px, rgba(255,255,255,0.15), transparent 40%)`,
            }}
          />
        )}

        {/* Noise overlay */}
        {noise && (
          <div 
            className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
          />
        )}

        <div className="relative z-10">{children}</div>
      </motion.div>
    );
  }
);
Card.displayName = "Card";
