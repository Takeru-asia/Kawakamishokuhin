import { getFacilities } from "@/actions/master";
import { NewTemperatureClient } from "./client";

export default async function NewTemperaturePage() {
  const facilities = await getFacilities();
  return <NewTemperatureClient facilities={JSON.parse(JSON.stringify(facilities))} />;
}
