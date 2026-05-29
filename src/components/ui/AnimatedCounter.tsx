"use client";
import React, { useEffect, useRef, useState } from "react";
import { animate, useMotionValue, motion } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number; // duration in seconds
  format?: "currency" | "number" | "percent";
  currencySymbol?: string;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 1.2,
  format = "currency",
  currencySymbol = "₹",
  className = "",
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("");
  const motionValue = useMotionValue(0);

  // Setup formatting
  const formatNumber = (num: number) => {
    const rounded = Math.round(num);
    if (format === "currency") {
      // Indian numbering format (e.g., ₹1,23,456) or international fallback
      try {
        const formatter = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        });
        return formatter.format(rounded);
      } catch (e) {
        return `${currencySymbol}${rounded.toLocaleString()}`;
      }
    } else if (format === "percent") {
      return `${rounded}%`;
    }
    return rounded.toLocaleString();
  };

  useEffect(() => {
    // Sync initial state on mount (SSR safe)
    setDisplayValue(formatNumber(0));

    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1], // Custom premium ease-out cubic
      onUpdate: (latest) => {
        setDisplayValue(formatNumber(latest));
      },
    });

    return () => controls.stop();
  }, [value, duration, format, currencySymbol]);

  return <span className={className}>{displayValue}</span>;
}
