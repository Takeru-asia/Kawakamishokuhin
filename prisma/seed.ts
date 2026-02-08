import "dotenv/config";
import { PrismaClient, Role, FacilityType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // ============================================================
  // 1. ユーザー（管理者アカウント）
  // ============================================================
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@kawakami-foods.co.jp" },
    update: {},
    create: {
      name: "管理者",
      email: "admin@kawakami-foods.co.jp",
      passwordHash: await bcrypt.hash("admin1234", 10),
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`ユーザー作成: ${adminUser.name} (${adminUser.email})`);

  // ============================================================
  // 2. 製品マスタ
  // ============================================================
  const products = [
    { code: "PRD-001", name: "絹ごし豆腐", unit: "パック" },
    { code: "PRD-002", name: "木綿豆腐", unit: "パック" },
    { code: "PRD-003", name: "厚揚げ", unit: "個" },
    { code: "PRD-004", name: "油揚げ", unit: "枚" },
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { code: p.code },
      update: {},
      create: { ...p, isActive: true },
    });
    console.log(`製品作成: ${product.name} (${product.code})`);
  }

  // ============================================================
  // 3. 設備マスタ
  // ============================================================
  const facilities = [
    {
      code: "FAC-001",
      name: "冷蔵庫A",
      type: FacilityType.REFRIGERATOR,
      tempUpperLimit: 5.0,
      location: "第1工場",
    },
    {
      code: "FAC-002",
      name: "冷蔵庫B",
      type: FacilityType.REFRIGERATOR,
      tempUpperLimit: 5.0,
      location: "第1工場",
    },
    {
      code: "FAC-003",
      name: "冷凍庫",
      type: FacilityType.FREEZER,
      tempUpperLimit: -15.0,
      location: "第1工場",
    },
    {
      code: "FAC-004",
      name: "加熱設備",
      type: FacilityType.HEATER,
      tempLowerLimit: 75.0,
      location: "製造ライン",
    },
  ];

  for (const f of facilities) {
    const facility = await prisma.facility.upsert({
      where: { code: f.code },
      update: {},
      create: {
        code: f.code,
        name: f.name,
        type: f.type,
        tempLowerLimit: (f as any).tempLowerLimit ?? null,
        tempUpperLimit: (f as any).tempUpperLimit ?? null,
        location: f.location,
        isActive: true,
      },
    });
    console.log(`設備作成: ${facility.name} (${facility.code})`);
  }

  // ============================================================
  // 4. 衛生管理カテゴリ
  // ============================================================
  const hygieneCategories = [
    { name: "施設・設備の清掃", description: "施設および設備の日常清掃・定期清掃の管理", sortOrder: 1 },
    { name: "害虫駆除・防鼠管理", description: "害虫・鼠族の駆除および侵入防止対策の管理", sortOrder: 2 },
    { name: "水質検査", description: "使用水の水質検査および残留塩素測定の管理", sortOrder: 3 },
    { name: "廃棄物管理", description: "廃棄物の適正処理および保管場所の衛生管理", sortOrder: 4 },
  ];

  for (const hc of hygieneCategories) {
    const category = await prisma.hygieneCategory.create({
      data: { ...hc, isActive: true },
    });
    console.log(`衛生管理カテゴリ作成: ${category.name}`);
  }

  // ============================================================
  // 5. ロス原因カテゴリ
  // ============================================================
  const lossCategories = [
    { name: "製造不良", description: "製造工程における不良品の発生", sortOrder: 1 },
    { name: "破損", description: "輸送・保管中の物理的破損", sortOrder: 2 },
    { name: "期限切れ", description: "賞味期限・消費期限超過による廃棄", sortOrder: 3 },
    { name: "その他", description: "上記に分類されないロス", sortOrder: 4 },
  ];

  for (const lc of lossCategories) {
    const category = await prisma.lossCategory.create({
      data: { ...lc, isActive: true },
    });
    console.log(`ロス原因カテゴリ作成: ${category.name}`);
  }

  console.log("\nSeed完了！");
}

main()
  .catch((e) => {
    console.error("Seed失敗:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
