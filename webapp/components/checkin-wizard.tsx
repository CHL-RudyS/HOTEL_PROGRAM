"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { rp } from "@/lib/format";
import { updateGuestContact, assignRoomAndCheckIn } from "@/app/(app)/front-desk/checkin/actions";

type Room = { id: string; number: string; floor: number; status: string; note: string | null };

export function CheckinWizard(props: {
  reservationId: string;
  code: string;
  guestName: string;
  guestIdNumber: string | null;
  guestPhone: string;
  preferences: string;
  vipTag: string | null;
  roomTypeName: string;
  nightlyRate: number;
  nights: number;
  adults: number;
  arrivalLabel: string;
  departureLabel: string;
  alreadyAssignedRoomNumber: string | null;
  needsRoomPick: boolean;
  candidateRooms: Room[];
  isGroup: boolean;
  groupRoomCount: number;
  alreadyInHouse: boolean;
}) {
  const STEPS = props.needsRoomPick
    ? ["Verifikasi identitas", "Pilih kamar", "Registration card", "Encode kunci", "Selesai"]
    : ["Verifikasi identitas", "Registration card", "Encode kunci", "Selesai"];

  const [stepIdx, setStepIdx] = useState(0);
  const [phone, setPhone] = useState(props.guestPhone);
  const [preferences, setPreferences] = useState(props.preferences);
  const [pickedRoomId, setPickedRoomId] = useState<string | null>(props.candidateRooms[0]?.id ?? null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  if (props.alreadyInHouse) {
    return (
      <div style={{ maxWidth: 520 }}>
        <h3 style={{ margin: "0 0 var(--space-2)" }}>{props.guestName} sudah check-in</h3>
        <p style={{ fontSize: 13, color: "var(--color-neutral-800)" }}>Reservasi ini sudah berstatus in-house.</p>
        <Link href={`/front-desk/folio?reservationId=${props.reservationId}`} className="btn btn-primary">
          Buka folio
        </Link>
      </div>
    );
  }

  const stepKey = STEPS[stepIdx];
  const pickedRoom = props.candidateRooms.find((r) => r.id === pickedRoomId);
  const roomNumberForSummary = props.alreadyAssignedRoomNumber ?? pickedRoom?.number ?? "-";
  const total = props.nightlyRate * props.nights;
  const tax = Math.round(total * 0.21);

  async function goNext() {
    setError("");
    try {
      if (stepKey === "Verifikasi identitas") {
        setBusy(true);
        await updateGuestContact(props.reservationId, phone, preferences);
        setStepIdx((i) => i + 1);
      } else if (stepKey === "Pilih kamar" || stepKey === "Registration card") {
        setStepIdx((i) => i + 1);
      } else if (stepKey === "Encode kunci") {
        setBusy(true);
        await assignRoomAndCheckIn(props.reservationId, pickedRoomId);
        setStepIdx((i) => i + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memproses check-in");
      // The picked room may have just been taken by another terminal; pull a
      // fresh candidate list and send the user back to choose again.
      const pickIdx = STEPS.indexOf("Pilih kamar");
      if (stepKey === "Encode kunci" && pickIdx >= 0) {
        setPickedRoomId(null);
        setStepIdx(pickIdx);
        router.refresh();
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ maxWidth: 880, display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-4)" }}>
        {STEPS.map((label, i) => {
          const n = i + 1;
          const done = i < stepIdx;
          const now = i === stepIdx;
          return (
            <button
              key={label}
              onClick={() => (done ? setStepIdx(i) : undefined)}
              style={{
                display: "flex", alignItems: "baseline", gap: 8, border: 0, cursor: done ? "pointer" : "default", background: "transparent", padding: "0 0 6px",
                fontFamily: "var(--font-body)", fontSize: 13, textAlign: "left",
                borderBottom: `2px solid ${now ? "var(--color-accent)" : done ? "var(--color-accent-300)" : "var(--color-divider)"}`,
                color: now ? "var(--color-accent-700)" : done ? "var(--color-text)" : "var(--color-neutral-600)",
              }}
            >
              <span style={{ fontSize: 10, letterSpacing: "0.1em" }}>{String(n).padStart(2, "0")}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "var(--space-3)" }}>
        <h3 style={{ margin: 0 }}>{props.guestName}</h3>
        {props.vipTag && <span className="tag tag-accent-2">{props.vipTag}</span>}
        <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>
          {props.code} &middot; {props.roomTypeName} &middot; {props.arrivalLabel}&ndash;{props.departureLabel} &middot; {props.adults} dewasa
          {props.isGroup ? ` · ${props.groupRoomCount} kamar` : ""}
        </span>
      </div>

      {error && (
        <div style={{ fontSize: 13, color: "var(--color-accent-2-700)", background: "color-mix(in srgb, var(--color-accent-2) 8%, transparent)", padding: "var(--space-3)" }}>
          {error}
        </div>
      )}

      {stepKey === "Verifikasi identitas" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "var(--space-6)" }}>
          <div>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>Pindai identitas</h4>
            <div style={{ aspectRatio: "16/10", background: "var(--color-surface)", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", fontSize: 12, color: "var(--color-neutral-700)", padding: "var(--space-4)" }}>
              KTP terbaca via OCR
              <br />
              NIK terverifikasi &middot; 0,8 detik
            </div>
            <div style={{ fontSize: 11, color: "var(--color-neutral-700)", marginTop: "var(--space-2)" }}>Data identitas disimpan terenkripsi sesuai UU PDP No. 27/2022.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
            <div className="field">
              <label>Nama lengkap</label>
              <input className="input" value={props.guestName} readOnly />
            </div>
            <div className="field">
              <label>NIK</label>
              <input className="input" value={props.guestIdNumber ?? "—"} readOnly />
            </div>
            <div className="field">
              <label>Telepon</label>
              <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="field">
              <label>Catatan preferensi</label>
              <input className="input" value={preferences} onChange={(e) => setPreferences(e.target.value)} />
            </div>
            <button className="btn btn-primary btn-block" disabled={busy} onClick={goNext}>
              {busy ? "…" : "Lanjut — pilih kamar"}
            </button>
          </div>
        </div>
      )}

      {stepKey === "Pilih kamar" && (
        <div>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "var(--space-3)", marginBottom: "var(--space-2)" }}>
            <h4 style={{ margin: 0 }}>Kamar tersedia — {props.roomTypeName}</h4>
            {pickedRoom && <span style={{ fontSize: 12, color: "var(--color-neutral-700)" }}>Auto-assign menyarankan {props.candidateRooms[0]?.number}</span>}
          </div>
          {props.candidateRooms.length === 0 && <p style={{ fontSize: 13, color: "var(--color-neutral-700)" }}>Tidak ada kamar siap saat ini — jalankan tugas Housekeeping dulu.</p>}
          {props.candidateRooms.map((r) => (
            <button
              key={r.id}
              onClick={() => setPickedRoomId(r.id)}
              style={{
                display: "flex", gap: "var(--space-3)", alignItems: "baseline", width: "100%", textAlign: "left", cursor: "pointer", padding: "var(--space-2)",
                border: 0, borderBottom: "1px solid color-mix(in srgb, var(--color-text) 8%, transparent)", fontFamily: "var(--font-body)",
                background: pickedRoomId === r.id ? "color-mix(in srgb, var(--color-accent) 10%, transparent)" : "transparent",
              }}
            >
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 19, width: 66, flex: "none" }}>{r.number}</span>
              <span style={{ width: 44, flex: "none", fontSize: 12, color: "var(--color-accent-700)" }}>{r.status}</span>
              <span style={{ flex: 1, fontSize: 12, color: "var(--color-neutral-700)" }}>{r.note ?? "—"}</span>
            </button>
          ))}
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
            <button className="btn btn-secondary" onClick={() => setStepIdx((i) => i - 1)}>
              Kembali
            </button>
            <button className="btn btn-primary" disabled={!pickedRoomId} onClick={goNext}>
              Kamar {pickedRoom?.number ?? "-"} — lanjut
            </button>
          </div>
        </div>
      )}

      {stepKey === "Registration card" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "var(--space-6)" }}>
          <div>
            <h4 style={{ margin: "0 0 var(--space-3)" }}>Registration card digital</h4>
            <div style={{ fontSize: 13, lineHeight: 1.9, color: "var(--color-neutral-800)" }}>
              <div>
                Kamar {roomNumberForSummary} &middot; {props.roomTypeName}
              </div>
              <div>Rate BAR {rp(props.nightlyRate)} / malam</div>
              <div>
                {props.nights} malam &middot; total {rp(total)}
              </div>
              <div>Pajak &amp; service 21% termasuk ({rp(tax)})</div>
              <div>Jaminan: kartu ter-tokenisasi &middot; deposit incidental Rp 500.000</div>
            </div>
          </div>
          <div>
            <div style={{ height: 120, background: "var(--color-surface)", display: "flex", alignItems: "flex-end", padding: "var(--space-3)", fontSize: 12, color: "var(--color-neutral-700)" }}>
              Tanda tangan elektronik — tablet tamu
            </div>
            <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-4)" }}>
              <button className="btn btn-secondary" onClick={() => setStepIdx((i) => i - 1)}>
                Kembali
              </button>
              <button className="btn btn-primary" onClick={goNext}>
                Setujui &amp; encode kunci
              </button>
            </div>
          </div>
        </div>
      )}

      {stepKey === "Encode kunci" && (
        <div style={{ maxWidth: 460 }}>
          <h4 style={{ margin: "0 0 var(--space-2)" }}>Encode kunci</h4>
          <p style={{ fontSize: 13, color: "var(--color-neutral-800)" }}>
            Kartu 1 dan 2 dikirim ke encoder meja 2. Masa berlaku sampai {props.departureLabel} 12:00, akses lift dan lounge eksekutif.
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
            <button className="btn btn-secondary" onClick={() => setStepIdx((i) => i - 1)}>
              Kembali
            </button>
            <button className="btn btn-primary" disabled={busy} onClick={goNext}>
              {busy ? "…" : "Selesaikan check-in"}
            </button>
          </div>
        </div>
      )}

      {stepKey === "Selesai" && (
        <div style={{ maxWidth: 520 }}>
          <div style={{ fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--color-accent)" }}>Check-in selesai</div>
          <h3 style={{ margin: "var(--space-2) 0" }}>Kamar {roomNumberForSummary} aktif, folio terbuka</h3>
          <p style={{ fontSize: 13, color: "var(--color-neutral-800)" }}>
            Status kamar berubah menjadi Occupied, kunci aktif, dan folio tamu sudah berisi room charge malam pertama.
          </p>
          <div style={{ display: "flex", gap: "var(--space-2)", marginTop: "var(--space-3)" }}>
            <Link href={`/front-desk/folio?reservationId=${props.reservationId}`} className="btn btn-primary">
              Buka folio
            </Link>
            <Link href="/front-desk" className="btn btn-secondary">
              Kembali ke dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
