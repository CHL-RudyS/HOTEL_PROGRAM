// Client-safe: no Prisma import. Shared between server queries (lib/rack.ts)
// and client components (Room Rack / Housekeeping UI).

export const STATUS_META: Record<string, { label: string; group: string; style: { background: string; color: string } }> = {
  VI: { label: "Vacant Inspected", group: "ready", style: { background: "var(--color-accent-300)", color: "var(--color-accent-900)" } },
  VC: { label: "Vacant Clean", group: "ready", style: { background: "var(--color-accent-100)", color: "var(--color-accent-900)" } },
  VD: { label: "Vacant Dirty", group: "proses", style: { background: "var(--color-neutral-300)", color: "var(--color-neutral-900)" } },
  OC: { label: "Occupied Clean", group: "terjual", style: { background: "var(--color-neutral-800)", color: "var(--color-bg)" } },
  OD: { label: "Occupied Dirty", group: "terjual", style: { background: "var(--color-neutral-600)", color: "var(--color-bg)" } },
  OOO: { label: "Out of Order", group: "tindakan", style: { background: "var(--color-accent-2-200)", color: "var(--color-accent-2-800)" } },
  OOS: { label: "Out of Service", group: "tindakan", style: { background: "var(--color-accent-2-200)", color: "var(--color-accent-2-800)" } },
};
