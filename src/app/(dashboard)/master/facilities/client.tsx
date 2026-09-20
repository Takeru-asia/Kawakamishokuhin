"use client";

import { useState, useActionState } from "react";
import { createFacility, updateFacility, deleteFacility } from "@/actions/master";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const facilityTypeLabels: Record<string, string> = {
  REFRIGERATOR: "冷蔵庫",
  FREEZER: "冷凍庫",
  HEATER: "加熱設備",
  OTHER: "その他",
};

type Facility = {
  id: string; code: string; name: string; type: string;
  tempLowerLimit: string | null; tempUpperLimit: string | null; location: string | null;
};

export function FacilitiesClient({ facilities, canEdit }: { facilities: Facility[]; canEdit: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Facility | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Facility | null>(null);
  const [createState, createAction, createPending] = useActionState(createFacility, null);
  const [updateState, updateAction, updatePending] = useActionState(updateFacility, null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">設備マスタ</h1>
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
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">温度下限</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">温度上限</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">設置場所</th>
              {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">操作</th>}
            </tr>
          </thead>
          <tbody>
            {facilities.map((f) => (
              <tr key={f.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">{f.code}</td>
                <td className="px-4 py-3 text-sm">{f.name}</td>
                <td className="px-4 py-3 text-sm"><Badge variant="info">{facilityTypeLabels[f.type]}</Badge></td>
                <td className="px-4 py-3 text-sm">{f.tempLowerLimit != null ? `${f.tempLowerLimit}℃` : "—"}</td>
                <td className="px-4 py-3 text-sm">{f.tempUpperLimit != null ? `${f.tempUpperLimit}℃` : "—"}</td>
                <td className="px-4 py-3 text-sm">{f.location || "—"}</td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => { setEditing(f); setShowModal(true); }} className="p-1 text-gray-400 hover:text-blue-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(f)} className="p-1 text-gray-400 hover:text-red-600 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "設備を編集" : "設備を追加"}>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">種別</label>
            <select name="type" defaultValue={editing?.type || "REFRIGERATOR"} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a] bg-white">
              <option value="REFRIGERATOR">冷蔵庫</option>
              <option value="FREEZER">冷凍庫</option>
              <option value="HEATER">加熱設備</option>
              <option value="OTHER">その他</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">温度下限 (℃)</label>
              <input name="tempLowerLimit" type="number" step="0.01" defaultValue={editing?.tempLowerLimit || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">温度上限 (℃)</label>
              <input name="tempUpperLimit" type="number" step="0.01" defaultValue={editing?.tempUpperLimit || ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
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
        title="設備の削除"
        message={`「${deleteTarget?.name}」を削除しますか？この操作は元に戻せません。`}
        confirmLabel="削除"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) await deleteFacility(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
