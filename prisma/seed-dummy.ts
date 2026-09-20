import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Inserting dummy data...");

  // Fetch existing references
  const admin = await prisma.user.findFirstOrThrow({ where: { email: "admin@kawakami-foods.co.jp" } });
  const products = await prisma.product.findMany({ where: { isActive: true } });
  const facilities = await prisma.facility.findMany({ where: { isActive: true } });
  const hygieneCategories = await prisma.hygieneCategory.findMany({ where: { isActive: true } });
  const lossCategories = await prisma.lossCategory.findMany({ where: { isActive: true } });

  if (products.length === 0) {
    console.error("No products found. Run seed first: npx prisma db seed");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ============================================================
  // 1. Production records for past 60 days
  // ============================================================
  console.log("Creating production records (60 days)...");
  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Skip ~20% of days randomly (simulate days off)
    if (Math.random() < 0.15 && date.getDay() !== 1) continue;

    // Skip Sundays
    if (date.getDay() === 0) continue;

    const record = await prisma.productionRecord.create({
      data: {
        productionDate: date,
        recordedById: admin.id,
        notes: i === 0 ? "本日の製造" : null,
      },
    });

    // 2-4 products per day
    const dayProducts = products
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 3));

    for (const product of dayProducts) {
      const baseQty = product.code === "PRD-001" ? 150 : product.code === "PRD-002" ? 120 : product.code === "PRD-003" ? 80 : 200;
      const quantity = baseQty + Math.floor(Math.random() * 60) - 30;

      await prisma.productionRecordItem.create({
        data: {
          productionRecordId: record.id,
          productId: product.id,
          quantity,
        },
      });
    }
  }
  console.log("  -> Production records created");

  // ============================================================
  // 2. Temperature records (4 facilities x 60 days x 2-3 readings)
  // ============================================================
  console.log("Creating temperature records...");
  for (let i = 59; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    for (const facility of facilities) {
      const readings = 2 + Math.floor(Math.random() * 2); // 2-3 readings/day
      for (let r = 0; r < readings; r++) {
        const hour = r === 0 ? 8 : r === 1 ? 13 : 18;
        const recordTime = new Date(date);
        recordTime.setHours(hour, Math.floor(Math.random() * 60));

        let temp: number;
        let isNormal = true;
        if (facility.type === "REFRIGERATOR") {
          temp = 2 + Math.random() * 3; // 2-5°C
          if (Math.random() < 0.03) { temp = 6 + Math.random() * 2; isNormal = false; }
        } else if (facility.type === "FREEZER") {
          temp = -20 + Math.random() * 4; // -20 to -16°C
          if (Math.random() < 0.02) { temp = -14 + Math.random() * 2; isNormal = false; }
        } else {
          temp = 76 + Math.random() * 10; // 76-86°C
          if (Math.random() < 0.02) { temp = 70 + Math.random() * 4; isNormal = false; }
        }

        const tempRecord = await prisma.temperatureRecord.create({
          data: {
            facilityId: facility.id,
            temperature: parseFloat(temp.toFixed(1)),
            isNormal,
            recordedById: admin.id,
            recordedAt: recordTime,
          },
        });

        if (!isNormal) {
          const threshold = facility.type === "HEATER"
            ? facility.tempLowerLimit!
            : facility.tempUpperLimit!;
          const resolved = Math.random() < 0.7;
          await prisma.temperatureAlert.create({
            data: {
              temperatureRecordId: tempRecord.id,
              facilityId: facility.id,
              alertTemperature: parseFloat(temp.toFixed(1)),
              threshold,
              status: resolved ? "RESOLVED" : "OPEN",
              correctiveAction: resolved ? "温度調整済み" : null,
              resolvedById: resolved ? admin.id : null,
              resolvedAt: resolved ? recordTime : null,
            },
          });
        }
      }
    }
  }
  console.log("  -> Temperature records created");

  // ============================================================
  // 3. Hygiene records (past 30 days)
  // ============================================================
  console.log("Creating hygiene records...");
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0) continue;

    for (const category of hygieneCategories) {
      if (Math.random() < 0.1) continue; // skip some

      await prisma.hygieneRecord.create({
        data: {
          categoryId: category.id,
          recordDate: date,
          result: Math.random() < 0.92 ? "PASS" : Math.random() < 0.5 ? "FAIL" : "NA",
          details: "定期検査実施",
          recordedById: admin.id,
        },
      });
    }
  }
  console.log("  -> Hygiene records created");

  // ============================================================
  // 4. Loss records (past 30 days)
  // ============================================================
  console.log("Creating loss records...");
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (date.getDay() === 0) continue;

    // 0-2 loss events per day
    const lossCount = Math.floor(Math.random() * 3);
    for (let l = 0; l < lossCount; l++) {
      const product = products[Math.floor(Math.random() * products.length)];
      const category = lossCategories[Math.floor(Math.random() * lossCategories.length)];
      const quantity = 1 + Math.floor(Math.random() * 10);

      await prisma.lossRecord.create({
        data: {
          productId: product.id,
          categoryId: category.id,
          recordDate: date,
          quantity,
          lossRate: parseFloat((quantity / 150 * 100).toFixed(2)),
          notes: "検査時に確認",
          recordedById: admin.id,
        },
      });
    }
  }
  console.log("  -> Loss records created");

  // ============================================================
  // 5. Production targets (current month)
  // ============================================================
  console.log("Creating production targets...");
  const year = today.getFullYear();
  const month = today.getMonth() + 1;
  for (const product of products) {
    const target = product.code === "PRD-001" ? 4000 : product.code === "PRD-002" ? 3500 : product.code === "PRD-003" ? 2000 : 5000;
    await prisma.productionTarget.upsert({
      where: {
        productId_targetYear_targetMonth: {
          productId: product.id,
          targetYear: year,
          targetMonth: month,
        },
      },
      update: {},
      create: {
        product: { connect: { id: product.id } },
        setBy: { connect: { id: admin.id } },
        targetYear: year,
        targetMonth: month,
        targetQuantity: target,
        dailyTarget: Math.round(target / 26),
      },
    });
  }
  console.log("  -> Production targets created");

  console.log("\nDummy data insertion complete!");
}

main()
  .catch((e) => {
    console.error("Failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
