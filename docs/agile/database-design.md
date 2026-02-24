# データベース設計書

## 川上食品 HACCP管理システム

| 項目 | 内容 |
|------|------|
| DBMS | PostgreSQL 17 |
| ORM | Prisma 7 |
| DB名 | kawakamishokuhin |
| スキーマ | public |
| エンティティ数 | 17（マスタ7 + トランザクション10） |
| Enum数 | 5 |
| PK方式 | UUID v4 |
| 命名規則 | Prismaモデル: PascalCase / DBテーブル: snake_case（@@map） |

---

## 1. ER図

```mermaid
erDiagram
    User ||--o{ ProductionRecord : "recorded_by"
    User ||--o{ TemperatureRecord : "recorded_by"
    User ||--o{ HygieneRecord : "recorded_by"
    User ||--o{ TemperatureAlert : "resolved_by"
    User ||--o{ ProductionTarget : "set_by"
    User ||--o{ LossRecord : "recorded_by"

    Product ||--o{ ProductMaterial : "product_id"
    Product ||--o{ ProductionRecordItem : "product_id"
    Product ||--o{ ProductLot : "product_id"
    Product ||--o{ ProductionTarget : "product_id"
    Product ||--o{ LossRecord : "product_id"

    Material ||--o{ ProductMaterial : "material_id"
    Material ||--o{ MaterialLot : "material_id"

    Facility ||--o{ TemperatureRecord : "facility_id"
    Facility ||--o{ TemperatureAlert : "facility_id"
    Facility ||--o{ HygieneRecord : "facility_id"

    ProductionRecord ||--o{ ProductionRecordItem : "production_record_id"
    ProductionRecordItem ||--o{ ProductLot : "production_record_item_id"

    MaterialLot ||--o{ LotLink : "material_lot_id"
    ProductLot ||--o{ LotLink : "product_lot_id"

    TemperatureRecord ||--o| TemperatureAlert : "temperature_record_id"

    HygieneCategory ||--o{ HygieneRecord : "category_id"
    LossCategory ||--o{ LossRecord : "category_id"

    User {
        uuid id PK
        varchar name
        varchar email UK
        varchar password_hash
        enum role
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    Product {
        uuid id PK
        varchar code UK
        varchar name
        varchar unit
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    Material {
        uuid id PK
        varchar code UK
        varchar name
        varchar unit
        varchar supplier
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    Facility {
        uuid id PK
        varchar code UK
        varchar name
        enum type
        decimal temp_lower_limit
        decimal temp_upper_limit
        varchar location
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    ProductMaterial {
        uuid id PK
        uuid product_id FK
        uuid material_id FK
        decimal quantity
        varchar unit
        timestamp created_at
        timestamp updated_at
    }

    HygieneCategory {
        uuid id PK
        varchar name
        text description
        int sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    LossCategory {
        uuid id PK
        varchar name
        text description
        int sort_order
        boolean is_active
        timestamp created_at
        timestamp updated_at
    }

    ProductionRecord {
        uuid id PK
        date production_date
        uuid recorded_by FK
        text notes
        timestamp created_at
        timestamp updated_at
    }

    ProductionRecordItem {
        uuid id PK
        uuid production_record_id FK
        uuid product_id FK
        decimal quantity
        timestamp created_at
        timestamp updated_at
    }

    MaterialLot {
        uuid id PK
        uuid material_id FK
        varchar lot_number UK
        date received_date
        date expiry_date
        decimal quantity
        varchar supplier_lot
        timestamp created_at
        timestamp updated_at
    }

    ProductLot {
        uuid id PK
        uuid production_record_item_id FK
        uuid product_id FK
        varchar lot_number UK
        date production_date
        decimal quantity
        date expiry_date
        timestamp created_at
        timestamp updated_at
    }

    LotLink {
        uuid id PK
        uuid material_lot_id FK
        uuid product_lot_id FK
        decimal quantity_used
        timestamp created_at
    }

    TemperatureRecord {
        uuid id PK
        uuid facility_id FK
        timestamp recorded_at
        decimal temperature
        boolean is_normal
        uuid recorded_by FK
        text notes
        timestamp created_at
        timestamp updated_at
    }

    TemperatureAlert {
        uuid id PK
        uuid temperature_record_id FK_UK
        uuid facility_id FK
        decimal alert_temperature
        decimal threshold
        enum status
        uuid resolved_by FK
        timestamp resolved_at
        text corrective_action
        timestamp created_at
        timestamp updated_at
    }

    HygieneRecord {
        uuid id PK
        uuid category_id FK
        uuid facility_id FK
        date record_date
        text details
        enum result
        uuid recorded_by FK
        text notes
        timestamp created_at
        timestamp updated_at
    }

    ProductionTarget {
        uuid id PK
        uuid product_id FK
        int target_year
        int target_month
        decimal target_quantity
        decimal daily_target
        uuid set_by FK
        timestamp created_at
        timestamp updated_at
    }

    LossRecord {
        uuid id PK
        uuid product_id FK
        uuid category_id FK
        date record_date
        decimal quantity
        decimal loss_rate
        uuid recorded_by FK
        text notes
        timestamp created_at
        timestamp updated_at
    }
```

