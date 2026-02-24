"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { deleteProductionTarget } from "@/actions/targets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, BarChart3, Trash2 } from "lucide-react";

type Target = {
  id: string; targetYear: number; targetMonth: number; targetQuantity: string; dailyTarget: string | null;
  product: { name: string; code: string; unit: string }; setBy: { name: string };
};
type Product = { id: string; name: string };

export function TargetsClient({
  targets, products, canEdit, filters,
}: {
  targets: Target[]; products: Product[]; canEdit: boolean;
  filters: { year?: string; month?: string; productId?: string };
}) {
  const router = useRouter();
  const now = new Date();

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (filters.year) params.set("year", filters.year);
    if (filters.month) params.set("month", filters.month);
    if (filters.productId) params.set("productId", filters.productId);
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/targets?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">製造目標</h1>
        <div className="flex gap-3">
          <Link href={`/targets/analysis?year=${filters.year || now.getFullYear()}&month=${filters.month || now.getMonth() + 1}`}>
            <Button variant="secondary"><BarChart3 className="w-4 h-4 mr-2" />達成分析</Button>
          </Link>
          {canEdit && (
            <Link href="/targets/set">
              <Button><Plus className="w-4 h-4 mr-2" />目標設定</Button>
            </Link>
          )}
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">年</label>
            <select value={filters.year || ""} onChange={(e) => handleFilter("year", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="">すべて</option>
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}年</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">月</label>
            <select value={filters.month || ""} onChange={(e) => handleFilter("month", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="">すべて</option>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">製品</label>
            <select value={filters.productId || ""} onChange={(e) => handleFilter("productId", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="">すべて</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
        </div>
      </Card>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">年月</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">製品</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">月間目標</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">日次目標</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">設定者</th>
              {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">操作</th>}
            </tr>
          </thead>
          <tbody>
            {targets.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
            ) : targets.map((t) => (
              <tr key={t.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{t.targetYear}年{t.targetMonth}月</td>
                <td className="px-4 py-3 text-sm">{t.product.name}</td>
                <td className="px-4 py-3 text-sm font-mono">{Number(t.targetQuantity).toLocaleString()} {t.product.unit}</td>
                <td className="px-4 py-3 text-sm font-mono">{t.dailyTarget ? `${Number(t.dailyTarget).toLocaleString()} ${t.product.unit}` : "—"}</td>
                <td className="px-4 py-3 text-sm">{t.setBy.name}</td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={async () => { if (confirm("この目標を削除しますか？")) await deleteProductionTarget(t.id); }} className="p-1 text-gray-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
