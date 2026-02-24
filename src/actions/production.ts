"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// Transaction client type for prisma.$transaction() callback
type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Lot auto-numbering: PLT-YYYYMMDD-NNN
// Accepts a transaction client to ensure atomicity (Issue #4)
async function generateProductLotNumber(
  tx: TxClient,
  date: Date,
): Promise<string> {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `PLT-${dateStr}-`;

  const lastLot = await tx.productLot.findFirst({
    where: { lotNumber: { startsWith: prefix } },
    orderBy: { lotNumber: "desc" },
  });

  const seq = lastLot
    ? parseInt(lastLot.lotNumber.slice(-3)) + 1
    : 1;

  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export async function getProductionRecords(params?: { date?: string }) {
  await requireSession();
  const where: Record<string, unknown> = {};
  if (params?.date) {
    where.productionDate = new Date(params.date);
  }

  return prisma.productionRecord.findMany({
    where,
    include: {
      recordedBy: { select: { name: true } },
      items: {
        include: {
          product: { select: { name: true, unit: true, code: true } },
        },
      },
    },
    orderBy: { productionDate: "desc" },
    take: 50,
  });
}

export async function getProductionRecord(id: string) {
  await requireSession();
  return prisma.productionRecord.findUnique({
    where: { id },
    include: {
      recordedBy: { select: { name: true } },
      items: {
        include: {
          product: { select: { name: true, unit: true, code: true } },
          productLots: true,
        },
      },
    },
  });
}

export async function createProductionRecord(_prev: unknown, formData: FormData) {
  const session = await requireSession();

  const productionDate = formData.get("productionDate") as string;
  const notes = formData.get("notes") as string;
  const itemsJson = formData.get("items") as string;

  if (!productionDate) return { error: "製造日を入力してください" };

  let items: { productId: string; quantity: number }[];
  try {
    items = JSON.parse(itemsJson);
  } catch {
    return { error: "明細データが不正です" };
  }

  if (!items || items.length === 0) return { error: "明細を1件以上入力してください" };

  const date = new Date(productionDate);

  // Wrap entire creation in a transaction (Issue #6)
  // Lot number generation also uses tx to prevent race conditions (Issue #4)
  await prisma.$transaction(async (tx) => {
    const record = await tx.productionRecord.create({
      data: {
        productionDate: date,
        recordedById: session.userId,
        notes: notes || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    for (const item of record.items) {
      const lotNumber = await generateProductLotNumber(tx, date);
      await tx.productLot.create({
        data: {
          productionRecordItemId: item.id,
          productId: item.productId,
          lotNumber,
          productionDate: date,
          quantity: item.quantity,
        },
      });
    }
  });

  revalidatePath("/production");
  return { success: true };
}
