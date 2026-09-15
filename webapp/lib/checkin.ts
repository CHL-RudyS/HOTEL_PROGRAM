import { prisma } from "@/lib/prisma";

export async function getCheckinContext(reservationId: string) {
  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      guest: true,
      corporateAccount: true,
      rooms: { include: { roomType: true, room: true, ratePlan: true } },
      folios: true,
    },
  });
  if (!reservation) return null;

  const unassigned = reservation.rooms.find((r) => !r.roomId);
  let candidateRooms: { id: string; number: string; floor: number; status: string; note: string | null }[] = [];
  if (unassigned) {
    const rooms = await prisma.room.findMany({
      where: { propertyId: reservation.propertyId, roomTypeId: unassigned.roomTypeId, status: { in: ["VI", "VC"] } },
      orderBy: [{ status: "asc" }, { number: "asc" }],
      take: 6,
    });
    candidateRooms = rooms.map((r) => ({ id: r.id, number: r.number, floor: r.floor, status: r.status, note: r.note }));
  }

  return { reservation, unassignedRoomTypeId: unassigned?.roomTypeId ?? null, candidateRooms };
}

export async function getRoomTypesForWalkIn(propertyId: string) {
  return prisma.roomType.findMany({ where: { propertyId }, orderBy: { barRate: "asc" } });
}
