import { requireSession } from "@/lib/session";
import { ScreenHeader } from "@/components/screen-header";
import { getPosData } from "@/lib/pos";
import { PosScreen } from "@/components/pos-screen";

export default async function PosPage() {
  const session = await requireSession();
  const data = await getPosData(session.user.homePropertyId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <ScreenHeader title="FD - POS Resto" />
      <PosScreen {...data} />
    </div>
  );
}
