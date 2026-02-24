import { getMaterials } from "@/actions/master";
import { getSession } from "@/lib/session";
import { MaterialsClient } from "./client";

export default async function MaterialsPage() {
  const [materials, session] = await Promise.all([getMaterials(), getSession()]);
  const canEdit = session?.role === "ADMIN" || session?.role === "MANAGER";
  return <MaterialsClient materials={materials} canEdit={canEdit} />;
}
