"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SCREENS, screenForPath } from "@/lib/screens";

export function MenuLayar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const current = screenForPath(pathname);
  const q = query.toLowerCase();
  const items = useMemo(
    () => SCREENS.filter((it) => !q || it.label.toLowerCase().includes(q) || it.num.toLowerCase().includes(q)),
    [q]
  );

  function go(href: string) {
    setOpen(false);
    setQuery("");
    router.push(href);
  }

  return (
    <div
      style={{
        position: "fixed",
        left: "var(--space-4)",
        bottom: "var(--space-4)",
        zIndex: 80,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "var(--space-2)",
      }}
    >
      {open && (
        <div
          style={{
            width: 286,
            background: "var(--color-neutral-800)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-lg)",
            padding: "var(--space-3)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-2)",
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--color-bg)", opacity: 0.6, padding: "0 var(--space-2)" }}>
            Menu Layar
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari layar"
            style={{
              width: "100%",
              boxSizing: "border-box",
              background: "var(--color-neutral-700)",
              border: 0,
              borderRadius: 999,
              padding: "8px 14px",
              fontFamily: "var(--font-body)",
              fontSize: 13,
              color: "var(--color-bg)",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 1, maxHeight: 320, overflowY: "auto" }}>
            {items.map((item) => {
              const active = current?.href === item.href;
              return (
                <button
                  key={item.href}
                  onClick={() => go(item.href)}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 10,
                    width: "100%",
                    textAlign: "left",
                    border: 0,
                    cursor: "pointer",
                    borderRadius: 999,
                    padding: "8px 14px",
                    fontFamily: "var(--font-body)",
                    fontSize: 14,
                    background: active ? "var(--color-accent)" : "transparent",
                    color: "var(--color-bg)",
                  }}
                >
                  <span style={{ fontFamily: "var(--font-heading)", fontSize: 12, opacity: 0.6, width: 20, flex: "none" }}>{item.num}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: "var(--space-2)", background: "var(--color-neutral-800)", borderRadius: 999, padding: 7, boxShadow: "var(--shadow-lg)" }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: 0,
            cursor: "pointer",
            background: "var(--color-neutral-700)",
            color: "var(--color-bg)",
            borderRadius: 999,
            padding: "7px 16px",
            fontFamily: "var(--font-heading)",
            fontWeight: 600,
            fontSize: 15,
          }}
        >
          <span style={{ opacity: 0.65 }}>{current?.num ?? ""}</span>
          <span>{current?.label ?? ""}</span>
        </button>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label="Cari layar"
          style={{
            width: 34,
            height: 34,
            flex: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: 0,
            cursor: "pointer",
            borderRadius: 999,
            background: "var(--color-bg)",
            color: "var(--color-neutral-900)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 256 256" fill="currentColor" aria-hidden="true">
            <path d="M112 40a72 72 0 1 0 72 72 72 72 0 0 0-72-72Z" opacity="0.2"></path>
            <path d="m229.66 218.34-50.07-50.06a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.32ZM40 112a72 72 0 1 1 72 72 72.08 72.08 0 0 1-72-72Z"></path>
          </svg>
        </button>
      </div>
    </div>
  );
}
