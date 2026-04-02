"use client";

import useSWR from "swr";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Package,
  AlertTriangle,
  ShieldCheck,
  TrendingDown,
  Plus,
  Thermometer,
  Search,
  ClipboardList,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatDateTime } from "@/lib/utils";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DashboardPage() {
  const { data: kpi } = useSWR("/api/dashboard/kpi", fetcher, { refreshInterval: 30000 });
  const { data: alerts } = useSWR("/api/dashboard/alerts", fetcher, { refreshInterval: 30000 });
  const { data: chartData } = useSWR("/api/dashboard/production-chart", fetcher, { refreshInterval: 30000 });
  const { data: tempStatus } = useSWR("/api/dashboard/temperature-status", fetcher, { refreshInterval: 30000 });

  return (
    <div>
      {/* Alert Banner */}
      {alerts && alerts.length > 0 && (
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-4 rounded-lg mb-6 flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-bold">温度異常を検出しました</h3>
            <p className="text-xs opacity-90">
              {alerts[0].facility.name}の温度が{Number(alerts[0].temperatureRecord.temperature).toFixed(1)}℃に変動しています。
              基準値: {Number(alerts[0].threshold).toFixed(1)}℃
            </p>
          </div>
          <Link href="/temperature/alerts">
            <button className="bg-white text-red-600 px-4 py-2 rounded-md text-sm font-bold">
              確認する
            </button>
          </Link>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6">
        <KPICard
          title="本日の製造数量"
          value={kpi ? kpi.todayProduction.toLocaleString() : "—"}
          unit="個"
          icon={<Package className="w-5 h-5 text-white" />}
          iconBg="bg-green-600"
        />
        <KPICard
          title="衛生検査合格率"
          value={kpi ? `${kpi.hygieneRate}` : "—"}
          unit="%"
          icon={<ShieldCheck className="w-5 h-5 text-white" />}
          iconBg="bg-blue-600"
        />
        <KPICard
          title="ロス率（今月）"
          value={kpi ? `${kpi.lossRate}` : "—"}
          unit="%"
          icon={<TrendingDown className="w-5 h-5 text-white" />}
          iconBg="bg-orange-600"
        />
        <KPICard
          title="温度異常件数"
          value={kpi ? `${kpi.alertCount}` : "—"}
          unit="件"
          icon={<AlertTriangle className="w-5 h-5 text-white" />}
          iconBg="bg-purple-600"
          highlight={kpi?.alertCount > 0}
        />
      </div>

      {/* Charts and Temperature Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card
            title="製造実績（過去60日間）"
            action={<Link href="/production" className="text-sm text-[#1a5f2a]">詳細を見る →</Link>}
          >
            <div className="h-56">
              {chartData ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="label" tick={false} />
                    <YAxis tick={false} />
                    <Tooltip labelStyle={{ fontSize: 13, fontWeight: 600 }} />
                    <Bar dataKey="total" fill="#22c55e" radius={[4, 4, 0, 0]} name="製造数" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">読み込み中...</div>
              )}
            </div>
          </Card>
        </div>

        <Card
          title="温度記録（最新）"
          action={<Link href="/temperature" className="text-sm text-[#1a5f2a]">すべて見る →</Link>}
        >
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-500 pb-2">設備</th>
                <th className="text-left text-xs text-gray-500 pb-2">温度</th>
                <th className="text-left text-xs text-gray-500 pb-2">状態</th>
              </tr>
            </thead>
            <tbody>
              {tempStatus ? (
                tempStatus.map((t: { facilityId: string; facilityName: string; temperature: number | null; isNormal: boolean }) => (
                  <tr key={t.facilityId} className="border-t">
                    <td className="py-2.5 text-sm">{t.facilityName}</td>
                    <td className="py-2.5 text-sm font-mono">
                      {t.temperature != null ? `${t.temperature.toFixed(1)}℃` : "—"}
                    </td>
                    <td className="py-2.5">
                      <Badge variant={t.isNormal ? "success" : "danger"}>
                        {t.isNormal ? "正常" : "異常"}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-400">読み込み中...</td></tr>
              )}
            </tbody>
          </table>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="クイックアクション">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Link href="/production/new">
            <QuickAction icon={<Plus className="w-6 h-6" />} label="製造実績を登録" />
          </Link>
          <Link href="/temperature/new">
            <QuickAction icon={<Thermometer className="w-6 h-6" />} label="温度を記録" />
          </Link>
          <Link href="/lots">
            <QuickAction icon={<Search className="w-6 h-6" />} label="ロット検索" />
          </Link>
          <Link href="/hygiene/new">
            <QuickAction icon={<ClipboardList className="w-6 h-6" />} label="衛生記録" />
          </Link>
        </div>
      </Card>
    </div>
  );
}

function KPICard({
  title, value, unit, icon, iconBg, highlight,
}: {
  title: string; value: string; unit: string; icon: React.ReactNode; iconBg: string; highlight?: boolean;
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs text-gray-500">{title}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold">
        {value}
        <span className="text-sm font-normal text-gray-500 ml-1">{unit}</span>
      </div>
      {highlight && <span className="text-xs text-red-600 font-medium">要対応</span>}
    </div>
  );
}

function QuickAction({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-[#1a5f2a] transition-all cursor-pointer text-left">
      <div className="text-[#1a5f2a] mb-2">{icon}</div>
      <span className="text-sm font-semibold text-gray-700">{label}</span>
    </div>
  );
}
