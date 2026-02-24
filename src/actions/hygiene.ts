"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createHygieneRecordSchema } from "@/validations/hygiene";
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

  const { facilityId, ...data } = parsed.data;

  await prisma.hygieneRecord.create({
    data: {
      categoryId: data.categoryId,
      facilityId: facilityId && facilityId !== "" ? facilityId : null,
      recordDate: new Date(data.recordDate),
      details: data.details,
      result: data.result as "PASS" | "FAIL" | "NA",
      recordedById: session.userId,
      notes: data.notes || null,
    },
  });

  revalidatePath("/hygiene");
  return { success: true };
}
