import { getHygieneCategories } from "@/actions/hygiene";
import { getFacilities } from "@/actions/master";
import { NewHygieneClient } from "./client";

export default async function NewHygienePage() {
  const [categories, facilities] = await Promise.all([
    getHygieneCategories(),
    getFacilities(),
  ]);

  return (
    <NewHygieneClient
      categories={JSON.parse(JSON.stringify(categories))}
      facilities={JSON.parse(JSON.stringify(facilities))}
    />
  );
}
