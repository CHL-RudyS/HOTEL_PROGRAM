import { requireSession } from "@/lib/session";
import { ScreenHeader } from "@/components/screen-header";
import { getCheckinContext, getRoomTypesForWalkIn } from "@/lib/checkin";
import { CheckinWizard } from "@/components/checkin-wizard";
import { WalkInForm } from "@/components/walk-in-form";

export default async function CheckinPage({ searchParams }: { searchParams: { reservationId?: string } }) {
  const session = await requireSession();

  if (!searchParams.reservationId) {
    const roomTypes = await getRoomTypesForWalkIn(session.user.homePropertyId);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <ScreenHeader title="FD - Check-in Wizard" />
        <WalkInForm roomTypes={roomTypes.map((rt) => ({ id: rt.id, name: rt.name, barRate: rt.barRate }))} />
      </div>
    );
  }

  const ctx = await getCheckinContext(searchParams.reservationId);
  if (!ctx) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
        <ScreenHeader title="FD - Check-in Wizard" />
        <p>Reservasi tidak ditemukan.</p>
      </div>
    );
  }

  const { reservation, candidateRooms } = ctx;
  const nights = Math.round((reservation.departure.getTime() - reservation.arrival.getTime()) / 86400000);
  const primary = reservation.rooms[0];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
      <ScreenHeader title="FD - Check-in Wizard" />
      <CheckinWizard
        reservationId={reservation.id}
        code={reservation.code}
        guestName={reservation.guest.name}
        guestIdNumber={reservation.guest.idNumber}
        guestPhone={reservation.guest.phone ?? ""}
        preferences={reservation.guest.preferences ?? ""}
        vipTag={reservation.vipTag}
        roomTypeName={primary?.roomType.name ?? "—"}
        nightlyRate={primary?.roomType.barRate ?? 0}
        nights={nights}
        adults={reservation.adults}
        arrivalLabel={reservation.arrival.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}
        departureLabel={reservation.departure.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}
        alreadyAssignedRoomNumber={primary?.room?.number ?? null}
        needsRoomPick={!primary?.roomId}
        candidateRooms={candidateRooms}
        isGroup={!!reservation.groupCode}
        groupRoomCount={reservation.rooms.length}
        alreadyInHouse={reservation.status === "IN_HOUSE"}
      />
    </div>
  );
}
