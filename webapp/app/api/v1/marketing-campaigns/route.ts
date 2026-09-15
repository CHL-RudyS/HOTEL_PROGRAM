import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

// PRD Module 8 (CRM & Loyalty) — stub surface, no dedicated screen yet.
export async function GET() {
  const { error } = await requireApiSession();
  if (error) return error;
  const campaigns = await prisma.marketingCampaign.findMany();
  return NextResponse.json({ data: campaigns });
}
