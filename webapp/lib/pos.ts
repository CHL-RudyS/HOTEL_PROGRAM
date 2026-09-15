import { prisma } from "@/lib/prisma";
import { rp } from "@/lib/format";

export async function getPosData(propertyId: string) {
  const outlet = await prisma.pOSOutlet.findFirstOrThrow({ where: { propertyId }, include: { menuItems: true } });
  const order = await prisma.pOSOrder.findFirst({ where: { outletId: outlet.id, status: "OPEN" }, include: { items: true, waiter: true } });

  const categories = [...new Set(outlet.menuItems.map((m) => m.category))];

  return {
    outletId: outlet.id,
    outletName: outlet.name,
    categories,
    itemsByCategory: Object.fromEntries(categories.map((cat) => [cat, outlet.menuItems.filter((m) => m.category === cat).map((m) => ({ id: m.id, name: m.name, price: m.price }))])),
    order: order
      ? {
          id: order.id,
          waiterName: order.waiter?.name ?? "Andi",
          lines: order.items.map((it) => ({ id: it.id, name: it.name, qty: it.qty, price: it.price, amount: rp(it.price * it.qty) })),
          subtotal: order.subtotal,
          serviceCharge: order.serviceCharge,
          tax: order.tax,
          total: order.total,
        }
      : null,
  };
}
