import { getHygieneCategoryList } from "@/actions/master-extra";
import { getSession } from "@/lib/session";
import { HygieneCategoriesClient } from "./client";

export default async function HygieneCategoriesPage() {
  const [categories, session] = await Promise.all([getHygieneCategoryList(), getSession()]);
  const canEdit = session?.role === "ADMIN" || session?.role === "MANAGER";
  return <HygieneCategoriesClient categories={JSON.parse(JSON.stringify(categories))} canEdit={canEdit} />;
}
