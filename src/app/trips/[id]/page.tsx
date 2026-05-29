// src/app/trips/[id]/page.tsx
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import TripDetailClient from "@/components/TripDetailClient";
import { getForexComparison, getCurrencyForDestination } from "@/lib/forex";
import { getFlightPriceTrends } from "@/lib/flights";
import { getCardRecommendations, CREDIT_CARDS } from "@/lib/cards";
import { getVisaInfo } from "@/lib/visa";
import type { Trip, AIAnalysis, Expense } from "@/types";

interface PageProps {
  params: { id: string };
}

export default async function TripDetailPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin");

  const dbTrip = await prisma.trip.findUnique({
    where: { id: params.id, userId: session.user.id },
    include: { expenses: true },
  });
  if (!dbTrip) notFound();

  const trip: Trip = {
    ...dbTrip,
    startDate: dbTrip.startDate.toISOString(),
    endDate: dbTrip.endDate.toISOString(),
    createdAt: dbTrip.createdAt.toISOString(),
    predictedCost: dbTrip.predictedCost ?? undefined,
    overspendRisk: dbTrip.overspendRisk ?? undefined,
    aiAnalysis: dbTrip.aiAnalysis as unknown as AIAnalysis | undefined,
    travelStyle: dbTrip.travelStyle as Trip["travelStyle"],
    status: dbTrip.status as Trip["status"],
    expenses: dbTrip.expenses.map((e) => ({
      ...e,
      date: e.date.toISOString(),
      splitWith: e.splitWith as string[],
      category: e.category as Expense["category"],
    })),
  };

  // Fetch live data in parallel
  const toCurrency = getCurrencyForDestination(dbTrip.destination);
  const destinationAirport = (() => {
    const destLower = dbTrip.destination.toLowerCase();
    if (destLower.includes("tokyo") || destLower.includes("japan") || destLower.includes("nrt") || destLower.includes("hnd")) return "NRT";
    if (destLower.includes("paris") || destLower.includes("france") || destLower.includes("cdg")) return "CDG";
    if (destLower.includes("london") || destLower.includes("uk") || destLower.includes("lhr")) return "LHR";
    if (destLower.includes("singapore") || destLower.includes("sin")) return "SIN";
    if (destLower.includes("bangkok") || destLower.includes("thailand") || destLower.includes("bkk")) return "BKK";
    if (destLower.includes("dubai") || destLower.includes("uae") || destLower.includes("dxb")) return "DXB";
    if (destLower.includes("sydney") || destLower.includes("australia") || destLower.includes("syd")) return "SYD";
    if (destLower.includes("new york") || destLower.includes("usa") || destLower.includes("jfk")) return "JFK";
    if (destLower.includes("rome") || destLower.includes("italy")) return "FCO";
    if (destLower.includes("germany") || destLower.includes("berlin")) return "BER";
    return "DXB"; // default
  })();

  const [forexRates, flightTrends, cardRecs] = await Promise.allSettled([
    getForexComparison(dbTrip.budget, toCurrency),
    getFlightPriceTrends("DEL", destinationAirport, dbTrip.startDate.toISOString().split("T")[0]),
    (async () => {
      const userId = session.user!.id;
      const userCardIds = await prisma.userCreditCard
        .findMany({ where: { userId } })
        .then((cards) => cards.map((c) => c.cardId));

      const spend = trip.aiAnalysis?.costBreakdown ?? {
        flights: 0, accommodation: 0, food: 0, transportation: 0, activities: 0, hiddenFees: 0,
      };

      return getCardRecommendations(
        userCardIds.length > 0 ? userCardIds : CREDIT_CARDS.slice(0, 3).map((c) => c.id),
        { ...spend, misc: spend.hiddenFees },
        dbTrip.destination
      );
    })(),
  ]);

  const visaInfo = getVisaInfo(dbTrip.destination);

  return (
    <TripDetailClient
      trip={trip}
      toCurrency={toCurrency}
      forexRates={forexRates.status === "fulfilled" ? forexRates.value : []}
      flightTrends={flightTrends.status === "fulfilled" ? flightTrends.value : null}
      cardRecs={cardRecs.status === "fulfilled" ? cardRecs.value : []}
      visaInfo={visaInfo}
    />
  );
}
