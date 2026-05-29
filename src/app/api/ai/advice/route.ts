// src/app/api/ai/advice/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAIBudgetAdvice } from "@/lib/ai";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tripId } = await req.json().catch(() => ({}));
  if (!tripId) return NextResponse.json({ error: "tripId required" }, { status: 400 });

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    include: { expenses: true },
  });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const now = new Date();
  const endDate = new Date(trip.endDate);
  const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / 86400000));
  const currentSpend = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

  // Aggregate by category
  const catMap: Record<string, number> = {};
  for (const e of trip.expenses) {
    catMap[e.category] = (catMap[e.category] ?? 0) + e.amount;
  }
  const topCategories = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category, amount]) => ({ category, amount }));

  const advice = await getAIBudgetAdvice({
    destination: trip.destination,
    currentSpend,
    budget: trip.budget,
    daysLeft,
    topCategories,
  });

  return NextResponse.json({ advice });
}
