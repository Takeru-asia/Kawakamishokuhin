"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

type HealthCheck = {
  id: string; checkDate: string; clockInAt: string; bodyTemperature: string;
  hasHandInjury: boolean; hasSymptoms: boolean; hasSickFamily: boolean;
  hasCap: boolean; hasMask: boolean; hasUniform: boolean; isAbnormal: boolean;
  notes: string | null; user: { name: string }; recordedBy: { name: string };
};

const TH = "px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50 whitespace-nowrap";
const TD = "px-4 py-3 text-sm whitespace-nowrap";
// HH:mm in JST on both server and browser (avoids hydration mismatch across host time zones)
const hhmm = (iso: string) =>
  new Date(iso).toLocaleTimeString("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", hour12: false });
// Only the problems are listed; an empty list renders as "—"
const flagged = (pairs: [boolean, string][]) => {
  const hits = pairs.filter(([on]) => on).map(([, label]) => label);
  return hits.length ? <span className="text-red-600 font-medium">{hits.join("・")}</span> : "—";
};

export function HealthListClient({ records, date }: { records: HealthCheck[]; date: string }) {
  const router = useRouter();
  const abnormalCount = records.filter((r) => r.isAbnormal).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">出勤時チェック</h1>
        <Link href="/health/new">
          <Button><Plus className="w-4 h-4 mr-2" />チェック登録</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex items-end gap-6">
          <div>
            <label className="block text-xs text-gray-500 mb-1">日付</label>
            <input type="date" value={date} onChange={(e) => router.push(`/health?date=${e.target.value}`)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <p className="text-sm text-gray-700 pb-2">
            本日: {records.length}名登録 / 異常 <span className={abnormalCount > 0 ? "text-red-600 font-semibold" : ""}>{abnormalCount}名</span>
          </p>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b">
              <th className={TH}>日付</th>
              <th className={TH}>出勤時刻</th>
              <th className={TH}>従業員</th>
              <th className={TH}>体温</th>
              <th className={TH}>体調（該当あり）</th>
              <th className={TH}>服装（未着用）</th>
              <th className={TH}>判定</th>
              <th className={TH}>記録者</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
            ) : records.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className={TD}>{formatDate(r.checkDate)}</td>
                <td className={`${TD} font-mono`}>{hhmm(r.clockInAt)}</td>
                <td className={TD}>{r.user.name}</td>
                <td className={`${TD} font-mono`}>{Number(r.bodyTemperature).toFixed(1)}℃</td>
                <td className="px-4 py-3 text-sm">
                  {flagged([[r.hasHandInjury, "手指の傷"], [r.hasSymptoms, "症状"], [r.hasSickFamily, "家族の病気"]])}
                </td>
                <td className="px-4 py-3 text-sm">
                  {flagged([[!r.hasCap, "帽子"], [!r.hasMask, "マスク"], [!r.hasUniform, "作業着"]])}
                </td>
                <td className={TD}>
                  <Badge variant={r.isAbnormal ? "danger" : "success"}>{r.isAbnormal ? "異常" : "正常"}</Badge>
                </td>
                <td className={TD}>{r.recordedBy.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>
    </div>
  );
}