---

## 2. Enum 定義

### Role（ユーザーロール）

| 値 | 説明 |
|----|------|
| ADMIN | システム管理者 |
| MANAGER | 管理者・品質管理責任者 |
| WORKER | 製造作業者 |

### FacilityType（設備種別）

| 値 | 説明 |
|----|------|
| REFRIGERATOR | 冷蔵庫 |
| FREEZER | 冷凍庫 |
| HEATER | 加熱設備 |
| OTHER | その他 |

### AlertStatus（アラートステータス）

| 値 | 説明 |
|----|------|
| OPEN | 未対応 |
| ACKNOWLEDGED | 確認済み |
| RESOLVED | 解決済み |

### HygieneResult（衛生検査結果）

| 値 | 説明 |
|----|------|
| PASS | 合格 |
| FAIL | 不合格 |
| NA | 該当なし |

---

## 3. エンティティ詳細仕様

### 3.1 マスタ系テーブル

#### users（ユーザー）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| name | VARCHAR(100) | NO | - | ユーザー名 |
| email | VARCHAR(255) | NO | - | メールアドレス（ユニーク） |
| password_hash | VARCHAR(255) | NO | - | bcryptハッシュ化パスワード |
| role | Role | NO | WORKER | ロール（ADMIN/MANAGER/WORKER） |
| is_active | BOOLEAN | NO | true | 有効フラグ |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_users_role` (role)
- `idx_users_is_active` (is_active)
- `uq_users_email` (email) UNIQUE

---

#### products（製品）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| code | VARCHAR(50) | NO | - | 製品コード（ユニーク） |
| name | VARCHAR(200) | NO | - | 製品名 |
| unit | VARCHAR(20) | NO | - | 単位（丁、枚 等） |
| is_active | BOOLEAN | NO | true | 有効フラグ |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_products_is_active` (is_active)
- `uq_products_code` (code) UNIQUE

---

#### materials（原材料）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| code | VARCHAR(50) | NO | - | 原材料コード（ユニーク） |
| name | VARCHAR(200) | NO | - | 原材料名 |
| unit | VARCHAR(20) | NO | - | 単位（kg、L 等） |
| supplier | VARCHAR(200) | YES | - | 仕入先 |
| is_active | BOOLEAN | NO | true | 有効フラグ |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_materials_is_active` (is_active)
- `uq_materials_code` (code) UNIQUE

---

#### facilities（設備）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| code | VARCHAR(50) | NO | - | 設備コード（ユニーク） |
| name | VARCHAR(200) | NO | - | 設備名 |
| type | FacilityType | NO | - | 設備種別 |
| temp_lower_limit | DECIMAL(5,2) | YES | - | 温度下限（℃） |
| temp_upper_limit | DECIMAL(5,2) | YES | - | 温度上限（℃） |
| location | VARCHAR(200) | YES | - | 設置場所 |
| is_active | BOOLEAN | NO | true | 有効フラグ |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_facilities_type` (type)
- `idx_facilities_is_active` (is_active)
- `uq_facilities_code` (code) UNIQUE

