"use client";
import { motion } from "framer-motion";

export function AnimatedBackground() {
  // Generate random coordinates/durations for subtle floating dust particles
  const particles = [
    { id: 1, size: 2, top: "15%", left: "20%", duration: 18, delay: 0 },
    { id: 2, size: 3, top: "45%", left: "80%", duration: 25, delay: 2 },
    { id: 3, size: 2, top: "75%", left: "30%", duration: 22, delay: 5 },
    { id: 4, size: 4, top: "25%", left: "65%", duration: 28, delay: 1 },
    { id: 5, size: 2, top: "85%", left: "70%", duration: 20, delay: 3 },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#020204]">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-dark opacity-75" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#020204]/40 to-[#020204]" />
      
      {/* Floating high-end gradient orbs */}
      <motion.div
        className="absolute -top-[10%] -left-[10%] w-[55%] h-[55%] rounded-full bg-blue-900/10 blur-[130px]"
        animate={{
          x: [0, 40, 0],
          y: [0, -30, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <motion.div
        className="absolute top-[20%] -right-[10%] w-[45%] h-[65%] rounded-full bg-purple-900/10 blur-[140px]"
        animate={{
          x: [0, -30, 0],
          y: [0, 40, 0],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      <motion.div
        className="absolute -bottom-[20%] left-[15%] w-[60%] h-[50%] rounded-full bg-cyan-950/10 blur-[120px]"
        animate={{
          x: [0, 25, 0],
          y: [0, -25, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 4 }}
      />

      {/* Micro-particle dust field for depth */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute bg-white/25 rounded-full"
          style={{
            width: p.size,
            height: p.size,
            top: p.top,
            left: p.left,
            boxShadow: "0 0 10px rgba(255, 255, 255, 0.5)",
          }}
          animate={{
            y: [0, -50, 0],
            x: [0, p.id % 2 === 0 ? 30 : -30, 0],
            opacity: [0.15, 0.6, 0.15],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>
  );
}
