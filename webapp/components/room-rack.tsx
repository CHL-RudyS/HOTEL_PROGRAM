"use client";

import { useMemo, useState } from "react";
import { STATUS_META } from "@/lib/room-status";

type Room = { id: string; no: string; status: string; roomTypeName: string; guestLine: string };
type Floor = { floor: string; rooms: Room[] };

const FILTERS = [
  ["all", "Semua"],
  ["ready", "Siap dijual"],
  ["proses", "Perlu dibersihkan"],
  ["terjual", "Terisi"],
  ["tindakan", "Perlu tindakan"],
] as const;

export function RoomRack({ floors, discrepancyRoomNumber }: { floors: Floor[]; discrepancyRoomNumber: string | null }) {
  const [filter, setFilter] = useState<string>("all");
  const allRooms = useMemo(() => floors.flatMap((f) => f.rooms), [floors]);
  const [selectedId, setSelectedId] = useState<string | undefined>(allRooms[0]?.id);
  const selected = allRooms.find((r) => r.id === selectedId);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            style={{
              border: filter === key ? 0 : "1px solid var(--color-divider)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 12, padding: "5px 12px", borderRadius: 2,
              background: filter === key ? "var(--color-accent)" : "transparent", color: filter === key ? "var(--color-bg)" : "var(--color-text)",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)", alignItems: "flex-start" }}>
        <div style={{ flex: 1, minWidth: 300, display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
          {floors.map((fl) => (
            <div key={fl.floor} style={{ display: "flex", gap: "var(--space-3)", alignItems: "flex-start" }}>
              <div style={{ width: 62, flex: "none", fontSize: 11, paddingTop: "var(--space-2)", color: "var(--color-neutral-700)" }}>{fl.floor}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {fl.rooms.map((r) => {
                  const meta = STATUS_META[r.status];
                  const dim = filter !== "all" && meta.group !== filter;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedId(r.id)}
                      style={{
                        display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", gap: 2,
                        width: 62, height: 48, padding: "5px 6px", border: 0, cursor: "pointer", borderRadius: 2, fontFamily: "var(--font-body)",
                        ...meta.style, opacity: dim ? 0.28 : 1,
                        outline: selectedId === r.id ? "2px solid var(--color-accent-2)" : undefined, outlineOffset: selectedId === r.id ? 1 : undefined,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-heading)" }}>{r.no}</span>
                      <span style={{ fontSize: 10, letterSpacing: "0.04em", opacity: 0.85 }}>{r.status}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div style={{ width: 260, flex: "none", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)" }}>Kamar terpilih</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 38, lineHeight: 1.1 }}>{selected?.no}</div>
            <div style={{ fontSize: 13, marginTop: 2 }}>{selected ? `${selected.status} — ${STATUS_META[selected.status].label}` : ""}</div>
            <div style={{ fontSize: 12, color: "var(--color-neutral-700)", marginTop: "var(--space-2)", lineHeight: 1.6 }}>{selected?.guestLine}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
                Ubah status
              </button>
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
                Room move
              </button>
              <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
                Work order
              </button>
            </div>
          </div>
          <div>
            <h4 style={{ margin: "0 0 var(--space-2)" }}>Legenda</h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.entries(STATUS_META)
                .filter(([code]) => code !== "OOS")
                .map(([code, meta]) => (
                  <div key={code} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12 }}>
                    <span style={{ width: 14, height: 14, flex: "none", ...meta.style }} />
                    <span style={{ width: 32, color: "var(--color-neutral-700)" }}>{code}</span>
                    <span>{meta.label}</span>
                  </div>
                ))}
            </div>
          </div>
          <div style={{ fontSize: 11, color: "var(--color-neutral-700)", lineHeight: 1.6 }}>
            {discrepancyRoomNumber ? `Discrepancy report: 1 selisih terbuka (${discrepancyRoomNumber}).` : "Tidak ada discrepancy terbuka."} Status kamar diperbarui langsung dari aplikasi Housekeeping.
          </div>
        </div>
      </div>
    </div>
  );
}
