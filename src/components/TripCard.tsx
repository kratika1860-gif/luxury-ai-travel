// src/components/TripCard.tsx
import Link from "next/link";
import type { Trip } from "@/types";
import WikipediaImage from "./WikipediaImage";

interface Props {
  trip: Trip;
  dimmed?: boolean;
}

export default function TripCard({ trip, dimmed }: Props) {
  const over = (trip.predictedCost ?? 0) - trip.budget;
  const risk = trip.overspendRisk ?? 0;

  return (
    <Link
      href={`/trips/${trip.id}`}
      className={`group relative block h-64 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 bg-[#0d0d12]/90 border border-white/[0.04] hover:border-blue-500/40 shadow-soft hover:shadow-[0_0_30px_rgba(59,130,246,0.25)] hover:-translate-y-1.5 ${
        dimmed ? "opacity-60 grayscale-[40%]" : ""
      }`}
    >
      {/* Background Image */}
      <WikipediaImage place={`${trip.destination} landmark beautiful`} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
      
      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020204]/95 via-[#020204]/55 to-[#020204]/10 transition-opacity duration-300 group-hover:opacity-90"></div>
      
      {/* Content */}
      <div className="absolute inset-0 p-5 flex flex-col justify-between z-10">
        {/* Top Badge */}
        <div className="flex justify-end">
          <span
            className={`badge shadow-sm backdrop-blur-md border ${
              trip.status === "completed"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-blue-500/10 text-blue-400 border-blue-500/20"
            }`}
          >
            {trip.status}
          </span>
        </div>

        {/* Bottom Info */}
        <div className="space-y-3">
          <div>
            <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-blue-400 transition-colors duration-300">{trip.destination}</h3>
            {trip.origin && (
              <div className="text-[12px] text-blue-400 font-semibold mt-0.5 flex items-center gap-1.5">
                <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 8h12M10 4l4 4-4 4" /></svg>
                From {trip.origin}
              </div>
            )}
            <div className="text-[11px] text-gray-400 mt-1 font-medium flex items-center gap-1.5">
              <svg viewBox="0 0 14 14" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="2" width="12" height="11" rx="2" />
                <path d="M1 6h12M5 1v2M9 1v2" />
              </svg>
              {new Date(trip.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
              {new Date(trip.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </div>

          <div className="bg-[#0c0c12]/80 backdrop-blur-xl rounded-2xl p-3.5 border border-white/[0.05]">
            <div className="flex justify-between items-center text-[12px] text-gray-300 mb-1">
              <span className="font-semibold">Budget: ₹{trip.budget.toLocaleString()}</span>
              {trip.predictedCost !== undefined && (
                <span className={`font-black ${over > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                  Est: ₹{trip.predictedCost.toLocaleString()}
                </span>
              )}
            </div>
            
            {trip.overspendRisk !== undefined && (
              <div className="relative h-1.5 bg-white/[0.04] rounded-full mt-2 overflow-hidden border border-white/[0.02]">
                <div
                  className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(59,130,246,0.5)]"
                  style={{
                    width: `${risk}%`,
                    background:
                      risk > 60
                        ? "linear-gradient(90deg, #f59e0b, #e11d48)"
                        : "linear-gradient(90deg, #10b981, #3b82f6)",
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
