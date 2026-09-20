import { getTemperatureRecords } from "@/actions/temperature";
import { getFacilities } from "@/actions/master";
import { TemperatureListClient } from "./client";

export default async function TemperaturePage({
  searchParams,
}: {
  searchParams: Promise<{ facilityId?: string; date?: string }>;
}) {
  const params = await searchParams;
  const [records, facilities] = await Promise.all([
    getTemperatureRecords(params),
    getFacilities(),
  ]);

  return (
    <TemperatureListClient
      records={JSON.parse(JSON.stringify(records))}
      facilities={JSON.parse(JSON.stringify(facilities))}
      filters={params}
    />
  );
}
