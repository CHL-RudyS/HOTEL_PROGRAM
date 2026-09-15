import Link from "next/link";
import { requireSession } from "@/lib/session";
import { ScreenHeader } from "@/components/screen-header";
import { getFrontDeskData, rp } from "@/lib/front-desk";

export default async function FrontDeskPage() {
  const session = await requireSession();
  const { arrivals, kpis, alerts } = await getFrontDeskData(session.user.homePropertyId);

  const tiles = [
    { label: "Arrival hari ini", value: String(kpis.arrivalTotal), sub: `${kpis.arrivalCheckedIn} sudah check-in · ${kpis.arrivalVip} VIP`, accent: false },
    { label: "Departure", value: String(kpis.departureTotal), sub: `${kpis.departureDone} selesai`, accent: false },
    { label: "In-house", value: String(kpis.inHouseRooms), sub: `${kpis.guestCount} tamu`, accent: false },
    { label: "Siap dijual", value: String(kpis.saleableTotal), sub: `VC ${kpis.vc} · VI ${kpis.vi} · OOO ${kpis.ooo}`, accent: false },
    { label: "Occupancy", value: kpis.occupancyPct.toLocaleString("id-ID", { maximumFractionDigits: 1 }) + "%", sub: `ADR ${rp(kpis.adr)} · RevPAR ${rp(kpis.revpar)}`, accent: true },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <ScreenHeader title="Front Desk (FD) Dashboard" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "var(--space-4)" }}>
        {tiles.map((tile) => (
          <div key={tile.label}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: tile.accent ? "var(--color-accent)" : "var(--color-neutral-700)" }}>{tile.label}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 44, lineHeight: 1, color: tile.accent ? "var(--color-accent-700)" : undefined }}>{tile.value}</div>
            <div style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{tile.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: "var(--space-8) var(--space-6)", alignItems: "start" }}>
        <section style={{ minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
            <h4 style={{ margin: 0 }}>Arrival list</h4>
            <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{kpis.arrivalTotal} belum tiba</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 440 }}>
              <thead>
                <tr>
                  <th>Tamu</th>
                  <th>Tipe</th>
                  <th>Malam</th>
                  <th>Kamar</th>
                  <th style={{ textAlign: "right" }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {arrivals.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span>{row.name}</span>
                        <span className={row.tagClass}>{row.tag}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>
                        {row.source} &middot; {row.code}
                      </div>
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>{row.type}</td>
                    <td>{row.nights}</td>
                    <td style={{ whiteSpace: "nowrap" }}>{row.room}</td>
                    <td style={{ textAlign: "right" }}>
                      <Link href={`/front-desk/checkin?reservationId=${row.id}`} className="btn btn-primary" style={{ fontSize: 12, padding: "5px 12px" }}>
                        Check-in
                      </Link>
                    </td>
                  </tr>
                ))}
                {arrivals.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{ color: "var(--color-neutral-700)" }}>
                      Semua tamu hari ini sudah check-in.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div>
            <h4 style={{ margin: "0 0 var(--space-2)" }}>Aksi cepat</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
              <Link href="/front-desk/checkin" className="btn btn-secondary">
                Walk-in
              </Link>
              <Link href="/front-desk/rack" className="btn btn-secondary">
                Room rack
              </Link>
              <Link href="/front-desk/folio" className="btn btn-secondary">
                Cari folio
              </Link>
              <Link href="/front-desk/availability" className="btn btn-secondary">
                Availability
              </Link>
            </div>
            <div style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: "var(--space-2)" }}>Shortcut: F2 check-in &middot; F3 folio &middot; F4 rack &middot; F8 shift handover</div>
          </div>
          <div>
            <h4 style={{ margin: "0 0 var(--space-2)" }}>Perlu tindakan</h4>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {alerts.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: "var(--space-3)", padding: "var(--space-2) 0", borderBottom: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
                  <span style={{ fontSize: 11, color: "var(--color-accent-2-700)", width: 70, flex: "none", textTransform: "uppercase", letterSpacing: "0.06em" }}>{a.kind}</span>
                  <span style={{ fontSize: 13, flex: 1 }}>{a.text}</span>
                </div>
              ))}
              {alerts.length === 0 && <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Tidak ada tindakan mendesak saat ini.</div>}
            </div>
          </div>
          <div>
            <h4 style={{ margin: "0 0 var(--space-2)" }}>Catatan shift</h4>
            <p style={{ fontSize: 13, margin: 0, color: "var(--color-neutral-800)", maxWidth: "44ch" }}>
              Grup PT Astra Daihatsu (30 kamar, rooming list lengkap) tiba hari ini dengan master folio grup sudah dibuka; semua room charge dirouting ke folio perusahaan.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
