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

  await prisma.housekeepingTask.update({ where: { id: taskId }, data: { status: next } });
  const roomStatus = ROOM_STATUS_FOR[next];
  if (roomStatus) {
    await prisma.room.update({ where: { id: task.roomId }, data: { status: roomStatus } });
  }
  await prisma.auditLog.create({
    data: { userId: session.user.id, entity: "HousekeepingTask", entityId: taskId, action: "advance_status", oldValue: { status: task.status }, newValue: { status: next } },
  });
  revalidatePath("/front-desk/housekeeping");
  revalidatePath("/front-desk/rack");
  revalidatePath("/front-desk/checkin");
}
