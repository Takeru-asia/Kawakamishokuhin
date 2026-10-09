import { getHealthChecks } from "@/actions/health";
import { HealthListClient } from "./client";

export default async function HealthPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = params.date || new Date().toLocaleDateString("sv-SE");
  const records = await getHealthChecks({ date });

  return <HealthListClient records={JSON.parse(JSON.stringify(records))} date={date} />;
}
