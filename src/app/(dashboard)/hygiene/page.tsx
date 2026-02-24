import { getHygieneRecords, getHygieneCategories } from "@/actions/hygiene";
import { HygieneListClient } from "./client";

export default async function HygienePage({
  searchParams,
}: {
  searchParams: Promise<{ categoryId?: string; date?: string }>;
}) {
  const params = await searchParams;
  const [records, categories] = await Promise.all([
    getHygieneRecords(params),
    getHygieneCategories(),
  ]);

  return (
    <HygieneListClient
      records={JSON.parse(JSON.stringify(records))}
      categories={JSON.parse(JSON.stringify(categories))}
      filters={params}
    />
  );
}
