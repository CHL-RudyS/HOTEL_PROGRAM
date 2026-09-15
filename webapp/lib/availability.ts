import { prisma } from "@/lib/prisma";
import { TODAY } from "@/lib/front-desk";

const DOW = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function addDays(d: Date, n: number) {
  const out = new Date(d);
  out.setUTCDate(out.getUTCDate() + n);
  return out;
}
function isWeekendJkt(d: Date) {
  const dow = d.getUTCDay();
  return dow === 5 || dow === 6;
}

export async function getAvailabilityGrid(propertyId: string, days = 30) {
  const ratePlan = await prisma.ratePlan.findFirst({ where: { propertyId, code: "BAR" } });
  const roomTypes = await prisma.roomType.findMany({ where: { propertyId }, orderBy: { barRate: "asc" } });
  const rooms = await prisma.room.findMany({ where: { propertyId } });
  const totalByType = new Map<string, number>();
  for (const r of rooms) totalByType.set(r.roomTypeId, (totalByType.get(r.roomTypeId) ?? 0) + 1);

  const from = TODAY;
  const to = addDays(TODAY, days);

  const [rateDetails, bookedGroups] = await Promise.all([
    prisma.rateDetail.findMany({ where: { ratePlanId: ratePlan?.id, date: { gte: from, lt: to } } }),
    prisma.$queryRawUnsafe<{ roomtypeid: string; day: Date; sold: bigint }[]>(
      `select rr."roomTypeId" as roomtypeid, d.day, count(*)::bigint as sold
       from generate_series($1::date, $2::date, interval '1 day') d(day)
       join "ReservationRoom" rr on true
       join "Reservation" r on r.id = rr."reservationId"
       where r."propertyId" = $3
         and r.status not in ('CANCELLED', 'NO_SHOW')
         and r.arrival <= d.day and r.departure > d.day
       group by rr."roomTypeId", d.day`,
      from,
      addDays(to, -1),
      propertyId
    ),
  ]);

  const rateByKey = new Map(rateDetails.map((r) => [`${r.roomTypeId}|${r.date.toISOString().slice(0, 10)}`, r]));
  const soldByKey = new Map(bookedGroups.map((g) => [`${g.roomtypeid}|${new Date(g.day).toISOString().slice(0, 10)}`, Number(g.sold)]));

  const days30 = Array.from({ length: days }, (_, i) => addDays(from, i));

  const rows = roomTypes.map((rt) => {
    const total = totalByType.get(rt.id) ?? 0;
    const cells = days30.map((date) => {
      const key = `${rt.id}|${date.toISOString().slice(0, 10)}`;
      const sold = soldByKey.get(key) ?? 0;
      const available = Math.max(0, total - sold);
      const rate = rateByKey.get(key);
      return { date, available, total, price: rate?.price ?? rt.barRate };
    });
    return { roomType: rt, total, cells };
  });

  return {
    days: days30.map((d) => ({ date: d, dow: DOW[d.getUTCDay()], label: String(d.getUTCDate()), weekend: isWeekendJkt(d) })),
    rows,
  };
}

