"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { createTemperatureRecord } from "@/actions/temperature";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useEffect } from "react";

type Facility = { id: string; name: string; code: string; type: string; tempLowerLimit: string | null; tempUpperLimit: string | null };

export function NewTemperatureClient({ facilities }: { facilities: Facility[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createTemperatureRecord, null);

  useEffect(() => {
    if (state?.success) router.push("/temperature");
  }, [state, router]);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">温度記録</h1>
      <Card>
        <form action={formAction} className="space-y-5">
          {state?.error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">設備</label>
            <select name="facilityId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]">
              <option value="">設備を選択</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} {f.tempUpperLimit ? `(上限: ${f.tempUpperLimit}℃)` : ""} {f.tempLowerLimit ? `(下限: ${f.tempLowerLimit}℃)` : ""}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">温度 (℃)</label>
            <input name="temperature" type="number" step="0.1" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" placeholder="例: 3.5" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea name="notes" rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>キャンセル</Button>
            <Button type="submit" disabled={pending}>{pending ? "記録中..." : "記録する"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
