"use client";

import { useState, useActionState } from "react";
import { createUser, updateUser, deleteUser } from "@/actions/master";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";

const roleLabels: Record<string, string> = { ADMIN: "管理者", MANAGER: "マネージャー", WORKER: "作業者" };
const roleBadge: Record<string, "danger" | "warning" | "info"> = { ADMIN: "danger", MANAGER: "warning", WORKER: "info" };

type User = { id: string; name: string; email: string; role: string; createdAt: string };

export function UsersClient({ users }: { users: User[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [createState, createAction, createPending] = useActionState(createUser, null);
  const [updateState, updateAction, updatePending] = useActionState(updateUser, null);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ユーザー管理</h1>
        <Button onClick={() => { setEditing(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />新規追加
        </Button>
      </div>

      <Card>
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">名前</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">メールアドレス</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">ロール</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">{u.name}</td>
                <td className="px-4 py-3 text-sm">{u.email}</td>
                <td className="px-4 py-3 text-sm"><Badge variant={roleBadge[u.role]}>{roleLabels[u.role]}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => { setEditing(u); setShowModal(true); }} className="p-1 text-gray-400 hover:text-blue-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(u)} className="p-1 text-gray-400 hover:text-red-600 ml-2">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title={editing ? "ユーザーを編集" : "ユーザーを追加"}>
        <form action={editing ? updateAction : createAction} className="space-y-4">
          {editing && <input type="hidden" name="id" value={editing.id} />}
          {(editing ? updateState : createState)?.error && (
            <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{(editing ? updateState : createState)?.error}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">名前</label>
            <input name="name" defaultValue={editing?.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input name="email" type="email" defaultValue={editing?.email} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード{editing && "（変更する場合のみ入力）"}
            </label>
            <input name="password" type="password" minLength={8} required={!editing} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ロール</label>
            <select name="role" defaultValue={editing?.role || "WORKER"} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a5f2a] bg-white">
              <option value="ADMIN">管理者</option>
              <option value="MANAGER">マネージャー</option>
              <option value="WORKER">作業者</option>
            </select>
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
        title="ユーザーの削除"
        message={`「${deleteTarget?.name}」を削除しますか？この操作は元に戻せません。`}
        confirmLabel="削除"
        variant="danger"
        onConfirm={async () => {
          if (deleteTarget) await deleteUser(deleteTarget.id);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
