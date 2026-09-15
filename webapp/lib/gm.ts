import { prisma } from "@/lib/prisma";
import { TODAY } from "@/lib/front-desk";
import { rp } from "@/lib/format";

export const PERIODS = ["Hari ini", "Bulan ini", "Tahun ini"] as const;
export type Period = (typeof PERIODS)[number];

const DEPT_LABEL: Record<string, string> = {
  ROOM: "Room",
  FNB_RESTAURANT: "F&B Restaurant",
  BANQUET_MICE: "Banquet & MICE",
  SPA_WELLNESS: "Spa & Wellness",
  LAUNDRY_OTHER: "Laundry & lain-lain",
};

function periodRange(period: Period): { from: Date; to: Date } {
  if (period === "Hari ini") return { from: TODAY, to: TODAY };
  if (period === "Bulan ini") return { from: new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth(), 1)), to: TODAY };
  return { from: new Date(Date.UTC(TODAY.getUTCFullYear(), 0, 1)), to: TODAY };
}

async function aggregateProperty(propertyId: string, from: Date, to: Date) {
  const metrics = await prisma.dailyPropertyMetric.findMany({ where: { propertyId, date: { gte: from, lte: to } } });
  const depts = await prisma.departmentRevenueDay.findMany({ where: { propertyId, date: { gte: from, lte: to } } });

  const roomsAvailable = metrics.reduce((a, m) => a + m.roomsAvailable, 0);
  const roomsSold = metrics.reduce((a, m) => a + m.roomsSold, 0);
  const roomRevenue = metrics.reduce((a, m) => a + m.roomRevenue, 0);
  const totalRevenue = metrics.reduce((a, m) => a + m.totalRevenue, 0);
  const totalRevenueLY = depts.reduce((a, d) => a + d.revenueLastYear, 0);
  const directBookingPct = metrics.length ? metrics.reduce((a, m) => a + Number(m.directBookingPct), 0) / metrics.length : 0;

  const occ = roomsAvailable ? (roomsSold / roomsAvailable) * 100 : 0;
  const adr = roomsSold ? Math.round(roomRevenue / roomsSold) : 0;
  const revpar = roomsAvailable ? Math.round(roomRevenue / roomsAvailable) : 0;
  const trevpar = roomsAvailable ? Math.round(totalRevenue / roomsAvailable) : 0;
  // Shared revenue-growth proxy applied across KPI deltas — see getGmData doc comment.
  const growthPct = totalRevenueLY > 0 ? (totalRevenue / totalRevenueLY - 1) * 100 : 0;

  return { roomsAvailable, roomsSold, roomRevenue, totalRevenue, totalRevenueLY, directBookingPct, occ, adr, revpar, trevpar, growthPct, depts };
}

/**
 * True LY (last-year) daily figures were not seeded at daily granularity —
 * only per-department revenueLastYear. So every "vs LY" delta below reuses
 * one real, period-specific revenue-growth ratio (totalRevenue vs
 * totalRevenueLY) as a shared proxy for the occupancy/ADR/RevPAR deltas,
 * rather than fabricating independent numbers with no backing data.
 */
export async function getGmData(propertyId: string, period: Period) {
  const { from, to } = periodRange(period);
  const agg = await aggregateProperty(propertyId, from, to);

  const kpis = [
    { label: "Occupancy", value: agg.occ.toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%", delta: fmtDelta(agg.growthPct) },
    { label: "ADR", value: rp(agg.adr), delta: fmtDelta(agg.growthPct) },
    { label: "RevPAR", value: rp(agg.revpar), delta: fmtDelta(agg.growthPct) },
    { label: "TRevPAR", value: rp(agg.trevpar), delta: fmtDelta(agg.growthPct) },
  ];

  const deptTotals = new Map<string, { revenue: number; revenueLastYear: number }>();
  for (const d of agg.depts) {
    const cur = deptTotals.get(d.department) ?? { revenue: 0, revenueLastYear: 0 };
    cur.revenue += d.revenue;
    cur.revenueLastYear += d.revenueLastYear;
    deptTotals.set(d.department, cur);
  }
  const totalRevenue = agg.totalRevenue || 1;
  const depts = [...deptTotals.entries()].map(([code, v]) => ({
    name: DEPT_LABEL[code] ?? code,
    rev: rp(v.revenue),
    share: Math.round((v.revenue / totalRevenue) * 100) + "%",
    vs: fmtDelta(v.revenueLastYear > 0 ? (v.revenue / v.revenueLastYear - 1) * 100 : 0),
  }));

  const flagshipCodes = ["GNJ", "NRB", "NCB", "NES"];
  const properties = await prisma.property.findMany({ where: { code: { in: flagshipCodes } } });
  const props = await Promise.all(
    properties.map(async (p) => {
      const a = await aggregateProperty(p.id, from, to);
      return { name: p.name, occ: a.occ.toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%", adr: rp(a.adr), revpar: rp(a.revpar), vs: fmtDelta(a.growthPct) };
    })
  );

  // Trend bars: daily occupancy for day/month views, monthly-averaged for the year view.
  let bars: { label: string; value: number }[];
  if (period === "Tahun ini") {
    const monthly = await prisma.dailyPropertyMetric.findMany({ where: { propertyId, date: { gte: from, lte: to } } });
    const byMonth = new Map<number, { sold: number; avail: number }>();
    for (const m of monthly) {
      const mo = m.date.getUTCMonth();
      const cur = byMonth.get(mo) ?? { sold: 0, avail: 0 };
      cur.sold += m.roomsSold;
      cur.avail += m.roomsAvailable;
      byMonth.set(mo, cur);
    }
    bars = [...byMonth.entries()].sort((a, b) => a[0] - b[0]).map(([mo, v]) => ({ label: String(mo + 1), value: v.avail ? (v.sold / v.avail) * 100 : 0 }));
  } else {
    const last14From = new Date(to);
    last14From.setUTCDate(last14From.getUTCDate() - 13);
    const daily = await prisma.dailyPropertyMetric.findMany({ where: { propertyId, date: { gte: last14From, lte: to } }, orderBy: { date: "asc" } });
    bars = daily.map((m) => ({ label: String(m.date.getUTCDate()), value: m.roomsAvailable ? (m.roomsSold / m.roomsAvailable) * 100 : 0 }));
  }

  const trendLabel = period === "Tahun ini" ? "Occupancy rata-rata per bulan (%) — tahun berjalan" : period === "Bulan ini" ? "Occupancy 14 hari terakhir (%)" : "Occupancy 14 hari terakhir (%)";

  return { kpis, depts, props, bars, trendLabel };
}

function fmtDelta(pct: number) {
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toLocaleString("id-ID", { maximumFractionDigits: 1 })}% vs LY`;
}
