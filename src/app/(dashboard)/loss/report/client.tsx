"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#ef4444", "#8b5cf6"];

type Report = {
  byCategory: { category: string; totalQuantity: number; count: number }[];
  byProduct: { product: string; totalQuantity: number; count: number; unit: string }[];
  totalLoss: number;
  totalProduction: number;
  overallLossRate: number;
  recordCount: number;
};

export function LossReportClient({ report, startDate, endDate }: { report: Report; startDate: string; endDate: string }) {
  const router = useRouter();

  const handleChange = (key: string, value: string) => {
    const params = new URLSearchParams();
    params.set("startDate", key === "startDate" ? value : startDate);
    params.set("endDate", key === "endDate" ? value : endDate);
    router.push(`/loss/report?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.push("/loss")}>
          <ArrowLeft className="w-4 h-4 mr-1" />戻る
        </Button>
        <h1 className="text-2xl font-bold text-gray-800">ロスレポート</h1>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4 items-end">
          <div>
            <label className="block text-xs text-gray-500 mb-1">開始日</label>
            <input type="date" value={startDate} onChange={(e) => handleChange("startDate", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">終了日</label>
            <input type="date" value={endDate} onChange={(e) => handleChange("endDate", e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
      </Card>

      {/* Summary KPIs */}
      <div className="grid grid-cols-4 gap-5 mb-6">
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <span className="text-xs text-gray-500">総ロス数量</span>
          <p className="text-2xl font-bold mt-1">{report.totalLoss.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <span className="text-xs text-gray-500">総製造数量</span>
          <p className="text-2xl font-bold mt-1">{report.totalProduction.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <span className="text-xs text-gray-500">ロス率</span>
          <p className="text-2xl font-bold mt-1">{report.overallLossRate}%</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <span className="text-xs text-gray-500">記録件数</span>
          <p className="text-2xl font-bold mt-1">{report.recordCount}件</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* By Category Pie */}
        <Card title="カテゴリ別ロス">
          {report.byCategory.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">データがありません</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={report.byCategory} dataKey="totalQuantity" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ name, value }: { name?: string; value?: number }) => `${name}: ${value}`}>
                    {report.byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>

        {/* By Product Bar */}
        <Card title="製品別ロス">
          {report.byProduct.length === 0 ? (
            <p className="text-center text-sm text-gray-400 py-8">データがありません</p>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.byProduct}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="product" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="totalQuantity" fill="#ef4444" radius={[4, 4, 0, 0]} name="ロス数量" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
