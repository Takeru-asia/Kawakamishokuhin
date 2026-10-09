-- CreateEnum
CREATE TYPE "EquipmentType" AS ENUM ('THERMOMETER', 'SCALE', 'OTHER');

-- CreateEnum
CREATE TYPE "CheckFrequency" AS ENUM ('DAILY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "EquipmentCheckKind" AS ENUM ('CALIBRATION', 'INSPECTION');

-- CreateEnum
CREATE TYPE "ChemicalKind" AS ENUM ('SODIUM_HYDROXIDE', 'SODIUM_HYPOCHLORITE', 'OTHER');

-- AlterTable
ALTER TABLE "hygiene_records" ADD COLUMN     "measured_value" DECIMAL(6,2);

-- CreateTable
CREATE TABLE "production_plans" (
    "id" UUID NOT NULL,
    "plan_date" DATE NOT NULL,
    "set_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_plan_items" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "planned_quantity" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "production_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_plan_materials" (
    "id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "production_plan_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" "EquipmentType" NOT NULL,
    "check_frequency" "CheckFrequency" NOT NULL,
    "location" VARCHAR(200),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_checks" (
    "id" UUID NOT NULL,
    "equipment_id" UUID NOT NULL,
    "check_date" DATE NOT NULL,
    "kind" "EquipmentCheckKind" NOT NULL,
    "result" "HygieneResult" NOT NULL,
    "measured_value" DECIMAL(10,2),
    "recorded_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "equipment_checks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_check_records" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "check_date" DATE NOT NULL,
    "clock_in_at" TIMESTAMP(3) NOT NULL,
    "body_temperature" DECIMAL(3,1) NOT NULL,
    "has_hand_injury" BOOLEAN NOT NULL DEFAULT false,
    "has_symptoms" BOOLEAN NOT NULL DEFAULT false,
    "has_sick_family" BOOLEAN NOT NULL DEFAULT false,
    "has_cap" BOOLEAN NOT NULL DEFAULT true,
    "has_mask" BOOLEAN NOT NULL DEFAULT true,
    "has_uniform" BOOLEAN NOT NULL DEFAULT true,
    "is_abnormal" BOOLEAN NOT NULL DEFAULT false,
    "recorded_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_check_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "chemical_usage_records" (
    "id" UUID NOT NULL,
    "used_at" TIMESTAMP(3) NOT NULL,
    "chemical_kind" "ChemicalKind" NOT NULL,
    "chemical_name" VARCHAR(200),
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "purpose" TEXT NOT NULL,
    "used_by" UUID NOT NULL,
    "recorded_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "chemical_usage_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "production_plans_plan_date_key" ON "production_plans"("plan_date");

-- CreateIndex
CREATE UNIQUE INDEX "production_plan_items_plan_id_product_id_key" ON "production_plan_items"("plan_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "production_plan_materials_plan_id_material_id_key" ON "production_plan_materials"("plan_id", "material_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_code_key" ON "equipment"("code");

-- CreateIndex
CREATE INDEX "equipment_is_active_idx" ON "equipment"("is_active");

-- CreateIndex
CREATE INDEX "equipment_checks_equipment_id_check_date_idx" ON "equipment_checks"("equipment_id", "check_date");

-- CreateIndex
CREATE INDEX "health_check_records_check_date_idx" ON "health_check_records"("check_date");

-- CreateIndex
CREATE INDEX "health_check_records_is_abnormal_idx" ON "health_check_records"("is_abnormal");

-- CreateIndex
CREATE UNIQUE INDEX "health_check_records_user_id_check_date_key" ON "health_check_records"("user_id", "check_date");

-- CreateIndex
CREATE INDEX "chemical_usage_records_used_at_idx" ON "chemical_usage_records"("used_at");

-- AddForeignKey
ALTER TABLE "production_plans" ADD CONSTRAINT "production_plans_set_by_fkey" FOREIGN KEY ("set_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_plan_items" ADD CONSTRAINT "production_plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "production_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_plan_items" ADD CONSTRAINT "production_plan_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_plan_materials" ADD CONSTRAINT "production_plan_materials_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "production_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_plan_materials" ADD CONSTRAINT "production_plan_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_checks" ADD CONSTRAINT "equipment_checks_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_checks" ADD CONSTRAINT "equipment_checks_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_check_records" ADD CONSTRAINT "health_check_records_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_check_records" ADD CONSTRAINT "health_check_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemical_usage_records" ADD CONSTRAINT "chemical_usage_records_used_by_fkey" FOREIGN KEY ("used_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chemical_usage_records" ADD CONSTRAINT "chemical_usage_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
