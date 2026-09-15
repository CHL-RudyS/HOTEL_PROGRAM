// Pure, framework/server-agnostic formatting helpers — safe to import from
// both server components and "use client" components (no Prisma import here).

export const rp = (n: number) => "Rp " + n.toLocaleString("id-ID");

export function cellTone(available: number) {
  if (available <= 0) return { background: "var(--color-accent-2-200)", color: "var(--color-accent-2-800)" };
  if (available <= 3) return { background: "var(--color-accent-300)", color: "var(--color-accent-900)" };
  if (available <= 8) return { background: "var(--color-accent-200)", color: "var(--color-accent-900)" };
  if (available <= 16) return { background: "var(--color-accent-100)", color: "var(--color-accent-900)" };
  return { background: "transparent", color: "var(--color-neutral-800)" };
}
