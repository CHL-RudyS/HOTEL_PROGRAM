import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

// PRD Module 9 (MICE / Banquet & Event) — stub surface, no dedicated screen yet.
export async function GET() {
  const { session, error } = await requireApiSession();
  if (error) return error;
  const bookings = await prisma.eventBooking.findMany({ where: { space: { propertyId: session!.user.homePropertyId } }, include: { space: true, corporateAccount: true } });
  return NextResponse.json({ data: bookings });
}
