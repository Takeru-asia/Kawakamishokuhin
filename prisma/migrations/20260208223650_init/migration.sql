-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'WORKER');

-- CreateEnum
CREATE TYPE "FacilityType" AS ENUM ('REFRIGERATOR', 'FREEZER', 'HEATER', 'OTHER');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- CreateEnum
CREATE TYPE "HygieneResult" AS ENUM ('PASS', 'FAIL', 'NA');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'WORKER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materials" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "supplier" VARCHAR(200),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "facilities" (
    "id" UUID NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "type" "FacilityType" NOT NULL,
    "temp_lower_limit" DECIMAL(5,2),
    "temp_upper_limit" DECIMAL(5,2),
    "location" VARCHAR(200),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_materials" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "unit" VARCHAR(20) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_materials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hygiene_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hygiene_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loss_categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,
    "sort_order" INTEGER NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loss_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_records" (
    "id" UUID NOT NULL,
    "production_date" DATE NOT NULL,
    "recorded_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_record_items" (
    "id" UUID NOT NULL,
    "production_record_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_record_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "material_lots" (
    "id" UUID NOT NULL,
    "material_id" UUID NOT NULL,
    "lot_number" VARCHAR(100) NOT NULL,
    "received_date" DATE NOT NULL,
    "expiry_date" DATE,
    "quantity" DECIMAL(10,2) NOT NULL,
    "supplier_lot" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "material_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_lots" (
    "id" UUID NOT NULL,
    "production_record_item_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "lot_number" VARCHAR(100) NOT NULL,
    "production_date" DATE NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "expiry_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_lots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lot_links" (
    "id" UUID NOT NULL,
    "material_lot_id" UUID NOT NULL,
    "product_lot_id" UUID NOT NULL,
    "quantity_used" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lot_links_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temperature_records" (
    "id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL,
    "temperature" DECIMAL(5,2) NOT NULL,
    "is_normal" BOOLEAN NOT NULL,
    "recorded_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temperature_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "temperature_alerts" (
    "id" UUID NOT NULL,
    "temperature_record_id" UUID NOT NULL,
    "facility_id" UUID NOT NULL,
    "alert_temperature" DECIMAL(5,2) NOT NULL,
    "threshold" DECIMAL(5,2) NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'OPEN',
    "resolved_by" UUID,
    "resolved_at" TIMESTAMP(3),
    "corrective_action" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "temperature_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hygiene_records" (
    "id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "facility_id" UUID,
    "record_date" DATE NOT NULL,
    "details" TEXT NOT NULL,
    "result" "HygieneResult" NOT NULL,
    "recorded_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hygiene_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "production_targets" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "target_year" INTEGER NOT NULL,
    "target_month" INTEGER NOT NULL,
    "target_quantity" DECIMAL(10,2) NOT NULL,
    "daily_target" DECIMAL(10,2),
    "set_by" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "production_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "loss_records" (
    "id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    "record_date" DATE NOT NULL,
    "quantity" DECIMAL(10,2) NOT NULL,
    "loss_rate" DECIMAL(5,2),
    "recorded_by" UUID NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "loss_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "products_code_key" ON "products"("code");

-- CreateIndex
CREATE INDEX "products_is_active_idx" ON "products"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "materials_code_key" ON "materials"("code");

-- CreateIndex
CREATE INDEX "materials_is_active_idx" ON "materials"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "facilities_code_key" ON "facilities"("code");

-- CreateIndex
CREATE INDEX "facilities_type_idx" ON "facilities"("type");

-- CreateIndex
CREATE INDEX "facilities_is_active_idx" ON "facilities"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "product_materials_product_id_material_id_key" ON "product_materials"("product_id", "material_id");

-- CreateIndex
CREATE INDEX "hygiene_categories_sort_order_idx" ON "hygiene_categories"("sort_order");

-- CreateIndex
CREATE INDEX "loss_categories_sort_order_idx" ON "loss_categories"("sort_order");

-- CreateIndex
CREATE INDEX "production_records_production_date_idx" ON "production_records"("production_date");

-- CreateIndex
CREATE INDEX "production_record_items_production_record_id_product_id_idx" ON "production_record_items"("production_record_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "material_lots_lot_number_key" ON "material_lots"("lot_number");

-- CreateIndex
CREATE INDEX "material_lots_material_id_idx" ON "material_lots"("material_id");

-- CreateIndex
CREATE INDEX "material_lots_received_date_idx" ON "material_lots"("received_date");

-- CreateIndex
CREATE UNIQUE INDEX "product_lots_lot_number_key" ON "product_lots"("lot_number");

-- CreateIndex
CREATE INDEX "product_lots_product_id_idx" ON "product_lots"("product_id");

-- CreateIndex
CREATE INDEX "product_lots_production_date_idx" ON "product_lots"("production_date");

-- CreateIndex
CREATE INDEX "lot_links_material_lot_id_idx" ON "lot_links"("material_lot_id");

-- CreateIndex
CREATE INDEX "lot_links_product_lot_id_idx" ON "lot_links"("product_lot_id");

-- CreateIndex
CREATE INDEX "temperature_records_facility_id_idx" ON "temperature_records"("facility_id");

-- CreateIndex
CREATE INDEX "temperature_records_recorded_at_idx" ON "temperature_records"("recorded_at");

-- CreateIndex
CREATE INDEX "temperature_records_is_normal_idx" ON "temperature_records"("is_normal");

-- CreateIndex
CREATE UNIQUE INDEX "temperature_alerts_temperature_record_id_key" ON "temperature_alerts"("temperature_record_id");

-- CreateIndex
CREATE INDEX "temperature_alerts_status_idx" ON "temperature_alerts"("status");

-- CreateIndex
CREATE INDEX "temperature_alerts_facility_id_idx" ON "temperature_alerts"("facility_id");

-- CreateIndex
CREATE INDEX "hygiene_records_category_id_idx" ON "hygiene_records"("category_id");

-- CreateIndex
CREATE INDEX "hygiene_records_record_date_idx" ON "hygiene_records"("record_date");

-- CreateIndex
CREATE UNIQUE INDEX "production_targets_product_id_target_year_target_month_key" ON "production_targets"("product_id", "target_year", "target_month");

-- CreateIndex
CREATE INDEX "loss_records_product_id_idx" ON "loss_records"("product_id");

-- CreateIndex
CREATE INDEX "loss_records_record_date_idx" ON "loss_records"("record_date");

-- CreateIndex
CREATE INDEX "loss_records_category_id_idx" ON "loss_records"("category_id");

-- AddForeignKey
ALTER TABLE "product_materials" ADD CONSTRAINT "product_materials_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_materials" ADD CONSTRAINT "product_materials_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_records" ADD CONSTRAINT "production_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_record_items" ADD CONSTRAINT "production_record_items_production_record_id_fkey" FOREIGN KEY ("production_record_id") REFERENCES "production_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_record_items" ADD CONSTRAINT "production_record_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "material_lots" ADD CONSTRAINT "material_lots_material_id_fkey" FOREIGN KEY ("material_id") REFERENCES "materials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_lots" ADD CONSTRAINT "product_lots_production_record_item_id_fkey" FOREIGN KEY ("production_record_item_id") REFERENCES "production_record_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_lots" ADD CONSTRAINT "product_lots_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_links" ADD CONSTRAINT "lot_links_material_lot_id_fkey" FOREIGN KEY ("material_lot_id") REFERENCES "material_lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lot_links" ADD CONSTRAINT "lot_links_product_lot_id_fkey" FOREIGN KEY ("product_lot_id") REFERENCES "product_lots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_records" ADD CONSTRAINT "temperature_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_records" ADD CONSTRAINT "temperature_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_alerts" ADD CONSTRAINT "temperature_alerts_temperature_record_id_fkey" FOREIGN KEY ("temperature_record_id") REFERENCES "temperature_records"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_alerts" ADD CONSTRAINT "temperature_alerts_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "temperature_alerts" ADD CONSTRAINT "temperature_alerts_resolved_by_fkey" FOREIGN KEY ("resolved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hygiene_records" ADD CONSTRAINT "hygiene_records_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "hygiene_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hygiene_records" ADD CONSTRAINT "hygiene_records_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "facilities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hygiene_records" ADD CONSTRAINT "hygiene_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_targets" ADD CONSTRAINT "production_targets_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "production_targets" ADD CONSTRAINT "production_targets_set_by_fkey" FOREIGN KEY ("set_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loss_records" ADD CONSTRAINT "loss_records_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loss_records" ADD CONSTRAINT "loss_records_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "loss_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "loss_records" ADD CONSTRAINT "loss_records_recorded_by_fkey" FOREIGN KEY ("recorded_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
