import { requireSession } from "@/lib/session";
import { ScreenHeader } from "@/components/screen-header";
import { getAvailabilityGrid } from "@/lib/availability";
import { prisma } from "@/lib/prisma";
import { AvailabilityGrid } from "@/components/availability-grid";

export default async function AvailabilityPage() {
  const session = await requireSession();
  const { days, rows } = await getAvailabilityGrid(session.user.homePropertyId);
  const channels = await prisma.channelConnection.findMany({ where: { propertyId: session.user.homePropertyId } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <ScreenHeader title="FD - Availability Grid" />
      <AvailabilityGrid
        days={days.map((d) => ({ dow: d.dow, label: d.label, weekend: d.weekend }))}
        rows={rows.map((r) => ({
          id: r.roomType.id,
          name: r.roomType.name,
          total: r.total,
          cells: r.cells.map((c) => ({ available: c.available, price: c.price })),
        }))}
        channels={channels.map((c) => ({ name: c.name, lastSyncAt: c.lastSyncAt.toISOString() }))}
      />
    </div>
  );
}
