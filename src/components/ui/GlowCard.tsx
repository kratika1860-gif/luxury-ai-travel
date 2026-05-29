"use client";
import React from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { twMerge } from "tailwind-merge";

interface GlowCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowColor?: string; // CSS color string, e.g. "rgba(59, 130, 246, 0.25)"
  className?: string;
  children: React.ReactNode;
  tilt?: boolean;
}

export function GlowCard({
  glowColor = "rgba(59, 130, 246, 0.2)",
  className,
  children,
  tilt = false,
  ...props
}: GlowCardProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  };

  // Radial gradient following the cursor for the border glow
  const borderBackground = useMotionTemplate`
    radial-gradient(
      250px circle at ${mouseX}px ${mouseY}px,
      ${glowColor},
      transparent 80%
    )
  `;

  // Inner card glow for background depth
  const innerBackground = useMotionTemplate`
    radial-gradient(
      400px circle at ${mouseX}px ${mouseY}px,
      rgba(255, 255, 255, 0.015),
      transparent 60%
    )
  `;

  return (
    <div
      className={twMerge(
        "group relative rounded-2xl border border-white/[0.04] bg-[#0c0c12]/80 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:border-white/[0.08] hover:shadow-[0_0_30px_rgba(0,0,0,0.4)]",
        className
      )}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {/* Sharp Border Glow Layer */}
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-[inherit] border border-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-30"
        style={{
          background: borderBackground,
          maskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          WebkitMaskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
          maskComposite: "exclude",
          WebkitMaskComposite: "destination-out",
        }}
      />

      {/* Subtle Inner Background Glow Layer */}
      <motion.div
        className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0"
        style={{
          background: innerBackground,
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 w-full h-full">{children}</div>
    </div>
  );
}
