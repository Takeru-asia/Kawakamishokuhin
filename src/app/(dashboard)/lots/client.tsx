"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createMaterialLot } from "@/actions/lots";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import { Search, Plus, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ProductLot = {
  id: string; lotNumber: string; productionDate: string; quantity: string;
  product: { name: string; code: string; unit: string };
};
type MaterialLot = {
  id: string; lotNumber: string; receivedDate: string; quantity: string; supplierLot: string | null;
  material: { name: string; code: string; unit: string };
};
type Material = { id: string; name: string; code: string; unit: string };

export function LotsClient({
  productLots, materialLots, materials, tab, query,
}: {
  productLots: ProductLot[]; materialLots: MaterialLot[]; materials: Material[];
  tab: string; query: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState(query);
  const [showModal, setShowModal] = useState(false);
  const [state, formAction, pending] = useActionState(createMaterialLot, null);

  useEffect(() => {
    if (state?.success) setShowModal(false);
  }, [state]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set("tab", tab);
    if (search) params.set("q", search);
    router.push(`/lots?${params.toString()}`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">ロット管理</h1>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />原材料ロット登録
        </Button>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => router.push(`/lots?tab=product${search ? `&q=${search}` : ""}`)}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", tab === "product" ? "bg-[#1a5f2a] text-white" : "bg-white text-gray-600 border")}
        >
          製品ロット
        </button>
        <button
          onClick={() => router.push(`/lots?tab=material${search ? `&q=${search}` : ""}`)}
          className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors", tab === "material" ? "bg-[#1a5f2a] text-white" : "bg-white text-gray-600 border")}
        >
          原材料ロット
        </button>
      </div>

      <Card className="mb-6">
        <div className="flex gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="ロット番号、製品名で検索..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
          />
          <Button onClick={handleSearch} variant="secondary">
            <Search className="w-4 h-4 mr-1" />検索
          </Button>
        </div>
      </Card>

      <Card>
        {tab === "product" ? (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">ロット番号</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">製品</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">製造日</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">数量</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">トレース</th>
              </tr>
            </thead>
            <tbody>
              {productLots.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
              ) : productLots.map((lot) => (
                <tr key={lot.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm"><Badge variant="info">{lot.lotNumber}</Badge></td>
                  <td className="px-4 py-3 text-sm">{lot.product.name}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(lot.productionDate)}</td>
                  <td className="px-4 py-3 text-sm font-mono">{Number(lot.quantity).toLocaleString()} {lot.product.unit}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/lots/${lot.id}?type=product`}>
                      <button className="p-1 text-gray-400 hover:text-[#1a5f2a]"><Eye className="w-4 h-4" /></button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">ロット番号</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">原材料</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">入荷日</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">数量</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">仕入先ロット</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 bg-gray-50">トレース</th>
              </tr>
            </thead>
            <tbody>
              {materialLots.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
              ) : materialLots.map((lot) => (
                <tr key={lot.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm"><Badge variant="success">{lot.lotNumber}</Badge></td>
                  <td className="px-4 py-3 text-sm">{lot.material.name}</td>
                  <td className="px-4 py-3 text-sm">{formatDate(lot.receivedDate)}</td>
                  <td className="px-4 py-3 text-sm font-mono">{Number(lot.quantity).toLocaleString()} {lot.material.unit}</td>
                  <td className="px-4 py-3 text-sm">{lot.supplierLot || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/lots/${lot.id}?type=material`}>
                      <button className="p-1 text-gray-400 hover:text-[#1a5f2a]"><Eye className="w-4 h-4" /></button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="原材料ロット登録">
        <form action={formAction} className="space-y-4">
          {state?.error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg">{state.error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">原材料</label>
            <select name="materialId" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white">
              <option value="">選択してください</option>
              {materials.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">入荷日</label>
            <input name="receivedDate" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">有効期限</label>
            <input name="expiryDate" type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
            <input name="quantity" type="number" step="0.01" required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">仕入先ロット番号</label>
            <input name="supplierLot" className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>キャンセル</Button>
            <Button type="submit" disabled={pending}>{pending ? "登録中..." : "登録"}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
