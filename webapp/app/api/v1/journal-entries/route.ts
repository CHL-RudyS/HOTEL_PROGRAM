import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

// PRD Module 13 (Accounting) — stub surface, no dedicated screen yet.
export async function GET() {
  const { session, error } = await requireApiSession();
  if (error) return error;
  const entries = await prisma.journalEntry.findMany({ where: { propertyId: session!.user.homePropertyId }, include: { lines: { include: { account: true } } } });
  return NextResponse.json({ data: entries });
}
