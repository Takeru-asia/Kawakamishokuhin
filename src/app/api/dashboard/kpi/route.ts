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
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const firstOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

    // Today's production quantity
    const todayItems = await prisma.productionRecordItem.findMany({
      where: {
        productionRecord: {
          productionDate: { gte: today, lt: tomorrow },
        },
      },
    });
    const todayProduction = todayItems.reduce((sum, item) => sum + Number(item.quantity), 0);

    // Open temperature alerts count
    const alertCount = await prisma.temperatureAlert.count({
      where: { status: "OPEN" },
    });

    // Monthly hygiene pass rate
    const monthlyHygiene = await prisma.hygieneRecord.findMany({
      where: { recordDate: { gte: firstOfMonth, lt: firstOfNextMonth } },
      select: { result: true },
    });
    const hygieneTotal = monthlyHygiene.length;
    const hygienePass = monthlyHygiene.filter((h) => h.result === "PASS").length;
    const hygieneRate = hygieneTotal > 0 ? Math.round((hygienePass / hygieneTotal) * 1000) / 10 : 100;

    // Monthly loss rate
    const monthlyLoss = await prisma.lossRecord.findMany({
      where: { recordDate: { gte: firstOfMonth, lt: firstOfNextMonth } },
    });
    const totalLossQty = monthlyLoss.reduce((sum, l) => sum + Number(l.quantity), 0);
    const monthlyProdItems = await prisma.productionRecordItem.findMany({
      where: {
        productionRecord: {
          productionDate: { gte: firstOfMonth, lt: firstOfNextMonth },
        },
      },
    });
    const totalProdQty = monthlyProdItems.reduce((sum, item) => sum + Number(item.quantity), 0);
    const lossRate = totalProdQty > 0 ? Math.round((totalLossQty / totalProdQty) * 1000) / 10 : 0;

    return NextResponse.json({
      todayProduction,
      alertCount,
      hygieneRate,
      lossRate,
    });
  } catch (error) {
    console.error("Failed to fetch KPI data:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
