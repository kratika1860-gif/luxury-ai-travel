// src/app/api/trips/[id]/chat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAITravelChatResponse } from "@/lib/ai";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tripId = params.id;
  const { message, history } = await req.json().catch(() => ({}));

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id }
  });

  if (!trip) {
    return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  }

  try {
    const reply = await getAITravelChatResponse({
      destination: trip.destination,
      travelStyle: trip.travelStyle,
      budget: trip.budget,
      message,
      history,
      aiAnalysis: trip.aiAnalysis ? JSON.stringify(trip.aiAnalysis) : undefined
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat route error:", error);
    return NextResponse.json({ error: "Failed to generate chat response" }, { status: 500 });
  }
}
