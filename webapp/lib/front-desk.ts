import { prisma } from "@/lib/prisma";
import { ReservationStatus } from "@prisma/client";
export { rp } from "@/lib/format";

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
export const TODAY = startOfDay(new Date());

export function deriveTag(r: { groupCode: string | null; vipTag: string | null; corporateAccountId: string | null; source: string }) {
  if (r.groupCode) return { label: "Grup", className: "tag tag-accent" };
  if (r.vipTag) return { label: "VIP", className: "tag tag-accent-2" };
  if (r.corporateAccountId || r.source.toLowerCase().startsWith("kontrak")) return { label: "Corporate", className: "tag tag-neutral" };
  if (r.source === "Direct web") return { label: "Direct", className: "tag tag-outline" };
  return { label: "OTA", className: "tag tag-neutral" };
}

export async function getFrontDeskData(propertyId: string) {
  const [arrivals, departingCount, checkedOutToday, inHouseRooms, saleableRooms, oooCount, metricToday, corpAccounts, discrepancyTask, unassignedArrivals] = await Promise.all([
    prisma.reservation.findMany({
      where: { propertyId, arrival: TODAY, status: ReservationStatus.CONFIRMED },
      include: { guest: true, rooms: { include: { roomType: true, room: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.reservation.count({ where: { propertyId, departure: TODAY } }),
    prisma.reservation.count({ where: { propertyId, departure: TODAY, status: ReservationStatus.CHECKED_OUT } }),
    prisma.room.count({ where: { propertyId, status: { in: ["OC", "OD"] } } }),
    prisma.room.groupBy({ by: ["status"], where: { propertyId, status: { in: ["VC", "VI"] } }, _count: true }),
    prisma.room.count({ where: { propertyId, status: "OOO" } }),
    prisma.dailyPropertyMetric.findFirst({ where: { propertyId, date: TODAY } }),
    prisma.corporateAccount.findMany({ include: { reservations: { where: { propertyId }, include: { folios: { include: { transactions: true } } } } } }),
    prisma.housekeepingTask.findFirst({ where: { priority: "Discrepancy", room: { propertyId } }, include: { room: true } }),
    prisma.reservation.count({ where: { propertyId, arrival: TODAY, status: ReservationStatus.CONFIRMED, rooms: { every: { roomId: null } } } }),
  ]);

  const vipArrivalCount = arrivals.filter((a) => a.vipTag).length;
  const inHouseArrivalCount = await prisma.reservation.count({ where: { propertyId, arrival: TODAY, status: ReservationStatus.IN_HOUSE } });

  const inHouseReservations = await prisma.reservation.findMany({ where: { propertyId, status: ReservationStatus.IN_HOUSE } });
  const guestCount = inHouseReservations.reduce((a, r) => a + r.adults + r.children, 0);

  const vc = saleableRooms.find((s) => s.status === "VC")?._count ?? 0;
  const vi = saleableRooms.find((s) => s.status === "VI")?._count ?? 0;

  const occupancyPct = metricToday ? (metricToday.roomsSold / metricToday.roomsAvailable) * 100 : 0;
  const adr = metricToday && metricToday.roomsSold > 0 ? Math.round(metricToday.roomRevenue / metricToday.roomsSold) : 0;
  const revpar = metricToday ? Math.round(metricToday.roomRevenue / metricToday.roomsAvailable) : 0;

  const alerts: { kind: string; text: string }[] = [];
  if (discrepancyTask) {
    alerts.push({ kind: "Discrepancy", text: `Kamar ${discrepancyTask.room.number} sistem VD, laporan fisik berbeda — perlu verifikasi HK` });
  }
  for (const corp of corpAccounts) {
    const balance = corp.reservations.flatMap((r) => r.folios).flatMap((f) => f.transactions).reduce((a, t) => a + t.debit - t.credit, 0);
    if (corp.creditLimit > 0 && balance / corp.creditLimit > 0.05) {
      const pct = Math.round((balance / corp.creditLimit) * 100);
      if (pct > 0) alerts.push({ kind: "Credit", text: `Folio ${corp.name} mencapai ${pct}% credit limit korporat` });
    }
  }
  if (unassignedArrivals > 0) {
    alerts.push({ kind: "Assign", text: `${unassignedArrivals} reservasi arrival hari ini belum mendapat penugasan kamar` });
  }
  if (oooCount > 0) {
    alerts.push({ kind: "OOO", text: `${oooCount} kamar Out of Order — menunggu tindak lanjut teknisi` });
  }

  return {
    arrivals: arrivals.map((a) => {
      const tag = deriveTag(a);
      const nights = Math.round((a.departure.getTime() - a.arrival.getTime()) / 86400000);
      const roomTypeName = a.rooms[0]?.roomType.name ?? "—";
      const roomNumbers = a.rooms.map((rr) => rr.room?.number).filter(Boolean) as string[];
      return {
        id: a.id,
        name: a.groupName ? `${a.groupName} (${a.rooms.length})` : a.guest.name,
        tag: tag.label,
        tagClass: tag.className,
        source: a.source,
        code: a.code,
        type: roomTypeName,
        nights,
        room: roomNumbers.length === 0 ? "Belum" : roomNumbers.length === 1 ? roomNumbers[0] : `${roomNumbers.length} kamar`,
      };
    }),
    kpis: {
      arrivalTotal: arrivals.length,
      arrivalCheckedIn: inHouseArrivalCount,
      arrivalVip: vipArrivalCount,
      departureTotal: departingCount,
      departureDone: checkedOutToday,
      inHouseRooms,
      guestCount,
      saleableTotal: vc + vi,
      vc,
      vi,
      ooo: oooCount,
      occupancyPct,
      adr,
      revpar,
    },
    alerts: alerts.slice(0, 4),
  };
}
