"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { upsertProductionPlan } from "@/actions/plan";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Product = { id: string; code: string; name: string; unit: string };
type Material = { id: string; code: string; name: string; unit: string };
type Plan = {
  notes: string | null;
  setBy: { name: string };
  items: { productId: string; plannedQuantity: string | number }[];
  materials: { materialId: string; quantity: string | number }[];
};

const inputClass =
  "w-32 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]";

function toMap(rows: { key: string; value: string | number }[]) {
  return Object.fromEntries(rows.map((r) => [r.key, String(Number(r.value))]));
}

export function ProductionPlanClient({
  date, canEdit, plan, products, materials,
}: {
  date: string; canEdit: boolean; plan: Plan | null; products: Product[]; materials: Material[];
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(upsertProductionPlan, null);
  // page.tsx keys this component by date so switching the picker re-seeds inputs from the loaded plan
  const [itemQty, setItemQty] = useState<Record<string, string>>(() =>
    toMap((plan?.items ?? []).map((i) => ({ key: i.productId, value: i.plannedQuantity })))
  );
  const [materialQty, setMaterialQty] = useState<Record<string, string>>(() =>
    toMap((plan?.materials ?? []).map((m) => ({ key: m.materialId, value: m.quantity })))
  );

  const submit = (formData: FormData) => {
    formData.set("planDate", date);
    formData.set("items", JSON.stringify(
      products.map((p) => ({ productId: p.id, plannedQuantity: Number(itemQty[p.id] || 0) }))
    ));
    formData.set("materials", JSON.stringify(
      materials.map((m) => ({ materialId: m.id, quantity: Number(materialQty[m.id] || 0) }))
    ));
    formAction(formData);
  };

  // Plain render helper (not a nested component) so inputs keep focus across re-renders
  const renderQuantity = (label: string, value: string, onChange: (v: string) => void) =>
    canEdit ? (
      <input
        type="number" step="0.01" min="0" value={value} aria-label={label}
        onChange={(e) => onChange(e.target.value)} className={inputClass} placeholder="0"
      />
    ) : (
      <span className="font-mono">{value || "—"}</span>
    );

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">製造予定</h1>
        <Link href="/" className="text-sm text-[#1a5f2a]">← ダッシュボードへ戻る</Link>
      </div>

      <Card className="mb-6">
        <div className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">予定日</label>
            <input
              type="date" value={date}
              onChange={(e) => e.target.value && router.push(`/production/plan?date=${e.target.value}`)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]"
            />
          </div>
          <p className="text-sm text-gray-500 pb-2">
            {plan ? `設定者: ${plan.setBy.name}` : "この日の予定は未設定です"}
            {!canEdit && "（閲覧のみ）"}
          </p>
        </div>
      </Card>

      <form action={submit} className="space-y-6">
        {state?.error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>}
        {state?.success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">保存しました</div>}

        <Card title="本日の製造予定">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-500 pb-2">製品</th>
                <th className="text-right text-xs text-gray-500 pb-2">予定数量</th>
                <th className="text-left text-xs text-gray-500 pb-2 pl-3">単位</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-t">
                  <td className="py-2.5 text-sm">{p.name}</td>
                  <td className="py-2.5 text-right">
                    {renderQuantity(p.name, itemQty[p.id] ?? "", (v) => setItemQty({ ...itemQty, [p.id]: v }))}
                  </td>
                  <td className="py-2.5 text-sm text-gray-500 pl-3">{p.unit}</td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-400">有効な製品がありません</td></tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card title="大豆仕込み数量">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-xs text-gray-500 pb-2">原材料</th>
                <th className="text-right text-xs text-gray-500 pb-2">数量</th>
                <th className="text-left text-xs text-gray-500 pb-2 pl-3">単位</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr key={m.id} className="border-t">
                  <td className="py-2.5 text-sm">{m.name}</td>
                  <td className="py-2.5 text-right">
                    {renderQuantity(m.name, materialQty[m.id] ?? "", (v) => setMaterialQty({ ...materialQty, [m.id]: v }))}
                  </td>
                  <td className="py-2.5 text-sm text-gray-500 pl-3">{m.unit}</td>
                </tr>
              ))}
              {materials.length === 0 && (
                <tr><td colSpan={3} className="py-4 text-center text-sm text-gray-400">有効な原材料がありません</td></tr>
              )}
            </tbody>
          </table>
        </Card>

        <Card title="備考">
          {canEdit ? (
            <textarea
              name="notes" rows={3} defaultValue={plan?.notes ?? ""}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]"
            />
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{plan?.notes || "—"}</p>
          )}
        </Card>

        {canEdit && (
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>{pending ? "保存中..." : "保存する"}</Button>
          </div>
        )}
      </form>
    </div>
  );
}
