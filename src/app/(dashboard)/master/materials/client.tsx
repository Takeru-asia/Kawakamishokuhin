"use client";

import { useState, useActionState } from "react";
import { createMaterial, updateMaterial, deleteMaterial } from "@/actions/master";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Material = { id: string; code: string; name: string; unit: string; supplier: string | null };

export function MaterialsClient({ materials, canEdit }: { materials: Material[]; canEdit: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [createState, createAction, createPending] = useActionState(createMaterial, null);
  const [updateState, updateAction, updatePending] = useActionState(updateMaterial, null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">原材料マスタ</h1>
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">コード</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">名称</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">単位</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">仕入先</th>
              {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">操作</th>}
            </tr>
          </thead>
          <tbody>
            {materials.map((m) => (
              <tr key={m.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">{m.code}</td>
                <td className="px-4 py-3 text-sm">{m.name}</td>
                <td className="px-4 py-3 text-sm">{m.unit}</td>
                <td className="px-4 py-3 text-sm">{m.supplier || "—"}</td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(m); setShowModal(true); }} className="p-1 text-gray-400 hover:text-blue-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={async () => { if (confirm(`「${m.name}」を削除しますか？`)) await deleteMaterial(m.id); }} className="p-1 text-gray-400 hover:text-red-600 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "原材料を編集" : "原材料を追加"}>
        <form action={editing ? updateAction : createAction} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {(editing ? updateState : createState)?.error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{(editing ? updateState : createState)?.error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">コード</label>
            <input name="code" defaultValue={editing?.code} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
            <input name="name" defaultValue={editing?.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">単位</label>
            <input name="unit" defaultValue={editing?.unit} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">仕入先</label>
            <input name="supplier" defaultValue={editing?.supplier || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>キャンセル</Button>
            <Button type="submit" disabled={editing ? updatePending : createPending}>
              {(editing ? updatePending : createPending) ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
