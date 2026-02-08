# 川上食品 HACCP管理システム ER図

## 概要

PostgreSQL + Prisma によるデータベース設計。全17エンティティ（マスタ系7 + トランザクション系10）。

---

## ER図（全体）

```mermaid
erDiagram
    %% ============================================================
    %% マスタ系テーブル
    %% ============================================================

    users {
        uuid id PK
        varchar name
        varchar email UK
        varchar password_hash
        enum role "ADMIN | MANAGER | WORKER"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    products {
        uuid id PK
        varchar code UK
        varchar name
        varchar unit
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    materials {
        uuid id PK
        varchar code UK
        varchar name
        varchar unit
        varchar supplier "nullable"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    facilities {
        uuid id PK
        varchar code UK
        varchar name
        enum type "REFRIGERATOR | FREEZER | HEATER | OTHER"
        decimal temp_lower_limit "nullable"
        decimal temp_upper_limit "nullable"
        varchar location "nullable"
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    product_materials {
        uuid id PK
        uuid product_id FK
        uuid material_id FK
        decimal quantity
        varchar unit
        timestamp created_at
        timestamp updated_at
    }

    hygiene_categories {
        uuid id PK
        varchar name
        text description "nullable"
        int sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    loss_categories {
        uuid id PK
        varchar name
        text description "nullable"
        int sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================================
    %% トランザクション系テーブル
    %% ============================================================

    production_records {
        uuid id PK
        date production_date
        uuid recorded_by FK
        text notes "nullable"
        timestamp created_at
        timestamp updated_at
    }

    production_record_items {
        uuid id PK
        uuid production_record_id FK
        uuid product_id FK
        decimal quantity
        timestamp created_at
        timestamp updated_at
    }

    material_lots {
        uuid id PK
        uuid material_id FK
        varchar lot_number UK
        date received_date
        date expiry_date "nullable"
        decimal quantity
        varchar supplier_lot "nullable"
        timestamp created_at
        timestamp updated_at
    }

    product_lots {
        uuid id PK
        uuid production_record_item_id FK
        uuid product_id FK
        varchar lot_number UK
        date production_date
        decimal quantity
        date expiry_date "nullable"
        timestamp created_at
        timestamp updated_at
    }

    lot_links {
        uuid id PK
        uuid material_lot_id FK
        uuid product_lot_id FK
        decimal quantity_used "nullable"
        timestamp created_at
    }

    temperature_records {
        uuid id PK
        uuid facility_id FK
        timestamp recorded_at
        decimal temperature
        boolean is_normal
        uuid recorded_by FK
        text notes "nullable"
        timestamp created_at
        timestamp updated_at
    }

    temperature_alerts {
        uuid id PK
        uuid temperature_record_id FK "unique"
        uuid facility_id FK
        decimal alert_temperature
        decimal threshold
        enum status "OPEN | ACKNOWLEDGED | RESOLVED"
        uuid resolved_by FK "nullable"
        timestamp resolved_at "nullable"
        text corrective_action "nullable"
        timestamp created_at
        timestamp updated_at
    }

    hygiene_records {
        uuid id PK
        uuid category_id FK
        uuid facility_id FK "nullable"
        date record_date
        text details
        enum result "PASS | FAIL | NA"
        uuid recorded_by FK
        text notes "nullable"
        timestamp created_at
        timestamp updated_at
    }

    production_targets {
        uuid id PK
        uuid product_id FK
        int target_year
        int target_month
        decimal target_quantity
        decimal daily_target "nullable"
        uuid set_by FK
        timestamp created_at
        timestamp updated_at
    }

    loss_records {
        uuid id PK
        uuid product_id FK
        uuid category_id FK
        date record_date
        decimal quantity
        decimal loss_rate "nullable"
        uuid recorded_by FK
        text notes "nullable"
        timestamp created_at
        timestamp updated_at
    }

    %% ============================================================
    %% リレーション
    %% ============================================================

    %% ユーザー関連
    users ||--o{ production_records : "記録者"
    users ||--o{ temperature_records : "記録者"
    users ||--o{ hygiene_records : "記録者"
    users ||--o{ temperature_alerts : "対応者"
    users ||--o{ production_targets : "設定者"
    users ||--o{ loss_records : "記録者"

    %% 製品関連
    products ||--o{ product_materials : "配合定義"
    products ||--o{ production_record_items : "製造対象"
    products ||--o{ product_lots : "ロット発番"
    products ||--o{ production_targets : "目標設定"
    products ||--o{ loss_records : "ロス記録"

    %% 原材料関連
    materials ||--o{ product_materials : "配合対象"
    materials ||--o{ material_lots : "入荷ロット"

    %% 設備関連
    facilities ||--o{ temperature_records : "計測対象"
    facilities ||--o{ temperature_alerts : "アラート対象"
    facilities ||--o{ hygiene_records : "管理対象"

    %% 製造実績関連
    production_records ||--o{ production_record_items : "明細"
    production_record_items ||--o{ product_lots : "ロット生成"

    %% ロットトレーサビリティ
    material_lots ||--o{ lot_links : "原材料側"
    product_lots ||--o{ lot_links : "製品側"

    %% 温度異常
    temperature_records ||--o| temperature_alerts : "異常検知"

    %% カテゴリ関連
    hygiene_categories ||--o{ hygiene_records : "分類"
    loss_categories ||--o{ loss_records : "分類"
```

