"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { CHEMICAL_KIND_LABELS, type ChemicalKindValue } from "@/validations/chemicals";

type ChemicalUsage = {
  id: string; usedAt: string; chemicalKind: ChemicalKindValue; chemicalName: string | null;
  quantity: string; unit: string; purpose: string; notes: string | null;
  usedBy: { name: string }; recordedBy: { name: string };
};

const TH = "px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50 whitespace-nowrap";

function chemicalLabel(r: ChemicalUsage) {
  return r.chemicalKind === "OTHER" ? `その他: ${r.chemicalName ?? ""}` : CHEMICAL_KIND_LABELS[r.chemicalKind];
}

export function ChemicalsListClient({ records, month }: { records: ChemicalUsage[]; month: string }) {
  const router = useRouter();

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">劇物薬品使用記録</h1>
        <Link href="/chemicals/new">
          <Button><Plus className="w-4 h-4 mr-2" />使用記録</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <div className="flex gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">年月</label>
            <input type="month" value={month} onChange={(e) => e.target.value && router.push(`/chemicals?month=${e.target.value}`)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
          </div>
        </div>
      </Card>

      <Card>
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b">
              <th className={TH}>使用日時</th>
              <th className={TH}>薬品</th>
              <th className={TH}>数量</th>
              <th className={TH}>単位</th>
              <th className={TH}>用途</th>
              <th className={TH}>使用者</th>
              <th className={TH}>記録者</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">データがありません</td></tr>
            ) : records.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-sm whitespace-nowrap">{formatDateTime(r.usedAt)}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{chemicalLabel(r)}</td>
                <td className="px-4 py-3 text-sm font-mono">{Number(r.quantity).toLocaleString()}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{r.unit}</td>
                <td className="px-4 py-3 text-sm">{r.purpose}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{r.usedBy.name}</td>
                <td className="px-4 py-3 text-sm whitespace-nowrap">{r.recordedBy.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
