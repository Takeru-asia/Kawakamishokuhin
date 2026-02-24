"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProductionTarget } from "@/actions/targets";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Product = { id: string; name: string; unit: string };

export function SetTargetClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const now = new Date();
  const [state, formAction, pending] = useActionState(createProductionTarget, null);

  useEffect(() => {
    if (state?.success) router.push("/targets");
  }, [state, router]);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">製造目標設定</h1>
      <Card>
        <form action={formAction} className="space-y-5">
          {state?.error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">製品</label>
            <select name="productId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]">
              <option value="">選択してください</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">年</label>
              <input name="targetYear" type="number" required defaultValue={now.getFullYear()} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">月</label>
              <select name="targetMonth" required defaultValue={now.getMonth() + 1} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => <option key={m} value={m}>{m}月</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">月間目標数量</label>
            <input name="targetQuantity" type="number" step="0.01" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" placeholder="例: 10000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">日次目標数量（任意）</label>
            <input name="dailyTarget" type="number" step="0.01" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" placeholder="例: 500" />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => router.back()}>キャンセル</Button>
            <Button type="submit" disabled={pending}>{pending ? "設定中..." : "設定する"}</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
