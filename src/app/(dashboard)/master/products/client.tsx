"use client";

import { useState, useActionState } from "react";
import { createProduct, updateProduct, deleteProduct } from "@/actions/master";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

type Product = { id: string; code: string; name: string; unit: string };

export function ProductsClient({ products, canEdit }: { products: Product[]; canEdit: boolean }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [createState, createAction, createPending] = useActionState(createProduct, null);
  const [updateState, updateAction, updatePending] = useActionState(updateProduct, null);

  const openCreate = () => { setEditing(null); setShowModal(true); };
  const openEdit = (p: Product) => { setEditing(p); setShowModal(true); };

  const handleSuccess = () => {
    if ((!editing && createState?.success) || (editing && updateState?.success)) {
      setShowModal(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">製品マスタ</h1>
        {canEdit && (
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" />
            新規追加
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
              {canEdit && <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">操作</th>}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-mono">{p.code}</td>
                <td className="px-4 py-3 text-sm">{p.name}</td>
                <td className="px-4 py-3 text-sm">{p.unit}</td>
                {canEdit && (
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => openEdit(p)} className="p-1 text-gray-400 hover:text-blue-600">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(p)}
                      className="p-1 text-gray-400 hover:text-red-600 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "製品を編集" : "製品を追加"}>
        <form action={editing ? updateAction : createAction} onSubmit={() => setTimeout(handleSuccess, 500)} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {(editing ? updateState : createState)?.error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">
              {(editing ? updateState : createState)?.error}
            </div>
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
        title="製品の削除"
        message={`「${deleteTarget?.name}」を削除しますか？この操作は元に戻せません。`}
        confirmLabel="削除"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) await deleteProduct(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
