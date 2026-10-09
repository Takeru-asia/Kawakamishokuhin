import { getActiveEquipment } from "@/actions/equipment";
import { NewEquipmentCheckClient } from "./client";

export default async function NewEquipmentCheckPage() {
  const equipment = await getActiveEquipment();
  return <NewEquipmentCheckClient equipment={JSON.parse(JSON.stringify(equipment))} />;
}
