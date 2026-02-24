import { getTargetAnalysis } from "@/actions/targets";
import { AnalysisClient } from "./client";

export default async function AnalysisPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const year = params.year ? Number(params.year) : now.getFullYear();
  const month = params.month ? Number(params.month) : now.getMonth() + 1;

  const analysis = await getTargetAnalysis(year, month);
  return <AnalysisClient analysis={JSON.parse(JSON.stringify(analysis))} year={year} month={month} />;
}
