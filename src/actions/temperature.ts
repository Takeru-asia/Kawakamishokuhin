"use server";

import { prisma } from "@/lib/prisma";
import { requireSession, requireRole } from "@/lib/session";
import { createTemperatureRecordSchema, updateAlertSchema } from "@/validations/temperature";
import { revalidatePath } from "next/cache";

export async function getTemperatureRecords(params?: { facilityId?: string; date?: string }) {
  await requireSession();
  const where: Record<string, unknown> = {};
  if (params?.facilityId) where.facilityId = params.facilityId;
  if (params?.date) {
    const d = new Date(params.date);
    const next = new Date(d);
    next.setDate(next.getDate() + 1);
    where.recordedAt = { gte: d, lt: next };
  }

  return prisma.temperatureRecord.findMany({
    where,
    include: {
      facility: { select: { name: true, code: true } },
      recordedBy: { select: { name: true } },
    },
    orderBy: { recordedAt: "desc" },
    take: 100,
  });
}

export async function createTemperatureRecord(_prev: unknown, formData: FormData) {
  const session = await requireSession();
  const raw = Object.fromEntries(formData);
  const parsed = createTemperatureRecordSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { facilityId, temperature, notes } = parsed.data;

  // Fetch facility for threshold check
  const facility = await prisma.facility.findUnique({ where: { id: facilityId } });
  if (!facility) return { error: "設備が見つかりません" };

  // Temperature anomaly detection logic
  let isNormal = true;
  let threshold: typeof facility.tempUpperLimit = null;

  if (facility.tempUpperLimit != null) {
    if (temperature > Number(facility.tempUpperLimit)) {
      isNormal = false;
      threshold = facility.tempUpperLimit;
    }
  }
  if (facility.tempLowerLimit != null) {
    if (temperature < Number(facility.tempLowerLimit)) {
      isNormal = false;
      threshold = facility.tempLowerLimit;
    }
  }

  const record = await prisma.temperatureRecord.create({
    data: {
      facilityId,
      temperature,
      isNormal,
      recordedById: session.userId,
      recordedAt: new Date(),
      notes: notes || null,
    },
  });

  // Auto-create alert if abnormal
  if (!isNormal && threshold != null) {
    await prisma.temperatureAlert.create({
      data: {
        temperatureRecordId: record.id,
        facilityId,
        alertTemperature: temperature,
        threshold,
        status: "OPEN",
      },
    });
  }

  revalidatePath("/temperature");
  return { success: true };
}

export async function getAlerts(status?: string) {
  await requireSession();
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  return prisma.temperatureAlert.findMany({
    where,
    include: {
      facility: { select: { name: true, code: true } },
      temperatureRecord: { select: { temperature: true, recordedAt: true } },
      resolvedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function updateAlert(_prev: unknown, formData: FormData) {
  const session = await requireRole(["ADMIN", "MANAGER"]);
  const raw = Object.fromEntries(formData);
  const parsed = updateAlertSchema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { id, status, correctiveAction } = parsed.data;

  await prisma.temperatureAlert.update({
    where: { id },
    data: {
      status,
      correctiveAction: correctiveAction || null,
      resolvedById: status === "RESOLVED" ? session.userId : undefined,
      resolvedAt: status === "RESOLVED" ? new Date() : undefined,
    },
  });

  revalidatePath("/temperature/alerts");
  return { success: true };
}
