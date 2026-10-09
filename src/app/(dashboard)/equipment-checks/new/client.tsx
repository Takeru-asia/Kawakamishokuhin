"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createEquipmentCheck } from "@/actions/equipment";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Equipment = { id: string; code: string; name: string };

const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]";
const selectClass = `${inputClass} bg-white`;

export function NewEquipmentCheckClient({ equipment }: { equipment: Equipment[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createEquipmentCheck, null);

  useEffect(() => {
    if (state?.success) router.push("/equipment-checks");
  }, [state, router]);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">計器点検記録</h1>
      <Card>
        <form action={formAction} className="space-y-5">
          {state?.error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">計器</label>
            <select name="equipmentId" required className={selectClass}>
              <option value="">選択してください</option>
              {equipment.map((e) => <option key={e.id} value={e.id}>{e.code} {e.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">点検日</label>
            <input name="checkDate" type="date" required defaultValue={new Date().toLocaleDateString("sv-SE")} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
              <select name="kind" required className={selectClass}>
                <option value="">選択してください</option>
                <option value="CALIBRATION">校正</option>
                <option value="INSPECTION">点検</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">結果</label>
              <select name="result" required className={selectClass}>
                <option value="">選択してください</option>
                <option value="PASS">合格</option>
                <option value="FAIL">不合格</option>
                <option value="NA">該当なし</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">測定値（任意）</label>
            <input name="measuredValue" type="number" step="0.01" className={inputClass} placeholder="例: 0.0" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea name="notes" rows={2} className={inputClass} />
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
