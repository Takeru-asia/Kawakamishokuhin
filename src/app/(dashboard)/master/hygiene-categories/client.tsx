"use client";

import { useState, useActionState } from "react";
import { createHygieneCategory, updateHygieneCategory, deleteHygieneCategory } from "@/actions/master-extra";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Category = { id: string; name: string; description: string | null; sortOrder: number };

export function HygieneCategoriesClient({ categories, canEdit }: { categories: Category[]; canEdit: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [createState, createAction, createPending] = useActionState(createHygieneCategory, null);
  const [updateState, updateAction, updatePending] = useActionState(updateHygieneCategory, null);
  const nextSortOrder = categories.reduce((max, c) => Math.max(max, c.sortOrder), 0) + 1;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">衛生カテゴリマスタ</h1>
        {canEdit && (
          <Button onClick={() => { setEditing(null); setShowModal(true); }}>
            <Plus className="w-4 h-4 mr-2" />新規追加
          </Button>
        )}
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50 whitespace-nowrap">表示順</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">名称</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">説明</th>
              {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">操作</th>}
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr><td colSpan={canEdit ? 4 : 3} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">{c.sortOrder}</td>
                <td className="px-4 py-3 text-sm">{c.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{c.description || "—"}</td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(c); setShowModal(true); }} className="p-1 text-gray-400 hover:text-blue-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(c)} className="p-1 text-gray-400 hover:text-red-600 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "カテゴリを編集" : "カテゴリを追加"}>
        <form action={editing ? updateAction : createAction} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {(editing ? updateState : createState)?.error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{(editing ? updateState : createState)?.error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input name="name" defaultValue={editing?.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">説明</label>
            <textarea name="description" rows={2} defaultValue={editing?.description || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">表示順</label>
            <input name="sortOrder" type="number" step="1" required defaultValue={editing?.sortOrder ?? nextSortOrder} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>キャンセル</Button>
            <Button type="submit" disabled={editing ? updatePending : createPending}>
              {(editing ? updatePending : createPending) ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="カテゴリの削除"
        message={`「${deleteTarget?.name}」を削除しますか？この操作は元に戻せません。`}
        confirmLabel="削除"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) await deleteHygieneCategory(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
