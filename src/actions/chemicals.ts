"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createChemicalUsageSchema } from "@/validations/chemicals";
import { revalidatePath } from "next/cache";

export async function getChemicalUsages(params?: { from?: string; to?: string; limit?: number }) {
  await requireSession();
  const usedAt: Record<string, Date> = {};
  // Parse YYYY-MM-DD as local midnight (usedAt is a timestamp, not a @db.Date)
  if (params?.from) usedAt.gte = new Date(`${params.from}T00:00:00`);
  if (params?.to) usedAt.lt = new Date(`${params.to}T00:00:00`);

  return prisma.chemicalUsageRecord.findMany({
    where: Object.keys(usedAt).length ? { usedAt } : {},
    include: {
      usedBy: { select: { name: true } },
      recordedBy: { select: { name: true } },
    },
    orderBy: { usedAt: "desc" },
    take: params?.limit ?? 100,
  });
}

export async function createChemicalUsage(_prev: unknown, formData: FormData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = createChemicalUsageSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { usedDate, usedTime, chemicalKind, chemicalName, quantity, unit, purpose, usedById, notes } = parsed.data;

  await prisma.chemicalUsageRecord.create({
    data: {
      usedAt: new Date(`${usedDate}T${usedTime}:00`),
      chemicalKind,
      chemicalName: chemicalKind === "OTHER" ? chemicalName!.trim() : null,
      quantity,
      unit,
      purpose,
      usedById,
      recordedById: session.userId,
      notes: notes || null,
    },
  });

  revalidatePath("/chemicals");
  return { success: true };
}
