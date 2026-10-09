"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createHygieneRecordSchema, applyWaterQualityGuard } from "@/validations/hygiene";
import { RESIDUAL_CHLORINE_MIN_MG_L } from "@/lib/constants";
import { revalidatePath } from "next/cache";

export async function getHygieneRecords(params?: { categoryId?: string; date?: string }) {
  await requireSession();
  const where: Record<string, unknown> = {};
  if (params?.categoryId) where.categoryId = params.categoryId;
  if (params?.date) where.recordDate = new Date(params.date);

  return prisma.hygieneRecord.findMany({
    where,
    include: {
      category: { select: { name: true } },
      facility: { select: { name: true } },
      recordedBy: { select: { name: true } },
    },
    orderBy: { recordDate: "desc" },
    take: 100,
  });
}

export async function getHygieneCategories() {
  await requireSession();
  return prisma.hygieneCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createHygieneRecord(_prev: unknown, formData: FormData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = createHygieneRecordSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { facilityId, measuredValue, ...data } = parsed.data;
  let result = data.result as "PASS" | "FAIL" | "NA";
  let notes = data.notes || "";

  // Water quality guard: residual chlorine must be recorded and meet the legal minimum.
  // Never clamp the value; force FAIL and annotate so the deviation stays on record.
  const category = await prisma.hygieneCategory.findUnique({ where: { id: data.categoryId } });
  if (!category) return { error: "カテゴリが見つかりません" };
  const guarded = applyWaterQualityGuard({
    isWaterQuality: category.name.includes("水質"),
    measuredValue,
    result,
    notes,
    minMgL: RESIDUAL_CHLORINE_MIN_MG_L,
  });
  if ("error" in guarded) return { error: guarded.error };
  result = guarded.result;
  notes = guarded.notes;

  await prisma.hygieneRecord.create({
    data: {
      categoryId: data.categoryId,
      facilityId: facilityId && facilityId !== "" ? facilityId : null,
      recordDate: new Date(data.recordDate),
      details: data.details,
      result,
      measuredValue: measuredValue ?? null,
      recordedById: session.userId,
      notes: notes || null,
    },
  });

  revalidatePath("/hygiene");
  return { success: true };
}
