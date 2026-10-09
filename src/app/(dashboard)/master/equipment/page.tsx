import { getEquipmentList } from "@/actions/master-extra";
import { getSession } from "@/lib/session";
import { EquipmentClient } from "./client";

export default async function EquipmentMasterPage() {
  const [equipment, session] = await Promise.all([getEquipmentList(), getSession()]);
  const canEdit = session?.role === "ADMIN" || session?.role === "MANAGER";
  return <EquipmentClient equipment={JSON.parse(JSON.stringify(equipment))} canEdit={canEdit} />;
}
