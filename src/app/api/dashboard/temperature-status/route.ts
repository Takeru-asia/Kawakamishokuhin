import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const facilities = await prisma.facility.findMany({
      where: { isActive: true },
      orderBy: { code: "asc" },
    });

    const result = [];

    for (const facility of facilities) {
      const latest = await prisma.temperatureRecord.findFirst({
        where: { facilityId: facility.id },
        orderBy: { recordedAt: "desc" },
      });

      result.push({
        facilityId: facility.id,
        facilityName: facility.name,
        facilityType: facility.type,
        temperature: latest ? Number(latest.temperature) : null,
        isNormal: latest?.isNormal ?? true,
        recordedAt: latest?.recordedAt ?? null,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to fetch temperature status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
