"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { FolioType, ReservationStatus, Prisma } from "@prisma/client";
import { redirect } from "next/navigation";

function startOfDay(d: Date) {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}
const TODAY = startOfDay(new Date());

export async function updateGuestContact(reservationId: string, phone: string, preferences: string) {
  const session = await requireSession();
  const reservation = await prisma.reservation.findUniqueOrThrow({ where: { id: reservationId } });
  await prisma.guest.update({ where: { id: reservation.guestId }, data: { phone, preferences } });
  await prisma.auditLog.create({
    data: { userId: session.user.id, entity: "Guest", entityId: reservation.guestId, action: "update_contact", newValue: { phone, preferences } },
  });
}

export async function createWalkIn(guestName: string, roomTypeId: string) {
  const session = await requireSession();
  const guest = await prisma.guest.create({ data: { name: guestName } });
  const ratePlan = await prisma.ratePlan.findFirstOrThrow({ where: { propertyId: session.user.homePropertyId, code: "BAR" } });
  const reservation = await prisma.reservation.create({
    data: {
      code: "WI" + Date.now().toString(36).toUpperCase(),
      propertyId: session.user.homePropertyId,
      guestId: guest.id,
      source: "Walk-in",
      arrival: TODAY,
      departure: new Date(TODAY.getTime() + 86400000),
      status: ReservationStatus.CONFIRMED,
    },
  });
  await prisma.reservationRoom.create({ data: { reservationId: reservation.id, roomTypeId, ratePlanId: ratePlan.id } });
  redirect(`/front-desk/checkin?reservationId=${reservation.id}`);
}

export async function assignRoomAndCheckIn(reservationId: string, roomId: string | null) {
  const session = await requireSession();
  const reservation = await prisma.reservation.findUniqueOrThrow({
    where: { id: reservationId },
    include: { guest: true, corporateAccount: true, rooms: { include: { roomType: true, ratePlan: true, room: true } }, folios: true },
  });

  for (const rr of reservation.rooms) {
    if (!rr.roomId) {
      const targetRoomId = roomId;
      if (!targetRoomId) throw new Error("Kamar belum dipilih");
      await prisma.reservationRoom.update({ where: { id: rr.id }, data: { roomId: targetRoomId, checkInAt: new Date() } });
      await prisma.room.update({ where: { id: targetRoomId }, data: { status: "OC" } });
    } else {
      await prisma.room.update({ where: { id: rr.roomId }, data: { status: "OC" } });
    }
  }

  await prisma.reservation.update({ where: { id: reservationId }, data: { status: ReservationStatus.IN_HOUSE } });

  // Group bookings (and any reservation with pre-seeded billing) already have
  // a folio — e.g. the master Folio C for a group. Only spin up a fresh
  // Folio A when the reservation has no folio at all yet.
  let folioId = reservation.folios[0]?.id;
  if (!folioId) {
    const nights = Math.round((reservation.departure.getTime() - reservation.arrival.getTime()) / 86400000);
    const primary = reservation.rooms[0];
    const roomNo = roomId && !primary.roomId ? (await prisma.room.findUnique({ where: { id: roomId } }))?.number : primary.room?.number;
    try {
      const folio = await prisma.folio.create({
        data: {
          reservationId,
          type: FolioType.A,
          ownerLabel: `${reservation.guest.name} · Kamar ${roomNo ?? "-"} · ${nights} malam`,
          routingNote: reservation.corporateAccount ? `Room charge & pajak → folio korporat. Incidental tetap di folio ini.` : "Seluruh charge tetap di folio ini.",
        },
      });
      folioId = folio.id;
      const nightlyRate = primary.roomType.barRate;
      await prisma.folioTransaction.create({
        data: { folioId, date: TODAY, code: "ROOM", description: `Room charge ${primary.roomType.name} ${roomNo ?? ""}`.trim(), debit: nightlyRate, credit: 0 },
      });
    } catch (err) {
      // Two concurrent "Selesaikan check-in" submissions (e.g. two front-desk
      // tabs on the same reservation) could otherwise both see no folio yet
      // and each create their own Folio A + room-charge transaction. The
      // unique (reservationId, type) constraint lets the DB reject the
      // loser; it just reuses the winner's folio instead of duplicating it.
      if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
        folioId = (await prisma.folio.findFirstOrThrow({ where: { reservationId } })).id;
      } else {
        throw err;
      }
    }
  }

  await prisma.auditLog.create({
    data: { userId: session.user.id, entity: "Reservation", entityId: reservationId, action: "check_in", newValue: { roomId } },
  });

  return { folioId };
}
