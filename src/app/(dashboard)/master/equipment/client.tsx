"use client";

import { useState, useActionState } from "react";
import { createEquipment, updateEquipment, deleteEquipment } from "@/actions/master-extra";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const typeLabels: Record<string, string> = {
  THERMOMETER: "温度計",
  SCALE: "スケール",
  OTHER: "その他",
};
const frequencyLabels: Record<string, string> = {
  DAILY: "毎日",
  MONTHLY: "毎月",
};

type Equipment = {
  id: string; code: string; name: string; type: string;
  checkFrequency: string; location: string | null;
};

export function EquipmentClient({ equipment, canEdit }: { equipment: Equipment[]; canEdit: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Equipment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Equipment | null>(null);
  const [createState, createAction, createPending] = useActionState(createEquipment, null);
  const [updateState, updateAction, updatePending] = useActionState(updateEquipment, null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">計器マスタ</h1>
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">種別</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">点検周期</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">設置場所</th>
              {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">操作</th>}
            </tr>
          </thead>
          <tbody>
            {equipment.length === 0 ? (
              <tr><td colSpan={canEdit ? 6 : 5} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
            ) : equipment.map((e) => (
              <tr key={e.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">{e.code}</td>
                <td className="px-4 py-3 text-sm">{e.name}</td>
                <td className="px-4 py-3 text-sm"><Badge variant="info">{typeLabels[e.type]}</Badge></td>
                <td className="px-4 py-3 text-sm">{frequencyLabels[e.checkFrequency]}</td>
                <td className="px-4 py-3 text-sm">{e.location || "—"}</td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(e); setShowModal(true); }} className="p-1 text-gray-400 hover:text-blue-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(e)} className="p-1 text-gray-400 hover:text-red-600 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "計器を編集" : "計器を追加"}>
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">種別</label>
              <select name="type" defaultValue={editing?.type || "THERMOMETER"} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a] bg-white">
                <option value="THERMOMETER">温度計</option>
                <option value="SCALE">スケール</option>
                <option value="OTHER">その他</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">点検周期</label>
              <select name="checkFrequency" defaultValue={editing?.checkFrequency || "DAILY"} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a] bg-white">
                <option value="DAILY">毎日</option>
                <option value="MONTHLY">毎月</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">設置場所</label>
            <input name="location" defaultValue={editing?.location || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
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
        title="計器の削除"
        message={`「${deleteTarget?.name}」を削除しますか？この操作は元に戻せません。`}
        confirmLabel="削除"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) await deleteEquipment(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
