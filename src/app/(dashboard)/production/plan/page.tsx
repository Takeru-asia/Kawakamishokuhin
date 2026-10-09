import { getPlanFormData, getProductionPlan } from "@/actions/plan";
import { getSession } from "@/lib/session";
import { ProductionPlanClient } from "./client";

// Default to tomorrow: the plan is set the day before (server local date, TZ=Asia/Tokyo in production)
function tomorrowString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function ProductionPlanPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(params.date ?? "") ? (params.date as string) : tomorrowString();

  const session = await getSession();
  const canEdit = session?.role === "ADMIN" || session?.role === "MANAGER";

  const [plan, formData] = await Promise.all([getProductionPlan(date), getPlanFormData()]);

  return (
    <ProductionPlanClient
      key={date}
      date={date}
      canEdit={canEdit}
      plan={plan ? JSON.parse(JSON.stringify(plan)) : null}
      products={JSON.parse(JSON.stringify(formData.products))}
      materials={JSON.parse(JSON.stringify(formData.materials))}
    />
  );
}
