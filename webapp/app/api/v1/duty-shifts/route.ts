import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

// PRD Module 11 (HR, Duty Roster & Payroll) — stub surface, no dedicated screen yet.
export async function GET() {
  const { session, error } = await requireApiSession();
  if (error) return error;
  const shifts = await prisma.dutyShift.findMany({ where: { employee: { propertyId: session!.user.homePropertyId } }, include: { employee: true } });
  return NextResponse.json({ data: shifts });
}
