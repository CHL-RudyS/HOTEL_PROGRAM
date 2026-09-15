"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const T = {
  ID: {
    welcome: "Selamat Datang Kembali", signin: "Masuk Email Kantor Anda", email: "Email", pass: "Kata Sandi",
    showPass: "Lihat kata sandi", role: "Peran", btn: "Masuk", forgot: "Lupa kata sandi",
    need: "Butuh akun? Hubungi Admin", lastOut: "Logout terakhir dari perangkat ini",
  },
  EN: {
    welcome: "Welcome Back", signin: "Sign in with your office email", email: "Email", pass: "Password",
    showPass: "Show password", role: "Role", btn: "Sign in", forgot: "Forgot password",
    need: "Need an account? Contact Admin", lastOut: "Last logout from this device",
  },
} as const;

const DEMO_ACCOUNTS = {
  "Front Office": { email: "rina.pratiwi@kantor.id", password: "rahasia123" },
  "Back Office": { email: "hendra.wijaya@kantor.id", password: "rahasia123" },
} as const;

const flagStyle = (code: "ID" | "EN"): React.CSSProperties =>
  code === "ID"
    ? { background: "linear-gradient(to bottom,#E01020 0 50%,#fff 50% 100%)" }
    : { background: "linear-gradient(#3C3B6E,#3C3B6E) no-repeat top left/50% 50%, repeating-linear-gradient(to bottom,#B22234 0 14.28%,#fff 14.28% 28.56%)" };

