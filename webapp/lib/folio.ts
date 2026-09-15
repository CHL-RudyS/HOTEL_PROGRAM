import { prisma } from "@/lib/prisma";

const TYPE_LABEL: Record<string, string> = { A: "Tamu", B: "Perusahaan", C: "Grup" };

export async function getFolioContext(reservationId?: string) {
  const reservation = reservationId
    ? await prisma.reservation.findUnique({
        where: { id: reservationId },
        include: { guest: true, folios: { include: { transactions: { orderBy: { date: "asc" } } } } },
      })
    : await prisma.reservation.findFirst({
        where: { guest: { name: "Ratih Wulandari" } },
        include: { guest: true, folios: { include: { transactions: { orderBy: { date: "asc" } } } } },
      });

  if (!reservation) return null;

  return {
    reservationId: reservation.id,
    guestName: reservation.guest.name,
    folios: reservation.folios.map((f) => ({
      id: f.id,
      type: f.type,
      label: `Folio ${f.type} — ${TYPE_LABEL[f.type]}`,
      ownerLabel: f.ownerLabel,
      routingNote: f.routingNote,
      balance: f.transactions.reduce((a, t) => a + t.debit - t.credit, 0),
      rows: f.transactions.map((t) => ({
        id: t.id,
        date: t.date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" }),
        code: t.code,
        desc: t.description,
        debit: t.debit,
        credit: t.credit,
      })),
    })),
  };
}
