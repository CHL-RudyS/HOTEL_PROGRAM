import Link from "next/link";
import { requireSession } from "@/lib/session";
import { ScreenHeader } from "@/components/screen-header";
import { getGmData, PERIODS, type Period } from "@/lib/gm";

export default async function GmPage({ searchParams }: { searchParams: { period?: string } }) {
  const session = await requireSession();
  const period = (PERIODS as readonly string[]).includes(searchParams.period ?? "") ? (searchParams.period as Period) : "Hari ini";
  const { kpis, depts, props, bars, trendLabel } = await getGmData(session.user.homePropertyId, period);

  const maxBar = Math.max(1, ...bars.map((b) => b.value));
  const barWidth = bars.length ? Math.min(24, 340 / bars.length - 2) : 18;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <ScreenHeader title="GM Dashboard" />

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        {PERIODS.map((p) => (
          <Link
            key={p}
            href={`/gm?period=${encodeURIComponent(p)}`}
            style={{
              border: period === p ? "0" : "1px solid var(--color-divider)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, padding: "6px 14px", borderRadius: 2,
              background: period === p ? "var(--color-accent)" : "transparent", color: period === p ? "var(--color-bg)" : "var(--color-text)", display: "inline-block",
            }}
          >
            {p}
          </Link>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "var(--space-6)" }}>
        {kpis.map((k) => (
          <div key={k.label}>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-neutral-700)" }}>{k.label}</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 40, lineHeight: 1.05, margin: "4px 0" }}>{k.value}</div>
            <div style={{ fontSize: 12, color: "var(--color-accent-700)" }}>{k.delta}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: "var(--space-8) var(--space-6)", alignItems: "start" }}>
        <section>
          <h4 style={{ margin: "0 0 var(--space-3)" }}>{trendLabel}</h4>
          <svg viewBox="0 0 364 130" style={{ width: "100%", height: "auto" }} role="img" aria-label="Grafik batang occupancy">
            <line x1="0" y1="120" x2="364" y2="120" stroke="var(--color-divider)" strokeWidth="1" />
            {bars.map((b, i) => {
              const h = Math.round((b.value / maxBar) * 100);
              const x = i * (364 / Math.max(1, bars.length));
              const isLast = i === bars.length - 1;
              return <rect key={i} x={x} y={120 - h} width={barWidth} height={h} fill={isLast ? "var(--color-accent-2)" : "var(--color-accent-500)"} />;
            })}
          </svg>
          <div style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: "var(--space-2)" }}>Batang magenta adalah periode terakhir.</div>
        </section>

        <section>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Revenue per departemen</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Departemen</th>
                <th style={{ textAlign: "right" }}>Revenue</th>
                <th style={{ textAlign: "right" }}>Porsi</th>
                <th style={{ textAlign: "right" }}>vs LY</th>
              </tr>
            </thead>
            <tbody>
              {depts.map((d) => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{d.rev}</td>
                  <td style={{ textAlign: "right" }}>{d.share}</td>
                  <td style={{ textAlign: "right" }}>{d.vs}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section>
        <h4 style={{ margin: "0 0 var(--space-2)" }}>Perbandingan properti — konsolidasi grup</h4>
        <table className="table">
          <thead>
            <tr>
              <th>Properti</th>
              <th style={{ textAlign: "right" }}>Occ</th>
              <th style={{ textAlign: "right" }}>ADR</th>
              <th style={{ textAlign: "right" }}>RevPAR</th>
              <th style={{ textAlign: "right" }}>RevPAR vs LY</th>
            </tr>
          </thead>
          <tbody>
            {props.map((p) => (
              <tr key={p.name}>
                <td>{p.name}</td>
                <td style={{ textAlign: "right" }}>{p.occ}</td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{p.adr}</td>
                <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{p.revpar}</td>
                <td style={{ textAlign: "right" }}>{p.vs}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: "var(--space-2)" }}>Ekspor tersedia dalam Excel, CSV, dan PDF.</div>
      </section>
    </div>
  );
}
