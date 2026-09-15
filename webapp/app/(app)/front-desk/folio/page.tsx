import { ScreenHeader } from "@/components/screen-header";
import { getFolioContext } from "@/lib/folio";
import { FolioView } from "@/components/folio-view";

export default async function FolioPage({ searchParams }: { searchParams: { reservationId?: string } }) {
  const ctx = await getFolioContext(searchParams.reservationId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)", maxWidth: 1000 }}>
      <ScreenHeader title="FD - Folio View" />
      {ctx ? <FolioView folios={ctx.folios} /> : <p>Tidak ada folio untuk ditampilkan.</p>}
    </div>
  );
}
