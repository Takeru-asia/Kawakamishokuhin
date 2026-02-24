import { searchProductLots, searchMaterialLots } from "@/actions/lots";
import { getMaterials } from "@/actions/master";
import { LotsClient } from "./client";

export default async function LotsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; q?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab || "product";
  const q = params.q || "";

  const [productLots, materialLots, materials] = await Promise.all([
    tab === "product" ? searchProductLots(q || undefined) : Promise.resolve([]),
    tab === "material" ? searchMaterialLots(q || undefined) : Promise.resolve([]),
    getMaterials(),
  ]);

  return (
    <LotsClient
      productLots={JSON.parse(JSON.stringify(productLots))}
      materialLots={JSON.parse(JSON.stringify(materialLots))}
      materials={JSON.parse(JSON.stringify(materials))}
      tab={tab}
      query={q}
    />
  );
}
