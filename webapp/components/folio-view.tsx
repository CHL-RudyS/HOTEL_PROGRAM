"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { rp } from "@/lib/format";
import { postCharge } from "@/app/(app)/front-desk/folio/actions";

type Folio = {
  id: string;
  type: string;
  label: string;
  ownerLabel: string;
  routingNote: string;
  balance: number;
  rows: { id: string; date: string; code: string; desc: string; debit: number; credit: number }[];
};

export function FolioView({ folios }: { folios: Folio[] }) {
  const router = useRouter();
  const [activeId, setActiveId] = useState(folios[0]?.id);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const active = folios.find((f) => f.id === activeId) ?? folios[0];

  async function submitCharge(e: React.FormEvent) {
    e.preventDefault();
    if (!active) return;
    setSubmitting(true);
    try {
      await postCharge(active.id, code, Number(amount), reason);
      setDialogOpen(false);
      setCode("");
      setAmount("");
      setReason("");
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  if (!active) return null;

  return (
    <>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
        {folios.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveId(f.id)}
            style={{
              border: 0, cursor: "pointer", background: "transparent", fontFamily: "var(--font-body)", fontSize: 13, padding: "0 0 6px",
              borderBottom: `2px solid ${active.id === f.id ? "var(--color-accent)" : "var(--color-divider)"}`,
              color: active.id === f.id ? "var(--color-accent-700)" : "var(--color-neutral-700)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "var(--space-4)" }}>
        <div>
          <div style={{ fontSize: 13, color: "var(--color-neutral-800)" }}>{active.ownerLabel}</div>
          <div style={{ fontSize: 12, color: "var(--color-neutral-700)", maxWidth: "62ch", marginTop: 4 }}>Routing: {active.routingNote}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-neutral-700)" }}>Saldo</div>
          <div style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 32, lineHeight: 1.1 }}>{rp(active.balance)}</div>
        </div>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Kode</th>
            <th>Deskripsi</th>
            <th style={{ textAlign: "right" }}>Debit</th>
            <th style={{ textAlign: "right" }}>Kredit</th>
          </tr>
        </thead>
        <tbody>
          {active.rows.map((r) => (
            <tr key={r.id}>
              <td style={{ whiteSpace: "nowrap" }}>{r.date}</td>
              <td style={{ fontSize: 11, color: "var(--color-accent-700)", whiteSpace: "nowrap" }}>{r.code}</td>
              <td>{r.desc}</td>
              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{r.debit ? rp(r.debit) : "—"}</td>
              <td style={{ textAlign: "right", whiteSpace: "nowrap" }}>{r.credit ? rp(r.credit) : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-2)" }}>
        <button className="btn btn-primary" onClick={() => setDialogOpen(true)}>
          Posting charge
        </button>
        <button className="btn btn-secondary">Split bill</button>
        <button className="btn btn-secondary">Transfer ke city ledger</button>
        <button className="btn btn-secondary">Pembayaran</button>
        <button className="btn btn-secondary">Cetak / email invoice</button>
      </div>
      <div style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>Setiap adjustment, rebate, dan void wajib mencantumkan alasan dan otorisasi supervisor. Semua perubahan tercatat di audit log.</div>

      {dialogOpen && (
        <div className="dialog-backdrop" onClick={() => setDialogOpen(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-title">Posting manual charge</div>
            <form onSubmit={submitCharge} className="dialog-body" style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <div className="field">
                <label>Kode charge</label>
                <input className="input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="mis. FB-RST" />
              </div>
              <div className="field">
                <label>Jumlah (IDR)</label>
                <input className="input" type="number" min={1} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
              </div>
              <div className="field">
                <label>Alasan (wajib)</label>
                <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tulis alasan posting" required />
              </div>
              <div style={{ fontSize: 11, color: "var(--color-neutral-700)" }}>Butuh otorisasi supervisor untuk nilai di atas Rp 1.000.000.</div>
              <div className="dialog-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setDialogOpen(false)}>
                  Batal
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary">
                  {submitting ? "…" : "Posting"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
