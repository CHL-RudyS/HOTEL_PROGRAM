"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

async function recomputeTotals(orderId: string) {
  const items = await prisma.pOSOrderItem.findMany({ where: { orderId } });
  const subtotal = items.reduce((a, it) => a + it.price * it.qty, 0);
  const serviceCharge = Math.round(subtotal * 0.11);
  const tax = Math.round((subtotal + serviceCharge) * 0.1);
  const total = subtotal + serviceCharge + tax;
  await prisma.pOSOrder.update({ where: { id: orderId }, data: { subtotal, serviceCharge, tax, total } });
}

async function getOrCreateOpenOrder(outletId: string) {
  const existing = await prisma.pOSOrder.findFirst({ where: { outletId, status: "OPEN" } });
  if (existing) return existing;
  // Two concurrent requests (e.g. a double-tap on a touch POS) can both see
  // no open order and race to create one; openOutletKey's unique constraint
  // lets the DB reject the loser instead of silently creating a duplicate
  // order, and we just fetch the winner's row instead.
  try {
    const waiter = await prisma.employee.findFirst({ where: { department: "FNB" } });
    return await prisma.pOSOrder.create({ data: { outletId, tableNumber: "12", paxCount: 2, waiterId: waiter?.id, openOutletKey: outletId } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return await prisma.pOSOrder.findFirstOrThrow({ where: { outletId, status: "OPEN" } });
    }
    throw err;
  }
}

export async function addMenuItem(outletId: string, menuItemId: string) {
  await requireSession();
  const order = await getOrCreateOpenOrder(outletId);
  const menuItem = await prisma.pOSMenuItem.findUniqueOrThrow({ where: { id: menuItemId } });
  // upsert on the (orderId, menuItemId) unique constraint: atomic at the DB
  // level, so concurrent add-clicks increment one row instead of racing to
  // each create their own duplicate line.
  await prisma.pOSOrderItem.upsert({
    where: { orderId_menuItemId: { orderId: order.id, menuItemId } },
    update: { qty: { increment: 1 } },
    create: { orderId: order.id, menuItemId, name: menuItem.name, qty: 1, price: menuItem.price },
  });
  await recomputeTotals(order.id);
  revalidatePath("/front-desk/pos");
}

export async function decrementItem(orderItemId: string) {
  await requireSession();
  // Idempotent: a double-click (or stale UI) may target a line already
  // removed by a previous click — treat that as a no-op, not an error.
  const item = await prisma.pOSOrderItem.findUnique({ where: { id: orderItemId } });
  if (!item) return;
  if (item.qty > 1) {
    await prisma.pOSOrderItem.update({ where: { id: orderItemId }, data: { qty: item.qty - 1 } });
  } else {
    await prisma.pOSOrderItem.delete({ where: { id: orderItemId } });
  }
  await recomputeTotals(item.orderId);
  revalidatePath("/front-desk/pos");
}

export async function chargeToRoom(orderId: string, roomNumber: string) {
  const session = await requireSession();
  const order = await prisma.pOSOrder.findUniqueOrThrow({ where: { id: orderId }, include: { outlet: true } });
  const room = await prisma.room.findFirst({ where: { propertyId: session.user.homePropertyId, number: roomNumber.trim() } });
  if (!room) throw new Error("Kamar tidak ditemukan");

  const occupant = await prisma.reservationRoom.findFirst({
    where: { roomId: room.id, reservation: { status: "IN_HOUSE" } },
    include: { reservation: { include: { folios: true, guest: true } } },
  });
  if (!occupant) throw new Error("Kamar tidak sedang ditempati tamu in-house");

  let folio = occupant.reservation.folios.find((f) => f.type === "A");
  if (!folio) {
    folio = await prisma.folio.create({
      data: { reservationId: occupant.reservationId, type: "A", ownerLabel: `${occupant.reservation.guest.name} · Kamar ${room.number}`, routingNote: "Seluruh charge tetap di folio ini." },
    });
  }

  await prisma.folioTransaction.create({
    data: { folioId: folio.id, date: new Date(new Date().toDateString()), code: "FB-RST", description: `${order.outlet.name} — meja ${order.tableNumber}`, debit: order.total, credit: 0, postedById: session.user.id },
  });
  await prisma.pOSOrder.update({ where: { id: orderId }, data: { status: "CLOSED", openOutletKey: null } });
  await prisma.auditLog.create({ data: { userId: session.user.id, entity: "POSOrder", entityId: orderId, action: "charge_to_room", newValue: { roomNumber } } });

  revalidatePath("/front-desk/pos");
  revalidatePath("/front-desk/folio");
}
