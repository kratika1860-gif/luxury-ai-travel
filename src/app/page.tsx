"use client";
import React, { Suspense } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Wallet, 
  Percent, 
  ShieldAlert, 
  Globe as GlobeIcon, 
  Activity, 
  ArrowRight,
  ShieldCheck,
  Zap,
  CreditCard
} from "lucide-react";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { GlowCard } from "@/components/ui/GlowCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

import dynamic from "next/dynamic";

// Dynamic import with SSR disabled for R3F Globe component to prevent SSR compile and prerendering errors
const Globe3D = dynamic(() => import("@/components/ui/Globe"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[350px] flex items-center justify-center bg-transparent">
      <div className="w-12 h-12 rounded-full border border-blue-500/20 border-t-blue-500 animate-spin" />
    </div>
  ),
});

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
  };

  return (
    <div className="min-h-screen bg-[#020204] flex flex-col relative text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Nav */}
      <nav className="glass-nav h-20 flex items-center px-8 md:px-12 justify-between z-50">
        <div className="flex items-center gap-2 font-bold text-[18px] tracking-widest text-white group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            T
          </div>
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            TRAVIQ <span className="text-blue-500">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/auth/signin">
            <MagneticButton variant="outline" size="sm">
              Sign In
            </MagneticButton>
          </Link>
          <Link href="/dashboard">
            <MagneticButton variant="primary" size="sm">
              Launch App
            </MagneticButton>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative min-h-[90vh] flex items-center px-8 md:px-16 lg:px-24 py-12 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full relative z-10">
          
          {/* Left Side: Staggered Content */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="flex flex-col text-left space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/25 rounded-full px-4 py-1.5 text-xs text-blue-400 font-semibold tracking-wide w-fit">
              <Zap className="w-3.5 h-3.5 animate-pulse" />
              THE LUXURY AI TRAVEL OPERATING SYSTEM
            </motion.div>
            
            <motion.h1 variants={itemVariants} className="text-[48px] md:text-[64px] font-black tracking-tight leading-[1.08] text-white">
              The AI <br/>
              <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                Financial Brain
              </span> <br/>
              for Global Travel
            </motion.h1>
            
            <motion.p variants={itemVariants} className="text-[16px] text-gray-400 leading-relaxed max-w-lg">
              Never guess what your trip will cost. Traviq merges predictive intelligence, 
              forex tracking, and credit card optimization into a cinematic command center.
            </motion.p>
            
            <motion.div variants={itemVariants} className="flex gap-4 flex-wrap pt-2">
              <Link href="/dashboard">
                <MagneticButton variant="primary" size="lg">
                  Explore Dashboard <ArrowRight className="w-4 h-4 ml-1" />
                </MagneticButton>
              </Link>
              <Link href="/new-trip">
                <MagneticButton variant="secondary" size="lg">
                  Plan Next Voyage
                </MagneticButton>
              </Link>
            </motion.div>
          </motion.div>

          {/* Right Side: Interactive 3D Globe + Overlay Cards */}
          <div className="relative w-full h-[400px] lg:h-[550px] flex items-center justify-center">
            
            {/* 3D Globe Container */}
            <div className="absolute inset-0 z-0">
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full border border-blue-500/30 border-t-blue-500 animate-spin" />
                </div>
              }>
                <Globe3D />
              </Suspense>
            </div>

            {/* Overlapping Floating Cards for Anti-Gravity effect */}
            <motion.div 
              initial={{ opacity: 0, x: 50, y: -20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute top-[10%] right-[5%] z-20 pointer-events-none"
            >
              <GlowCard glowColor="rgba(6,182,212,0.3)" className="px-5 py-3.5 bg-[#0d0d12]/90 border border-white/10 backdrop-blur-md rounded-2xl flex items-center gap-3 shadow-2xl">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">FOREX MARKUP SAVED</div>
                  <div className="text-sm font-extrabold text-white">
                    <AnimatedCounter value={2480} format="currency" />
                  </div>
                </div>
              </GlowCard>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: -50, y: 40 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ delay: 0.8, type: "spring" }}
              className="absolute bottom-[10%] left-[5%] z-20 pointer-events-none"
            >
              <GlowCard glowColor="rgba(168,85,247,0.3)" className="px-5 py-3.5 bg-[#0d0d12]/90 border border-white/10 backdrop-blur-md rounded-2xl flex items-center gap-3 shadow-2xl">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">OVERSPEND RISK</div>
                  <div className="text-sm font-extrabold text-emerald-400 flex items-center gap-1.5">
                    0% Safe Zone
                  </div>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </div>

      {/* AI CFO Section — Core Differentiator (Bloomberg/Stripe Styled) */}
      <div className="py-24 px-8 md:px-16 border-t border-white/[0.04] bg-[#040407]/60 relative">
        <div className="max-w-6xl mx-auto w-full">
          <div className="text-center space-y-3 mb-16">
            <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">REAL-TIME PORTFOLIO INTEL</div>
            <h2 className="text-3xl md:text-5xl font-black">AI CFO Command Dashboard</h2>
            <p className="text-gray-400 max-w-lg mx-auto text-sm">
              Your travels simulated, forecasted, and guarded. See every financial metric on a unified glass dock.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Card 1: Overspend Risk Circular Dial */}
            <GlowCard glowColor="rgba(59,130,246,0.15)" className="p-8 flex flex-col justify-between h-[360px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">RISK ENGINE</span>
                  <span className="badge badge-green">HEALTHY</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Budget Confidence Meter</h3>
                <p className="text-xs text-gray-500">ML simulation predicting probability of exceeding destination threshold.</p>
              </div>
              
              <div className="flex justify-center items-center py-6 relative">
                {/* Simulated circular progress meter */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="6" className="text-white/5" fill="transparent" />
                  <motion.circle 
                    cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="6" 
                    className="text-blue-500" fill="transparent"
                    strokeDasharray="339.3"
                    initial={{ strokeDashoffset: 339.3 }}
                    animate={{ strokeDashoffset: 67.8 }} // 80% full
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-white">94%</span>
                  <span className="text-[8px] text-gray-500 font-bold uppercase">CONFIDENCE</span>
                </div>
              </div>
            </GlowCard>

            {/* Card 2: Live Burn Rate Chart SVG */}
            <GlowCard glowColor="rgba(168,85,247,0.15)" className="p-8 flex flex-col justify-between h-[360px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">BURN RATE</span>
                  <span className="text-xs text-blue-400 font-semibold tracking-wide">₹6,200 / day</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Live Burn Forecast</h3>
                <p className="text-xs text-gray-500">Predictive spending curves comparing target limits vs actual pace.</p>
              </div>

              <div className="w-full h-32 flex items-end">
                {/* SVG Curve chart */}
                <svg className="w-full h-full" viewBox="0 0 100 40">
                  <defs>
                    <linearGradient id="gradient-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3"/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" />
                  
                  {/* Fill area */}
                  <motion.path 
                    d="M 0,35 Q 25,32 50,22 T 100,5 L 100,40 L 0,40 Z" 
                    fill="url(#gradient-glow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  />
                  {/* Stroke path */}
                  <motion.path 
                    d="M 0,35 Q 25,32 50,22 T 100,5" 
                    fill="none" stroke="#3b82f6" strokeWidth="1.5"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: "easeInOut" }}
                  />
                </svg>
              </div>

              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-white/5">
                <span>Start Trip</span>
                <span>Midpoint</span>
                <span>Destination End</span>
              </div>
            </GlowCard>

            {/* Card 3: Forex Prediction & Fee Alerts */}
            <GlowCard glowColor="rgba(6,182,212,0.15)" className="p-8 flex flex-col justify-between h-[360px]">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[11px] font-bold tracking-widest text-gray-400 uppercase">INTELLIGENCE</span>
                  <span className="badge badge-blue">ACTIVE</span>
                </div>
                <h3 className="text-lg font-bold mb-2">Forex & Fees Optimizer</h3>
                <p className="text-xs text-gray-500">Live indicators forecasting favorable exchange rates and flagging hidden surcharges.</p>
              </div>

              <div className="space-y-4 my-2">
                <div className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-xl flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-semibold text-white">USD/INR</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-white">83.12</span>
                    <span className="text-[9px] text-emerald-400 block font-bold">-0.24% BUY</span>
                  </div>
                </div>

                <div className="p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0 animate-bounce" />
                  <div>
                    <span className="text-xs font-bold text-rose-400 block">3.5% Markup Alert</span>
                    <span className="text-[10px] text-gray-400 leading-tight">Agoda carries a markup. Book directly at Marriott for optimal card savings.</span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-gray-500 flex justify-between items-center pt-2">
                <span>Optimized via AI Engine</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              </div>
            </GlowCard>

          </div>
        </div>
      </div>

      {/* Bento Grid Features Layout */}
      <div className="py-24 px-8 md:px-16 max-w-6xl mx-auto w-full">
        <div className="text-center space-y-3 mb-16">
          <div className="text-xs font-bold text-blue-500 uppercase tracking-widest">PRODUCT ARCHITECTURE</div>
          <h2 className="text-3xl md:text-5xl font-black">Designed for Elite Travelers</h2>
          <p className="text-gray-400 max-w-lg mx-auto text-sm">
            Everything you need to orchestrate hyper-efficient travel finance, completely automated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <GlowCard glowColor="rgba(59,130,246,0.1)" className="p-6 col-span-1 md:col-span-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 mb-6 border border-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Predictive Price Simulator</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Analyzes historical prices and seasonal surcharges to predict realistic trip budgets based on actual destination data. Includes departure cities to ensure flights are calculated accurately.
            </p>
          </GlowCard>

          <GlowCard glowColor="rgba(168,85,247,0.1)" className="p-6">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 mb-6 border border-purple-500/20">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Rewards Maximizer</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Scan your credit card portfolio to identify which card gives you maximum rewards, points, or lounge access at each destination.
            </p>
          </GlowCard>

          <GlowCard glowColor="rgba(6,182,212,0.1)" className="p-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-6 border border-cyan-500/20">
              <GlobeIcon className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold mb-2">Visa Smart Assistant</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Up-to-date visa requirements checklist specifically calculated from your departure citizenship to your target destination.
            </p>
          </GlowCard>

        </div>
      </div>
    </div>
  );
}

