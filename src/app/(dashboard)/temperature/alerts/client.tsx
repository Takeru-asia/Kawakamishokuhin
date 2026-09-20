"use client";

import { useState, useActionState } from "react";
import { updateAlert } from "@/actions/temperature";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { formatDateTime } from "@/lib/utils";

const statusLabels: Record<string, string> = { OPEN: "未対応", ACKNOWLEDGED: "確認済", RESOLVED: "解決済" };
const statusVariant: Record<string, "danger" | "warning" | "success"> = { OPEN: "danger", ACKNOWLEDGED: "warning", RESOLVED: "success" };

type Alert = {
  id: string; alertTemperature: string; threshold: string; status: string;
  correctiveAction: string | null; resolvedAt: string | null; createdAt: string;
  facility: { name: string; code: string };
  temperatureRecord: { temperature: string; recordedAt: string };
  resolvedBy: { name: string } | null;
};

export function AlertsClient({ alerts, canResolve }: { alerts: Alert[]; canResolve: boolean }) {
  const [selected, setSelected] = useState<Alert | null>(null);
  const [state, formAction, pending] = useActionState(updateAlert, null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">アラート管理</h1>
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">発生日時</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">設備</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">検出温度</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">基準値</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">ステータス</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">是正措置</th>
              {canResolve && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">操作</th>}
            </tr>
          </thead>
          <tbody>
            {alerts.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">アラートはありません</td></tr>
            ) : (
              alerts.map((a) => (
                <tr key={a.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm">{formatDateTime(a.createdAt)}</td>
                  <td className="px-4 py-3 text-sm">{a.facility.name}</td>
                  <td className="px-4 py-3 text-sm font-mono text-red-600">{Number(a.alertTemperature).toFixed(1)}℃</td>
                  <td className="px-4 py-3 text-sm font-mono">{Number(a.threshold).toFixed(1)}℃</td>
                  <td className="px-4 py-3 text-sm"><Badge variant={statusVariant[a.status]}>{statusLabels[a.status]}</Badge></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{a.correctiveAction || "—"}</td>
                  {canResolve && a.status !== "RESOLVED" && (
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" onClick={() => setSelected(a)}>対応</Button>
                    </td>
                  )}
                  {canResolve && a.status === "RESOLVED" && (
                    <td className="px-4 py-3 text-right text-sm text-gray-400">
                      {a.resolvedBy?.name}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="アラート対応">
        {selected && (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={selected.id} />
            {state?.error && (
              <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>
            )}
            <div className="bg-red-50 p-3 rounded-lg text-sm">
              <p><span className="font-medium">設備:</span> {selected.facility.name}</p>
              <p><span className="font-medium">検出温度:</span> {Number(selected.alertTemperature).toFixed(1)}℃ (基準: {Number(selected.threshold).toFixed(1)}℃)</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ステータス</label>
              <select name="status" defaultValue={selected.status === "OPEN" ? "ACKNOWLEDGED" : "RESOLVED"} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
                <option value="ACKNOWLEDGED">確認済み</option>
                <option value="RESOLVED">解決済み</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">是正措置</label>
              <textarea name="correctiveAction" rows={3} defaultValue={selected.correctiveAction || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" placeholder="実施した是正措置を入力" />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={() => setSelected(null)}>キャンセル</Button>
              <Button type="submit" disabled={pending}>{pending ? "更新中..." : "更新"}</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
