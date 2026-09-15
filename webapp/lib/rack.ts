import { prisma } from "@/lib/prisma";

export async function getRackData(propertyId: string) {
  const rooms = await prisma.room.findMany({ where: { propertyId }, include: { roomType: true }, orderBy: [{ floor: "asc" }, { number: "asc" }] });

  const occupied = await prisma.reservationRoom.findMany({
    where: { reservation: { propertyId, status: "IN_HOUSE" }, roomId: { not: null } },
    include: { reservation: { include: { guest: true } } },
  });
  const occupantByRoom = new Map(
    occupied.map((rr) => [
      rr.roomId as string,
      `${rr.reservation.guest.name} · check-out ${rr.reservation.departure.toLocaleDateString("id-ID", { day: "2-digit", month: "short" })}`,
    ])
  );

  const openWorkOrders = await prisma.workOrder.findMany({ where: { propertyId, status: { not: "DONE" }, roomId: { not: null } } });
  const workOrderByRoom = new Map(openWorkOrders.map((w) => [w.roomId as string, `Work order ${w.code} — ${w.description}`]));

  function guestLine(status: string, roomId: string) {
    if (status === "OC" || status === "OD") return occupantByRoom.get(roomId) ?? "Tamu in-house";
    if (status === "OOO" || status === "OOS") return workOrderByRoom.get(roomId) ?? "Perlu work order — belum dibuat";
    return "Kosong — siap ditugaskan";
  }

  const floorsMap = new Map<number, typeof rooms>();
  for (const r of rooms) {
    if (!floorsMap.has(r.floor)) floorsMap.set(r.floor, []);
    floorsMap.get(r.floor)!.push(r);
  }
  const floors = [...floorsMap.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([floor, list]) => ({
      floor: `Lantai ${floor}`,
      rooms: list.map((r) => ({ id: r.id, no: r.number, status: r.status, roomTypeName: r.roomType.name, guestLine: guestLine(r.status, r.id) })),
    }));

  const discrepancyTask = await prisma.housekeepingTask.findFirst({ where: { priority: "Discrepancy", room: { propertyId } }, include: { room: true } });

  return { floors, discrepancyRoomNumber: discrepancyTask?.room.number ?? null };
}
