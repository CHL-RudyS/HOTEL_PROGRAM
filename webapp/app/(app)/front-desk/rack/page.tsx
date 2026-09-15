import { requireSession } from "@/lib/session";
import { ScreenHeader } from "@/components/screen-header";
import { getRackData } from "@/lib/rack";
import { RoomRack } from "@/components/room-rack";

export default async function RackPage() {
  const session = await requireSession();
  const { floors, discrepancyRoomNumber } = await getRackData(session.user.homePropertyId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <ScreenHeader title="FD - Room Rack" />
      <RoomRack floors={floors} discrepancyRoomNumber={discrepancyRoomNumber} />
    </div>
  );
}
