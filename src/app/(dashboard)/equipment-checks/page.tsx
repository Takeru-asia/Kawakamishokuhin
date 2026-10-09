import { getEquipmentChecks, getEquipmentDueStatus } from "@/actions/equipment";
import { EquipmentChecksClient } from "./client";

export default async function EquipmentChecksPage() {
  const [dueStatus, checks] = await Promise.all([
    getEquipmentDueStatus(),
    getEquipmentChecks({ limit: 50 }),
  ]);

  return (
    <EquipmentChecksClient
      dueStatus={JSON.parse(JSON.stringify(dueStatus))}
      checks={JSON.parse(JSON.stringify(checks))}
    />
  );
}
