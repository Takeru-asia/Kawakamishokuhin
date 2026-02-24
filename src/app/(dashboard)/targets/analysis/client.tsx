"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

type Analysis = {
  productId: string; productName: string; productCode: string; unit: string;
  targetQuantity: number; actualQuantity: number; achievementRate: number;
};

export function AnalysisClient({ analysis, year, month }: { analysis: Analysis[]; year: number; month: number }) {
  const router = useRouter();

  const handleChange = (key: string, value: string) => {
    const params = new URLSearchParams();
    params.set("year", key === "year" ? value : String(year));
    params.set("month", key === "month" ? value : String(month));
    router.push(`/targets/analysis?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/targets")}>
          <ArrowLeft className="w-4 h-4 mr-1" />戻る
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">達成分析</h1>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">年</label>
            <select value={year} onChange={(e) => handleChange("year", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}年</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">月</label>
            <select value={month} onChange={(e) => handleChange("month", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
            </select>
          </div>
        </div>
      </Card>

      {analysis.length === 0 ? (
        <Card><p className="text-center text-sm text-gray-400 py-8">この月の目標データがありません</p></Card>
      ) : (
        <>
          <Card className="mb-6" title={`${year}年${month}月 達成率グラフ`}>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysis}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="productName" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="targetQuantity" fill="#94a3b8" name="目標" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actualQuantity" fill="#22c55e" name="実績" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card title="達成率詳細">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">製品</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">目標</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">実績</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">達成率</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">状態</th>
                </tr>
              </thead>
              <tbody>
                {analysis.map((a) => (
                  <tr key={a.productId} className="border-b">
                    <td className="px-4 py-3 text-sm">{a.productName}</td>
                    <td className="px-4 py-3 text-sm font-mono">{a.targetQuantity.toLocaleString()} {a.unit}</td>
                    <td className="px-4 py-3 text-sm font-mono">{a.actualQuantity.toLocaleString()} {a.unit}</td>
                    <td className="px-4 py-3 text-sm font-mono font-bold">{a.achievementRate}%</td>
                    <td className="px-4 py-3">
                      <Badge variant={a.achievementRate >= 100 ? "success" : a.achievementRate >= 80 ? "warning" : "danger"}>
                        {a.achievementRate >= 100 ? "達成" : a.achievementRate >= 80 ? "もう少し" : "未達"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </>
      )}
    </div>
  );
}
