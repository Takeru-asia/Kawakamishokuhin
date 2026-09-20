"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

// Transaction client type for prisma.$transaction() callback
type TxClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

// Material lot auto-numbering: MLT-YYYYMMDD-NNN
// Accepts a transaction client to ensure atomicity (Issue #4)
async function generateMaterialLotNumber(
  tx: TxClient,
  date: Date,
): Promise<string> {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `MLT-${dateStr}-`;

  const lastLot = await tx.materialLot.findFirst({
    where: { lotNumber: { startsWith: prefix } },
    orderBy: { lotNumber: "desc" },
  });

  const seq = lastLot ? parseInt(lastLot.lotNumber.slice(-3)) + 1 : 1;
  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export async function searchProductLots(query?: string) {
  await requireSession();
  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { lotNumber: { contains: query, mode: "insensitive" } },
      { product: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  return prisma.productLot.findMany({
    where,
    include: {
      product: { select: { name: true, code: true, unit: true } },
      productionRecordItem: {
        include: {
          productionRecord: { select: { productionDate: true } },
        },
      },
    },
    orderBy: { productionDate: "desc" },
    take: 50,
  });
}

export async function searchMaterialLots(query?: string) {
  await requireSession();
  const where: Record<string, unknown> = {};
  if (query) {
    where.OR = [
      { lotNumber: { contains: query, mode: "insensitive" } },
      { material: { name: { contains: query, mode: "insensitive" } } },
    ];
  }

  return prisma.materialLot.findMany({
    where,
    include: {
      material: { select: { name: true, code: true, unit: true } },
    },
    orderBy: { receivedDate: "desc" },
    take: 50,
  });
}

export async function createMaterialLot(_prev: unknown, formData: FormData) {
  await requireSession();

  const materialId = formData.get("materialId") as string;
  const receivedDate = formData.get("receivedDate") as string;
  const expiryDate = formData.get("expiryDate") as string;
  const quantity = Number(formData.get("quantity"));
  const supplierLot = formData.get("supplierLot") as string;

  if (!materialId || !receivedDate || !quantity) {
    return { error: "必須項目を入力してください" };
  }

  const date = new Date(receivedDate);

  // Wrap lot number generation and creation in a transaction (Issue #4)
  await prisma.$transaction(async (tx) => {
    const lotNumber = await generateMaterialLotNumber(tx, date);
    await tx.materialLot.create({
      data: {
        materialId,
        lotNumber,
        receivedDate: date,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        quantity,
        supplierLot: supplierLot || null,
      },
    });
  });

  revalidatePath("/lots");
  return { success: true };
}

export async function createLotLink(_prev: unknown, formData: FormData) {
  await requireSession();

  const materialLotId = formData.get("materialLotId") as string;
  const productLotId = formData.get("productLotId") as string;
  const quantityUsed = formData.get("quantityUsed") ? Number(formData.get("quantityUsed")) : undefined;

  if (!materialLotId || !productLotId) {
    return { error: "原材料ロットと製品ロットを選択してください" };
  }

  await prisma.lotLink.create({
    data: {
      materialLotId,
      productLotId,
      quantityUsed: quantityUsed ?? null,
    },
  });

  revalidatePath("/lots");
  return { success: true };
}

// Forward trace: materialLot → productLots
export async function traceForward(materialLotId: string) {
  await requireSession();
  const links = await prisma.lotLink.findMany({
    where: { materialLotId },
    include: {
      productLot: {
        include: { product: { select: { name: true, code: true } } },
      },
    },
  });
  return links;
}

// Backward trace: productLot → materialLots
export async function traceBackward(productLotId: string) {
  await requireSession();
  const links = await prisma.lotLink.findMany({
    where: { productLotId },
    include: {
      materialLot: {
        include: { material: { select: { name: true, code: true } } },
      },
    },
  });
  return links;
}

export async function getLotDetail(id: string, type: "product" | "material") {
  await requireSession();
  if (type === "product") {
    const lot = await prisma.productLot.findUnique({
      where: { id },
      include: {
        product: true,
        productionRecordItem: {
          include: { productionRecord: { select: { productionDate: true, recordedBy: { select: { name: true } } } } },
        },
        lotLinks: {
          include: { materialLot: { include: { material: { select: { name: true, code: true } } } } },
        },
      },
    });
    return lot;
  } else {
    const lot = await prisma.materialLot.findUnique({
      where: { id },
      include: {
        material: true,
        lotLinks: {
          include: { productLot: { include: { product: { select: { name: true, code: true } } } } },
        },
      },
    });
    return lot;
  }
}
