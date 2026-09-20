"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

type ProductionRecord = {
  id: string; productionDate: string; notes: string | null;
  recordedBy: { name: string };
  items: { id: string; quantity: string; product: { name: string; unit: string; code: string } }[];
};

export function ProductionListClient({
  records, filters,
}: {
  records: ProductionRecord[];
  filters: { date?: string };
}) {
  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">製造実績一覧</h1>
        <Link href="/production/new">
          <Button><Plus className="w-4 h-4 mr-2" />新規登録</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div>
          <label className="block text-xs text-gray-500 mb-1">製造日</label>
          <input
            type="date"
            value={filters.date || ""}
            onChange={(e) => router.push(e.target.value ? `/production?date=${e.target.value}` : "/production")}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
        </div>
      </Card>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">製造日</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">製品</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">合計数量</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">記録者</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">操作</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{formatDate(r.productionDate)}</td>
                  <td className="px-4 py-3 text-sm">
                    {r.items.map((item) => item.product.name).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono">
                    {r.items.map((item) => `${Number(item.quantity).toLocaleString()} ${item.product.unit}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 text-sm">{r.recordedBy.name}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/production/${r.id}`}>
                      <button className="p-1 text-gray-400 hover:text-[#1a5f2a]">
                        <Eye className="w-4 h-4" />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
