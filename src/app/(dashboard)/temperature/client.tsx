"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, AlertTriangle } from "lucide-react";
import { formatDateTime } from "@/lib/utils";

type Record = {
  id: string; temperature: string; isNormal: boolean; recordedAt: string; notes: string | null;
  facility: { name: string; code: string }; recordedBy: { name: string };
};
type Facility = { id: string; name: string; code: string };

export function TemperatureListClient({
  records, facilities, filters,
}: {
  records: Record[]; facilities: Facility[];
  filters: { facilityId?: string; date?: string };
}) {
  const router = useRouter();

  const handleFilter = (key: string, value: string) => {
    const params = new URLSearchParams();
    if (filters.facilityId) params.set("facilityId", filters.facilityId);
    if (filters.date) params.set("date", filters.date);
    if (value) params.set(key, value); else params.delete(key);
    router.push(`/temperature?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">温度記録一覧</h1>
        <div className="flex gap-3">
          <Link href="/temperature/alerts">
            <Button variant="secondary">
              <AlertTriangle className="w-4 h-4 mr-2" />アラート管理
            </Button>
          </Link>
          <Link href="/temperature/new">
            <Button><Plus className="w-4 h-4 mr-2" />温度を記録</Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">設備</label>
            <select
              value={filters.facilityId || ""}
              onChange={(e) => handleFilter("facilityId", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
            >
              <option value="">すべて</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">記録日時</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">設備</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">温度</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">状態</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">記録者</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">備考</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
            ) : (
              records.map((r) => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{formatDateTime(r.recordedAt)}</td>
                  <td className="px-4 py-3 text-sm">{r.facility.name}</td>
                  <td className="px-4 py-3 text-sm font-mono">{Number(r.temperature).toFixed(1)}℃</td>
                  <td className="px-4 py-3 text-sm">
                    <Badge variant={r.isNormal ? "success" : "danger"}>
                      {r.isNormal ? "正常" : "異常"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm">{r.recordedBy.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{r.notes || "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
