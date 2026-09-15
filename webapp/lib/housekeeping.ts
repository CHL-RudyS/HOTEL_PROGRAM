import { prisma } from "@/lib/prisma";

const ACTION_LABEL: Record<string, string> = {
  VD: "Mulai bersihkan",
  CLEANING: "Tandai selesai",
  VC: "Minta inspeksi",
  VI: "Sudah di-inspect — reset",
};
const STATUS_LABEL: Record<string, string> = {
  VD: "Vacant Dirty",
  CLEANING: "Sedang dibersihkan",
  VC: "Vacant Clean",
  VI: "Vacant Inspected",
};
const PRIORITY_CLASS: Record<string, string> = {
  "VIP arrival": "tag tag-accent-2",
  Discrepancy: "tag tag-accent-2",
  "Early check-in": "tag tag-outline",
  "Due-out": "tag tag-accent",
  Normal: "tag tag-neutral",
};

export async function getHousekeepingData(propertyId: string) {
  const tasks = await prisma.housekeepingTask.findMany({
    where: { room: { propertyId } },
    include: { room: { include: { roomType: true } }, assignee: true },
    // id as a tiebreaker: seed data batch-inserts all tasks with the same
    // createdAt, so sorting on createdAt alone reorders the list whenever a
    // row is updated (its physical tuple moves) — id is stable across updates.
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
  });

  const assignee = tasks[0]?.assignee;
  const floors = [...new Set(tasks.map((t) => t.room.floor))].sort((a, b) => a - b);
  const done = tasks.filter((t) => t.status === "VC" || t.status === "VI").length;

  return {
    assigneeName: assignee?.name ?? "—",
    zoneLabel: floors.length ? `Zona lantai ${floors.join("–")}` : "",
    done,
    total: tasks.length,
    tasks: tasks.map((t) => ({
      id: t.id,
      no: t.room.number,
      type: t.room.roomType.name,
      prio: t.priority,
      prioClass: PRIORITY_CLASS[t.priority] ?? "tag tag-neutral",
      status: STATUS_LABEL[t.status],
      statusCode: t.status,
      note: t.note,
      action: ACTION_LABEL[t.status],
      canFinishInspect: t.status === "VC",
    })),
  };
}
