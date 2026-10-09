"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createHealthCheckSchema, isAbnormalHealthCheck } from "@/validations/health";
import { revalidatePath } from "next/cache";

export async function getHealthChecks(params?: { date?: string; limit?: number }) {
  await requireSession();
  const where: Record<string, unknown> = {};
  if (params?.date) where.checkDate = new Date(params.date);

  return prisma.healthCheckRecord.findMany({
    where,
    include: {
      user: { select: { name: true } },
      recordedBy: { select: { name: true } },
    },
    orderBy: [{ checkDate: "desc" }, { clockInAt: "desc" }],
    take: params?.limit ?? 100,
  });
}

export async function getEmployees() {
  await requireSession();
  return prisma.user.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

// Any logged-in user may record; the employee defaults to self but a manager may enter on behalf of others.
export async function createHealthCheck(_prev: unknown, formData: FormData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = createHealthCheckSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { userId, checkDate, clockInTime, notes, ...flags } = parsed.data;

  try {
    await prisma.healthCheckRecord.create({
      data: {
        userId,
        checkDate: new Date(checkDate),
        clockInAt: new Date(`${checkDate}T${clockInTime}:00`),
        ...flags,
        isAbnormal: isAbnormalHealthCheck(flags),
        recordedById: session.userId,
        notes: notes || null,
      },
    });
  } catch (e) {
    // Unique violation on (userId, checkDate)
    if (e && typeof e === "object" && "code" in e && e.code === "P2002") {
      return { error: "この日の記録は既に登録されています" };
    }
    throw e;
  }

  revalidatePath("/health");
  return { success: true };
}
