"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, FileText } from "lucide-react";
import { formatDate } from "@/lib/utils";

type LossRecord = {
  id: string; recordDate: string; quantity: string; lossRate: string | null; notes: string | null;
  product: { name: string; code: string; unit: string };
  category: { name: string }; recordedBy: { name: string };
};
type Category = { id: string; name: string };
type Product = { id: string; name: string };

export function LossListClient({
  records, categories, products, filters,
}: {
  records: LossRecord[]; categories: Category[]; products: Product[];
  filters: { productId?: string; categoryId?: string; date?: string };
}) {
  const router = useRouter();

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (filters.productId) params.set("productId", filters.productId);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.date) params.set("date", filters.date);
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/loss?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ロス管理</h1>
        <div className="flex gap-3">
          <Link href="/loss/report">
            <Button variant="secondary"><FileText className="w-4 h-4 mr-2" />レポート</Button>
          </Link>
          <Link href="/loss/new">
            <Button><Plus className="w-4 h-4 mr-2" />ロス記録</Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">製品</label>
            <select value={filters.productId || ""} onChange={(e) => handleFilter("productId", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="">すべて</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">カテゴリ</label>
            <select value={filters.categoryId || ""} onChange={(e) => handleFilter("categoryId", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="">すべて</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">日付</label>
            <input type="date" value={filters.date || ""} onChange={(e) => handleFilter("date", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
      </Card>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">記録日</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">製品</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">カテゴリ</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">数量</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">ロス率</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">記録者</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
            ) : records.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{formatDate(r.recordDate)}</td>
                <td className="px-4 py-3 text-sm">{r.product.name}</td>
                <td className="px-4 py-3 text-sm">{r.category.name}</td>
                <td className="px-4 py-3 text-sm font-mono">{Number(r.quantity).toLocaleString()} {r.product.unit}</td>
                <td className="px-4 py-3 text-sm">
                  {r.lossRate ? (
                    <Badge variant={Number(r.lossRate) <= 2 ? "success" : Number(r.lossRate) <= 4 ? "warning" : "danger"}>
                      {Number(r.lossRate).toFixed(1)}%
                    </Badge>
                  ) : "—"}
                </td>
                <td className="px-4 py-3 text-sm">{r.recordedBy.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
