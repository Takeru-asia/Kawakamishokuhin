import { getProductionRecords } from "@/actions/production";
import { ProductionListClient } from "./client";

export default async function ProductionPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const records = await getProductionRecords(params);
  return <ProductionListClient records={JSON.parse(JSON.stringify(records))} filters={params} />;
}
