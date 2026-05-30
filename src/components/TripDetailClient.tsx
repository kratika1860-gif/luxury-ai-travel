// src/components/TripDetailClient.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import type { Trip, ForexRate, CreditCardRecommendation, FlightPriceTrend } from "@/types";
import type { VisaInfo } from "@/lib/visa";
import AddExpenseModal from "./AddExpenseModal";
import WikipediaImage from "./WikipediaImage";
import { GlowCard } from "@/components/ui/GlowCard";
import { generateDetailedFlights, generatePricePredictionChart } from "@/lib/flightsData";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MagneticButton } from "@/components/ui/MagneticButton";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, Filler);

interface Props {
  trip: Trip;
  toCurrency: string;
  forexRates: ForexRate[];
  flightTrends: FlightPriceTrend | null;
  cardRecs: CreditCardRecommendation[];
  visaInfo: VisaInfo;
}

export default function TripDetailClient({ trip, toCurrency, forexRates, flightTrends, cardRecs, visaInfo }: Props) {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "itinerary" | "flights" | "hotels" | "forex" | "cards" | "visa" | "expenses">("overview");
  const [expandedTips, setExpandedTips] = useState<Record<string, boolean>>({});
  // Itinerary Accordion State: By default, only Day 1 is open
  const [openDays, setOpenDays] = useState<number[]>([1]);
  // Hotel Directory State
  const [hotelSort, setHotelSort] = useState<"price_asc" | "rating_desc">("rating_desc");
  const [expandedHotels, setExpandedHotels] = useState<number[]>([]);

  // AI Concierge Chatbot State
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    { sender: "bot", text: `👋 Alola! I am your TRAVIQ AI Concierge. I am fully configured with your trip to ${trip.destination}. Ask me anything about transit lines, restaurant recommendations, rainy-day alternatives, packing lists, or local hacks!` }
  ]);
  const [chatLoading, setChatLoading] = useState(false);

  async function handleSendChatMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    setChatInput("");
    setChatMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setChatLoading(true);

    try {
      const history = chatMessages
        .slice(-6)
        .map(m => ({
          role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
          content: m.text
        }));

      const res = await fetch(`/api/trips/${trip.id}/chat`, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history }),
      });

      const data = await res.json();
      if (data.reply) {
        setChatMessages((prev) => [...prev, { sender: "bot", text: data.reply }]);
      } else {
        setChatMessages((prev) => [...prev, { sender: "bot", text: "I ran into a small connection hiccup. Feel free to ask me again!" }]);
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [...prev, { sender: "bot", text: "Connection error. Please check your network and try again." }]);
    } finally {
      setChatLoading(false);
    }
  }

  function toggleDay(dayNumber: number) {
    setOpenDays(prev => prev.includes(dayNumber) ? prev.filter(d => d !== dayNumber) : [...prev, dayNumber]);
  }

  function toggleHotel(index: number) {
    setExpandedHotels(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  }

  function toggleTip(key: string) {
    setExpandedTips((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  const analysis = trip.aiAnalysis;
  const breakdown = analysis?.costBreakdown;
  const overspend = trip.overspendRisk ?? 0;
  const predicted = trip.predictedCost ?? 0;
  const over = predicted - trip.budget;
  const duration = Math.ceil(
    (new Date(trip.endDate).getTime() - new Date(trip.startDate).getTime()) / 86400000
  );

  const pieData = breakdown
    ? {
        labels: ["Flights", "Accommodation", "Food", "Transport", "Activities", "Hidden"],
        datasets: [{
          data: [breakdown.flights, breakdown.accommodation, breakdown.food, breakdown.transportation, breakdown.activities, breakdown.hiddenFees],
          backgroundColor: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"],
          borderWidth: 2,
          borderColor: "#0d0d12",
          hoverOffset: 6,
        }],
      }
    : null;

  const lineData = flightTrends
    ? {
        labels: flightTrends.labels,
        datasets: [{
          data: flightTrends.prices,
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59,130,246,0.02)",
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#0d0d12",
          pointBorderWidth: 2,
          fill: true,
          tension: 0.35,
        }],
      }
    : null;

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "itinerary", label: "Itinerary" },
    { id: "flights", label: "Flights" },
    { id: "hotels", label: "Hotels" },
    { id: "visa", label: "Visa" },
    { id: "forex", label: "Forex" },
    { id: "cards", label: "Cards" },
    { id: "expenses", label: "Expenses" },
  ] as const;

  return (
    <div className="min-h-screen flex flex-col relative z-10 text-white select-none">
      {/* Nav */}
      <nav className="h-20 glass-nav flex items-center px-8 md:px-12 justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-300 text-[13px] font-semibold bg-white/[0.03] border border-white/10 px-4 py-2 rounded-xl hover:bg-white/[0.08] hover:text-white transition-all duration-300">
          <svg viewBox="0 0 14 14" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,2 4,7 9,12" /></svg>
          Dashboard
        </Link>
        <div className="flex items-center gap-4">
          <MagneticButton
            variant="secondary"
            size="sm"
            onClick={() => setActiveTab("expenses")}
          >
            Split Expenses
          </MagneticButton>
        </div>
      </nav>

      <div className="flex-1 px-8 md:px-12 py-10 max-w-[1200px] w-full mx-auto">
        {/* Trip Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center">
              <svg viewBox="0 0 16 16" width="18" height="18" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="8" cy="7" r="3" /><path d="M8 1a6 6 0 010 12c-2 0-6-5-6-6a6 6 0 0112 0c0 1-4 6-6 6z" /></svg>
            </div>
            <div className="flex items-center gap-2.5">
              {trip.origin && (
                <>
                  <span className="text-xl font-bold text-gray-400">{trip.origin}</span>
                  <svg viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="#3b82f6" strokeWidth="2.5" className="flex-shrink-0">
                    <path d="M4 10h12M12 6l4 4-4 4" />
                  </svg>
                </>
              )}
              <span className="text-3xl font-black tracking-tight text-white">{trip.destination}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-[14px] font-medium pl-[52px]">
            <svg viewBox="0 0 14 14" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="2" width="12" height="11" rx="2" /><path d="M1 6h12M5 1v2M9 1v2" /></svg>
            {duration} days &nbsp;·&nbsp; {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <GlowCard glowColor="rgba(59,130,246,0.15)" className="p-6 relative overflow-hidden flex flex-col justify-between h-[120px]">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Total Budget</div>
            <div className="text-3xl font-black tracking-tight text-white mt-2">
              <AnimatedCounter value={trip.budget} format="currency" />
            </div>
            <div className="absolute -bottom-4 -right-4 text-7xl opacity-[0.02] select-none">💰</div>
          </GlowCard>

          <GlowCard glowColor={overspend > 60 ? "rgba(244,63,94,0.15)" : "rgba(16,185,129,0.15)"} className="p-6 relative overflow-hidden flex flex-col justify-between h-[120px]">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">AI Predicted</div>
            <div className={`text-3xl font-black tracking-tight mt-2 ${over > 0 ? "text-rose-400" : "text-emerald-400"}`}>
              <AnimatedCounter value={trip.predictedCost ?? 0} format="currency" />
            </div>
            <div className="absolute -bottom-4 -right-4 text-7xl opacity-[0.02] select-none">🤖</div>
          </GlowCard>

          <GlowCard 
            glowColor={overspend > 60 ? "rgba(244,63,94,0.25)" : overspend > 40 ? "rgba(245,158,11,0.25)" : "rgba(16,185,129,0.25)"} 
            className={`p-6 relative overflow-hidden flex flex-col justify-between h-[120px] bg-gradient-to-br border-0 ${
              overspend > 60 
                ? "from-rose-950/20 to-red-950/10 border-rose-500/20 text-rose-400" 
                : overspend > 40 
                  ? "from-amber-950/20 to-yellow-950/10 border-amber-500/20 text-amber-400" 
                  : "from-emerald-950/20 to-green-950/10 border-emerald-500/20 text-emerald-400"
            }`}
          >
            <div className="text-[11px] font-bold uppercase tracking-widest opacity-80">Overspend Risk</div>
            <div className="flex justify-between items-end mt-2">
              <div className="text-3xl font-black tracking-tight">
                <AnimatedCounter value={overspend} format="percent" />
              </div>
              <div className="text-[12px] font-bold uppercase tracking-wider">
                {overspend > 70 ? "High Risk" : overspend > 40 ? "Medium Risk" : "Safe Zone"}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 text-7xl opacity-[0.05] select-none">⚠️</div>
          </GlowCard>
        </div>

        {/* AI Summary */}
        {analysis?.summary && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-950/15 via-indigo-950/10 to-transparent border border-white/[0.05] rounded-3xl text-sm flex gap-5 shadow-[0_0_30px_rgba(59,130,246,0.04)] relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/25 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
              <span className="text-xl animate-pulse">✨</span>
            </div>
            <div className="relative z-10 flex-1">
              <div className="font-black text-[14px] text-blue-400 mb-1">AI CFO Summary</div>
              <div className="text-[14px] text-gray-300 leading-relaxed font-medium max-w-4xl">{analysis.summary}</div>
            </div>
          </div>
        )}

        {/* Tabs - Pill Menu */}
        <div className="flex bg-white/[0.02] backdrop-blur-xl p-1.5 rounded-2xl mb-8 w-fit border border-white/[0.06] overflow-x-auto max-w-full hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-5 py-2.5 text-[13px] font-bold rounded-xl transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]"
                  : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Cost Breakdown Pie */}
              <GlowCard glowColor="rgba(59,130,246,0.1)" className="p-6">
                <div className="mb-6 flex justify-between items-center">
                  <span className="text-[14px] font-black text-white tracking-tight">Cost Breakdown</span>
                  <span className="text-xl opacity-50">📊</span>
                </div>
                <div>
                  {pieData ? (
                    <div className="flex flex-col sm:flex-row items-center gap-8">
                      <div className="relative flex-shrink-0" style={{ width: 200, height: 200 }}>
                        <Doughnut data={pieData} options={{ cutout: "70%", plugins: { legend: { display: false } }, animation: { animateRotate: true, duration: 800, easing: "easeOutQuart" } }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                           <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Total</span>
                           <span className="text-xl font-black text-white">
                             <AnimatedCounter value={trip.predictedCost ?? trip.budget} format="currency" />
                           </span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-3 w-full">
                        {[
                          { label: "Flights", color: "#3b82f6", val: breakdown!.flights },
                          { label: "Accommodation", color: "#8b5cf6", val: breakdown!.accommodation },
                          { label: "Food", color: "#ec4899", val: breakdown!.food },
                          { label: "Transport", color: "#f59e0b", val: breakdown!.transportation },
                          { label: "Activities", color: "#10b981", val: breakdown!.activities },
                          { label: "Hidden Fees", color: "#ef4444", val: breakdown!.hiddenFees },
                        ].map((item) => (
                          <div key={item.label} className="flex items-center justify-between text-[13px]">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 rounded-md flex-shrink-0 shadow-sm" style={{ background: item.color }} />
                              <span className="font-medium text-gray-400">{item.label}</span>
                            </div>
                            <span className="font-bold text-white">₹{item.val.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : <div className="text-gray-400 text-sm text-center py-10">No breakdown available</div>}
                </div>
              </GlowCard>

              {/* Flight Trend Line */}
              <GlowCard glowColor="rgba(6,182,212,0.1)" className="p-6">
                <div className="mb-6 flex justify-between items-center">
                  <span className="text-[14px] font-black text-white tracking-tight">Flight Price Trend</span>
                  <span className="text-xl opacity-50">✈️</span>
                </div>
                <div>
                  {lineData ? (
                    <>
                      <div style={{ height: 180 }} className="mb-4">
                        <Line data={lineData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, border: {display: false}, ticks: { font: { size: 11, family: 'Inter' }, color: "#8a8a93" } }, y: { grid: { color: "rgba(255,255,255,0.03)" }, border: {display: false}, ticks: { font: { size: 11, family: 'Inter' }, color: "#8a8a93" } } }, animation: { duration: 800, easing: "easeOutQuart" } }} />
                      </div>
                      {flightTrends?.alert && (
                        <div className="p-4 bg-blue-950/10 border border-blue-500/10 rounded-2xl flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                             <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="#3b82f6" strokeWidth="2"><path d="M8 1v14M1 8h14"/></svg>
                           </div>
                           <div>
                             <div className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-0.5">Price Alert</div>
                             <div className="text-[13px] font-medium text-gray-300">{flightTrends.alert}</div>
                           </div>
                        </div>
                      )}
                    </>
                  ) : <div className="text-gray-400 text-sm text-center py-10">No trend data</div>}
                </div>
              </GlowCard>
            </div>

            {/* AI Recommendations */}
            {analysis?.recommendations && (
              <GlowCard glowColor="rgba(168,85,247,0.1)" className="p-6">
                <div className="pb-4 border-b border-white/[0.06] mb-4">
                  <span className="text-sm font-semibold">AI Recommendations & Budget Tips</span>
                  <p className="text-xs text-gray-400 mt-0.5">Click any tip to see why it matters for your trip</p>
                </div>

                {/* Best booking time banner */}
                {analysis.bestBookingTime && (
                  <div className="mb-6 flex items-start gap-2.5 p-3.5 bg-blue-950/15 border border-blue-500/15 rounded-xl text-blue-400">
                    <span className="text-base flex-shrink-0">🗓</span>
                    <div>
                      <div className="text-[12px] font-bold text-blue-400 uppercase tracking-wide mb-0.5">Best Time to Book</div>
                      {(() => {
                        const [title, ...rest] = analysis.bestBookingTime.split(" — ");
                        return (
                          <>
                            <div className="text-[13px] font-semibold text-white">{title}</div>
                            {rest.length > 0 && <div className="text-[12px] text-gray-400 mt-0.5 leading-relaxed">{rest.join(" — ")}</div>}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-2.5">
                  {/* Recommendations */}
                  {analysis.recommendations.map((tip, i) => {
                    const [title, ...rest] = tip.split(" — ");
                    const detail = rest.join(" — ");
                    const key = `rec-${i}`;
                    const isOpen = expandedTips[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleTip(key)}
                        className="w-full text-left flex items-start gap-3 p-3.5 bg-white/[0.01] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/10 rounded-xl transition-all group"
                      >
                        <span className="text-emerald-400 text-base flex-shrink-0 mt-0.5">✓</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-semibold text-gray-250 leading-snug group-hover:text-white transition-colors">{title}</span>
                            <svg
                              viewBox="0 0 12 12" width="10" height="10" fill="none"
                              stroke="currentColor" strokeWidth="2"
                              className={`flex-shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            >
                              <polyline points="1,4 6,9 11,4" />
                            </svg>
                          </div>
                          {detail && isOpen && (
                            <p className="text-[12px] text-gray-400 mt-1.5 leading-relaxed border-t border-white/[0.06] pt-1.5">{detail}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}

                  {/* Budget Tips */}
                  {analysis.budgetTips?.map((tip, i) => {
                    const [title, ...rest] = tip.split(" — ");
                    const detail = rest.join(" — ");
                    const key = `tip-${i}`;
                    const isOpen = expandedTips[key];
                    return (
                      <button
                        key={key}
                        onClick={() => toggleTip(key)}
                        className="w-full text-left flex items-start gap-3 p-3.5 bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/15 rounded-xl transition-all group"
                      >
                        <span className="text-amber-400 text-base flex-shrink-0 mt-0.5">💡</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[13px] font-semibold text-amber-300 leading-snug">{title}</span>
                            <svg
                              viewBox="0 0 12 12" width="10" height="10" fill="none"
                              stroke="currentColor" strokeWidth="2"
                              className={`flex-shrink-0 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                            >
                              <polyline points="1,4 6,9 11,4" />
                            </svg>
                          </div>
                          {detail && isOpen && (
                            <p className="text-[12px] text-gray-300/80 mt-1.5 leading-relaxed border-t border-amber-500/10 pt-1.5">{detail}</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </GlowCard>
            )}

            {/* ═══ AI TRAVEL INTELLIGENCE — Bloomberg-style Risk Dashboard ═══ */}
            {analysis?.riskIntel && (
              <GlowCard glowColor="rgba(239,68,68,0.08)" className="p-0 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-red-950/15 via-[#0d0d12] to-orange-950/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(239,68,68,0.15)]">
                      <span className="text-[16px]">🛡️</span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-black text-white tracking-tight">TRAVIQ Risk Intel</h3>
                      <p className="text-[11px] text-gray-400 font-medium">Real-time threat assessment for {trip.destination}</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { icon: "⛈️", label: "Weather Risk", value: analysis.riskIntel.weatherRisk, color: "blue" },
                    { icon: "🏛️", label: "Political Stability", value: analysis.riskIntel.politicalStability, color: "emerald" },
                    { icon: "🏥", label: "Health Advisory", value: analysis.riskIntel.healthAdvisory, color: "rose" },
                    { icon: "👥", label: "Peak Crowd Alert", value: analysis.riskIntel.peakCrowdAlert, color: "amber" },
                    { icon: "💱", label: "Currency Volatility", value: analysis.riskIntel.currencyVolatility, color: "cyan" },
                  ].map((item, i) => (
                    <div key={i} className={`bg-${item.color}-950/10 border border-${item.color}-500/15 rounded-xl p-4 hover:border-${item.color}-500/30 transition-colors`}
                      style={{
                        backgroundColor: `color-mix(in srgb, ${
                          item.color === "blue" ? "#3b82f6" : item.color === "emerald" ? "#10b981" : item.color === "rose" ? "#f43f5e" : item.color === "amber" ? "#f59e0b" : "#06b6d4"
                        } 4%, transparent)`,
                        borderColor: `color-mix(in srgb, ${
                          item.color === "blue" ? "#3b82f6" : item.color === "emerald" ? "#10b981" : item.color === "rose" ? "#f43f5e" : item.color === "amber" ? "#f59e0b" : "#06b6d4"
                        } 15%, transparent)`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2.5">
                        <span className="text-[15px]">{item.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{item.label}</span>
                      </div>
                      <p className="text-[12.5px] text-gray-300 leading-relaxed font-medium">{item.value}</p>
                    </div>
                  ))}
                </div>
              </GlowCard>
            )}

            {/* ═══ AI FLIGHT STRATEGY — Command Center ═══ */}
            {analysis?.flightStrategy && (
              <GlowCard glowColor="rgba(59,130,246,0.08)" className="p-0 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-blue-950/15 via-[#0d0d12] to-indigo-950/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                      <span className="text-[16px]">✈️</span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-black text-white tracking-tight">Flight Strategy Engine</h3>
                      <p className="text-[11px] text-gray-400 font-medium">AI-optimized booking intelligence</p>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px]">📅</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Cheapest Days to Fly</span>
                      </div>
                      <p className="text-[13px] text-white font-semibold leading-relaxed">{analysis.flightStrategy.cheapestDays}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px]">🪑</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Seat Recommendation</span>
                      </div>
                      <p className="text-[13px] text-white font-semibold leading-relaxed">{analysis.flightStrategy.seatRecommendation}</p>
                    </div>
                    <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px]">🔄</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Layover Tip</span>
                      </div>
                      <p className="text-[13px] text-gray-300 leading-relaxed font-medium">{analysis.flightStrategy.layoverTip}</p>
                    </div>
                    <div className="bg-amber-950/10 border border-amber-500/15 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-[13px]">⚠️</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">Baggage Warning</span>
                      </div>
                      <p className="text-[13px] text-amber-200 leading-relaxed font-medium">{analysis.flightStrategy.baggageWarning}</p>
                    </div>
                  </div>
                  {analysis.flightStrategy.bestAirlines && analysis.flightStrategy.bestAirlines.length > 0 && (
                    <div className="mt-4 bg-emerald-950/10 border border-emerald-500/15 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-[13px]">🏆</span>
                        <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Best Airlines for This Route</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {analysis.flightStrategy.bestAirlines.map((airline, i) => (
                          <span key={i} className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[12px] font-bold px-3 py-1.5 rounded-lg">
                            {airline}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </GlowCard>
            )}

            {/* ═══ PRICING INTEL — Market Intelligence ═══ */}
            {analysis?.pricingIntel && (
              <GlowCard glowColor="rgba(16,185,129,0.08)" className="p-0 overflow-hidden">
                <div className="px-6 py-5 border-b border-white/[0.06] bg-gradient-to-r from-emerald-950/15 via-[#0d0d12] to-teal-950/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                      <span className="text-[16px]">📊</span>
                    </div>
                    <div>
                      <h3 className="text-[15px] font-black text-white tracking-tight">Pricing Intelligence</h3>
                      <p className="text-[11px] text-gray-400 font-medium">Market-grade pricing data & alternatives</p>
                    </div>
                  </div>
                </div>
                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[13px]">📈</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">vs Last Year</span>
                    </div>
                    <p className="text-[13px] text-white font-semibold leading-relaxed">{analysis.pricingIntel.vsLastYear}</p>
                  </div>
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[13px]">🎯</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Booking Window</span>
                    </div>
                    <p className="text-[13px] text-white font-semibold leading-relaxed">{analysis.pricingIntel.bookingWindow}</p>
                  </div>
                  <div className="bg-purple-950/10 border border-purple-500/15 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[13px]">🌍</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-purple-400">Alt Destination</span>
                    </div>
                    <p className="text-[13px] text-purple-200 leading-relaxed font-medium">{analysis.pricingIntel.alternativeDestination}</p>
                  </div>
                  <div className="bg-rose-950/10 border border-rose-500/15 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[13px]">🚫</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-rose-400">Peak Avoidance</span>
                    </div>
                    <p className="text-[13px] text-rose-200 leading-relaxed font-medium">{analysis.pricingIntel.peakAvoidance}</p>
                  </div>
                </div>
              </GlowCard>
            )}
          </div>
        )}

        {/* ITINERARY TAB */}
        {activeTab === "itinerary" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Day-by-Day Plan</h2>
                <p className="text-sm text-gray-400 mt-1">Your optimized {trip.destination} itinerary</p>
              </div>
            </div>

            {analysis?.itinerary && analysis.itinerary.length > 0 ? (
              <div className="space-y-6">
                {analysis.itinerary.map((day) => {
                  return (
                    <div key={day.day} className="bg-white/[0.01] rounded-2xl border border-white/[0.05] overflow-hidden hover:border-white/10 transition-colors">
                      {/* Day Header - Clickable Accordion */}
                      <button 
                        onClick={() => toggleDay(day.day)}
                        className="w-full text-left bg-white/[0.01] hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="bg-blue-600 text-white w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
                            <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">Day</span>
                            <span className="text-xl font-black leading-none">{day.day}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white leading-tight">{day.title}</h3>
                            {day.estimatedCost > 0 && (
                              <p className="text-[13px] text-gray-400 font-medium mt-0.5 flex items-center gap-1.5">
                                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 1v14M4 4h8M4 8h8M4 12h4" /></svg>
                                Est. Daily Spend: ₹{day.estimatedCost.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {day.placesToVisit && day.placesToVisit.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 justify-end">
                              {day.placesToVisit.map((place, idx) => (
                                <span key={idx} className="bg-white/[0.02] border border-white/[0.06] text-gray-300 text-[11px] font-semibold py-1 px-2.5 rounded-lg flex items-center gap-1">
                                  <span className="text-blue-400">📍</span> {place}
                                </span>
                              ))}
                            </div>
                          )}
                          <svg className={`w-5 h-5 text-gray-400 transition-transform ${openDays.includes(day.day) ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </button>

                      {/* Day Content (Accordion Body) */}
                      {openDays.includes(day.day) && (
                        <div className="p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            
                            {/* Activities Timeline */}
                            <div className="lg:col-span-3 relative">
                              <div className="absolute left-2.5 top-2 bottom-2 w-0.5 bg-white/[0.04] rounded-full"></div>
                              <div className="space-y-6">
                                {day.hotel && (
                                  <div className="relative pl-8">
                                    <span className="absolute left-1.5 top-2.5 w-2.5 h-2.5 bg-indigo-500 rounded-full ring-4 ring-[#0d0d12] shadow-[0_0_8px_rgba(99,102,241,0.5)]"></span>
                                    <div className="bg-indigo-950/10 border border-indigo-500/20 p-4 rounded-xl shadow-sm">
                                      <div className="flex items-center gap-2 mb-1.5">
                                        <span className="text-[14px]">🏨</span>
                                        <h4 className="text-[11px] font-black text-indigo-300 uppercase tracking-wider">Recommended Stay</h4>
                                      </div>
                                      <p className="text-[13px] text-gray-300 leading-relaxed font-medium">{day.hotel}</p>
                                    </div>
                                  </div>
                                )}

                                {day.transport && day.transport.length > 0 && (
                                  <div className="relative pl-8">
                                    <span className="absolute left-1.5 top-2.5 w-2.5 h-2.5 bg-amber-500 rounded-full ring-4 ring-[#0d0d12] shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                                    <div className="bg-amber-950/10 border border-amber-500/20 p-4 rounded-xl shadow-sm">
                                      <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[14px]">🚇</span>
                                        <h4 className="text-[11px] font-black text-amber-300 uppercase tracking-wider">Transit Directions</h4>
                                      </div>
                                      <ul className="space-y-2">
                                        {day.transport.map((leg, lIdx) => (
                                          <li key={lIdx} className="text-[13px] text-gray-300 flex items-start gap-2">
                                            <span className="text-amber-400 mt-0.5">•</span>
                                            <span>{leg}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                                {day.activities.map((act, idx) => {
                                  const parts = act.split(" — ");
                                  const title = parts[0];
                                  const desc = parts.slice(1).join(" — ");
                                  return (
                                    <div key={idx} className="relative pl-8">
                                      <span className="absolute left-1.5 top-1.5 w-2.5 h-2.5 bg-blue-500 rounded-full ring-4 ring-[#0d0d12] shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                                      <div className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/[0.04] p-4 rounded-xl transition-colors">
                                        <h4 className="text-[14px] font-bold text-white leading-snug">{title}</h4>
                                        {desc && (
                                          <p className="text-[13px] text-gray-400 mt-1.5 leading-relaxed">{desc}</p>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Beautiful Photo Gallery */}
                            {day.placesToVisit && day.placesToVisit.length > 0 && (
                              <div className="lg:col-span-2">
                                <div className="grid grid-cols-2 gap-3 h-full">
                                  {day.placesToVisit.slice(0, 3).map((place, idx) => {
                                    const isLarge = idx === 0 && day.placesToVisit!.length >= 2;
                                    return (
                                      <div 
                                        key={idx} 
                                        className={`relative rounded-xl overflow-hidden group shadow-sm bg-[#0c0c12] ${isLarge ? 'col-span-2 aspect-[16/9]' : 'col-span-1 aspect-square'}`}
                                      >
                                        <WikipediaImage place={`${place} ${trip.destination}`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#020204]/90 via-black/30 to-transparent"></div>
                                        <div className="absolute bottom-3 left-3 right-3">
                                          <span className="text-white text-xs font-bold drop-shadow-md truncate block">{place}</span>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                          </div>

                          {/* ═══ WEATHER NOTE ═══ */}
                          {day.weatherNote && (
                            <div className="flex items-start gap-2.5 p-3.5 bg-cyan-950/10 border border-cyan-500/15 rounded-xl mt-2">
                              <span className="text-[15px] flex-shrink-0">🌤️</span>
                              <div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400 block mb-0.5">Weather Note</span>
                                <p className="text-[12.5px] text-gray-300 leading-relaxed font-medium">{day.weatherNote}</p>
                              </div>
                            </div>
                          )}

                          {/* ═══ MEAL GUIDE ═══ */}
                          {day.mealSuggestions && day.mealSuggestions.length > 0 && (
                            <div className="mt-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-[15px]">🍽️</span>
                                <span className="text-[11px] font-black uppercase tracking-widest text-gray-400">Meal Concierge</span>
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {day.mealSuggestions.map((meal, mIdx) => (
                                  <div key={mIdx} className="bg-gradient-to-br from-orange-950/10 to-[#0c0c12] border border-orange-500/15 rounded-xl p-4 hover:border-orange-500/25 transition-colors">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">{meal.meal}</span>
                                      <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/15 px-2 py-0.5 rounded">₹{meal.cost.toLocaleString()}</span>
                                    </div>
                                    <p className="text-[13px] font-semibold text-white leading-snug mb-1.5">{meal.place}</p>
                                    <p className="text-[11.5px] text-gray-400 leading-relaxed italic">💡 {meal.tip}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* ═══ LOCAL HACKS ═══ */}
                          {day.localHacks && day.localHacks.length > 0 && (
                            <div className="mt-4 bg-gradient-to-r from-purple-950/10 to-[#0d0d12] border border-purple-500/15 rounded-xl p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="text-[15px]">🎯</span>
                                <span className="text-[11px] font-black uppercase tracking-widest text-purple-400">Local Concierge Hacks</span>
                              </div>
                              <div className="space-y-2">
                                {day.localHacks.map((hack, hIdx) => (
                                  <div key={hIdx} className="flex items-start gap-2.5 p-2.5 bg-white/[0.01] border border-white/[0.04] rounded-lg hover:bg-white/[0.03] transition-colors">
                                    <span className="text-purple-400 text-[12px] mt-0.5 flex-shrink-0">▸</span>
                                    <p className="text-[12.5px] text-gray-300 leading-relaxed font-medium">{hack}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <GlowCard glowColor="rgba(59,130,246,0.05)" className="p-12 text-center">
                <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                  <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19V5a2 2 0 0 1 2-2h13.4a.6.6 0 0 1 .6.6v13.8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z" /><path d="M8 11h8M8 15h6M8 7h8" /></svg>
                </div>
                <h3 className="text-lg font-bold text-white mb-1">No Itinerary Found</h3>
                <p className="text-sm text-gray-400">We couldn't generate an itinerary for this trip.</p>
              </GlowCard>
            )}
          </div>
        )}

        {/* FLIGHTS TAB */}
        {activeTab === "flights" && (
          <div className="space-y-6">
            {/* Header */}
            <GlowCard glowColor="rgba(59,130,246,0.15)" className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    ✈️ Flight Command Cockpit
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    AI-optimized schedules, cabin tiers, and pricing intelligence customized for your trip from <strong>{trip.origin}</strong> to <strong>{trip.destination}</strong>.
                  </p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl text-xs text-blue-400 font-bold uppercase tracking-wider">
                  Style: {trip.travelStyle}
                </div>
              </div>
            </GlowCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Flight List (Col-span 2) */}
              {(() => {
                const detailedFlights = generateDetailedFlights(trip.origin, trip.destination, trip.startDate, trip.travelStyle);
                return (
                  <>
                    <div className="lg:col-span-2 space-y-4">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Custom Flight Options For Your Plan ({new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })})
                      </div>

                      {detailedFlights.map((flight) => (
                        <GlowCard key={flight.id} glowColor="rgba(59,130,246,0.1)" className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-black/40 border-white/[0.05]">
                          {/* Airline & Info */}
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center font-black text-xs text-blue-400 tracking-wider">
                              {flight.logo}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-[15px] text-white">{flight.carrier}</h3>
                                <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-gray-400 font-medium">
                                  {flight.flightNo}
                                </span>
                              </div>
                              <p className="text-[11px] text-gray-400 mt-0.5 font-medium font-semibold">Class: <span className="text-blue-400 font-black">{flight.cabinClass}</span></p>
                            </div>
                          </div>

                          {/* Schedule */}
                          <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-start">
                            <div className="text-left">
                              <div className="text-sm font-bold text-white">{flight.departureTime.split(" ")[0]}</div>
                              <div className="text-[10px] text-gray-500 font-semibold">{trip.origin.split(",")[0]}</div>
                            </div>
                            
                            <div className="flex flex-col items-center min-w-[80px]">
                              <span className="text-[9px] text-gray-500 uppercase tracking-wider font-bold">{flight.duration}</span>
                              <div className="w-16 h-0.5 bg-white/10 my-1 relative flex items-center justify-center">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 absolute"></div>
                              </div>
                              <span className="text-[9px] text-gray-400 font-semibold">{flight.stopDetails}</span>
                            </div>

                            <div className="text-right">
                              <div className="text-sm font-bold text-white">{flight.arrivalTime.split(" ")[0]}</div>
                              <div className="text-[10px] text-gray-500 font-semibold">{trip.destination.split(",")[0]}</div>
                            </div>
                          </div>

                          {/* Fare & CTA */}
                          <div className="flex items-center md:items-end justify-between md:justify-start md:flex-col gap-4 w-full md:w-auto pt-4 md:pt-0 border-t border-white/5 md:border-none">
                            <div className="text-left md:text-right">
                              <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Cabin Fare</span>
                              <div className="text-xl font-black text-white mt-0.5">
                                ₹{flight.price.toLocaleString("en-IN")}
                              </div>
                              <span className="text-[9.5px] text-emerald-400 font-semibold block mt-0.5">
                                💼 {flight.baggage}
                              </span>
                            </div>

                            <MagneticButton 
                              onClick={() => alert(`Redirecting to secure airline portal for ${flight.carrier} ${flight.flightNo}...`)}
                              variant="primary" 
                              size="sm"
                            >
                              Book Flight
                            </MagneticButton>
                          </div>
                        </GlowCard>
                      ))}

                      {/* Cabin Benefits */}
                      <GlowCard glowColor="rgba(16,185,129,0.1)" className="p-5 bg-gradient-to-br from-emerald-950/10 to-transparent border-emerald-500/10">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block mb-2 pl-0.5">👑 Premium Cabin Inclusions</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-300">
                          {detailedFlights[0]?.benefits.map((b, i) => (
                            <div key={i} className="flex items-center gap-2">
                              <span className="text-emerald-400">✦</span>
                              <span className="font-semibold">{b}</span>
                            </div>
                          ))}
                        </div>
                      </GlowCard>
                    </div>

                    {/* Pricing Intelligence Widget */}
                    <div className="space-y-6">
                      <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                        Pricing Intelligence Center
                      </div>

                      <GlowCard glowColor="rgba(6,182,212,0.15)" className="p-5 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-1">Live Price Prediction</span>
                          <h3 className="text-sm font-black text-white">Interactive Booking Curve</h3>
                          <p className="text-[10.5px] text-gray-400 leading-relaxed mt-1 mb-6">
                            AI analyzes seasonal demand patterns to forecast booking spikes leading to your travel date:
                          </p>
                        </div>

                        {/* Neon Area Chart */}
                        <div className="relative w-full h-[180px] bg-black/20 border border-white/[0.05] rounded-xl p-3 flex flex-col justify-between mb-4">
                          {/* SVG Curve */}
                          <svg viewBox="0 0 100 50" preserveAspectRatio="none" className="absolute inset-0 w-full h-full p-2">
                            <defs>
                              <linearGradient id="cyan-gradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(6,182,212,0.4)" />
                                <stop offset="100%" stopColor="rgba(6,182,212,0.0)" />
                              </linearGradient>
                            </defs>
                            {/* Grid Lines */}
                            <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                            <line x1="0" y1="25" x2="100" y2="25" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                            <line x1="0" y1="40" x2="100" y2="40" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

                            {/* Area Fill */}
                            <path d="M 0 45 L 12.5 44 L 25 42 L 37.5 40 L 50 36 L 62.5 30 L 75 22 L 87.5 12 L 100 6 L 100 50 L 0 50 Z" fill="url(#cyan-gradient)" />
                            {/* Glowing Line */}
                            <path d="M 0 45 L 12.5 44 L 25 42 L 37.5 40 L 50 36 L 62.5 30 L 75 22 L 87.5 12 L 100 6" fill="none" stroke="rgba(6,182,212,1)" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>

                          {/* Chart overlay details */}
                          <div className="flex justify-between text-[8px] text-gray-500 font-bold uppercase relative z-10">
                            <span>₹{(detailedFlights[0]?.price * 0.8).toFixed(0)}</span>
                            <span>₹{(detailedFlights[0]?.price * 3.5).toFixed(0)}</span>
                          </div>

                          <div className="flex justify-between text-[8.5px] text-gray-400 font-bold uppercase tracking-wider relative z-10 pt-28">
                            <span>Day -60</span>
                            <span>Day -30</span>
                            <span>Day -7</span>
                            <span className="text-cyan-400 animate-pulse font-black">Departure</span>
                          </div>
                        </div>

                        {/* Recommendation block */}
                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-xl p-3 text-[11px] leading-relaxed text-cyan-300">
                          💡 <strong>AI Forecast:</strong> Booking right now (approx. 30-45 days before departure) saves an average of <strong>22%</strong> compared to booking within 7 days. Rates will spike in {new Date(new Date(trip.startDate).getTime() - 14 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.
                        </div>
                      </GlowCard>

                      {/* Additional Pricing Insights */}
                      <GlowCard glowColor="rgba(168,85,247,0.1)" className="p-5 space-y-4">
                        <span className="text-[10px] font-bold text-purple-400 uppercase tracking-widest block pl-0.5">Custom Price Hacks</span>
                        
                        {/* Secondary Airport */}
                        <div className="flex items-start gap-3">
                          <span className="text-purple-400 text-sm mt-0.5">✈️</span>
                          <div>
                            <h4 className="text-xs font-black text-white">Alternate Departure Savings</h4>
                            <p className="text-[10.5px] text-gray-400 leading-normal mt-0.5">
                              Flying into nearby secondary hubs saves up to 30% on accommodation and direct connection markups.
                            </p>
                          </div>
                        </div>

                        {/* Peak Avoidance */}
                        <div className="flex items-start gap-3">
                          <span className="text-purple-400 text-sm mt-0.5">📅</span>
                          <div>
                            <h4 className="text-xs font-black text-white">Mid-Week Departure Discount</h4>
                            <p className="text-[10.5px] text-gray-400 leading-normal mt-0.5">
                              Adjusting departure date to Tuesday/Wednesday cuts average tickets by ₹4,200 INR per traveler.
                            </p>
                          </div>
                        </div>
                      </GlowCard>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}

        {/* HOTELS TAB */}
        {activeTab === "hotels" && (
          <GlowCard glowColor="rgba(6,182,212,0.1)" className="p-6">
            <div className="pb-5 border-b border-white/[0.06] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">Hotel Directory</h2>
                <p className="text-sm text-gray-400 mt-1">Curated stays matching your {trip.travelStyle} travel style</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">Sort By</span>
                <select 
                  className="form-select text-sm rounded-lg border-white/10 bg-white/[0.04] text-white font-medium cursor-pointer focus:ring-blue-500 focus:border-blue-500 px-3 py-1.5"
                  value={hotelSort}
                  onChange={(e) => setHotelSort(e.target.value as any)}
                >
                  <option value="rating_desc">Highest Rating</option>
                  <option value="price_asc">Lowest Price</option>
                </select>
              </div>
            </div>
            <div>
              {analysis?.hotels && analysis.hotels.length > 0 ? (
                <div className="space-y-4">
                  {[...analysis.hotels].sort((a, b) => {
                    if (hotelSort === "price_asc") return a.pricePerNight - b.pricePerNight;
                    return parseFloat(b.rating) - parseFloat(a.rating);
                  }).map((hotel, idx) => {
                    const isExpanded = expandedHotels.includes(idx);
                    return (
                      <div key={idx} className="border border-white/[0.05] rounded-xl bg-[#0c0c12]/80 overflow-hidden hover:border-white/10 transition-colors shadow-sm">
                        <button 
                          onClick={() => toggleHotel(idx)}
                          className="w-full text-left p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-white/[0.02] transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2.5 mb-1.5">
                              <h4 className="text-[16px] font-bold text-white">{hotel.name}</h4>
                              <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm">
                                <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                {hotel.rating}
                              </span>
                              {hotel.type && (
                                <span className="bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full">
                                  {hotel.type}
                                </span>
                              )}
                            </div>
                            <p className="text-[13px] text-gray-400 font-medium mb-2">{hotel.description}</p>
                            
                            <div className="flex items-center gap-3 text-[12px] text-gray-500">
                              {hotel.distanceToCenter && (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.242-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                  {hotel.distanceToCenter} from center
                                </span>
                              )}
                              <span className="text-white/10">•</span>
                              <span className="text-emerald-400 font-semibold truncate max-w-[200px]">{hotel.suitability}</span>
                            </div>
                          </div>
                          
                          <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 border-white/[0.04] pt-3 sm:pt-0 mt-2 sm:mt-0">
                            <div className="text-left sm:text-right">
                              <span className="text-[10px] text-gray-400 block uppercase font-bold tracking-wide">Est. Price</span>
                              <div className="text-lg font-black text-blue-400 leading-none mt-0.5">₹{hotel.pricePerNight.toLocaleString()} <span className="text-[12px] text-gray-400 font-medium">/ night</span></div>
                            </div>
                            <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </button>
                        
                        {/* Expanded Hotel Details */}
                        {isExpanded && (
                          <div className="bg-white/[0.01] p-5 border-t border-white/[0.04] flex flex-col md:flex-row gap-6">
                            {/* Real Hotel Photo via WikipediaImage */}
                            <div className="w-full md:w-1/3 aspect-video relative rounded-xl overflow-hidden shadow-sm bg-[#0c0c12] flex-shrink-0">
                              <WikipediaImage place={`${hotel.name} ${trip.destination} hotel exterior`} className="absolute inset-0 w-full h-full object-cover" />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                  <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Why Book This?</h5>
                                  <p className="text-[13px] text-gray-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.06] shadow-sm">{hotel.suitability}</p>
                                </div>
                                {(hotel.amenities || hotel.benefits) && (
                                  <div>
                                    <h5 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Key Benefits</h5>
                                    <div className="flex flex-wrap gap-2">
                                      {(hotel.benefits || hotel.amenities)?.map((amenity, aIdx) => (
                                        <span key={aIdx} className="bg-white/[0.02] border border-white/[0.06] text-gray-300 text-[12px] font-medium px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                                          <span className="text-blue-400">✓</span> {amenity}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* ═══ EXTENDED HOTEL INTELLIGENCE ═══ */}
                              {(hotel.priceCategory || hotel.neighborhoodVibe || hotel.checkInTime || hotel.cancellationPolicy || hotel.sustainability || hotel.loyaltyProgram) && (
                                <div className="mt-5 pt-5 border-t border-white/[0.06]">
                                  <h5 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                    <span className="text-[13px]">🏷️</span> Hotel Intelligence
                                  </h5>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                                    {hotel.priceCategory && (
                                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">Tier</span>
                                        <span className="text-[12px] font-bold text-white">{hotel.priceCategory}</span>
                                      </div>
                                    )}
                                    {hotel.neighborhoodVibe && (
                                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">Neighborhood</span>
                                        <span className="text-[12px] font-bold text-purple-300">{hotel.neighborhoodVibe}</span>
                                      </div>
                                    )}
                                    {hotel.checkInTime && (
                                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">Check-In</span>
                                        <span className="text-[12px] font-bold text-cyan-300">{hotel.checkInTime}</span>
                                      </div>
                                    )}
                                    {hotel.cancellationPolicy && (
                                      <div className="bg-white/[0.02] border border-white/[0.06] rounded-lg p-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-500 block mb-1">Cancellation</span>
                                        <span className="text-[12px] font-bold text-emerald-300">{hotel.cancellationPolicy}</span>
                                      </div>
                                    )}
                                    {hotel.sustainability && (
                                      <div className="bg-emerald-950/10 border border-emerald-500/15 rounded-lg p-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 block mb-1">🌿 Sustainability</span>
                                        <span className="text-[12px] font-bold text-emerald-300">{hotel.sustainability}</span>
                                      </div>
                                    )}
                                    {hotel.loyaltyProgram && (
                                      <div className="bg-amber-950/10 border border-amber-500/15 rounded-lg p-3">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-500 block mb-1">Loyalty</span>
                                        <span className="text-[12px] font-bold text-amber-300">{hotel.loyaltyProgram}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              <div className="mt-5 flex justify-end">
                                <a 
                                  href={`https://www.google.com/search?q=${encodeURIComponent(hotel.name + " " + trip.destination)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <MagneticButton variant="secondary" size="sm">
                                    View on {hotel.bookingPlatform || "Booking.com"} 
                                    <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" className="ml-1"><path d="M5 1v14M1 5h14M1 9h14M1 13h14" /></svg>
                                  </MagneticButton>
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-white/[0.02] rounded-full flex items-center justify-center mx-auto mb-4 text-gray-500">
                    <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 21h18M3 10h18M5 6l7-3 7 3M4 10v11m16-11v11M8 14v7m8-7v7" /></svg>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-1">No Hotels Found</h3>
                  <p className="text-sm text-gray-400">We couldn't generate hotel recommendations for this trip.</p>
                </div>
              )}
            </div>
          </GlowCard>
        )}

        {/* VISA TAB */}
        {activeTab === "visa" && (
          <GlowCard glowColor={visaInfo.required ? "rgba(244,63,94,0.1)" : "rgba(16,185,129,0.1)"} className="overflow-hidden">
            <div className={`px-6 py-8 border-b ${
              visaInfo.required 
                ? "bg-rose-950/10 border-rose-500/20 text-rose-400" 
                : "bg-emerald-950/10 border-emerald-500/20 text-emerald-400"
            }`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white">Visa & Entry Guide</h2>
                  <p className="text-sm text-gray-400 mt-1">Official requirements for Indian Passport Holders traveling to {trip.destination}</p>
                </div>
                <div>
                  <span className={`px-4 py-1.5 text-xs font-black rounded-full uppercase tracking-widest shadow-[0_0_12px_rgba(0,0,0,0.5)] ${
                    visaInfo.required ? "bg-rose-600 text-white" : "bg-emerald-600 text-white"
                  }`}>
                    {visaInfo.required ? "Visa Required" : "Visa Free Entry"}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              {/* Premium Stat Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-400 flex items-center justify-center text-[11px]">🛂</span>
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Visa Type</span>
                  </div>
                  <div className="text-lg font-black text-white capitalize">{visaInfo.type.replace("-", " ")}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-[11px]">💸</span>
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Est. Cost</span>
                  </div>
                  <div className="text-lg font-black text-white">{visaInfo.costINR === 0 ? "Free" : `₹${visaInfo.costINR.toLocaleString()}`}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center text-[11px]">⏱️</span>
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Processing</span>
                  </div>
                  <div className="text-lg font-black text-white">{visaInfo.processingDays}</div>
                </div>
                <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center text-[11px]">📅</span>
                    <span className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">Max Stay</span>
                  </div>
                  <div className="text-lg font-black text-white">{visaInfo.maxStay}</div>
                </div>
              </div>

              {/* Action Banner */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8 items-start sm:items-center justify-between p-5 bg-gradient-to-r from-blue-950/10 to-indigo-950/10 border border-blue-500/15 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 border border-blue-500/20">
                    <span className="text-blue-400 font-bold text-sm">i</span>
                  </div>
                  <p className="text-sm font-medium text-gray-300 leading-relaxed max-w-2xl">{visaInfo.notes}</p>
                </div>
                {visaInfo.applyUrl && (
                  <a href={visaInfo.applyUrl} target="_blank" rel="noreferrer" className="flex-shrink-0">
                    <MagneticButton variant="primary" size="sm">
                      Official Portal
                      <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="ml-1.5"><path d="M5 11L11 5M11 5H6M11 5V10" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </MagneticButton>
                  </a>
                )}
              </div>

              {/* Documents & Tips Checklist */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/[0.05]">
                  <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-[12px] border border-indigo-500/20">📄</div>
                    Required Documents Checklist
                  </h4>
                  <div className="space-y-3">
                    {visaInfo.documents.map((doc, idx) => (
                      <label key={idx} className="flex items-start gap-3 p-3 bg-white/[0.01] border border-white/[0.06] rounded-xl cursor-pointer hover:border-blue-500/30 hover:bg-white/[0.03] transition-all shadow-sm">
                        <input type="checkbox" className="mt-1 w-4 h-4 text-blue-500 bg-white/[0.05] border-white/10 rounded focus:ring-blue-500/30" />
                        <span className="text-[13px] font-medium text-gray-300 leading-snug select-none">{doc}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-white/[0.01] p-6 rounded-2xl border border-white/[0.05]">
                  <h4 className="text-sm font-black text-white mb-4 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-[12px] border border-amber-500/20">💡</div>
                    Expert Insider Tips
                  </h4>
                  <div className="space-y-3">
                    {visaInfo.tips.map((tip, idx) => {
                      const parts = tip.split(" — ");
                      const title = parts[0];
                      const desc = parts.slice(1).join(" — ");
                      return (
                        <div key={idx} className="flex items-start gap-3 p-3 bg-white/[0.01] border border-white/[0.06] rounded-xl shadow-sm">
                          <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8l3 3 7-7" /></svg>
                          </div>
                          <div>
                            <span className="text-[13px] font-bold text-white block mb-0.5">{title}</span>
                            {desc && <span className="text-[12px] font-medium text-gray-400 leading-relaxed block">{desc}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </GlowCard>
        )}

        {/* FOREX TAB */}
        {activeTab === "forex" && (
          <GlowCard glowColor="rgba(6,182,212,0.1)" className="overflow-hidden">
            <div className="px-6 py-6 border-b border-white/[0.06] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tight">Forex Optimizer</h2>
                <p className="text-sm text-gray-400 mt-1">Live exchange comparisons for INR → {toCurrency}</p>
              </div>
            </div>
            
            <div className="p-6">
              {analysis?.forexAdvice && (
                <div className="mb-6 p-4 bg-amber-500/5 border border-amber-500/15 rounded-2xl flex items-start gap-3 shadow-sm text-amber-300">
                  <span className="text-xl">💡</span>
                  <p className="text-sm font-medium leading-relaxed">{analysis.forexAdvice}</p>
                </div>
              )}
              
              <div className="space-y-4">
                {forexRates.map((fx, idx) => (
                  <div
                    key={fx.provider}
                    className={`relative overflow-hidden border rounded-2xl transition-all ${
                      fx.recommended 
                        ? "border-emerald-500/30 bg-gradient-to-r from-emerald-950/10 to-[#0c0c12]/80 shadow-[0_0_20px_rgba(16,185,129,0.08)]" 
                        : "border-white/[0.05] bg-[#0c0c12]/80 hover:border-white/10 hover:shadow-sm"
                    }`}
                  >
                    {fx.recommended && (
                      <div className="absolute top-0 right-0 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-lg shadow-[0_0_10px_rgba(16,185,129,0.4)]">
                        Top Pick
                      </div>
                    )}
                    
                    <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black text-lg shadow-sm border ${
                          fx.recommended 
                            ? "bg-white/[0.02] text-emerald-400 border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]" 
                            : "bg-white/[0.01] text-gray-300 border-white/[0.05]"
                        }`}>
                          {fx.provider.charAt(0)}
                        </div>
                        <div>
                          <h4 className="text-base font-black text-white flex items-center gap-2">
                            {fx.provider}
                            {fx.markup === 0 && <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[9px] uppercase font-bold px-2 py-0.5 rounded">Zero Markup</span>}
                          </h4>
                          <div className="flex items-center gap-3 mt-1.5 text-[12px] font-medium text-gray-400">
                            <span className="flex items-center gap-1"><span className="text-gray-500">Rate:</span> {fx.rate.toFixed(2)}</span>
                            <span className="text-white/10">•</span>
                            <span className="flex items-center gap-1"><span className="text-gray-500">Markup:</span> {fx.markup}%</span>
                            <span className="text-white/10">•</span>
                            <span className="flex items-center gap-1"><span className="text-gray-500">Fee:</span> ₹{fx.fee}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right w-full sm:w-auto border-t sm:border-0 border-white/[0.04] pt-3 sm:pt-0 mt-2 sm:mt-0">
                        <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest block mb-0.5">Total Cost</span>
                        <div className="text-xl font-black text-white leading-none">₹{fx.totalCost.toLocaleString()}</div>
                        {fx.savings > 0 && (
                          <div className="text-[11px] font-bold text-emerald-400 flex items-center sm:justify-end gap-1 mt-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md inline-flex w-fit sm:w-auto">
                            <svg viewBox="0 0 16 16" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="3"><path d="M8 15V1M3 6l5-5 5 5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                            Save ₹{fx.savings.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlowCard>
        )}

        {/* CARDS TAB */}
        {activeTab === "cards" && (
          <GlowCard glowColor="rgba(168,85,247,0.1)" className="p-6">
            <div className="pb-4 border-b border-white/[0.06] mb-6">
              <div className="text-sm font-semibold">Credit Card Recommendations</div>
              <div className="text-xs text-gray-400 mt-0.5">Maximize rewards based on your spending pattern</div>
            </div>
            <div className="space-y-4">
              {cardRecs.map((card) => (
                <div
                  key={card.id}
                  className={`p-4 border rounded-2xl transition-all ${
                    card.recommended 
                      ? "border-purple-500/30 bg-purple-950/10 shadow-[0_0_20px_rgba(168,85,247,0.08)]" 
                      : "border-white/[0.05] hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <div className="text-[14px] font-bold text-white">{card.name}</div>
                      {card.recommended && <div className="text-[11px] text-purple-400 mt-0.5">Best for this trip</div>}
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-black text-emerald-400">₹{card.estimatedRewards}</div>
                      <div className="text-[10px] text-gray-500">Est. rewards</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {card.perks.slice(0, 3).map((perk) => (
                      <span key={perk} className={`badge ${card.recommended ? "badge-purple" : "badge-gray"}`}>
                        {perk}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        )}

        {/* EXPENSES TAB */}
        {activeTab === "expenses" && (
          <GlowCard glowColor="rgba(59,130,246,0.1)" className="p-6">
            <div className="pb-4 border-b border-white/[0.06] flex justify-between items-center mb-6">
              <span className="text-sm font-semibold">Expenses</span>
              <MagneticButton variant="primary" size="sm" onClick={() => setShowAddExpense(true)}>
                <svg viewBox="0 0 12 12" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" className="mr-1"><line x1="6" y1="1" x2="6" y2="11" /><line x1="1" y1="6" x2="11" y2="6" /></svg>
                Add Expense
              </MagneticButton>
            </div>
            <div className="space-y-4">
              {!trip.expenses?.length && (
                <div className="text-center py-12 text-gray-500 text-sm">No expenses logged yet</div>
              )}
              {trip.expenses?.map((exp) => (
                <div key={exp.id} className="py-4 border-b border-white/[0.05] last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[13px] font-bold text-white">{exp.name}</div>
                      <div className="text-xs text-gray-400 mt-1 mb-2">
                        Paid by {exp.paidBy} · {new Date(exp.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-black text-white">₹{exp.amount.toLocaleString()}</div>
                      <div className="text-[11px] text-gray-500 mt-1">
                        ₹{(exp.amount / (exp.splitWith.length || 1)).toFixed(2)} per person
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    <span className="badge badge-blue">{exp.category}</span>
                    <span className="badge badge-gray">Split: {exp.splitWith.join(", ")}</span>
                  </div>
                </div>
              ))}
            </div>
          </GlowCard>
        )}
      </div>

      {showAddExpense && (
        <AddExpenseModal
          tripId={trip.id}
          onClose={() => setShowAddExpense(false)}
          onAdded={() => { setShowAddExpense(false); window.location.reload(); }}
        />
      )}

      {/* ═══ FLOATING AI TRAVEL CONCIERGE CHATBOT ═══ */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Chat window panel */}
        {chatOpen && (
          <GlowCard 
            glowColor="rgba(6,182,212,0.15)" 
            className="w-[340px] sm:w-[380px] h-[480px] mb-4 flex flex-col overflow-hidden border border-cyan-500/20 bg-black/90 shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-float"
          >
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-cyan-950/20 via-black to-blue-950/20 border-b border-white/[0.06] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
                <div>
                  <span className="text-[12px] font-black uppercase tracking-widest text-cyan-300">AI Concierge</span>
                  <p className="text-[10px] text-gray-400 font-medium">Equipped with {trip.destination} intelligence</p>
                </div>
              </div>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-bold w-6 h-6 rounded-full bg-white/[0.03] flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Message list area */}
            {(() => {
              const userMessageCount = chatMessages.filter(m => m.sender === "user").length;
              return (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin">
                    {chatMessages.map((m, idx) => (
                      <div key={idx} className={`flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12.5px] leading-relaxed shadow-sm ${
                          m.sender === "user" 
                            ? "bg-blue-600 text-white rounded-tr-none font-medium" 
                            : "bg-white/[0.03] border border-white/[0.06] text-gray-250 rounded-tl-none font-medium"
                        }`}>
                          {m.text}
                        </div>
                      </div>
                    ))}
                    {chatLoading && (
                      <div className="flex justify-start">
                        <div className="bg-white/[0.02] border border-white/[0.04] rounded-2xl rounded-tl-none px-4 py-3 text-xs text-cyan-300/80 flex items-center gap-2 font-semibold">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></div>
                          <span>CFO Concierge is thinking...</span>
                        </div>
                      </div>
                    )}
                    
                    {userMessageCount >= 3 && (
                      <div className="bg-gradient-to-br from-amber-500/10 to-yellow-600/5 border border-amber-500/30 rounded-2xl p-4 text-center space-y-3 mt-4 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                        <div className="text-2xl animate-bounce">👑</div>
                        <div className="text-xs font-black uppercase tracking-widest text-amber-400">TRAVIQ Premium Required</div>
                        <p className="text-[11px] text-gray-300 leading-relaxed">
                          Aapne apni **3 free prompts** use kar li hain. Upgrade to **TRAVIQ Premium** for unlimited high-fidelity intelligence, dynamic flight bookings, and live Forex rates!
                        </p>
                        <button 
                          type="button"
                          onClick={() => alert("TRAVIQ Premium Upgrade: Redirecting to secure payment gateway...")}
                          className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-black text-xs rounded-xl shadow-lg shadow-amber-500/20 transition-all active:scale-95 cursor-pointer"
                        >
                          Upgrade for ₹299/month
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Chat Input form */}
                  <form onSubmit={handleSendChatMessage} className="p-3 border-t border-white/[0.06] bg-black/60 flex items-center gap-2">
                    <input 
                      type="text"
                      disabled={chatLoading || userMessageCount >= 3}
                      placeholder={userMessageCount >= 3 ? "🔒 Limit reached. Upgrade to premium!" : "Ask me transit lines, hotels, rainy-day plans..."}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      className="flex-1 text-[12.5px] rounded-xl border-white/10 bg-white/[0.03] text-white placeholder-gray-500 focus:ring-cyan-500 focus:border-cyan-500 py-2 px-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button 
                      type="submit"
                      disabled={chatLoading || !chatInput.trim() || userMessageCount >= 3}
                      className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-white/[0.02] disabled:text-gray-500 text-white font-bold text-[12.5px] px-3.5 py-2 rounded-xl transition-all shadow-md flex items-center justify-center flex-shrink-0"
                    >
                      Send
                    </button>
                  </form>
                </>
              );
            })()}
          </GlowCard>
        )}

        {/* Floating Bubble Button */}
        <button 
          onClick={() => setChatOpen(!chatOpen)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] border border-cyan-400/20 hover:scale-105 transition-transform group relative"
        >
          <span className="text-xl">🤖</span>
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#020204] animate-pulse"></span>
        </button>
      </div>

    </div>
  );
}
