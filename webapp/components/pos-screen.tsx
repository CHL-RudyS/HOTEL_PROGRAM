"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rp } from "@/lib/format";
import { addMenuItem, decrementItem, chargeToRoom } from "@/app/(app)/front-desk/pos/actions";

type MenuItem = { id: string; name: string; price: number };
type OrderLine = { id: string; name: string; qty: number; price: number; amount: string };
type Order = { id: string; waiterName: string; lines: OrderLine[]; subtotal: number; serviceCharge: number; tax: number; total: number };

export function PosScreen({ outletId, outletName, categories, itemsByCategory, order }: { outletId: string; outletName: string; categories: string[]; itemsByCategory: Record<string, MenuItem[]>; order: Order | null }) {
  const router = useRouter();
  const [cat, setCat] = useState(categories[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [roomNumber, setRoomNumber] = useState("0912");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function add(menuItemId: string) {
    try {
      await addMenuItem(outletId, menuItemId);
      router.refresh();
    } catch {
      // best-effort — a stale click failing here isn't worth a modal
    }
  }
  async function minus(orderItemId: string) {
    try {
      await decrementItem(orderItemId);
      router.refresh();
    } catch {
      // best-effort — a stale click failing here isn't worth a modal
    }
  }
  async function submitCharge(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setBusy(true);
    setError("");
    try {
      await chargeToRoom(order.id, roomNumber);
      setDialogOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-6)", alignItems: "flex-start" }}>
      <div style={{ flex: 1, minWidth: 320, display: "flex", flexDirection: "column", gap: "var(--space-4)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "var(--space-3)" }}>
          <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>Outlet</span>
          <strong style={{ fontWeight: 600, fontSize: 13 }}>{outletName}</strong>
          <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>Meja 12 &middot; 2 pax &middot; Waiter {order?.waiterName ?? "Andi"}</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              style={{ border: 0, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, padding: "6px 14px", borderRadius: 2, background: cat === c ? "var(--color-accent)" : "var(--color-surface)", color: cat === c ? "var(--color-bg)" : "var(--color-text)" }}
            >
              {c}
            </button>
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(148px,1fr))", gap: "var(--space-2)" }}>
          {itemsByCategory[cat]?.map((it) => (
            <button
              key={it.id}
              onClick={() => add(it.id)}
              style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-2)", minHeight: 82, padding: "var(--space-3)", border: 0, cursor: "pointer", borderRadius: 2, background: "var(--color-surface)", fontFamily: "var(--font-body)", textAlign: "left" }}
            >
              <span style={{ fontSize: 13, lineHeight: 1.3 }}>{it.name}</span>
              <span style={{ fontSize: 12, color: "var(--color-accent-700)" }}>{rp(it.price)}</span>
            </button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>Modifier, set menu, dan happy hour pricing mengikuti konfigurasi outlet. Void dan diskon butuh otorisasi supervisor.</div>
      </div>

      <div style={{ width: 320, flex: "none", display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
        <h4 style={{ margin: 0 }}>Order meja 12</h4>
        {(!order || order.lines.length === 0) && <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Belum ada item. Pilih menu di sebelah kiri.</div>}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {order?.lines.map((l) => (
            <div key={l.id} style={{ display: "flex", alignItems: "baseline", gap: "var(--space-2)", padding: "var(--space-2) 0", borderBottom: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)" }}>
              <span style={{ width: 26, flex: "none", fontSize: 12, color: "var(--color-neutral-700)" }}>×{l.qty}</span>
              <span style={{ flex: 1, fontSize: 13 }}>{l.name}</span>
              <span style={{ fontSize: 13, whiteSpace: "nowrap" }}>{l.amount}</span>
              <button onClick={() => minus(l.id)} className="btn btn-ghost" style={{ fontSize: 12, padding: "0 4px" }}>
                −
              </button>
            </div>
          ))}
        </div>
        <div style={{ fontSize: 13, lineHeight: 1.9, color: "var(--color-neutral-800)" }}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Subtotal</span>
            <span>{rp(order?.subtotal ?? 0)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>Service charge 11%</span>
            <span>{rp(order?.serviceCharge ?? 0)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span>PB1 10%</span>
            <span>{rp(order?.tax ?? 0)}</span>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "var(--space-2)", borderTop: "1px solid var(--color-divider)" }}>
          <span style={{ fontSize: 13 }}>Total</span>
          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 26 }}>{rp(order?.total ?? 0)}</span>
        </div>
        <button className="btn btn-primary btn-block" disabled={!order || order.lines.length === 0} onClick={() => setDialogOpen(true)}>
          Charge to room
        </button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
            Tunai
          </button>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
            QRIS
          </button>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
            Kartu
          </button>
          <button className="btn btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>
            Split bill
          </button>
        </div>
      </div>

      {dialogOpen && order && (
        <div className="dialog-backdrop" onClick={() => setDialogOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">Charge to room</div>
            <form onSubmit={submitCharge} className="dialog-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div className="field">
                <label>Nomor kamar</label>
                <input className="input" value={roomNumber} onChange={(e) => setRoomNumber(e.target.value)} />
              </div>
              {error && <div style={{ fontSize: 12, color: "var(--color-accent-2-700)" }}>{error}</div>}
              <div style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Routing: F&amp;B akan diposting ke folio tamu yang sedang in-house di kamar tersebut.</div>
              <div className="dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setDialogOpen(false)}>
                  Batal
                </button>
                <button type="submit" disabled={busy} className="btn btn-primary">
                  {busy ? "…" : "Posting ke folio"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
