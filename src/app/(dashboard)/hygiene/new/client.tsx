"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createHygieneRecord } from "@/actions/hygiene";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type Category = { id: string; name: string };
type Facility = { id: string; name: string };

export function NewHygieneClient({ categories, facilities }: { categories: Category[]; facilities: Facility[] }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(createHygieneRecord, null);

  useEffect(() => {
    if (state?.success) router.push("/hygiene");
  }, [state, router]);

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">衛生管理記録</h1>
      <Card>
        <form action={formAction} className="space-y-5">
          {state?.error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
            <select name="categoryId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]">
              <option value="">選択してください</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">設備（任意）</label>
            <select name="facilityId" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]">
              <option value="">なし</option>
              {facilities.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">記録日</label>
            <input name="recordDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">詳細</label>
            <textarea name="details" rows={3} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" placeholder="実施内容を入力" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">結果</label>
            <select name="result" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]">
              <option value="">選択してください</option>
              <option value="PASS">合格</option>
              <option value="FAIL">不合格</option>
              <option value="NA">該当なし</option>
            </select>
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