---

#### product_materials（製品配合 / BOM）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| product_id | UUID | NO | - | 製品ID（FK → products） |
| material_id | UUID | NO | - | 原材料ID（FK → materials） |
| quantity | DECIMAL(10,2) | NO | - | 配合量 |
| unit | VARCHAR(20) | NO | - | 単位 |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `uq_product_materials_product_material` (product_id, material_id) UNIQUE

---

#### hygiene_categories（衛生管理カテゴリ）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| name | VARCHAR(100) | NO | - | カテゴリ名 |
| description | TEXT | YES | - | 説明 |
| sort_order | INT | NO | - | ソート順 |
| is_active | BOOLEAN | NO | true | 有効フラグ |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_hygiene_categories_sort_order` (sort_order)

---

#### loss_categories（ロス原因カテゴリ）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| name | VARCHAR(100) | NO | - | カテゴリ名 |
| description | TEXT | YES | - | 説明 |
| sort_order | INT | NO | - | ソート順 |
| is_active | BOOLEAN | NO | true | 有効フラグ |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_loss_categories_sort_order` (sort_order)

---

### 3.2 トランザクション系テーブル

#### production_records（製造実績）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| production_date | DATE | NO | - | 製造日 |
| recorded_by | UUID | NO | - | 記録者（FK → users） |
| notes | TEXT | YES | - | メモ |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_production_records_date` (production_date)

---

#### production_record_items（製造実績明細）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| production_record_id | UUID | NO | - | 製造実績ID（FK → production_records） |
| product_id | UUID | NO | - | 製品ID（FK → products） |
| quantity | DECIMAL(10,2) | NO | - | 製造数量 |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_production_record_items_record_product` (production_record_id, product_id)

---

#### material_lots（原材料ロット）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| material_id | UUID | NO | - | 原材料ID（FK → materials） |
| lot_number | VARCHAR(100) | NO | - | ロット番号（ユニーク）MLT-YYYYMMDD-NNN |
| received_date | DATE | NO | - | 入荷日 |
| expiry_date | DATE | YES | - | 期限日 |
| quantity | DECIMAL(10,2) | NO | - | 数量 |
| supplier_lot | VARCHAR(100) | YES | - | 仕入先ロット番号 |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_material_lots_material_id` (material_id)
- `idx_material_lots_received_date` (received_date)
- `uq_material_lots_lot_number` (lot_number) UNIQUE

---

#### product_lots（製品ロット）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| production_record_item_id | UUID | NO | - | 製造明細ID（FK → production_record_items） |
| product_id | UUID | NO | - | 製品ID（FK → products） |
| lot_number | VARCHAR(100) | NO | - | ロット番号（ユニーク）PLT-YYYYMMDD-NNN |
| production_date | DATE | NO | - | 製造日 |
| quantity | DECIMAL(10,2) | NO | - | 数量 |
| expiry_date | DATE | YES | - | 期限日 |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_product_lots_product_id` (product_id)
- `idx_product_lots_production_date` (production_date)
- `uq_product_lots_lot_number` (lot_number) UNIQUE

---

#### lot_links（ロットトレーサビリティ）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| material_lot_id | UUID | NO | - | 原材料ロットID（FK → material_lots） |
| product_lot_id | UUID | NO | - | 製品ロットID（FK → product_lots） |
| quantity_used | DECIMAL(10,2) | YES | - | 使用量 |
| created_at | TIMESTAMP | NO | now() | 作成日時 |

**インデックス:**
- `idx_lot_links_material_lot_id` (material_lot_id)
- `idx_lot_links_product_lot_id` (product_lot_id)

---

