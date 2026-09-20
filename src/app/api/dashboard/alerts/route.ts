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
    const alerts = await prisma.temperatureAlert.findMany({
      where: { status: "OPEN" },
      include: {
        facility: { select: { name: true } },
        temperatureRecord: { select: { temperature: true, recordedAt: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
