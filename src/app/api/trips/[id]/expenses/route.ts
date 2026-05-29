// src/app/api/trips/[id]/expenses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const ExpenseSchema = z.object({
  name: z.string().min(1),
  amount: z.number().positive(),
  category: z.enum(["transportation", "accommodation", "food", "activities", "misc"]),
  paidBy: z.string().min(1),
  splitWith: z.array(z.string()),
  date: z.string(),
});

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Verify ownership
  const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const expenses = await prisma.expense.findMany({
    where: { tripId: params.id },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trip = await prisma.trip.findFirst({ where: { id: params.id, userId: session.user.id } });
  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => null);
  const parsed = ExpenseSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.message }, { status: 400 });

  const expense = await prisma.expense.create({
    data: {
      tripId: params.id,
      ...parsed.data,
      date: new Date(parsed.data.date),
    },
  });
  return NextResponse.json(expense, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { expenseId } = await req.json().catch(() => ({}));
  if (!expenseId) return NextResponse.json({ error: "expenseId required" }, { status: 400 });

  await prisma.expense.deleteMany({
    where: { id: expenseId, trip: { userId: session.user.id } },
  });
  return NextResponse.json({ ok: true });
}
