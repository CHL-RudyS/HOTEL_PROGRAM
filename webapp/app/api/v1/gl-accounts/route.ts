import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiSession } from "@/lib/api-auth";

// PRD Module 13 (Accounting) — stub surface, no dedicated screen yet.
export async function GET() {
  const { error } = await requireApiSession();
  if (error) return error;
  const accounts = await prisma.gLAccount.findMany();
  return NextResponse.json({ data: accounts });
}
