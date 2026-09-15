import { requireSession } from "@/lib/session";
import { MenuLayar } from "@/components/menu-layar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  await requireSession();

  return (
    <div style={{ display: "flex", alignItems: "stretch", minHeight: "100vh", background: "#EAF3F8", color: "var(--color-text)", fontFamily: "var(--font-body)" }}>
      <MenuLayar />
      <main style={{ flex: 1, minWidth: 0, padding: "var(--space-4) var(--space-6) 96px" }}>{children}</main>
    </div>
  );
}
