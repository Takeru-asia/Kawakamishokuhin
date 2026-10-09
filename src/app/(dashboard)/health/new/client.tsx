"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createHealthCheck } from "@/actions/health";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Employee = { id: string; name: string };

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]";
const LABEL = "block text-sm font-medium text-gray-700 mb-1";

function CheckRow({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-sm text-gray-700">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="w-4 h-4 rounded border-gray-300 accent-[#1a5f2a]" />
      {label}
    </label>
  );
}

// Date/time defaults come from the server page so SSR and hydration render the same values
export function NewHealthClient({ employees, currentUserId, today, nowTime }: {
  employees: Employee[]; currentUserId: string; today: string; nowTime: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createHealthCheck, null);

  useEffect(() => {
    if (state?.success) router.push("/health");
  }, [state, router]);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">出勤時チェック登録</h1>
      <Card>
        <form action={formAction} className="space-y-5">
          {state?.error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>}
          <div>
            <label className={LABEL}>従業員</label>
            <select name="userId" required defaultValue={currentUserId} className={`${INPUT} bg-white`}>
              <option value="">選択してください</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>日付</label>
              <input name="checkDate" type="date" required defaultValue={today} max={today} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>出勤時刻</label>
              <input name="clockInTime" type="time" required defaultValue={nowTime} className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>体温 (℃)</label>
            <input name="bodyTemperature" type="number" step="0.1" min="34" max="42" required className={INPUT} placeholder="例: 36.5" />
          </div>
          <div>
            <p className={LABEL}>体調</p>
            <div className="space-y-2">
              <CheckRow name="hasHandInjury" label="手指に傷がある" />
              <CheckRow name="hasSymptoms" label="下痢・嘔吐・発熱などの症状がある" />
              <CheckRow name="hasSickFamily" label="家族に同様の症状の人がいる" />
            </div>
          </div>
          <div>
            <p className={LABEL}>服装</p>
            <div className="space-y-2">
              <CheckRow name="hasCap" label="帽子着用" defaultChecked />
              <CheckRow name="hasMask" label="マスク着用" defaultChecked />
              <CheckRow name="hasUniform" label="作業着着用" defaultChecked />
            </div>
          </div>
          <div>
            <label className={LABEL}>備考</label>
            <textarea name="notes" rows={2} className={INPUT} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>キャンセル</Button>
            <Button type="submit" disabled={pending}>{pending ? "登録中..." : "登録する"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
