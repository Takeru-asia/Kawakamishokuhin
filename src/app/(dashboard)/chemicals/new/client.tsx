"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createChemicalUsage } from "@/actions/chemicals";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CHEMICAL_KINDS, CHEMICAL_KIND_LABELS, type ChemicalKindValue } from "@/validations/chemicals";

type Employee = { id: string; name: string };

const INPUT = "w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]";
const LABEL = "block text-sm font-medium text-gray-700 mb-1";

// Date/time defaults come from the server page so SSR and hydration render the same values
export function NewChemicalClient({ employees, currentUserId, today, nowTime }: {
  employees: Employee[]; currentUserId: string; today: string; nowTime: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createChemicalUsage, null);
  const [kind, setKind] = useState<ChemicalKindValue>("SODIUM_HYDROXIDE");

  useEffect(() => {
    if (state?.success) router.push("/chemicals");
  }, [state, router]);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">劇物薬品使用記録</h1>
      <Card>
        <form action={formAction} className="space-y-5">
          {state?.error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>使用日</label>
              <input name="usedDate" type="date" required defaultValue={today} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>時刻</label>
              <input name="usedTime" type="time" required defaultValue={nowTime} className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>薬品</label>
            <select name="chemicalKind" required value={kind} onChange={(e) => setKind(e.target.value as ChemicalKindValue)} className={`${INPUT} bg-white`}>
              {CHEMICAL_KINDS.map((k) => <option key={k} value={k}>{CHEMICAL_KIND_LABELS[k]}</option>)}
            </select>
          </div>
          {kind === "OTHER" && (
            <div>
              <label className={LABEL}>薬品名</label>
              <input name="chemicalName" type="text" required className={INPUT} placeholder="例: エタノール" />
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>数量</label>
              <input name="quantity" type="number" step="0.01" min="0.01" required className={INPUT} placeholder="例: 2.5" />
            </div>
            <div>
              <label className={LABEL}>単位</label>
              <input name="unit" type="text" required defaultValue="L" maxLength={20} className={INPUT} />
            </div>
          </div>
          <div>
            <label className={LABEL}>用途</label>
            <input name="purpose" type="text" required className={INPUT} placeholder="例: 製造ライン殺菌" />
          </div>
          <div>
            <label className={LABEL}>使用者</label>
            <select name="usedById" required defaultValue={currentUserId} className={`${INPUT} bg-white`}>
              <option value="">選択してください</option>
              {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>備考</label>
            <textarea name="notes" rows={2} className={INPUT} />
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
