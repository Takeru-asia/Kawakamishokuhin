// Idempotent master data for the 2026-10 president requests.
// Safe to run repeatedly on local and production (uses upsert / find-or-create).
// Usage: npx tsx prisma/seed-202610.ts
import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is not set");
const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  // 1. Products named by the president (2026-10-09 feedback). Existing PRD-001..004 are kept.
  const products = [
    { code: "PRD-005", name: "もめん", unit: "丁" },
    { code: "PRD-006", name: "ゆしどうふ", unit: "パック" },
    { code: "PRD-007", name: "厚揚げ生地", unit: "枚" },
    { code: "PRD-008", name: "絹ごし", unit: "丁" },
    { code: "PRD-009", name: "ソフト豆腐", unit: "丁" },
    { code: "PRD-010", name: "コープもめん", unit: "丁" },
    { code: "PRD-011", name: "コープゆしどうふ", unit: "パック" },
    { code: "PRD-012", name: "コープ厚揚げ", unit: "枚" },
  ];
  for (const p of products) {
    const r = await prisma.product.upsert({ where: { code: p.code }, update: {}, create: { ...p, isActive: true } });
    console.log(`製品: ${r.name} (${r.code})`);
  }

  // 2. Soybean types for the prep quantity (kg)
  const materials = [
    { code: "MAT-101", name: "一般大豆", unit: "kg" },
    { code: "MAT-102", name: "コープロ大豆", unit: "kg" },
    { code: "MAT-103", name: "絹ごし用大豆", unit: "kg" },
  ];
  for (const m of materials) {
    const r = await prisma.material.upsert({ where: { code: m.code }, update: {}, create: { ...m, isActive: true } });
    console.log(`原材料: ${r.name} (${r.code})`);
  }

  // 3. General hygiene category (no unique on name -> find-or-create)
  const categoryName = "一般衛生（トイレ・手洗い場・更衣室）";
  const existing = await prisma.hygieneCategory.findFirst({ where: { name: categoryName } });
  if (!existing) {
    await prisma.hygieneCategory.create({
      data: { name: categoryName, description: "トイレ・手洗い場・更衣室などの日常清掃と衛生状態の確認", sortOrder: 5, isActive: true },
    });
    console.log(`衛生カテゴリ: ${categoryName} を作成`);
  } else {
    console.log(`衛生カテゴリ: ${categoryName} は既存`);
  }

  // 4. Sample measuring instruments (the customer edits these in the master screen)
  const equipment = [
    { code: "EQP-001", name: "温度計（中心温度計）", type: "THERMOMETER" as const, checkFrequency: "MONTHLY" as const, location: "加熱工程" },
    { code: "EQP-002", name: "スケール（計量秤）", type: "SCALE" as const, checkFrequency: "DAILY" as const, location: "計量室" },
  ];
  for (const e of equipment) {
    const r = await prisma.equipment.upsert({ where: { code: e.code }, update: {}, create: { ...e, isActive: true } });
    console.log(`計器: ${r.name} (${r.code})`);
  }

  console.log("\nseed-202610 完了");
}

main()
  .catch((e) => {
    console.error("seed-202610 失敗:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
