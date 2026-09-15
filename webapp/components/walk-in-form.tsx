"use client";

import { useState } from "react";
import { createWalkIn } from "@/app/(app)/front-desk/checkin/actions";
import { rp } from "@/lib/format";

export function WalkInForm({ roomTypes }: { roomTypes: { id: string; name: string; barRate: number }[] }) {
  const [name, setName] = useState("");
  const [roomTypeId, setRoomTypeId] = useState(roomTypes[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);

  return (
    <div style={{ maxWidth: 420 }}>
      <h4 style={{ margin: "0 0 var(--space-3)" }}>Check-in walk-in</h4>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          if (!name.trim() || !roomTypeId) return;
          setSubmitting(true);
          await createWalkIn(name.trim(), roomTypeId);
        }}
        style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}
      >
        <div className="field">
          <label>Nama tamu</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama lengkap tamu" />
        </div>
        <div className="field">
          <label>Tipe kamar</label>
          <select className="input" value={roomTypeId} onChange={(e) => setRoomTypeId(e.target.value)}>
            {roomTypes.map((rt) => (
              <option key={rt.id} value={rt.id}>
                {rt.name} — {rp(rt.barRate)}/malam
              </option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={submitting} className="btn btn-primary btn-block">
          {submitting ? "…" : "Mulai check-in"}
        </button>
      </form>
    </div>
  );
}
