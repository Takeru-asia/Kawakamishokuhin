"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createLossRecord } from "@/actions/loss";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Product = { id: string; name: string; unit: string };
type Category = { id: string; name: string };

export function NewLossClient({ products, categories }: { products: Product[]; categories: Category[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createLossRecord, null);

  useEffect(() => {
    if (state?.success) router.push("/loss");
  }, [state, router]);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">ロス記録</h1>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ロスカテゴリ</label>
            <select name="categoryId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]">
              <option value="">選択してください</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">記録日</label>
            <input name="recordDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
            <input name="quantity" type="number" step="0.01" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" placeholder="例: 50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea name="notes" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
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
