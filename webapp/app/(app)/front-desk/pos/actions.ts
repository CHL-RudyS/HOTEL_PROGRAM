"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

async function recomputeTotals(orderId: string) {
  const items = await prisma.pOSOrderItem.findMany({ where: { orderId } });
  const subtotal = items.reduce((a, it) => a + it.price * it.qty, 0);
  const serviceCharge = Math.round(subtotal * 0.11);
  const tax = Math.round((subtotal + serviceCharge) * 0.1);
  const total = subtotal + serviceCharge + tax;
  await prisma.pOSOrder.update({ where: { id: orderId }, data: { subtotal, serviceCharge, tax, total } });
}

async function getOrCreateOpenOrder(outletId: string) {
  let order = await prisma.pOSOrder.findFirst({ where: { outletId, status: "OPEN" } });
  if (!order) {
    const waiter = await prisma.employee.findFirst({ where: { department: "FNB" } });
    order = await prisma.pOSOrder.create({ data: { outletId, tableNumber: "12", paxCount: 2, waiterId: waiter?.id } });
  }
  return order;
}

export async function addMenuItem(outletId: string, menuItemId: string) {
  await requireSession();
  const order = await getOrCreateOpenOrder(outletId);
  const menuItem = await prisma.pOSMenuItem.findUniqueOrThrow({ where: { id: menuItemId } });
  const existing = await prisma.pOSOrderItem.findFirst({ where: { orderId: order.id, menuItemId } });
  if (existing) {
    await prisma.pOSOrderItem.update({ where: { id: existing.id }, data: { qty: existing.qty + 1 } });
  } else {
    await prisma.pOSOrderItem.create({ data: { orderId: order.id, menuItemId, name: menuItem.name, qty: 1, price: menuItem.price } });
  }
  await recomputeTotals(order.id);
  revalidatePath("/front-desk/pos");
}

export async function decrementItem(orderItemId: string) {
  await requireSession();
  const item = await prisma.pOSOrderItem.findUniqueOrThrow({ where: { id: orderItemId } });
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
  await prisma.pOSOrder.update({ where: { id: orderId }, data: { status: "CLOSED" } });
  await prisma.auditLog.create({ data: { userId: session.user.id, entity: "POSOrder", entityId: orderId, action: "charge_to_room", newValue: { roomNumber } } });

  revalidatePath("/front-desk/pos");
  revalidatePath("/front-desk/folio");
}
