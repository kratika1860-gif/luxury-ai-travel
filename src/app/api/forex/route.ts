// src/app/api/forex/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getForexComparison, getCurrencyForDestination } from "@/lib/forex";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination") ?? "";
  const amount = Number(searchParams.get("amount") ?? "1000");

  const toCurrency = getCurrencyForDestination(destination);
  const rates = await getForexComparison(amount, toCurrency);

  return NextResponse.json({ toCurrency, rates });
}
