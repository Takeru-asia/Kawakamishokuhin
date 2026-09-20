import { getProducts } from "@/actions/master";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { SetTargetClient } from "./client";

export default async function SetTargetPage() {
  const session = await getSession();
  if (session?.role !== "ADMIN" && session?.role !== "MANAGER") redirect("/targets");

  const products = await getProducts();
  return <SetTargetClient products={JSON.parse(JSON.stringify(products))} />;
}
