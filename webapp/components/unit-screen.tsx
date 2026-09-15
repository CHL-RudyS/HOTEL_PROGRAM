"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Unit = { id: string; code: string; name: string; city: string };
type Corp = { id: string; name: string; units: Unit[] };

export function UnitScreen({ userName, roleLabel, corporations }: { userName: string; roleLabel: string; corporations: Corp[] }) {
  const router = useRouter();
  const defaultCorp = corporations.find((c) => c.units.some((u) => u.code === "GNJ")) ?? corporations[0];
  const [activeCorpId, setActiveCorpId] = useState(defaultCorp?.id);
  const [unitQuery, setUnitQuery] = useState("");

  const activeCorp = corporations.find((c) => c.id === activeCorpId) ?? corporations[0];
  const q = unitQuery.toLowerCase();
  const filteredUnits = useMemo(
    () => (activeCorp?.units ?? []).filter((u) => !q || u.name.toLowerCase().includes(q) || u.city.toLowerCase().includes(q) || u.code.toLowerCase().includes(q)),
    [activeCorp, q]
  );

  const loginTime = new Date().toLocaleString("id-ID", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "flex-start", marginTop: 69 }}>
      <div style={{ flex: "1 1 560px", minWidth: 320, background: "#FAFCFD", borderRadius: 12, boxShadow: "0 10px 26px -18px rgba(22,32,27,.18)", padding: "var(--space-6)", display: "flex", flexWrap: "wrap", gap: "var(--space-6)" }}>
        <div style={{ flex: "1 1 280px", minWidth: 260 }}>
          <div style={{ fontSize: 14, color: "var(--color-neutral-700)" }}>Selamat Datang Kembali :</div>
          <h2 style={{ margin: "6px 0 0", fontSize: 30, lineHeight: 1.15, textTransform: "uppercase" }}>{userName}</h2>
          <div style={{ fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--color-accent-700)", marginTop: 4 }}>{roleLabel}</div>
          <div style={{ width: 64, height: 3, background: "var(--color-accent)", margin: "var(--space-4) 0" }} />
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--color-neutral-800)", maxWidth: "42ch", margin: 0 }}>
            Pilih hotel dan lokasi cabang untuk mulai atau melanjutkan pekerjaan yang belum selesai.
          </p>
          <div style={{ fontSize: 12.5, color: "var(--color-neutral-700)", marginTop: "var(--space-4)" }}>Login {loginTime} WIB</div>
        </div>

        <div style={{ flex: "0 1 340px", minWidth: 260, background: "linear-gradient(to bottom,#F8FBFC 0%,#EEF4F7 100%)", borderRadius: 10, padding: "var(--space-4)" }}>
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", paddingBottom: "var(--space-3)", borderBottom: "1px solid #DCE5EC" }}>Daftar Perusahaan</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, margin: "var(--space-3) 0", maxHeight: 330, overflowY: "auto" }}>
            {corporations.map((c) => {
              const active = c.id === activeCorp?.id;
              return (
                <button
                  key={c.id}
                  onClick={() => { setActiveCorpId(c.id); setUnitQuery(""); }}
                  style={{
                    display: "flex", alignItems: "flex-start", gap: 10, width: "100%", textAlign: "left", cursor: "pointer",
                    padding: "11px 13px", border: `1px solid ${active ? "var(--color-accent)" : "#E1E9F0"}`, borderRadius: 8,
                    fontFamily: "var(--font-body)", boxShadow: "0 1px 2px rgba(22,32,27,.05)", background: active ? "#EFF4F0" : "#fff",
                  }}
                >
                  <span style={{ width: 9, height: 9, flex: "none", marginTop: 5, background: "var(--color-accent)" }} />
                  <span style={{ flex: 1, fontSize: 13.5, fontWeight: 600, lineHeight: 1.3 }}>{c.name}</span>
                  <span style={{ fontSize: 12, color: "var(--color-neutral-700)", whiteSpace: "nowrap" }}>{c.units.length} unit</span>
                </button>
              );
            })}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--color-neutral-700)", paddingTop: "var(--space-3)", borderTop: "1px solid #DCE5EC" }}>{corporations.length} perusahaan</div>
        </div>
      </div>

      <div style={{ flex: "0 1 400px", minWidth: 300, background: "#fff", borderRadius: 12, boxShadow: "0 10px 26px -18px rgba(22,32,27,.30)", padding: "var(--space-6)", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <div>
          <h4 style={{ margin: 0, fontSize: 17, textTransform: "uppercase" }}>{activeCorp?.name}</h4>
          <div style={{ fontSize: 13, color: "var(--color-neutral-700)", marginTop: 2 }}>Pilih cabang yang ingin anda buka.</div>
        </div>
        <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
          <svg width="15" height="15" viewBox="0 0 256 256" fill="var(--color-neutral-700)" aria-hidden="true" style={{ position: "absolute", left: 14, pointerEvents: "none" }}>
            <path d="m229.66 218.34-50.07-50.06a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32ZM40 112a72 72 0 1 1 72 72 72.08 72.08 0 0 1-72-72Z"></path>
          </svg>
          <input
            value={unitQuery}
            onChange={(e) => setUnitQuery(e.target.value)}
            placeholder="Cari unit bisnis..."
            style={{ width: "100%", boxSizing: "border-box", background: "#FDFDFC", border: "1px solid #E4E8E3", borderRadius: 10, padding: "11px 14px 11px 38px", fontFamily: "var(--font-body)", fontSize: 14, color: "var(--color-text)" }}
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))", gap: 10 }}>
          {filteredUnits.map((u) => (
            <button
              key={u.id}
              onClick={() => router.push("/front-desk")}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 6, textAlign: "left", cursor: "pointer", padding: 12, border: "1px solid var(--color-divider)", borderRadius: 9, background: "#fff", fontFamily: "var(--font-body)" }}
            >
              <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: "0.08em", padding: "2px 7px", borderRadius: 4, background: "var(--color-surface)", color: "var(--color-neutral-800)" }}>{u.code}</span>
              <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.25 }}>{u.name}</span>
              <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>{u.city}</span>
            </button>
          ))}
          {filteredUnits.length === 0 && <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Tidak ada cabang yang cocok.</div>}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)", alignItems: "center", marginTop: "auto", paddingTop: "var(--space-4)", borderTop: "1px solid var(--color-divider)", fontSize: 12.5 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 7, color: "#B8860B" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E3A008", flex: "none" }} />0 Modul Perlu Dikerjakan
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 7, color: "var(--color-accent-2-700)" }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: "var(--color-accent-2)", flex: "none" }} />0 Modul Masih Selisih
          </span>
        </div>
        <div style={{ textAlign: "right", fontSize: 12, color: "var(--color-neutral-700)" }}>Versi Beta</div>
      </div>
    </div>
  );
}
