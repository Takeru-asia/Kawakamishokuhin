"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/session";
import { upsertProductionPlanSchema } from "@/validations/plan";
import { revalidatePath } from "next/cache";

// Local calendar date (TZ is Asia/Tokyo in production via instrumentation.ts),
// consistent with the "today" computation in api/dashboard/kpi/route.ts
function toDateString(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export async function getProductionPlan(dateStr: string) {
  await requireSession();
  return prisma.productionPlan.findUnique({
    where: { planDate: new Date(dateStr) },
    include: {
      items: { include: { product: { select: { name: true, unit: true } } } },
      materials: { include: { material: { select: { name: true, unit: true } } } },
      setBy: { select: { name: true } },
    },
  });
}

export async function getPlanFormData() {
  await requireSession();
  const [products, materials] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
    prisma.material.findMany({ where: { isActive: true }, orderBy: { code: "asc" } }),
  ]);
  return { products, materials };
}

export async function upsertProductionPlan(_prev: unknown, formData: FormData) {
  const session = await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = upsertProductionPlanSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { planDate, items, materials, notes } = parsed.data;
  const date = new Date(planDate);

  // The plan is editable (not a HACCP record): replace child rows wholesale
  await prisma.$transaction(async (tx) => {
    const plan = await tx.productionPlan.upsert({
      where: { planDate: date },
      update: { setById: session.userId, notes: notes || null },
      create: { planDate: date, setById: session.userId, notes: notes || null },
    });
    await tx.productionPlanItem.deleteMany({ where: { planId: plan.id } });
    await tx.productionPlanMaterial.deleteMany({ where: { planId: plan.id } });
    await tx.productionPlanItem.createMany({
      data: items
        .filter((i) => i.plannedQuantity > 0)
        .map((i) => ({ planId: plan.id, productId: i.productId, plannedQuantity: i.plannedQuantity })),
    });
    await tx.productionPlanMaterial.createMany({
      data: materials
        .filter((m) => m.quantity > 0)
        .map((m) => ({ planId: plan.id, materialId: m.materialId, quantity: m.quantity })),
    });
  });

  revalidatePath("/production/plan");
  revalidatePath("/");
  return { success: true };
}

// Dashboard summary for today's plan (used by api/dashboard/plan)
export async function getTodayPlanSummary() {
  await requireSession();
  const todayStr = toDateString(new Date());
  const plan = await prisma.productionPlan.findUnique({
    where: { planDate: new Date(todayStr) },
    include: {
      items: { include: { product: { select: { name: true, unit: true } } } },
      materials: { include: { material: { select: { name: true, unit: true } } } },
    },
  });
  if (!plan) return null;

  return {
    planDate: todayStr,
    items: plan.items.map((i) => ({
      productName: i.product.name,
      unit: i.product.unit,
      plannedQuantity: Number(i.plannedQuantity),
    })),
    materials: plan.materials.map((m) => ({
      materialName: m.material.name,
      unit: m.material.unit,
      quantity: Number(m.quantity),
    })),
  };
}