---

## テーブル一覧

### マスタ系（7テーブル）

| No | テーブル名 | 和名 | PK | ユニーク制約 |
|----|-----------|------|-----|------------|
| 1 | users | ユーザー | id (UUID) | email |
| 2 | products | 製品 | id (UUID) | code |
| 3 | materials | 原材料 | id (UUID) | code |
| 4 | facilities | 設備 | id (UUID) | code |
| 5 | product_materials | 製品配合（BOM） | id (UUID) | [product_id, material_id] |
| 6 | hygiene_categories | 衛生管理カテゴリ | id (UUID) | - |
| 7 | loss_categories | ロス原因カテゴリ | id (UUID) | - |

### トランザクション系（10テーブル）

| No | テーブル名 | 和名 | PK | ユニーク制約 |
|----|-----------|------|-----|------------|
| 8 | production_records | 製造実績 | id (UUID) | - |
| 9 | production_record_items | 製造実績明細 | id (UUID) | - |
| 10 | material_lots | 原材料ロット | id (UUID) | lot_number |
| 11 | product_lots | 製品ロット | id (UUID) | lot_number |
| 12 | lot_links | ロットトレーサビリティ | id (UUID) | - |
| 13 | temperature_records | 温度記録 | id (UUID) | - |
| 14 | temperature_alerts | 温度異常アラート | id (UUID) | temperature_record_id |
| 15 | hygiene_records | 衛生管理記録 | id (UUID) | - |
| 16 | production_targets | 製造目標 | id (UUID) | [product_id, target_year, target_month] |
| 17 | loss_records | ロス記録 | id (UUID) | - |

---

## 設計方針

| 項目 | 方針 |
|------|------|
| PK | 全テーブル UUID（`@default(uuid())`） |
| タイムスタンプ | 全テーブルに `created_at`, `updated_at` |
| 論理削除 | マスタ系は `is_active` フラグ |
| テーブル名 | snake_case（Prisma `@@map()`） |
| カラム名 | snake_case（Prisma `@map()`） |
| FK制約 | Prisma `@relation` で明示定義 |
| Decimal | 温度: `Decimal(5,2)`, 数量: `Decimal(10,2)`, ロス率: `Decimal(5,2)` |

---

## 更新履歴

| 日付 | 版 | 更新内容 | 更新者 |
|------|-----|----------|--------|
| 2026-02-09 | 1.0 | 初版作成 | - |
