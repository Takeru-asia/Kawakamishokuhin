"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/session";
import {
  createProductSchema,
  updateProductSchema,
  createMaterialSchema,
  updateMaterialSchema,
  createFacilitySchema,
  updateFacilitySchema,
  createUserSchema,
  updateUserSchema,
} from "@/validations/master";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

// ---- Products ----

export async function getProducts() {
  await requireSession();
  return prisma.product.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });
}

export async function createProduct(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = createProductSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.product.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { error: "このコードは既に使用されています" };

  await prisma.product.create({ data: parsed.data });
  revalidatePath("/master/products");
  return { success: true };
}

export async function updateProduct(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = updateProductSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, ...data } = parsed.data;
  await prisma.product.update({ where: { id }, data });
  revalidatePath("/master/products");
  return { success: true };
}

export async function deleteProduct(id: string) {
  await requireRole(["ADMIN", "MANAGER"]);
  await prisma.product.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/master/products");
}

// ---- Materials ----

export async function getMaterials() {
  await requireSession();
  return prisma.material.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });
}

export async function createMaterial(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = createMaterialSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.material.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { error: "このコードは既に使用されています" };

  await prisma.material.create({ data: parsed.data });
  revalidatePath("/master/materials");
  return { success: true };
}

export async function updateMaterial(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = updateMaterialSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, ...data } = parsed.data;
  await prisma.material.update({ where: { id }, data });
  revalidatePath("/master/materials");
  return { success: true };
}

export async function deleteMaterial(id: string) {
  await requireRole(["ADMIN", "MANAGER"]);
  await prisma.material.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/master/materials");
}

// ---- Facilities ----

export async function getFacilities() {
  await requireSession();
  return prisma.facility.findMany({
    where: { isActive: true },
    orderBy: { code: "asc" },
  });
}

export async function createFacility(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = createFacilitySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.facility.findUnique({ where: { code: parsed.data.code } });
  if (existing) return { error: "このコードは既に使用されています" };

  const { tempLowerLimit, tempUpperLimit, ...rest } = parsed.data;
  await prisma.facility.create({
    data: {
      ...rest,
      tempLowerLimit: tempLowerLimit && tempLowerLimit !== "" ? Number(tempLowerLimit) : null,
      tempUpperLimit: tempUpperLimit && tempUpperLimit !== "" ? Number(tempUpperLimit) : null,
    },
  });
  revalidatePath("/master/facilities");
  return { success: true };
}

export async function updateFacility(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = updateFacilitySchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, tempLowerLimit, tempUpperLimit, ...rest } = parsed.data;
  await prisma.facility.update({
    where: { id },
    data: {
      ...rest,
      tempLowerLimit: tempLowerLimit && tempLowerLimit !== "" ? Number(tempLowerLimit) : null,
      tempUpperLimit: tempUpperLimit && tempUpperLimit !== "" ? Number(tempUpperLimit) : null,
    },
  });
  revalidatePath("/master/facilities");
  return { success: true };
}

export async function deleteFacility(id: string) {
  await requireRole(["ADMIN", "MANAGER"]);
  await prisma.facility.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/master/facilities");
}

// ---- Users ----

export async function getUsers() {
  await requireSession();
  return prisma.user.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
  });
}

export async function createUser(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN"]);
  const raw = Object.fromEntries(formData);
  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return { error: "このメールアドレスは既に使用されています" };

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      role: parsed.data.role as "ADMIN" | "MANAGER" | "WORKER",
    },
  });
  revalidatePath("/master/users");
  return { success: true };
}

export async function updateUser(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN"]);
  const raw = Object.fromEntries(formData);
  const parsed = updateUserSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, password, ...data } = parsed.data;
  const updateData: Record<string, unknown> = {
    name: data.name,
    email: data.email,
    role: data.role,
  };
  if (password && password !== "") {
    updateData.passwordHash = await bcrypt.hash(password, 10);
  }
  await prisma.user.update({ where: { id }, data: updateData });
  revalidatePath("/master/users");
  return { success: true };
}

export async function deleteUser(id: string) {
  await requireRole(["ADMIN"]);
  const session = await requireSession();
  if (session.userId === id) {
    throw new Error("自分自身を削除することはできません");
  }
  await prisma.user.update({ where: { id }, data: { isActive: false } });
  revalidatePath("/master/users");
}
