import { getLotDetail } from "@/actions/lots";
import { notFound } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowDown } from "lucide-react";

export default async function LotDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  const { id } = await params;
  const { type = "product" } = await searchParams;
  const lot = await getLotDetail(id, type as "product" | "material");
  if (!lot) notFound();

  const data = JSON.parse(JSON.stringify(lot));

  if (type === "product") {
    return (
      <div className="max-w-2xl">
        <div className="flex items-center gap-4 mb-6">
          <Link href="/lots"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />戻る</Button></Link>
          <h1 className="text-2xl font-bold text-gray-800">ロットトレース</h1>
        </div>

        <Card className="mb-6" title="製品ロット情報">
          <div className="grid grid-cols-2 gap-4">
            <div><span className="text-xs text-gray-500">ロット番号</span><p className="text-sm font-medium"><Badge variant="info">{data.lotNumber}</Badge></p></div>
            <div><span className="text-xs text-gray-500">製品</span><p className="text-sm font-medium">{data.product.name}</p></div>
            <div><span className="text-xs text-gray-500">製造日</span><p className="text-sm font-medium">{formatDate(data.productionDate)}</p></div>
            <div><span className="text-xs text-gray-500">数量</span><p className="text-sm font-medium">{Number(data.quantity).toLocaleString()} {data.product.unit}</p></div>
          </div>
        </Card>

        <Card title={<span className="flex items-center gap-2"><ArrowDown className="w-4 h-4" />後方追跡（使用された原材料）</span>}>
          {data.lotLinks.length === 0 ? (
            <p className="text-sm text-gray-400">関連する原材料ロットはありません</p>
          ) : (
            <div className="space-y-3">
              {data.lotLinks.map((link: { id: string; quantityUsed: string | null; materialLot: { id: string; lotNumber: string; material: { name: string; code: string } } }) => (
                <div key={link.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <ArrowRight className="w-4 h-4 text-green-600" />
                  <div>
                    <Badge variant="success">{link.materialLot.lotNumber}</Badge>
                    <span className="ml-2 text-sm">{link.materialLot.material.name}</span>
                    {link.quantityUsed && <span className="ml-2 text-xs text-gray-500">使用量: {Number(link.quantityUsed).toLocaleString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Material lot view
  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/lots?tab=material"><Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" />戻る</Button></Link>
        <h1 className="text-2xl font-bold text-gray-800">ロットトレース</h1>
      </div>

      <Card className="mb-6" title="原材料ロット情報">
        <div className="grid grid-cols-2 gap-4">
          <div><span className="text-xs text-gray-500">ロット番号</span><p className="text-sm font-medium"><Badge variant="success">{data.lotNumber}</Badge></p></div>
          <div><span className="text-xs text-gray-500">原材料</span><p className="text-sm font-medium">{data.material.name}</p></div>
          <div><span className="text-xs text-gray-500">入荷日</span><p className="text-sm font-medium">{formatDate(data.receivedDate)}</p></div>
          <div><span className="text-xs text-gray-500">数量</span><p className="text-sm font-medium">{Number(data.quantity).toLocaleString()} {data.material.unit}</p></div>
          {data.supplierLot && <div><span className="text-xs text-gray-500">仕入先ロット</span><p className="text-sm font-medium">{data.supplierLot}</p></div>}
        </div>
      </Card>

      <Card title={<span className="flex items-center gap-2"><ArrowDown className="w-4 h-4" />前方追跡（製造された製品）</span>}>
        {data.lotLinks.length === 0 ? (
          <p className="text-sm text-gray-400">関連する製品ロットはありません</p>
        ) : (
          <div className="space-y-3">
            {data.lotLinks.map((link: { id: string; quantityUsed: string | null; productLot: { id: string; lotNumber: string; product: { name: string; code: string } } }) => (
              <div key={link.id} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <ArrowRight className="w-4 h-4 text-blue-600" />
                <div>
                  <Badge variant="info">{link.productLot.lotNumber}</Badge>
                  <span className="ml-2 text-sm">{link.productLot.product.name}</span>
                  {link.quantityUsed && <span className="ml-2 text-xs text-gray-500">使用量: {Number(link.quantityUsed).toLocaleString()}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
