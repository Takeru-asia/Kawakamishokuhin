import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Demo data for lot traceability: material master, material lots,
// product lots for every production item, and material->product links.
// Idempotent: skips items that already have a product lot.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const MATERIALS = [
  { code: "MAT-001", name: "大豆（国産）", unit: "kg", supplier: "北海道農協" },
  { code: "MAT-002", name: "にがり", unit: "L", supplier: "沖縄海塩" },
  { code: "MAT-003", name: "消泡剤", unit: "kg", supplier: "食品資材商事" },
  { code: "MAT-004", name: "包装フィルム", unit: "枚", supplier: "包装工業" },
];

function ymd(d: Date) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}

async function main() {
  console.log("Seeding lot traceability demo data...");

  const materials = [];
  for (const m of MATERIALS) {
    materials.push(
      await prisma.material.upsert({ where: { code: m.code }, update: {}, create: m }),
    );
  }
  console.log(`  -> ${materials.length} materials`);

  // One material lot per material every ~7 days over the past 60 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const materialLots: { id: string; materialCode: string; receivedDate: Date }[] = [];
  for (let i = 63; i >= 0; i -= 7) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    let seq = 1;
    for (const m of materials) {
      const lotNumber = `MLT-${ymd(date)}-${String(seq++).padStart(3, "0")}`;
      const expiry = new Date(date);
      expiry.setDate(expiry.getDate() + (m.code === "MAT-001" ? 180 : 365));
      const lot = await prisma.materialLot.upsert({
        where: { lotNumber },
        update: {},
        create: {
          materialId: m.id,
          lotNumber,
          receivedDate: date,
          expiryDate: expiry,
          quantity: m.code === "MAT-001" ? 500 : m.code === "MAT-002" ? 40 : 100,
          supplierLot: `${m.supplier?.slice(0, 2) ?? "SP"}-${ymd(date)}`,
        },
      });
      materialLots.push({ id: lot.id, materialCode: m.code, receivedDate: date });
    }
  }
  console.log(`  -> ${materialLots.length} material lots`);

  // Product lots for production items that don't have one yet
  const items = await prisma.productionRecordItem.findMany({
    where: { productLots: { none: {} } },
    include: { productionRecord: true },
    orderBy: [{ productionRecord: { productionDate: "asc" } }, { createdAt: "asc" }],
  });

  let lotCount = 0;
  let linkCount = 0;
  const seqByDate = new Map<string, number>();
  for (const item of items) {
    const date = item.productionRecord.productionDate;
    const key = ymd(date);
    const seq = (seqByDate.get(key) ?? 0) + 1;
    seqByDate.set(key, seq);
    const lotNumber = `PLT-${key}-${String(seq).padStart(3, "0")}`;
    const expiry = new Date(date);
    expiry.setDate(expiry.getDate() + 7);

    const productLot = await prisma.productLot.create({
      data: {
        productionRecordItemId: item.id,
        productId: item.productId,
        lotNumber,
        productionDate: date,
        quantity: item.quantity,
        expiryDate: expiry,
      },
    });
    lotCount++;

    // Link the most recent material lot (received on/before production date)
    // for soybeans and nigari — the two ingredients every tofu lot uses.
    for (const code of ["MAT-001", "MAT-002"]) {
      const candidate = [...materialLots]
        .filter((ml) => ml.materialCode === code && ml.receivedDate <= date)
        .sort((a, b) => b.receivedDate.getTime() - a.receivedDate.getTime())[0];
      if (!candidate) continue;
      await prisma.lotLink.create({
        data: {
          materialLotId: candidate.id,
          productLotId: productLot.id,
          quantityUsed: code === "MAT-001" ? Number(item.quantity) * 0.3 : Number(item.quantity) * 0.02,
        },
      });
      linkCount++;
    }
  }
  console.log(`  -> ${lotCount} product lots, ${linkCount} lot links`);
  console.log("Lot demo data complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
