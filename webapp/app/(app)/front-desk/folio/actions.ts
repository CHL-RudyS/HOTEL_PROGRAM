"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function postCharge(folioId: string, code: string, amount: number, reason: string) {
  const session = await requireSession();
  if (!reason.trim()) throw new Error("Alasan posting wajib diisi");
  if (amount <= 0) throw new Error("Jumlah harus lebih dari 0");
  if (!Number.isFinite(amount) || amount > 999_999_999) throw new Error("Jumlah maksimum per posting adalah Rp 999.999.999.");

  await prisma.folioTransaction.create({
    data: {
      folioId,
      date: startOfDay(new Date()),
      code: code.trim() || "MISC",
      description: reason.trim(),
      debit: Math.round(amount),
      credit: 0,
      postedById: session.user.id,
    },
  });
  await prisma.auditLog.create({
    data: { userId: session.user.id, entity: "Folio", entityId: folioId, action: "post_charge", newValue: { code, amount, reason } },
  });
  revalidatePath("/front-desk/folio");
}
