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
    const RANGE_DAYS = 60;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (RANGE_DAYS - 1));

    const endDate = new Date(today);
    endDate.setDate(endDate.getDate() + 1);

    // Fetch all items in range with a single query
    const items = await prisma.productionRecordItem.findMany({
      where: {
        productionRecord: {
          productionDate: { gte: startDate, lt: endDate },
        },
      },
      select: {
        quantity: true,
        productionRecord: { select: { productionDate: true } },
      },
    });

    // Group by date
    const totalsByDate = new Map<string, number>();
    for (const item of items) {
      const key = item.productionRecord.productionDate.toISOString().slice(0, 10);
      totalsByDate.set(key, (totalsByDate.get(key) ?? 0) + Number(item.quantity));
    }

    // Build response array
    const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];
    const days: { date: string; total: number; label: string }[] = [];

    for (let i = RANGE_DAYS - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days.push({
        date: key,
        total: totalsByDate.get(key) ?? 0,
        label: `${d.getMonth() + 1}/${d.getDate()} (${dayLabels[d.getDay()]})`,
      });
    }

    return NextResponse.json(days);
  } catch (error) {
    console.error("Failed to fetch production chart data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
