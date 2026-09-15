import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

// PRD Module 9 (MICE / Banquet & Event) — stub surface, no dedicated screen yet.
export async function GET() {
  const { session, error } = await requireApiSession();
  if (error) return error;
  const spaces = await prisma.eventSpace.findMany({ where: { propertyId: session!.user.homePropertyId }, include: { bookings: true } });
  return NextResponse.json({ data: spaces });
}