#### temperature_records（温度記録）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| facility_id | UUID | NO | - | 設備ID（FK → facilities） |
| recorded_at | TIMESTAMP | NO | - | 記録日時 |
| temperature | DECIMAL(5,2) | NO | - | 温度（℃） |
| is_normal | BOOLEAN | NO | - | 正常フラグ |
| recorded_by | UUID | NO | - | 記録者（FK → users） |
| notes | TEXT | YES | - | メモ |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_temperature_records_facility_id` (facility_id)
- `idx_temperature_records_recorded_at` (recorded_at)
- `idx_temperature_records_is_normal` (is_normal)

---

#### temperature_alerts（温度異常アラート）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| temperature_record_id | UUID | NO | - | 温度記録ID（FK → temperature_records、ユニーク） |
| facility_id | UUID | NO | - | 設備ID（FK → facilities） |
| alert_temperature | DECIMAL(5,2) | NO | - | 異常時の温度 |
| threshold | DECIMAL(5,2) | NO | - | 超過した閾値 |
| status | AlertStatus | NO | OPEN | ステータス |
| resolved_by | UUID | YES | - | 対応者（FK → users） |
| resolved_at | TIMESTAMP | YES | - | 対応日時 |
| corrective_action | TEXT | YES | - | 是正措置 |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_temperature_alerts_status` (status)
- `idx_temperature_alerts_facility_id` (facility_id)
- `uq_temperature_alerts_record_id` (temperature_record_id) UNIQUE

---

