import { getProductionTargets } from "@/actions/targets";
import { getProducts } from "@/actions/master";
import { getSession } from "@/lib/session";
import { TargetsClient } from "./client";

export default async function TargetsPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; productId?: string }>;
}) {
  const params = await searchParams;
  const [targets, products, session] = await Promise.all([
    getProductionTargets(params),
    getProducts(),
    getSession(),
  ]);
  const canEdit = session?.role === "ADMIN" || session?.role === "MANAGER";

  return (
    <TargetsClient
      targets={JSON.parse(JSON.stringify(targets))}
      products={JSON.parse(JSON.stringify(products))}
      canEdit={canEdit}
      filters={params}
    />
  );
}
