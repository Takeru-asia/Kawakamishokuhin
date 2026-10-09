import { getChemicalUsages } from "@/actions/chemicals";
import { ChemicalsListClient } from "./client";

export default async function ChemicalsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const params = await searchParams;
  // month is YYYY-MM (matches <input type="month"> value)
  const month = /^\d{4}-\d{2}$/.test(params.month ?? "") ? params.month! : new Date().toLocaleDateString("sv-SE").slice(0, 7);
  const [y, m] = month.split("-").map(Number);
  const from = new Date(y, m - 1, 1).toLocaleDateString("sv-SE");
  const to = new Date(y, m, 1).toLocaleDateString("sv-SE");
  const records = await getChemicalUsages({ from, to });

  return <ChemicalsListClient records={JSON.parse(JSON.stringify(records))} month={month} />;
}
