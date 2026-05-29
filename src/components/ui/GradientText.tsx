"use client";
import React from "react";
import { twMerge } from "tailwind-merge";

interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
  animate?: boolean;
}

export function GradientText({
  children,
  className,
  from = "from-white",
  via = "via-gray-400",
  to = "to-gray-600",
  animate = false,
}: GradientTextProps) {
  return (
    <span
      className={twMerge(
        "bg-clip-text text-transparent bg-gradient-to-r",
        from,
        via,
        to,
        animate && "animate-pulse",
        className
      )}
    >
      {children}
    </span>
  );
}
