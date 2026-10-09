"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatDate } from "@/lib/utils";

const typeLabels: Record<string, string> = { THERMOMETER: "温度計", SCALE: "スケール", OTHER: "その他" };
const frequencyLabels: Record<string, string> = { DAILY: "毎日", MONTHLY: "毎月" };
const kindLabels: Record<string, string> = { CALIBRATION: "校正", INSPECTION: "点検" };
const resultLabels: Record<string, string> = { PASS: "合格", FAIL: "不合格", NA: "該当なし" };
const resultVariant: Record<string, "success" | "danger" | "default"> = { PASS: "success", FAIL: "danger", NA: "default" };

type DueStatus = {
  id: string; code: string; name: string; type: string; checkFrequency: string;
  lastCheckDate: string | null; isOverdue: boolean;
};
type Check = {
  id: string; checkDate: string; kind: string; result: string; measuredValue: string | null; notes: string | null;
  equipment: { code: string; name: string; type: string }; recordedBy: { name: string };
};

const th = "px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50 whitespace-nowrap";

export function EquipmentChecksClient({ dueStatus, checks }: { dueStatus: DueStatus[]; checks: Check[] }) {
  const overdueCount = dueStatus.filter((d) => d.isOverdue).length;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">計器点検</h1>
        <Link href="/equipment-checks/new">
          <Button><Plus className="w-4 h-4 mr-2" />点検記録</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">点検状況</h2>
          {overdueCount > 0 ? (
            <Badge variant="danger">未実施 {overdueCount} 件</Badge>
          ) : (
            <Badge variant="success">すべて実施済</Badge>
          )}
        </div>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b">
              <th className={th}>計器</th>
              <th className={th}>種別</th>
              <th className={th}>周期</th>
              <th className={th}>最終点検日</th>
              <th className={th}>状態</th>
            </tr>
          </thead>
          <tbody>
            {dueStatus.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">計器が登録されていません</td></tr>
            ) : dueStatus.map((d) => (
              <tr key={d.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm"><span className="font-mono text-gray-500 mr-2">{d.code}</span>{d.name}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{typeLabels[d.type]}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{frequencyLabels[d.checkFrequency]}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{d.lastCheckDate ? formatDate(d.lastCheckDate) : "—"}</td>
                <td className="px-4 py-3 text-sm">
                  <Badge variant={d.isOverdue ? "danger" : "success"}>{d.isOverdue ? "未実施" : "実施済"}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">最近の点検記録</h2>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b">
              <th className={th}>点検日</th>
              <th className={th}>計器</th>
              <th className={th}>種類</th>
              <th className={th}>結果</th>
              <th className={th}>測定値</th>
              <th className={th}>記録者</th>
              <th className={th}>備考</th>
            </tr>
          </thead>
          <tbody>
            {checks.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
            ) : checks.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDate(c.checkDate)}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap"><span className="font-mono text-gray-500 mr-2">{c.equipment.code}</span>{c.equipment.name}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{kindLabels[c.kind]}</td>
                <td className="px-4 py-3 text-sm"><Badge variant={resultVariant[c.result]}>{resultLabels[c.result]}</Badge></td>
                <td className="px-4 py-3 text-sm font-mono">{c.measuredValue != null ? Number(c.measuredValue).toFixed(2) : "—"}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{c.recordedBy.name}</td>
                <td className="px-4 py-3 text-sm max-w-xs truncate">{c.notes || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
