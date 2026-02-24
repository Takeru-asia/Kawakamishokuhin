"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { createLossRecordSchema } from "@/validations/loss";
import { revalidatePath } from "next/cache";

export async function getLossRecords(params?: { productId?: string; categoryId?: string; date?: string }) {
  await requireSession();
  const where: Record<string, unknown> = {};
  if (params?.productId) where.productId = params.productId;
  if (params?.categoryId) where.categoryId = params.categoryId;
  if (params?.date) where.recordDate = new Date(params.date);

  return prisma.lossRecord.findMany({
    where,
    include: {
      product: { select: { name: true, code: true, unit: true } },
      category: { select: { name: true } },
      recordedBy: { select: { name: true } },
    },
    orderBy: { recordDate: "desc" },
    take: 100,
  });
}

export async function getLossCategories() {
  await requireSession();
  return prisma.lossCategory.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
}

export async function createLossRecord(_prev: unknown, formData: FormData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = createLossRecordSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { productId, categoryId, recordDate, quantity, notes } = parsed.data;
  const date = new Date(recordDate);

  // Calculate loss rate
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const firstOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);

  const prodItems = await prisma.productionRecordItem.findMany({
    where: {
      productId,
      productionRecord: {
        productionDate: { gte: firstOfMonth, lt: firstOfNextMonth },
      },
    },
  });
  const totalProd = prodItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  const lossRate = totalProd > 0 ? Math.round((quantity / totalProd) * 1000) / 10 : null;

  await prisma.lossRecord.create({
    data: {
      productId,
      categoryId,
      recordDate: date,
      quantity,
      lossRate,
      recordedById: session.userId,
      notes: notes || null,
    },
  });

  revalidatePath("/loss");
  return { success: true };
}

// Loss report - period aggregation
export async function getLossReport(startDate: string, endDate: string) {
  await requireSession();
  const start = new Date(startDate);
  const end = new Date(endDate);
  end.setDate(end.getDate() + 1);

  const records = await prisma.lossRecord.findMany({
    where: { recordDate: { gte: start, lt: end } },
    include: {
      product: { select: { name: true, code: true, unit: true } },
      category: { select: { name: true } },
    },
  });

  // By category
  const byCategory: Record<string, { category: string; totalQuantity: number; count: number }> = {};
  for (const r of records) {
    const key = r.category.name;
    if (!byCategory[key]) byCategory[key] = { category: key, totalQuantity: 0, count: 0 };
    byCategory[key].totalQuantity += Number(r.quantity);
    byCategory[key].count++;
  }

  // By product
  const byProduct: Record<string, { product: string; totalQuantity: number; count: number; unit: string }> = {};
  for (const r of records) {
    const key = r.product.name;
    if (!byProduct[key]) byProduct[key] = { product: key, totalQuantity: 0, count: 0, unit: r.product.unit };
    byProduct[key].totalQuantity += Number(r.quantity);
    byProduct[key].count++;
  }

  // Total production for loss rate
  const prodItems = await prisma.productionRecordItem.findMany({
    where: {
      productionRecord: {
        productionDate: { gte: start, lt: end },
      },
    },
  });
  const totalProd = prodItems.reduce((sum, item) => sum + Number(item.quantity), 0);
  const totalLoss = records.reduce((sum, r) => sum + Number(r.quantity), 0);
  const overallLossRate = totalProd > 0 ? Math.round((totalLoss / totalProd) * 1000) / 10 : 0;

  return {
    byCategory: Object.values(byCategory),
    byProduct: Object.values(byProduct),
    totalLoss,
    totalProduction: totalProd,
    overallLossRate,
    recordCount: records.length,
  };
}
