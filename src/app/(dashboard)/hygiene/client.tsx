"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

const resultLabels: Record<string, string> = { PASS: "合格", FAIL: "不合格", NA: "該当なし" };
const resultVariant: Record<string, "success" | "danger" | "default"> = { PASS: "success", FAIL: "danger", NA: "default" };

type HygieneRecord = {
  id: string; recordDate: string; details: string; result: string; notes: string | null;
  category: { name: string }; facility: { name: string } | null; recordedBy: { name: string };
};
type Category = { id: string; name: string };

export function HygieneListClient({
  records, categories, filters,
}: {
  records: HygieneRecord[]; categories: Category[];
  filters: { categoryId?: string; date?: string };
}) {
  const router = useRouter();

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.date) params.set("date", filters.date);
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/hygiene?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">衛生管理記録</h1>
        <Link href="/hygiene/new">
          <Button><Plus className="w-4 h-4 mr-2" />新規記録</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
            <select
              value={filters.categoryId || ""}
              onChange={(e) => handleFilter("categoryId", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">すべて</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">日付</label>
            <input
              type="date"
              value={filters.date || ""}
              onChange={(e) => handleFilter("date", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
        </div>
      </Card>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">記録日</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">カテゴリ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">設備</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">内容</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">結果</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">記録者</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
            ) : records.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{formatDate(r.recordDate)}</td>
                <td className="px-4 py-3 text-sm">{r.category.name}</td>
                <td className="px-4 py-3 text-sm">{r.facility?.name || "—"}</td>
                <td className="px-4 py-3 text-sm max-w-xs truncate">{r.details}</td>
                <td className="px-4 py-3 text-sm"><Badge variant={resultVariant[r.result]}>{resultLabels[r.result]}</Badge></td>
                <td className="px-4 py-3 text-sm">{r.recordedBy.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
