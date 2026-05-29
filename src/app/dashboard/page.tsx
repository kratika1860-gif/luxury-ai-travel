// src/app/dashboard/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import TripCard from "@/components/TripCard";
import type { Trip } from "@/types";
import { GlowCard } from "@/components/ui/GlowCard";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { MagneticButton } from "@/components/ui/MagneticButton";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const dbTrips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const trips: Trip[] = dbTrips.map((t) => ({
    ...t,
    startDate: t.startDate.toISOString(),
    endDate: t.endDate.toISOString(),
    createdAt: t.createdAt.toISOString(),
    predictedCost: t.predictedCost ?? undefined,
    overspendRisk: t.overspendRisk ?? undefined,
    aiAnalysis: t.aiAnalysis as unknown as Trip["aiAnalysis"],
    travelStyle: t.travelStyle as Trip["travelStyle"],
    status: t.status as Trip["status"],
  }));

  const activeTrips = trips.filter((t) => t.status !== "completed");
  const completedTrips = trips.filter((t) => t.status === "completed");
  const totalSaved = trips.reduce((sum, t) => {
    if (t.predictedCost && t.predictedCost < t.budget) {
      return sum + (t.budget - t.predictedCost);
    }
    return sum;
  }, 0);

  return (
    <div className="min-h-screen flex flex-col relative z-10 text-white select-none">
      {/* Nav */}
      <nav className="h-20 glass-nav flex items-center px-8 md:px-12 justify-between">
        <div className="flex items-center gap-2 font-bold text-[18px] tracking-widest text-white group cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-xs font-black shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            T
          </div>
          <span className="bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            TRAVIQ <span className="text-blue-500">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-white/[0.04] border border-white/10 px-4 py-1.5 rounded-full text-white font-medium text-xs backdrop-blur-md">
            {session.user.name?.split(" ")[0]}
          </div>
        </div>
      </nav>

      <div className="flex-1 px-8 md:px-12 py-12 max-w-[1200px] w-full mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2 text-white">Your Journeys</h1>
            <p className="text-[14px] text-gray-400 font-medium">Plan smarter, spend less, travel better.</p>
          </div>
          <Link href="/new-trip">
            <MagneticButton variant="primary">
              <svg viewBox="0 0 16 16" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" className="mr-1">
                <line x1="8" y1="2" x2="8" y2="14" /><line x1="2" y1="8" x2="14" y2="8" />
              </svg>
              New Trip
            </MagneticButton>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <GlowCard glowColor="rgba(59,130,246,0.15)" className="p-6 flex flex-col justify-between min-h-[120px]">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Active Trips</div>
            <div className="text-4xl font-black tracking-tight text-white mt-2">
              <AnimatedCounter value={activeTrips.length} format="number" />
            </div>
          </GlowCard>
          
          <GlowCard glowColor="rgba(16,185,129,0.25)" className="p-6 flex flex-col justify-between min-h-[120px] bg-gradient-to-br from-emerald-950/20 to-teal-950/10 border-emerald-500/20">
            <div className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">Total AI Savings</div>
            <div className="text-4xl font-black tracking-tight text-emerald-400 mt-2">
              <AnimatedCounter value={totalSaved} format="currency" />
            </div>
          </GlowCard>
          
          <GlowCard glowColor="rgba(168,85,247,0.15)" className="p-6 flex flex-col justify-between min-h-[120px]">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Completed Trips</div>
            <div className="text-4xl font-black tracking-tight text-white mt-2">
              <AnimatedCounter value={completedTrips.length} format="number" />
            </div>
          </GlowCard>
        </div>

        {/* Active trips */}
        {activeTrips.length > 0 && (
          <div className="mb-16">
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6 pl-1">
              Upcoming & Active
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </div>
          </div>
        )}

        {/* Completed trips */}
        {completedTrips.length > 0 && (
          <div>
            <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-6 pl-1">
              Past Trips
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} dimmed />
              ))}
            </div>
          </div>
        )}

        {trips.length === 0 && (
          <GlowCard glowColor="rgba(59,130,246,0.1)" className="text-center py-20 bg-white/[0.01] border-dashed border-white/10">
            <div className="text-4xl mb-4 opacity-70">✈️</div>
            <div className="font-black text-white mb-2 text-xl">No journeys yet</div>
            <div className="mb-6 text-gray-400 text-[14px]">Create your first trip to get AI-powered budget insights</div>
            <Link href="/new-trip">
              <MagneticButton variant="primary">
                Plan Your First Trip
              </MagneticButton>
            </Link>
          </GlowCard>
        )}
      </div>
    </div>
  );
}

