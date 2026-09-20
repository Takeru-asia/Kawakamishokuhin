import { getProducts } from "@/actions/master";
import { NewProductionClient } from "./client";

export default async function NewProductionPage() {
  const products = await getProducts();
  return <NewProductionClient products={JSON.parse(JSON.stringify(products))} />;
}