export function LoginCard() {
  const searchParams = useSearchParams();
  const hadError = searchParams.get("error");

  const [lang, setLang] = useState<"ID" | "EN">("ID");
  const [langOpen, setLangOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [role, setRole] = useState<keyof typeof DEMO_ACCOUNTS>("Front Office");
  const [email, setEmail] = useState<string>(DEMO_ACCOUNTS["Front Office"].email);
  const [password, setPassword] = useState<string>(DEMO_ACCOUNTS["Front Office"].password);
  const [submitting, setSubmitting] = useState(false);

  const t = T[lang];

  function pickRole(r: keyof typeof DEMO_ACCOUNTS) {
    setRole(r);
    setEmail(DEMO_ACCOUNTS[r].email);
    setPassword(DEMO_ACCOUNTS[r].password);
  }

  async function doLogin(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await signIn("credentials", { email, password, callbackUrl: "/" });
  }

  return (
    <div
      style={{
        flex: "0 0 448px",
        width: 448,
        maxWidth: "56%",
        alignSelf: "flex-start",
        position: "relative",
        margin: "calc(4vh + 52px) clamp(20px,5vw,66px) 44px 0",
        padding: "clamp(28px,4vh,44px) 34px",
        background: "linear-gradient(160deg,#E4EFF6 0%,#CFE0EC 46%,#B6CEDF 100%)",
        borderRadius: 18,
        boxShadow: "0 26px 48px -18px rgba(22,32,27,.34), 0 10px 20px -12px rgba(22,32,27,.22), inset 0 1px 0 rgba(255,255,255,.85), inset 0 -1px 0 rgba(22,32,27,.08)",
        animation: "lgFloat 6s ease-in-out infinite",
        willChange: "transform",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ position: "absolute", top: 16, right: 22, zIndex: 2 }}>
        <button
          onClick={() => setLangOpen((v) => !v)}
          style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", border: 0, background: "#fff", borderRadius: 999, padding: "4px 11px 4px 4px", fontFamily: "var(--font-body)", fontSize: 12, fontWeight: 600, color: "var(--color-text)", boxShadow: "0 2px 8px rgba(22,32,27,.10)" }}
        >
          <span style={{ width: 21, height: 21, borderRadius: "50%", flex: "none", boxShadow: "0 0 0 1px rgba(22,32,27,.10)", ...flagStyle(lang) }} />
          <span>{lang}</span>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--color-neutral-700)" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flex: "none" }}>
            <path d="M6 9l6 6 6-6"></path>
          </svg>
        </button>
        {langOpen && (
          <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", background: "#fff", borderRadius: 11, boxShadow: "0 8px 22px rgba(22,32,27,.16)", padding: 5, minWidth: "100%", overflow: "hidden" }}>
            {(["ID", "EN"] as const).map((code) => (
              <button
                key={code}
                onClick={() => { setLang(code); setLangOpen(false); }}
                style={{
                  display: "flex", alignItems: "center", gap: 8, width: "100%", textAlign: "left", cursor: "pointer", border: 0,
                  padding: "5px 12px 5px 5px", fontFamily: "var(--font-body)", fontSize: 11.5, borderRadius: 9, whiteSpace: "nowrap",
                  background: lang === code ? "var(--color-surface)" : "transparent", fontWeight: lang === code ? 600 : 400,
                }}
              >
                <span style={{ width: 18, height: 18, borderRadius: "50%", flex: "none", boxShadow: "0 0 0 1px rgba(22,32,27,.10)", ...flagStyle(code) }} />
                <span>{code === "ID" ? "Bahasa" : "English"}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 38 }}>
        <img src="/assets/logo-chl.png" alt="Logo CHL Group" style={{ height: 32, width: "auto", display: "block", flex: "none" }} />
        <span style={{ fontFamily: "var(--font-heading)", fontSize: 22, fontWeight: 600, letterSpacing: "-0.01em", color: "#C79A2E" }}>CHL Group</span>
      </div>
      <p style={{ fontSize: 15, fontWeight: 600, margin: "var(--space-2) 0 0" }}>{t.welcome}</p>
      <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 2 }}>{t.signin}</div>

      <form onSubmit={doLogin}>
        <div className="field" style={{ marginTop: "var(--space-3)", fontSize: 12.5 }}>
          <label>{t.email}</label>
          <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} style={{ background: "#fff", borderColor: "transparent", borderRadius: 8, fontSize: 12.5, padding: "7px 11px" }} />
        </div>
        <div className="field" style={{ marginTop: "var(--space-2)", fontSize: 12.5 }}>
          <label>{t.pass}</label>
          <input className="input" type={showPass ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} style={{ background: "#fff", borderColor: "transparent", borderRadius: 8, fontSize: 12.5, padding: "7px 11px" }} />
        </div>
        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--color-neutral-800)", margin: "var(--space-2) 0 var(--space-3)", cursor: "pointer" }}>
          <input type="checkbox" checked={showPass} onChange={() => setShowPass((v) => !v)} style={{ width: 14, height: 14, accentColor: "var(--color-accent)" }} />
          <span>{t.showPass}</span>
        </label>

        <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-neutral-700)" }}>{t.role}</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "6px 0 var(--space-3)" }}>
          {(Object.keys(DEMO_ACCOUNTS) as (keyof typeof DEMO_ACCOUNTS)[]).map((r) => (
            <button
              type="button"
              key={r}
              onClick={() => pickRole(r)}
              style={{
                cursor: "pointer", border: 0, borderRadius: 999, padding: "4px 11px", fontFamily: "var(--font-body)", fontSize: 12,
                background: role === r ? "var(--color-accent)" : "#fff", color: role === r ? "var(--color-bg)" : "var(--color-text)",
              }}
            >
              {r}
            </button>
          ))}
        </div>

        {hadError && <div style={{ fontSize: 12, color: "var(--color-accent-2-700)", marginBottom: "var(--space-2)" }}>Email atau kata sandi salah.</div>}

        <button type="submit" disabled={submitting} className="btn btn-primary btn-block" style={{ background: "#2E86AB", borderColor: "#2E86AB", color: "#fff", borderRadius: 8, padding: 8, fontSize: 13, fontWeight: 600 }}>
          {submitting ? "…" : t.btn}
        </button>
      </form>

      <div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: "var(--space-2)", fontSize: 12 }}>
        <a href="#">{t.forgot}</a>
        <span style={{ color: "var(--color-neutral-700)" }}>{t.need}</span>
      </div>

      <div style={{ marginTop: "var(--space-3)", paddingTop: "var(--space-2)", borderTop: "1px solid var(--color-divider)", fontSize: 11, color: "var(--color-neutral-700)" }}>
        {t.lastOut}
      </div>
    </div>
  );
}
