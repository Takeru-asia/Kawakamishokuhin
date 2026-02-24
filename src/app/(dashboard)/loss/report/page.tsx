import { getLossReport } from "@/actions/loss";
import { LossReportClient } from "./client";

export default async function LossReportPage({
  searchParams,
}: {
  searchParams: Promise<{ startDate?: string; endDate?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startDate = params.startDate || firstOfMonth.toISOString().slice(0, 10);
  const endDate = params.endDate || now.toISOString().slice(0, 10);

  const report = await getLossReport(startDate, endDate);
  return <LossReportClient report={JSON.parse(JSON.stringify(report))} startDate={startDate} endDate={endDate} />;
}
