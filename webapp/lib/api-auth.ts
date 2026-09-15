import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function requireApiSession() {
  const session = await getServerSession(authOptions);
  if (!session) return { session: null, error: NextResponse.json({ error: { code: "UNAUTHENTICATED", message: "Login required" } }, { status: 401 }) };
  return { session, error: null };
}
