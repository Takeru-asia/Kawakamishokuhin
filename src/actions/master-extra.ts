"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/session";
import { equipmentSchema, updateEquipmentSchema } from "@/validations/equipment";
import { createHygieneCategorySchema, updateHygieneCategorySchema } from "@/validations/master-extra";
import { revalidatePath } from "next/cache";

// ---- Equipment (measuring instruments) ----

export async function getEquipmentList() {
  await requireSession();
  return prisma.equipment.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });
}

export async function createEquipment(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = equipmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.equipment.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { error: "このコードは既に使用されています" };

  await prisma.equipment.create({
    data: { ...parsed.data, location: parsed.data.location || null },
  });
  revalidatePath("/master/equipment");
  revalidatePath("/equipment-checks");
  return { success: true };
}

export async function updateEquipment(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = updateEquipmentSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, ...data } = parsed.data;
  const duplicate = await prisma.equipment.findFirst({ where: { code: data.code, NOT: { id } } });
  if (duplicate) return { error: "このコードは既に使用されています" };

  await prisma.equipment.update({
    where: { id },
    data: { ...data, location: data.location || null },
  });
  revalidatePath("/master/equipment");
  revalidatePath("/equipment-checks");
  return { success: true };
}

export async function deleteEquipment(id: string) {
  await requireRole(["ADMIN", "MANAGER"]);
  await prisma.equipment.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/master/equipment");
  revalidatePath("/equipment-checks");
}

// ---- Hygiene categories ----

export async function getHygieneCategoryList() {
  await requireSession();
  return prisma.hygieneCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createHygieneCategory(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = createHygieneCategorySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  await prisma.hygieneCategory.create({
    data: { ...parsed.data, description: parsed.data.description || null },
  });
  revalidatePath("/master/hygiene-categories");
  revalidatePath("/hygiene");
  return { success: true };
}

export async function updateHygieneCategory(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = updateHygieneCategorySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, ...data } = parsed.data;
  await prisma.hygieneCategory.update({
    where: { id },
    data: { ...data, description: data.description || null },
  });
  revalidatePath("/master/hygiene-categories");
  revalidatePath("/hygiene");
  return { success: true };
}

export async function deleteHygieneCategory(id: string) {
  await requireRole(["ADMIN", "MANAGER"]);
  await prisma.hygieneCategory.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/master/hygiene-categories");
  revalidatePath("/hygiene");
}
