import { requireSession } from "@/lib/session";
import { ScreenHeader } from "@/components/screen-header";
import { getHousekeepingData } from "@/lib/housekeeping";
import { HousekeepingScreen } from "@/components/housekeeping-screen";

export default async function HousekeepingPage() {
  const session = await requireSession();
  const data = await getHousekeepingData(session.user.homePropertyId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <ScreenHeader title="FD - Housekeeping" />
      <HousekeepingScreen {...data} />
    </div>
  );
}
