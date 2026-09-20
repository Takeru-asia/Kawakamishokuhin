import { getProductionRecord } from "@/actions/production";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function ProductionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await getProductionRecord(id);
  if (!record) notFound();

  const data = JSON.parse(JSON.stringify(record));

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/production">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />戻る</Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">製造実績詳細</h1>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-xs text-gray-500">製造日</span>
            <p className="text-sm font-medium">{formatDate(data.productionDate)}</p>
          </div>
          <div>
            <span className="text-xs text-gray-500">記録者</span>
            <p className="text-sm font-medium">{data.recordedBy.name}</p>
          </div>
          {data.notes && (
            <div className="col-span-2">
              <span className="text-xs text-gray-500">備考</span>
              <p className="text-sm">{data.notes}</p>
            </div>
          )}
        </div>
      </Card>

      <Card title="製造明細">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">製品</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">数量</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 bg-gray-50">ロット番号</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item: { id: string; quantity: string; product: { name: string; unit: string; code: string }; productLots: { lotNumber: string }[] }) => (
              <tr key={item.id} className="border-b">
                <td className="px-4 py-3 text-sm">{item.product.name}</td>
                <td className="px-4 py-3 text-sm font-mono">{Number(item.quantity).toLocaleString()} {item.product.unit}</td>
                <td className="px-4 py-3 text-sm">
                  {item.productLots.map((lot: { lotNumber: string }) => (
                    <Badge key={lot.lotNumber} variant="info" className="mr-1">{lot.lotNumber}</Badge>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
