import { NextResponse } from "next/server";
import { requireSession } from "@/lib/session";
import { getTodayPlanSummary } from "@/actions/plan";

export async function GET() {
  try {
    await requireSession();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getTodayPlanSummary();
    return NextResponse.json(summary);
  } catch (error) {
    console.error("Failed to fetch today's plan:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
