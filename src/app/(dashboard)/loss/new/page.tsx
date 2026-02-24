import { getProducts } from "@/actions/master";
import { getLossCategories } from "@/actions/loss";
import { NewLossClient } from "./client";

export default async function NewLossPage() {
  const [products, categories] = await Promise.all([getProducts(), getLossCategories()]);
  return (
    <NewLossClient
      products={JSON.parse(JSON.stringify(products))}
      categories={JSON.parse(JSON.stringify(categories))}
    />
  );
}
