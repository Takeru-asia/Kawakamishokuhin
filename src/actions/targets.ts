"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/session";
import { createProductionTargetSchema } from "@/validations/targets";
import { revalidatePath } from "next/cache";

export async function getProductionTargets(params?: { year?: string; month?: string; productId?: string }) {
  await requireSession();
  const where: Record<string, unknown> = {};
  if (params?.year) where.targetYear = Number(params.year);
  if (params?.month) where.targetMonth = Number(params.month);
  if (params?.productId) where.productId = params.productId;

  return prisma.productionTarget.findMany({
    where,
    include: {
      product: { select: { name: true, code: true, unit: true } },
      setBy: { select: { name: true } },
    },
    orderBy: [{ targetYear: "desc" }, { targetMonth: "desc" }],
  });
}

export async function createProductionTarget(_prev: unknown, formData: FormData) {
  const session = await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = createProductionTargetSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { productId, targetYear, targetMonth, targetQuantity, dailyTarget } = parsed.data;

  const existing = await prisma.productionTarget.findUnique({
    where: { productId_targetYear_targetMonth: { productId, targetYear, targetMonth } },
  });
  if (existing) return { error: "この製品の同月の目標は既に設定されています" };

  await prisma.productionTarget.create({
    data: {
      productId,
      targetYear,
      targetMonth,
      targetQuantity,
      dailyTarget: dailyTarget ?? null,
      setById: session.userId,
    },
  });

  revalidatePath("/targets");
  return { success: true };
}

export async function updateProductionTarget(_prev: unknown, formData: FormData) {
  await requireRole(["ADMIN", "MANAGER"]);
  const id = formData.get("id") as string;
  const targetQuantity = Number(formData.get("targetQuantity"));
  const dailyTarget = formData.get("dailyTarget") ? Number(formData.get("dailyTarget")) : null;

  await prisma.productionTarget.update({
    where: { id },
    data: { targetQuantity, dailyTarget },
  });

  revalidatePath("/targets");
  return { success: true };
}

export async function deleteProductionTarget(id: string) {
  await requireRole(["ADMIN", "MANAGER"]);
  await prisma.productionTarget.delete({ where: { id } });
  revalidatePath("/targets");
}

// Achievement analysis
export async function getTargetAnalysis(year: number, month: number) {
  await requireSession();
  const targets = await prisma.productionTarget.findMany({
    where: { targetYear: year, targetMonth: month },
    include: { product: { select: { id: true, name: true, code: true, unit: true } } },
  });

  const firstOfMonth = new Date(year, month - 1, 1);
  const firstOfNextMonth = new Date(year, month, 1);

  const result = [];

  for (const target of targets) {
    const items = await prisma.productionRecordItem.findMany({
      where: {
        productId: target.productId,
        productionRecord: {
          productionDate: { gte: firstOfMonth, lt: firstOfNextMonth },
        },
      },
    });

    const actualQuantity = items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const achievementRate = Number(target.targetQuantity) > 0
      ? Math.round((actualQuantity / Number(target.targetQuantity)) * 1000) / 10
      : 0;

    result.push({
      productId: target.productId,
      productName: target.product.name,
      productCode: target.product.code,
      unit: target.product.unit,
      targetQuantity: Number(target.targetQuantity),
      actualQuantity,
      achievementRate,
    });
  }

  return result;
}
