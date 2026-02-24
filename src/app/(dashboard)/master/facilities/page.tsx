import { getFacilities } from "@/actions/master";
import { getSession } from "@/lib/session";
import { FacilitiesClient } from "./client";

export default async function FacilitiesPage() {
  const [facilities, session] = await Promise.all([getFacilities(), getSession()]);
  const canEdit = session?.role === "ADMIN" || session?.role === "MANAGER";
  return <FacilitiesClient facilities={JSON.parse(JSON.stringify(facilities))} canEdit={canEdit} />;
}
