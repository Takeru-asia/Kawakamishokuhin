"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { equipmentCheckSchema } from "@/validations/equipment";
import { revalidatePath } from "next/cache";

export async function getEquipmentChecks(params?: { equipmentId?: string; limit?: number }) {
  await requireSession();
  const where: Record<string, unknown> = {};
  if (params?.equipmentId) where.equipmentId = params.equipmentId;

  return prisma.equipmentCheck.findMany({
    where,
    include: {
      equipment: { select: { code: true, name: true, type: true } },
      recordedBy: { select: { name: true } },
    },
    orderBy: [{ checkDate: "desc" }, { createdAt: "desc" }],
    take: params?.limit ?? 100,
  });
}

export async function getActiveEquipment() {
  await requireSession();
  return prisma.equipment.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });
}

export async function createEquipmentCheck(_prev: unknown, formData: FormData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = equipmentCheckSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { equipmentId, checkDate, kind, result, measuredValue, notes } = parsed.data;
  const equipment = await prisma.equipment.findUnique({ where: { id: equipmentId } });
  if (!equipment || !equipment.isActive) return { error: "計器が見つかりません" };

  await prisma.equipmentCheck.create({
    data: {
      equipmentId,
      checkDate: new Date(checkDate),
      kind,
      result,
      measuredValue: measuredValue ?? null,
      recordedById: session.userId,
      notes: notes || null,
    },
  });

  revalidatePath("/equipment-checks");
  return { success: true };
}

export type EquipmentDueStatus = {
  id: string;
  code: string;
  name: string;
  type: string;
  checkFrequency: string;
  lastCheckDate: Date | null;
  isOverdue: boolean;
};

/**
 * Due status per active equipment.
 * DAILY: overdue unless a check exists for today.
 * MONTHLY: overdue unless a check exists in the current calendar month.
 */
export async function getEquipmentDueStatus(): Promise<EquipmentDueStatus[]> {
  await requireSession();

  // Same "today" computation as the dashboard KPI route (server TZ = Asia/Tokyo)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const equipment = await prisma.equipment.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });
  const ids = equipment.map((e) => e.id);

  const [lastChecks, monthChecks] = await Promise.all([
    prisma.equipmentCheck.findMany({
      where: { equipmentId: { in: ids } },
      orderBy: { checkDate: "desc" },
      distinct: ["equipmentId"],
      select: { equipmentId: true, checkDate: true },
    }),
    prisma.equipmentCheck.findMany({
      where: { equipmentId: { in: ids }, checkDate: { gte: firstOfMonth, lt: firstOfNextMonth } },
      select: { equipmentId: true, checkDate: true },
    }),
  ]);

  const lastByEquipment = new Map(lastChecks.map((c) => [c.equipmentId, c.checkDate]));

  return equipment.map((e) => {
    const inWindow = monthChecks.some((c) => {
      if (c.equipmentId !== e.id) return false;
      if (e.checkFrequency === "DAILY") return c.checkDate >= today && c.checkDate < tomorrow;
      return true; // MONTHLY: any check within the current month
    });
    return {
      id: e.id,
      code: e.code,
      name: e.name,
      type: e.type,
      checkFrequency: e.checkFrequency,
      lastCheckDate: lastByEquipment.get(e.id) ?? null,
      isOverdue: !inWindow,
    };
  });
}
