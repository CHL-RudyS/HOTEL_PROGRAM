"use client";

import { useState } from "react";
import { rp, cellTone } from "@/lib/format";

type Day = { dow: string; label: string; weekend: boolean };
type Cell = { available: number; price: number };
type Row = { id: string; name: string; total: number; cells: Cell[] };

export function AvailabilityGrid({ days, rows, channels }: { days: Day[]; rows: Row[]; channels: { name: string; lastSyncAt: string }[] }) {
  const [sel, setSel] = useState({ t: Math.min(2, rows.length - 1), d: 3 });
  const selRow = rows[sel.t];
  const selCell = selRow?.cells[sel.d];
  const selDay = days[sel.d];

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)", fontSize: 12, color: "var(--color-neutral-700)" }}>
        <span>
          Rate plan: <strong style={{ fontWeight: 600, color: "var(--color-text)" }}>BAR — Best Available Rate</strong>
        </span>
        <span>Periode 30 hari ke depan</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          Kepadatan
          <span style={{ width: 14, height: 14, background: "var(--color-accent-100)" }} />
          <span style={{ width: 14, height: 14, background: "var(--color-accent-200)" }} />
          <span style={{ width: 14, height: 14, background: "var(--color-accent-300)" }} />
          <span style={{ width: 14, height: 14, background: "var(--color-accent-2-200)" }} />
          sold out
        </span>
      </div>

      <div style={{ overflowX: "auto", paddingBottom: "var(--space-2)" }}>
        <div style={{ minWidth: 900, display: "flex", flexDirection: "column", gap: 2 }}>
          <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
            <div style={{ width: 170, flex: "none" }} />
            {days.map((d, i) => (
              <div key={i} style={{ flex: 1, minWidth: 30, textAlign: "center", fontSize: 10, lineHeight: 1.25, color: "var(--color-neutral-700)" }}>
                <div>{d.dow}</div>
                <div style={{ color: "var(--color-text)", fontSize: 12 }}>{d.label}</div>
              </div>
            ))}
          </div>
          {rows.map((row, ti) => (
            <div key={row.id} style={{ display: "flex", gap: 2, alignItems: "center" }}>
              <div style={{ width: 170, flex: "none", fontSize: 13, display: "flex", justifyContent: "space-between", paddingRight: "var(--space-3)" }}>
                <span>{row.name}</span>
                <span style={{ fontSize: 11, color: "var(--color-neutral-600)" }}>{row.total}</span>
              </div>
              {row.cells.map((c, di) => {
                const picked = sel.t === ti && sel.d === di;
                const tone = cellTone(c.available);
                return (
                  <button
                    key={di}
                    onClick={() => setSel({ t: ti, d: di })}
                    style={{
                      flex: 1, minWidth: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontFamily: "var(--font-body)", cursor: "pointer", border: 0, borderRadius: 1,
                      ...tone,
                      outline: picked ? "2px solid var(--color-accent-2)" : undefined,
                      outlineOffset: picked ? -2 : undefined,
                    }}
                  >
                    {c.available}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "var(--space-6)", alignItems: "start", maxWidth: 900 }}>
        <div>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)" }}>Sel terpilih</div>
          <h4 style={{ margin: "4px 0 var(--space-2)" }}>
            {selRow?.name} &middot; {selDay?.dow} {selDay?.label}
          </h4>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-neutral-800)" }}>
            <div>
              Tersedia: {selCell?.available} dari {selRow?.total} kamar
            </div>
            <div>Rate: {selCell ? rp(selCell.price) : "—"} / malam</div>
            <div>{selCell && selCell.available <= 3 ? "Min stay 2 malam · Closed to arrival" : "Tidak ada restriction"}</div>
          </div>
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
            <button className="btn btn-primary" style={{ fontSize: 12, padding: "5px 12px" }}>
              Ubah rate
            </button>
            <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
              Stop sell
            </button>
          </div>
        </div>
        <div>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Pace booking</h4>
          <p style={{ fontSize: 13, margin: 0, color: "var(--color-neutral-800)" }}>
            Ketersediaan dihitung langsung dari reservasi aktif per tipe kamar. Akhir pekan biasanya terjual lebih penuh; sel magenta menandakan tipe kamar tersebut sudah habis pada tanggal itu.
          </p>
        </div>
        <div>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Channel</h4>
          <div style={{ fontSize: 13, lineHeight: 1.7, color: "var(--color-neutral-800)" }}>
            {channels.map((c) => (
              <div key={c.name}>
                {c.name} &middot; sinkron {Math.max(1, Math.round((Date.now() - new Date(c.lastSyncAt).getTime()) / 1000))}s lalu
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
