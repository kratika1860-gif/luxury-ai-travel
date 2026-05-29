// src/app/new-trip/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MagneticButton } from "@/components/ui/MagneticButton";
import { GlowCard } from "@/components/ui/GlowCard";

const CREDIT_CARDS = [
  { id: "hdfc-infinia", name: "HDFC Infinia" },
  { id: "axis-atlas", name: "Axis Bank Atlas" },
  { id: "sbi-elite", name: "SBI Card ELITE" },
  { id: "amex-plat-travel", name: "Amex Platinum Travel" },
  { id: "hdfc-regalia-gold", name: "HDFC Regalia Gold" },
  { id: "niyo-global", name: "Niyo Global Card" },
];

type TravelStyle = "budget" | "moderate" | "luxury";

export default function NewTripPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [budget, setBudget] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("moderate");
  const [selectedCards, setSelectedCards] = useState<string[]>(["hdfc-infinia"]);
  const [visaRequired, setVisaRequired] = useState(true);
  const [error, setError] = useState("");

  function toggleCard(id: string) {
    setSelectedCards((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  }

  const isDomestic =
    destination.toLowerCase().includes("goa") ||
    destination.toLowerCase().includes("kerala") ||
    destination.toLowerCase().includes("mumbai") ||
    destination.toLowerCase().includes("delhi") ||
    destination.toLowerCase().includes("india") ||
    destination.toLowerCase().includes("rajasthan") ||
    destination.toLowerCase().includes("srinagar") ||
    destination.toLowerCase().includes("kashmir") ||
    destination.toLowerCase().includes("manali") ||
    destination.toLowerCase().includes("shimla");

  async function handleSubmit() {
    if (!destination || !startDate || !endDate || !budget) {
      setError("Please fill in all required fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: origin || "New Delhi, India", // fallback if somehow missed
          destination,
          startDate,
          endDate,
          budget: Number(budget),
          travelers: Number(travelers),
          travelStyle,
          creditCards: selectedCards,
          visaRequired: isDomestic ? false : visaRequired,
        }),
      });
      const data = await res.json();
      if (data.id) router.push(`/trips/${data.id}`);
      else setError(data.error ?? "Something went wrong.");
    } catch {
      setError("Network error — please try again.");
    } finally {
      setLoading(false);
    }
  }

  const styleOptions: { value: TravelStyle; label: string; desc: string }[] = [
    { value: "budget", label: "Budget", desc: "Hostels, street food, public transport" },
    { value: "moderate", label: "Moderate", desc: "3-star hotels, local restaurants, occasional taxis" },
    { value: "luxury", label: "Luxury", desc: "5-star hotels, fine dining, private transport" },
  ];

  return (
    <div className="min-h-screen flex flex-col relative z-10 text-white select-none">
      {/* Nav */}
      <nav className="h-20 glass-nav flex items-center px-8 md:px-12">
        <div className="flex items-center gap-2 font-bold text-[18px] tracking-widest text-white group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            T
          </div>
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            TRAVIQ <span className="text-blue-500">AI</span>
          </span>
        </div>
      </nav>

      <div className="flex-1 px-8 py-12 max-w-[740px] w-full mx-auto">
        <h1 className="text-3xl font-black tracking-tight mb-2 text-white">Plan Your Trip</h1>
        <p className="text-[14px] text-gray-400 font-medium mb-10">
          Let our AI analyze costs, optimize your spending, and maximize rewards.
        </p>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-sm text-rose-400 font-medium flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            {error}
          </div>
        )}

        {/* Trip Details */}
        <GlowCard glowColor="rgba(59,130,246,0.15)" className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#3b82f6" strokeWidth="2">
                <circle cx="8" cy="7" r="3" /><path d="M8 1a6 6 0 010 12c-2 0-6-5-6-6a6 6 0 0112 0c0 1-4 6-6 6z" />
              </svg>
            </div>
            <span className="text-[15px] font-black text-white tracking-tight">Trip Details</span>
          </div>
          <div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Departure City (Origin) *</label>
              <input
                className="form-input"
                placeholder="e.g., New Delhi, India"
                value={origin}
                onChange={(e) => setOrigin(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Destination *</label>
              <input
                className="form-input"
                placeholder="e.g., Tokyo, Japan"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Start Date *</label>
                <input className="form-input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">End Date *</label>
                <input className="form-input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Budget (INR) *</label>
                <input className="form-input" type="number" placeholder="250000" value={budget} onChange={(e) => setBudget(e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Travelers</label>
                <input className="form-input" type="number" placeholder="1" min="1" value={travelers} onChange={(e) => setTravelers(e.target.value)} />
              </div>
            </div>

            {!isDomestic && destination.trim().length > 1 && (
              <div className="mt-6 pt-4 border-t border-white/[0.06] flex items-center justify-between">
                <div>
                  <div className="text-[13px] font-bold text-white">Need a Visa?</div>
                  <div className="text-[11px] text-gray-400 font-medium">Include estimated visa fees in predicted hidden costs</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={visaRequired}
                    onChange={(e) => setVisaRequired(e.target.checked)}
                    className="w-4 h-4 accent-blue-500 bg-white/[0.02] border-white/10 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                </label>
              </div>
            )}
          </div>
        </GlowCard>

        {/* Travel Style */}
        <GlowCard glowColor="rgba(6,182,212,0.15)" className="p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#22d3ee" strokeWidth="2">
                <path d="M8 1l2 5h5l-4 3 1.5 5L8 11l-4.5 3L5 9 1 6h5z" />
              </svg>
            </div>
            <span className="text-[15px] font-black text-white tracking-tight">Travel Style</span>
          </div>
          <div className="flex flex-col gap-3">
            {styleOptions.map((opt) => (
              <div
                key={opt.value}
                className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all duration-300 ${
                  travelStyle === opt.value
                    ? "border-blue-500 bg-blue-950/15 shadow-sm"
                    : "border-white/[0.05] bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10"
                }`}
                onClick={() => setTravelStyle(opt.value)}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 mt-0.5 flex-shrink-0 flex items-center justify-center transition-all ${
                    travelStyle === opt.value ? "border-blue-500 bg-blue-500" : "border-white/20"
                  }`}
                >
                  {travelStyle === opt.value && (
                    <div className="w-[6px] h-[6px] rounded-full bg-white" />
                  )}
                </div>
                <div>
                  <div className="text-[14px] font-bold text-white">{opt.label}</div>
                  <div className="text-[12px] text-gray-400 font-medium mt-0.5">{opt.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </GlowCard>

        {/* Credit Cards */}
        <GlowCard glowColor="rgba(168,85,247,0.15)" className="p-6 mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="#a855f7" strokeWidth="2">
                <rect x="1" y="4" width="14" height="9" rx="2" /><path d="M4 4V3a1 1 0 011-1h6a1 1 0 011 1v1" /><line x1="1" y1="8" x2="15" y2="8" />
              </svg>
            </div>
            <div>
              <div className="text-[15px] font-black text-white tracking-tight">Your Credit Cards</div>
              <div className="text-[11px] text-gray-400 font-medium">Select cards you own for personalized rewards</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 mt-5">
            {CREDIT_CARDS.map((card) => (
              <label
                key={card.id}
                className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all duration-300 ${
                  selectedCards.includes(card.id)
                    ? "border-purple-500/40 bg-purple-950/10"
                    : "border-white/[0.05] hover:bg-white/[0.04] hover:border-white/10"
                }`}
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-purple-500 rounded bg-white/[0.05] border-white/10 text-purple-600 focus:ring-purple-500/30"
                  checked={selectedCards.includes(card.id)}
                  onChange={() => toggleCard(card.id)}
                />
                <span className="text-[14px] font-medium text-gray-200">{card.name}</span>
              </label>
            ))}
          </div>
        </GlowCard>

        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard" className="w-full">
            <MagneticButton variant="outline" size="lg" className="w-full justify-center">
              Cancel
            </MagneticButton>
          </Link>
          <MagneticButton
            variant="primary"
            size="lg"
            className="w-full justify-center disabled:opacity-60"
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin text-white" viewBox="0 0 24 24" width="16" height="16" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 10" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75" />
                </svg>
                Analyzing with AI…
              </span>
            ) : "Analyze Trip →"}
          </MagneticButton>
        </div>
      </div>
    </div>
  );
}
