"use client";

import { useActionState, useEffect, useRef } from "react";
import { createFeedback, updateFeedbackStatus } from "@/actions/feedback";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

const categoryLabels: Record<string, string> = { REQUEST: "要望", BUG: "不具合", QUESTION: "質問", OTHER: "その他" };
const statusLabels: Record<string, string> = { NEW: "未確認", REVIEWED: "確認済", DONE: "対応済" };
const statusVariant: Record<string, "warning" | "info" | "success"> = { NEW: "warning", REVIEWED: "info", DONE: "success" };

type Feedback = {
  id: string; category: string; content: string; pageUrl: string | null; status: string;
  createdAt: string; submittedBy: { name: string };
};

export function FeedbackClient({ feedbacks, canReview }: { feedbacks: Feedback[]; canReview: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(createFeedback, null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">フィードバック</h1>

      <Card className="mb-6" title="ご要望・不具合を送る">
        <form ref={formRef} action={formAction} className="space-y-4">
          {state?.error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>}
          {state?.success && <div className="bg-green-50 text-green-700 text-sm p-3 rounded-lg">送信しました。ありがとうございます。</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">種類</label>
            <select name="category" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]">
              <option value="">選択してください</option>
              {Object.entries(categoryLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">内容</label>
            <textarea name="content" rows={4} required maxLength={2000} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" placeholder="「〇〇の画面で△△したい」「□□を押すとエラーになる」など、気づいたことを自由にお書きください" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">関係する画面（任意）</label>
            <input name="pageUrl" maxLength={500} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" placeholder="例: 温度管理の記録画面" />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={pending}>{pending ? "送信中..." : "送信する"}</Button>
          </div>
        </form>
      </Card>

      <Card title={canReview ? "受信したフィードバック" : "送信履歴"}>
        {feedbacks.length === 0 ? (
          <p className="text-sm text-gray-400">まだフィードバックはありません</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {feedbacks.map((f) => (
              <li key={f.id} className="py-4 flex flex-col md:flex-row md:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Badge>{categoryLabels[f.category]}</Badge>
                    <Badge variant={statusVariant[f.status]}>{statusLabels[f.status]}</Badge>
                    <span className="text-xs text-gray-500">{formatDateTime(f.createdAt)} / {f.submittedBy.name}</span>
                  </div>
                  <p className="text-sm text-gray-800 whitespace-pre-wrap">{f.content}</p>
                  {f.pageUrl && <p className="text-xs text-gray-500 mt-1">画面: {f.pageUrl}</p>}
                </div>
                {canReview && <StatusForm id={f.id} status={f.status} />}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

function StatusForm({ id, status }: { id: string; status: string }) {
  const [state, formAction, pending] = useActionState(updateFeedbackStatus, null);
  return (
    <form action={formAction} className="flex items-center gap-2 shrink-0">
      <input type="hidden" name="id" value={id} />
      <select name="status" defaultValue={status} className="px-2 py-1.5 border border-gray-300 rounded-lg text-sm bg-white">
        {Object.entries(statusLabels).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <Button type="submit" variant="secondary" disabled={pending}>更新</Button>
      {state?.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
