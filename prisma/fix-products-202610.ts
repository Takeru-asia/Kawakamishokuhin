// One-off master-data fix (2026-10-09): the customer had already registered PRD-005..007
// (ゆし豆腐 / 焼き豆腐 / ソフト豆腐) in the product master, so seed-202610's first version
// skipped もめん/ゆしどうふ/厚揚げ生地 (code collision) and created duplicates of 絹ごし / ソフト豆腐.
// This script deactivates the two duplicates and adds 厚揚げ生地. Idempotent.
// Usage (against the pulled env): npx tsx prisma/fix-products-202610.ts <path-to-.env.prod>
import { readFileSync } from "node:fs";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const envFile = process.argv[2];
if (envFile) {
  for (const line of readFileSync(envFile, "utf8").split("\n")) {
    const m = line.match(/^([A-Z_]+)="?(.*?)"?$/);
    if (m) process.env[m[1]] = m[2];
  }
}
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL! }),
});

async function main() {
  const r = await prisma.product.updateMany({
    where: { code: { in: ["PRD-008", "PRD-009"] }, isActive: true },
    data: { isActive: false },
  });
  console.log(`重複を無効化: ${r.count} 件（PRD-008 絹ごし / PRD-009 ソフト豆腐）`);
  const p = await prisma.product.upsert({
    where: { code: "PRD-013" },
    update: {},
    create: { code: "PRD-013", name: "厚揚げ生地", unit: "枚", isActive: true },
  });
  console.log(`確保: ${p.code} ${p.name}`);
  const active = await prisma.product.findMany({ where: { isActive: true }, orderBy: { code: "asc" } });
  for (const x of active) console.log(`有効: ${x.code} ${x.name} (${x.unit})`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