#### hygiene_records（衛生管理記録）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| category_id | UUID | NO | - | カテゴリID（FK → hygiene_categories） |
| facility_id | UUID | YES | - | 設備ID（FK → facilities、任意） |
| record_date | DATE | NO | - | 記録日 |
| details | TEXT | NO | - | 詳細 |
| result | HygieneResult | NO | - | 結果（PASS/FAIL/NA） |
| recorded_by | UUID | NO | - | 記録者（FK → users） |
| notes | TEXT | YES | - | メモ |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_hygiene_records_category_id` (category_id)
- `idx_hygiene_records_record_date` (record_date)

---

#### production_targets（製造目標）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| product_id | UUID | NO | - | 製品ID（FK → products） |
| target_year | INT | NO | - | 対象年 |
| target_month | INT | NO | - | 対象月 |
| target_quantity | DECIMAL(10,2) | NO | - | 目標数量 |
| daily_target | DECIMAL(10,2) | YES | - | 日次目標 |
| set_by | UUID | NO | - | 設定者（FK → users） |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `uq_production_targets_product_year_month` (product_id, target_year, target_month) UNIQUE

---

#### loss_records（ロス記録）

| カラム | 型 | NULL | デフォルト | 説明 |
|--------|-----|:----:|----------|------|
| id | UUID | NO | uuid() | 主キー |
| product_id | UUID | NO | - | 製品ID（FK → products） |
| category_id | UUID | NO | - | カテゴリID（FK → loss_categories） |
| record_date | DATE | NO | - | 記録日 |
| quantity | DECIMAL(10,2) | NO | - | ロス数量 |
| loss_rate | DECIMAL(5,2) | YES | - | ロス率（%） |
| recorded_by | UUID | NO | - | 記録者（FK → users） |
| notes | TEXT | YES | - | メモ |
| created_at | TIMESTAMP | NO | now() | 作成日時 |
| updated_at | TIMESTAMP | NO | auto | 更新日時 |

**インデックス:**
- `idx_loss_records_product_id` (product_id)
- `idx_loss_records_record_date` (record_date)
- `idx_loss_records_category_id` (category_id)

---

## 4. インデックス戦略

### 4.1 インデックス設計方針

| 方針 | 説明 |
|------|------|
| 外部キー | 全FK列にインデックスを設定（JOINパフォーマンス） |
| 検索条件 | 頻繁にWHEREで使用されるカラムにインデックス |
| ユニーク制約 | ビジネスルール上のユニーク性をDBレベルで保証 |
| 複合インデックス | 複合条件検索用の複合インデックス |
| 論理削除 | isActiveフラグにインデックス（頻繁なフィルタリング） |

### 4.2 インデックス一覧

| テーブル | インデックス名 | カラム | 種類 |
|---------|-------------|--------|------|
| users | uq_users_email | email | UNIQUE |
| users | idx_users_role | role | BTREE |
| users | idx_users_is_active | is_active | BTREE |
| products | uq_products_code | code | UNIQUE |
| products | idx_products_is_active | is_active | BTREE |
| materials | uq_materials_code | code | UNIQUE |
| materials | idx_materials_is_active | is_active | BTREE |
| facilities | uq_facilities_code | code | UNIQUE |
| facilities | idx_facilities_type | type | BTREE |
| facilities | idx_facilities_is_active | is_active | BTREE |
| product_materials | uq_pm_product_material | product_id, material_id | UNIQUE |
| hygiene_categories | idx_hc_sort_order | sort_order | BTREE |
| loss_categories | idx_lc_sort_order | sort_order | BTREE |
| production_records | idx_pr_date | production_date | BTREE |
| production_record_items | idx_pri_record_product | production_record_id, product_id | BTREE |
| material_lots | uq_ml_lot_number | lot_number | UNIQUE |
| material_lots | idx_ml_material_id | material_id | BTREE |
| material_lots | idx_ml_received_date | received_date | BTREE |
| product_lots | uq_pl_lot_number | lot_number | UNIQUE |
| product_lots | idx_pl_product_id | product_id | BTREE |
| product_lots | idx_pl_production_date | production_date | BTREE |
| lot_links | idx_ll_material_lot_id | material_lot_id | BTREE |
| lot_links | idx_ll_product_lot_id | product_lot_id | BTREE |
| temperature_records | idx_tr_facility_id | facility_id | BTREE |
| temperature_records | idx_tr_recorded_at | recorded_at | BTREE |
| temperature_records | idx_tr_is_normal | is_normal | BTREE |
| temperature_alerts | uq_ta_record_id | temperature_record_id | UNIQUE |
| temperature_alerts | idx_ta_status | status | BTREE |
| temperature_alerts | idx_ta_facility_id | facility_id | BTREE |
| hygiene_records | idx_hr_category_id | category_id | BTREE |
| hygiene_records | idx_hr_record_date | record_date | BTREE |
| production_targets | uq_pt_product_year_month | product_id, target_year, target_month | UNIQUE |
| loss_records | idx_lr_product_id | product_id | BTREE |
| loss_records | idx_lr_record_date | record_date | BTREE |
| loss_records | idx_lr_category_id | category_id | BTREE |

---

## 5. Seed データ

### 5.1 ユーザー

| name | email | password | role |
|------|-------|----------|------|
| 管理者 | admin@kawakami-foods.co.jp | admin1234 | ADMIN |

### 5.2 製品

| code | name | unit |
|------|------|------|
| PRD-001 | 絹ごし豆腐 | 丁 |
| PRD-002 | 木綿豆腐 | 丁 |
| PRD-003 | 厚揚げ | 枚 |
| PRD-004 | 油揚げ | 枚 |

### 5.3 設備

| code | name | type | 上限 | 下限 |
|------|------|------|------|------|
| FAC-001 | 冷蔵庫A | REFRIGERATOR | 5℃ | - |
| FAC-002 | 冷蔵庫B | REFRIGERATOR | 5℃ | - |
| FAC-003 | 冷凍庫 | FREEZER | -15℃ | - |
| FAC-004 | 加熱設備 | HEATER | - | 75℃ |

### 5.4 衛生管理カテゴリ

| name | sort_order |
|------|-----------|
| 清掃 | 1 |
| 害虫駆除 | 2 |
| 水質検査 | 3 |
| 廃棄物管理 | 4 |

### 5.5 ロスカテゴリ

| name | sort_order |
|------|-----------|
| 製造不良 | 1 |
| 破損 | 2 |
| 期限切れ | 3 |
| その他 | 4 |
