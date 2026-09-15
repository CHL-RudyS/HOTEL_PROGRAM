"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { advanceHkTask } from "@/app/(app)/front-desk/housekeeping/actions";

type Task = {
  id: string;
  no: string;
  type: string;
  prio: string;
  prioClass: string;
  status: string;
  statusCode: string;
  note: string;
  action: string;
};

export function HousekeepingScreen({ assigneeName, zoneLabel, done, total, tasks }: { assigneeName: string; zoneLabel: string; done: number; total: number; tasks: Task[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);

  function tap(taskId: string) {
    setBusyId(taskId);
    startTransition(async () => {
      await advanceHkTask(taskId);
      router.refresh();
      setBusyId(null);
    });
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-8)", alignItems: "flex-start" }}>
      <div style={{ width: 372, flex: "none", background: "var(--color-bg)", boxShadow: "var(--shadow-md)", borderRadius: "var(--radius-lg)", overflow: "hidden" }}>
        <div style={{ padding: "var(--space-3) var(--space-4)", display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-2)", borderBottom: "1px solid var(--color-divider)" }}>
          <div>
            <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)" }}>Room Attendant</div>
            <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19 }}>{assigneeName}</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "var(--color-neutral-700)" }}>
            {zoneLabel}
            <br />
            {done} dari {total} selesai
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {tasks.map((t) => (
            <div key={t.id} style={{ padding: "var(--space-3) var(--space-4)", borderBottom: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-2)" }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 23 }}>{t.no}</span>
                <span className={t.prioClass}>{t.prio}</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", fontSize: 12, color: "var(--color-neutral-700)" }}>
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", padding: "3px 9px", borderRadius: 2, fontSize: 11,
                    background: t.statusCode === "CLEANING" ? "var(--color-neutral-300)" : "var(--color-surface)",
                    color: t.statusCode === "CLEANING" ? "var(--color-neutral-900)" : "var(--color-text)",
                  }}
                >
                  {t.status}
                </span>
                <span>{t.type}</span>
              </div>
              <div style={{ fontSize: 12, color: "var(--color-neutral-800)" }}>{t.note}</div>
              <button
                onClick={() => tap(t.id)}
                disabled={pending && busyId === t.id}
                style={{
                  width: "100%", minHeight: 46, border: t.statusCode === "VI" ? "1px solid var(--color-divider)" : 0, cursor: "pointer",
                  fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, borderRadius: 2,
                  background: t.statusCode === "VI" ? "transparent" : "var(--color-accent)",
                  color: t.statusCode === "VI" ? "var(--color-neutral-700)" : "var(--color-bg)",
                }}
              >
                {busyId === t.id ? "…" : t.action}
              </button>
            </div>
          ))}
        </div>
        <div style={{ padding: "var(--space-3) var(--space-4)", fontSize: 11, color: "var(--color-neutral-700)" }}>Status kamar diperbarui langsung dan terlihat di Room Rack.</div>
      </div>

      <div style={{ flex: 1, minWidth: 260, maxWidth: 420, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <div>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Cara kerja layar ini</h4>
          <p style={{ fontSize: 13, margin: 0, color: "var(--color-neutral-800)" }}>
            Tekan tombol pada tiap kartu untuk menjalankan alur status: Vacant Dirty → sedang dibersihkan → Vacant Clean → menunggu inspeksi supervisor. Setiap perubahan langsung mengubah Room Rack dan kamar yang dijual di Availability Grid.
          </p>
        </div>
        <div>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Prioritas otomatis</h4>
          <p style={{ fontSize: 13, margin: 0, color: "var(--color-neutral-800)" }}>
            Urutan tugas disusun berdasarkan due-out, VIP arrival, dan permintaan early check-in, lalu diseimbangkan per zona lantai agar beban tiap attendant setara.
          </p>
        </div>
        <div>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Tombol besar, satu tangan</h4>
          <p style={{ fontSize: 13, margin: 0, color: "var(--color-neutral-800)" }}>
            Target sentuh minimum 46 px, dapat dioperasikan sambil mendorong trolley.
          </p>
        </div>
      </div>
    </div>
  );
}
