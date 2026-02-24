import { getProducts } from "@/actions/master";
import { getSession } from "@/lib/session";
import { ProductsClient } from "./client";

export default async function ProductsPage() {
  const [products, session] = await Promise.all([getProducts(), getSession()]);
  const canEdit = session?.role === "ADMIN" || session?.role === "MANAGER";
  return <ProductsClient products={products} canEdit={canEdit} />;
}
