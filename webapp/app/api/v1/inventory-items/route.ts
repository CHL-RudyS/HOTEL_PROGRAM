import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

// PRD Module 10 (Inventory & Procurement) — stub surface, no dedicated screen yet.
export async function GET() {
  const { session, error } = await requireApiSession();
  if (error) return error;
  const items = await prisma.inventoryItem.findMany({ where: { propertyId: session!.user.homePropertyId } });
  return NextResponse.json({ data: items });
}
