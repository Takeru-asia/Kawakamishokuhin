import { getLossRecords, getLossCategories } from "@/actions/loss";
import { getProducts } from "@/actions/master";
import { LossListClient } from "./client";

export default async function LossPage({
  searchParams,
}: {
  searchParams: Promise<{ productId?: string; categoryId?: string; date?: string }>;
}) {
  const params = await searchParams;
  const [records, categories, products] = await Promise.all([
    getLossRecords(params),
    getLossCategories(),
    getProducts(),
  ]);

  return (
    <LossListClient
      records={JSON.parse(JSON.stringify(records))}
      categories={JSON.parse(JSON.stringify(categories))}
      products={JSON.parse(JSON.stringify(products))}
      filters={params}
    />
  );
}
