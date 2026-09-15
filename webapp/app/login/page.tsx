import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { LoginCard } from "@/components/login-card";

const VALUES = [
  ["L", "Living with Integrity"],
  ["E", "Encourage Assertiveness & Professionalism"],
  ["S", "Strong Commitment"],
  ["T", "Teamwork with Loyalty"],
  ["A", "Achieve Services Level Agreements"],
  ["R", "Reliable Worth Ethic"],
  ["I", "Internal Harmony and Solidarity"],
];

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  if (session) redirect(session.user.role === "BACK_OFFICE" ? "/gm" : "/front-desk");

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 70, background: "#EAF3F8", display: "flex", flexDirection: "row", flexWrap: "nowrap", alignItems: "stretch", overflowY: "auto" }}>
      <div style={{ flex: "1 1 0%", minWidth: 0, padding: "calc(4vh + 52px) clamp(28px,7vw,96px) 44px", display: "flex", flexDirection: "column" }}>
        <div style={{ maxWidth: 520 }}>
          <div style={{ fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-accent-700)" }}>Internal System</div>
          <div style={{ animation: "lgFloat 4.6s ease-in-out infinite", willChange: "transform", display: "flex", alignItems: "center", gap: 10, marginTop: "var(--space-3)", flexWrap: "nowrap" }}>
            <img src="/assets/logo-chl.png" alt="Logo PT. Cipta Harmoni Lestari" style={{ height: 58, width: "auto", display: "block", flex: "none" }} />
            <span
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: 34,
                fontWeight: 600,
                letterSpacing: "-0.02em",
                lineHeight: 1.1,
                color: "#C79A2E",
                textShadow: "0 1px 0 rgba(255,255,255,.85), 0 2px 1px rgba(138,93,20,.45), 0 4px 7px rgba(22,32,27,.22)",
              }}
            >
              CIPTA HARMONI LESTARI
            </span>
          </div>
          <div style={{ animation: "lgFloat 5.4s ease-in-out infinite", willChange: "transform", marginTop: "var(--space-6)" }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-neutral-700)" }}>Company Values</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: "var(--space-3)" }}>
              {VALUES.map(([letter, text]) => (
                <div key={letter} style={{ display: "grid", gridTemplateColumns: "20px 1fr", alignItems: "baseline", columnGap: 10 }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, color: "var(--color-accent-700)" }}>{letter}</span>
                  <span style={{ fontSize: 13.5, lineHeight: 1.5, color: "var(--color-neutral-800)" }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ marginTop: "auto", display: "flex", gap: "var(--space-4)", flexWrap: "wrap", fontSize: 11.5, color: "var(--color-neutral-700)" }}>
          <span>Integrated Hotel Management System</span>
          <span>Grand Nusantara Hotel &amp; Suites &middot; Jakarta Pusat</span>
        </div>
      </div>

      <LoginCard />
    </div>
  );
}
