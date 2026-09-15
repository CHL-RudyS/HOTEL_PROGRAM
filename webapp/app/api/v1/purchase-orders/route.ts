import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

// PRD Module 10 (Inventory & Procurement) — stub surface, no dedicated screen yet.
export async function GET() {
  const { session, error } = await requireApiSession();
  if (error) return error;
  const orders = await prisma.purchaseOrder.findMany({ where: { propertyId: session!.user.homePropertyId }, include: { items: true } });
  return NextResponse.json({ data: orders });
}
