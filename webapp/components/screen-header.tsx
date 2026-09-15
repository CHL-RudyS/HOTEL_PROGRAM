import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

const ROLE_LABEL: Record<string, string> = {
  FRONT_OFFICE: "Front Office",
  BACK_OFFICE: "Back Office",
};

export async function ScreenHeader({ title }: { title: string }) {
  const session = await requireSession();
  const property = await prisma.property.findUnique({ where: { id: session.user.homePropertyId } });

  const now = new Date();
  const dateLabel = now.toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "short", year: "numeric" });
  const timeLabel = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  return (
    <header style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "var(--space-3) var(--space-4)", paddingBottom: "var(--space-4)" }}>
      <div style={{ flex: 1, minWidth: 260 }}>
        <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-accent)" }}>
          HotelOne &middot; {property?.name} &middot; {property?.city} &middot; {property?.roomCount} kamar
        </div>
        <h2 style={{ margin: "2px 0 0", fontSize: 27 }}>{title}</h2>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-3)", fontSize: 12, color: "var(--color-neutral-700)" }}>
        <span>
          {session.user.name} &middot; {ROLE_LABEL[session.user.role]} &middot; Shift 07:00&ndash;15:00
        </span>
        <span>
          {dateLabel} &middot; {timeLabel} WIB
        </span>
        <span className="tag tag-accent">Night audit 06:02 &middot; balanced</span>
      </div>
    </header>
  );
}
