"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProductionRecord } from "@/actions/production";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";

type Product = { id: string; code: string; name: string; unit: string };
type Item = { productId: string; quantity: string };

export function NewProductionClient({ products }: { products: Product[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createProductionRecord, null);
  const [items, setItems] = useState<Item[]>([{ productId: "", quantity: "" }]);

  useEffect(() => {
    if (state?.success) router.push("/production");
  }, [state, router]);

  const addItem = () => setItems([...items, { productId: "", quantity: "" }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, key: keyof Item, value: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: value };
    setItems(next);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">製造実績登録</h1>
      <Card>
        <form
          action={(formData) => {
            formData.set("items", JSON.stringify(items.filter((i) => i.productId && i.quantity).map((i) => ({ productId: i.productId, quantity: Number(i.quantity) }))));
            formAction(formData);
          }}
          className="space-y-5"
        >
          {state?.error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">製造日</label>
            <input name="productionDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">製造明細</label>
              <Button type="button" size="sm" variant="secondary" onClick={addItem}>
                <Plus className="w-3 h-3 mr-1" />行追加
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item, i) => (
                <div key={i} className="flex gap-3 items-end">
                  <div className="flex-1">
                    {i === 0 && <label className="block text-xs text-gray-500 mb-1">製品</label>}
                    <select
                      value={item.productId}
                      onChange={(e) => updateItem(i, "productId", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
                    >
                      <option value="">製品を選択</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32">
                    {i === 0 && <label className="block text-xs text-gray-500 mb-1">数量</label>}
                    <input
                      type="number"
                      step="0.01"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="0"
                    />
                  </div>
                  {items.length > 1 && (
                    <button type="button" onClick={() => removeItem(i)} className="p-2 text-gray-400 hover:text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
            <textarea name="notes" rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
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
