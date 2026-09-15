import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { UnitScreen } from "@/components/unit-screen";

export default async function UnitPage() {
  const session = await requireSession();
  const corporations = await prisma.corporation.findMany({
    include: { properties: { orderBy: { name: "asc" } } },
    orderBy: { name: "asc" },
  });

  return (
    <UnitScreen
      userName={session.user.name ?? ""}
      roleLabel={session.user.role === "BACK_OFFICE" ? "Back Office" : "Front Office"}
      corporations={corporations.map((c) => ({
        id: c.id,
        name: c.name,
        units: c.properties.map((p) => ({ id: p.id, code: p.code, name: p.name, city: p.city })),
      }))}
    />
  );
}
