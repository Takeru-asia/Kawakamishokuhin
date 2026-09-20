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
    const [productions, temps, hygiene] = await Promise.all([
      prisma.productionRecord.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          recordedBy: { select: { name: true } },
          items: { include: { product: { select: { name: true } } } },
        },
      }),
      prisma.temperatureRecord.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          facility: { select: { name: true } },
          recordedBy: { select: { name: true } },
        },
      }),
      prisma.hygieneRecord.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          category: { select: { name: true } },
          recordedBy: { select: { name: true } },
        },
      }),
    ]);

    type Activity = { type: string; description: string; user: string; time: Date };
    const activities: Activity[] = [
      ...productions.map((p) => ({
        type: "production" as const,
        description: `製造実績: ${p.items.map((i) => i.product.name).join(", ")}`,
        user: p.recordedBy.name,
        time: p.createdAt,
      })),
      ...temps.map((t) => ({
        type: "temperature" as const,
        description: `温度記録: ${t.facility.name} ${Number(t.temperature).toFixed(1)}℃`,
        user: t.recordedBy.name,
        time: t.createdAt,
      })),
      ...hygiene.map((h) => ({
        type: "hygiene" as const,
        description: `衛生記録: ${h.category.name}`,
        user: h.recordedBy.name,
        time: h.createdAt,
      })),
    ];

    activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    return NextResponse.json(activities.slice(0, 10));
  } catch (error) {
    console.error("Failed to fetch recent activities:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
