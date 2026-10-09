"use client";

import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/card";

type PlanSummary = {
  planDate: string;
  items: { productName: string; unit: string; plannedQuantity: number }[];
  materials: { materialName: string; unit: string; quantity: number }[];
} | null;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function PlanTable({ headers, rows }: { headers: [string, string, string]; rows: [string, number, string][] }) {
  return (
    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left text-xs text-gray-500 pb-2">{headers[0]}</th>
          <th className="text-right text-xs text-gray-500 pb-2">{headers[1]}</th>
          <th className="text-left text-xs text-gray-500 pb-2 pl-3">{headers[2]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.length === 0 ? (
          <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-400">未設定</td></tr>
        ) : (
          rows.map(([name, qty, unit]) => (
            <tr key={name} className="border-t">
              <td className="py-2.5 text-sm">{name}</td>
              <td className="py-2.5 text-sm font-mono text-right">{qty.toLocaleString()}</td>
              <td className="py-2.5 text-sm text-gray-500 pl-3">{unit}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}

// Today's production plan + soybean prep quantity, set the day before on /production/plan
export function TodayPlan() {
  const { data, isLoading } = useSWR<PlanSummary>("/api/dashboard/plan", fetcher, { refreshInterval: 30000 });
  const editLink = <Link href="/production/plan" className="text-sm text-[#1a5f2a]">予定を設定 →</Link>;

  if (isLoading) {
    return (
      <Card title="本日の製造予定" className="mb-6">
        <div className="py-4 text-center text-sm text-gray-400">読み込み中...</div>
      </Card>
    );
  }

  // null = no plan today; a non-array `items` means an error payload from the API
  if (!data || !Array.isArray(data.items)) {
    return (
      <Card title="本日の製造予定" action={editLink} className="mb-6">
        <p className="text-sm text-gray-500">本日の製造予定は未設定です</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card title="本日の製造予定" action={editLink}>
        <PlanTable
          headers={["製品", "予定数量", "単位"]}
          rows={data.items.map((i) => [i.productName, i.plannedQuantity, i.unit])}
        />
      </Card>
      <Card title="大豆仕込み数量">
        <PlanTable
          headers={["原材料", "数量", "単位"]}
          rows={data.materials.map((m) => [m.materialName, m.quantity, m.unit])}
        />
      </Card>
    </div>
  );
}
