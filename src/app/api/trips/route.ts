// src/app/api/trips/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeTrip } from "@/lib/ai";
import { z } from "zod";

const CreateTripSchema = z.object({
  origin: z.string().min(2),
  destination: z.string().min(2),
  startDate: z.string(),
  endDate: z.string(),
  budget: z.number().positive(),
  travelers: z.number().int().min(1).default(1),
  travelStyle: z.enum(["budget", "moderate", "luxury"]).default("moderate"),
  creditCards: z.array(z.string()).default([]),
  visaRequired: z.boolean().default(true),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { expenses: { orderBy: { date: "desc" } } },
  });

  return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = CreateTripSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const { origin, destination, startDate, endDate, budget, travelers, travelStyle, creditCards, visaRequired } = parsed.data;

  // Run AI analysis
  let aiAnalysis = null;
  let predictedCost: number | null = null;
  let overspendRisk: number | null = null;

  try {
    aiAnalysis = await analyzeTrip({ origin, destination, startDate, endDate, budget, travelers, travelStyle, visaRequired });
    predictedCost = aiAnalysis.predictedCost;
    overspendRisk = aiAnalysis.overspendRisk;
  } catch (err) {
    console.error("AI analysis failed:", err);
  }

  // Ensure user exists in database (JWT auth doesn't create DB records)
  await prisma.user.upsert({
    where: { id: session.user.id },
    update: {},
    create: {
      id: session.user.id,
      email: session.user.email || "test@example.com",
      name: session.user.name || "Demo User",
      image: session.user.image || null,
    },
  });

  // Save trip
  const userId = session.user.id!;
  const trip = await prisma.trip.create({
    data: {
      userId,
      origin,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      budget,
      travelers,
      travelStyle,
      status: "planning",
      predictedCost,
      overspendRisk,
      aiAnalysis: aiAnalysis as any,
    },
  });

  // Save selected credit cards
  if (creditCards.length > 0) {
    await prisma.userCreditCard.deleteMany({ where: { userId } });
    await prisma.userCreditCard.createMany({
      data: creditCards.map((cardId) => ({ userId, cardId })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json(trip, { status: 201 });
}
