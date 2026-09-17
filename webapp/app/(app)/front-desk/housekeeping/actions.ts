"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { HkTaskStatus, RoomStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

const NEXT_STATUS: Record<HkTaskStatus, HkTaskStatus> = {
  VD: "CLEANING",
  CLEANING: "VC",
  VC: "VI",
  VI: "VD",
};
const ROOM_STATUS_FOR: Partial<Record<HkTaskStatus, RoomStatus>> = {
  VD: "VD",
  VC: "VC",
  VI: "VI",
};

export async function advanceHkTask(taskId: string) {
  const session = await requireSession();
  const task = await prisma.housekeepingTask.findUniqueOrThrow({ where: { id: taskId } });
  const next = NEXT_STATUS[task.status];

  // Atomic claim on the task's current status: a rapid double-tap (or a
  // slow network prompting an impatient second tap) can fire a second
  // advance before the button's disabled state or the refreshed props
  // catch up. Without this, two near-simultaneous calls each read the same
  // starting status and advance it twice, skipping a step entirely — e.g.
  // Vacant Clean straight to Vacant Dirty, bypassing supervisor inspection.
  const claim = await prisma.housekeepingTask.updateMany({ where: { id: taskId, status: task.status }, data: { status: next } });
  if (claim.count === 0) return;

  const roomStatus = ROOM_STATUS_FOR[next];
  if (roomStatus) {
    // The VD/CLEANING/VC/VI cycle only applies to a room between checkout
    // and its next arrival. Guard against overwriting a room the system
    // currently considers occupied (OC/OD) — that would silently vacate an
    // occupied room and make it selectable for a new guest's check-in.
    await prisma.room.updateMany({ where: { id: task.roomId, status: { notIn: [RoomStatus.OC, RoomStatus.OD] } }, data: { status: roomStatus } });
  }
  await prisma.auditLog.create({
    data: { userId: session.user.id, entity: "HousekeepingTask", entityId: taskId, action: "advance_status", oldValue: { status: task.status }, newValue: { status: next } },
  });
  revalidatePath("/front-desk/housekeeping");
  revalidatePath("/front-desk/rack");
  revalidatePath("/front-desk/checkin");
}
