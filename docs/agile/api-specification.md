# API仕様書

## 川上食品 HACCP管理システム

| 項目 | 内容 |
|------|------|
| ベースURL | `http://localhost:3000` |
| 認証方式 | JWT (HS256) + httpOnly Cookie |
| Cookie名 | `haccp-token` |
| トークン有効期限 | 8時間 |
| コンテンツタイプ | `application/json` |
| バリデーション | Zod v4 |

---

## 1. API Routes（REST API）

### 1.1 認証 API

#### POST /api/auth/login

ユーザー認証を行い、JWTトークンを発行する。

**認証:** 不要

**リクエスト:**
```json
{
  "email": "admin@kawakami-foods.co.jp",
  "password": "admin1234"
}
```

**バリデーション:**
| フィールド | 型 | 必須 | ルール |
|-----------|-----|:----:|--------|
| email | string | はい | 有効なメールアドレス形式 |
| password | string | はい | 1文字以上 |

**レスポンス（成功 200）:**
```json
{
  "user": {
    "id": "uuid",
    "name": "管理者",
    "email": "admin@kawakami-foods.co.jp",
    "role": "ADMIN"
  }
}
```
- httpOnly Cookie `haccp-token` にJWTトークンが設定される

**エラーレスポンス:**

| ステータス | 条件 | レスポンス |
|-----------|------|----------|
| 400 | バリデーションエラー | `{ "error": "有効なメールアドレスを入力してください" }` |
| 401 | メールアドレス不一致 | `{ "error": "メールアドレスまたはパスワードが正しくありません" }` |
| 401 | パスワード不一致 | `{ "error": "メールアドレスまたはパスワードが正しくありません" }` |
| 401 | 無効化ユーザー | `{ "error": "メールアドレスまたはパスワードが正しくありません" }` |

---

#### POST /api/auth/logout

ログアウトし、認証Cookieを削除する。

**認証:** 不要（Cookie削除のみ）

**リクエスト:** ボディなし

**レスポンス（成功 200）:**
```json
{
  "success": true
}
```

---

#### GET /api/auth/me

現在の認証ユーザー情報を取得する。

**認証:** 必要

**レスポンス（成功 200）:**
```json
{
  "user": {
    "id": "uuid",
    "name": "管理者",
    "email": "admin@kawakami-foods.co.jp",
    "role": "ADMIN"
  }
}
```

**エラーレスポンス:**
| ステータス | 条件 | レスポンス |
|-----------|------|----------|
| 401 | 未認証 | `{ "error": "Unauthorized" }` |

---

### 1.2 ダッシュボード API

#### GET /api/dashboard/kpi

ダッシュボード用のKPIデータを取得する。

**認証:** 必要（Middleware経由）

**レスポンス（成功 200）:**
```json
{
  "todayProduction": 1500,
  "alertCount": 2,
  "hygieneRate": 95.5,
  "lossRate": 3.2
}
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| todayProduction | number | 本日の製造数量合計 |
| alertCount | number | 未対応（OPEN）アラート件数 |
| hygieneRate | number | 今月の衛生検査合格率（%）。記録なしの場合100 |
| lossRate | number | 今月のロス率（%）。製造実績なしの場合0 |

---

#### GET /api/dashboard/alerts

未対応の温度異常アラートを取得する（最新5件）。

**認証:** 必要

**レスポンス（成功 200）:**
```json
[
  {
    "id": "uuid",
    "temperatureRecordId": "uuid",
    "facilityId": "uuid",
    "alertTemperature": 8.5,
    "threshold": 5.0,
    "status": "OPEN",
    "createdAt": "2026-02-09T10:30:00.000Z",
    "facility": {
      "name": "冷蔵庫A"
    },
    "temperatureRecord": {
      "temperature": 8.5,
      "recordedAt": "2026-02-09T10:30:00.000Z"
    }
  }
]
```

---

#### GET /api/dashboard/production-chart

過去7日間の日別製造数量を取得する。

**認証:** 必要

**レスポンス（成功 200）:**
```json
[
  {
    "date": "2026-02-03",
    "total": 500,
    "label": "2/3 (月)"
  },
  {
    "date": "2026-02-04",
    "total": 620,
    "label": "2/4 (火)"
  }
]
```

| フィールド | 型 | 説明 |
|-----------|-----|------|
| date | string | 日付（YYYY-MM-DD） |
| total | number | 当日の製造数量合計 |
| label | string | 表示用ラベル（M/D (曜日)） |

---

#### GET /api/dashboard/temperature-status

全有効設備の最新温度ステータスを取得する。

**認証:** 必要

**レスポンス（成功 200）:**
```json
[
  {
    "facilityId": "uuid",
    "facilityName": "冷蔵庫A",
    "facilityType": "REFRIGERATOR",
    "temperature": 3.5,
    "isNormal": true,
    "recordedAt": "2026-02-09T10:00:00.000Z"
  },
  {
    "facilityId": "uuid",
    "facilityName": "加熱設備",
    "facilityType": "HEATER",
    "temperature": null,
    "isNormal": true,
    "recordedAt": null
  }
]
```

---

#### GET /api/dashboard/recent-activities

最近のアクティビティを取得する（最新10件）。

**認証:** 必要

**レスポンス（成功 200）:**
```json
[
  {
    "type": "production",
    "description": "製造実績: 絹ごし豆腐, 木綿豆腐",
    "user": "管理者",
    "time": "2026-02-09T10:30:00.000Z"
  },
  {
    "type": "temperature",
    "description": "温度記録: 冷蔵庫A 3.5℃",
    "user": "管理者",
    "time": "2026-02-09T10:15:00.000Z"
  },
  {
    "type": "hygiene",
    "description": "衛生記録: 清掃",
    "user": "作業者A",
    "time": "2026-02-09T09:00:00.000Z"
  }
]
```

| type | 説明 |
|------|------|
| production | 製造実績 |
| temperature | 温度記録 |
| hygiene | 衛生記録 |

---

## 2. Server Actions

Server ActionはNext.jsの`"use server"`ディレクティブを使用したサーバーサイド関数である。フォームのaction属性やuseActionStateフックから呼び出される。

### 2.1 認証 Server Actions

**ファイル:** `src/actions/auth.ts`

#### loginAction

| 項目 | 内容 |
|------|------|
| 関数名 | `loginAction(_prev: unknown, formData: FormData)` |
| 認証 | 不要 |
| 入力 | FormData: email, password |
| バリデーション | `loginSchema` |
| 成功時 | ダッシュボードへリダイレクト |
| エラー時 | `{ error: string }` |

#### logoutAction

| 項目 | 内容 |
|------|------|
| 関数名 | `logoutAction()` |
| 認証 | 不要 |
| 動作 | Cookie削除、ログイン画面へリダイレクト |

---

### 2.2 製造実績 Server Actions

**ファイル:** `src/actions/production.ts`

#### getProductionRecords

| 項目 | 内容 |
|------|------|
| 関数名 | `getProductionRecords(params?: { date?: string })` |
| 認証 | 不要（読み取り専用） |
| パラメータ | date: 製造日（YYYY-MM-DD） |
| 戻り値 | ProductionRecord[] (include: recordedBy, items.product) |
| ソート | productionDate DESC |
| 件数制限 | 50件 |

#### getProductionRecord

| 項目 | 内容 |
|------|------|
| 関数名 | `getProductionRecord(id: string)` |
| 認証 | 不要 |
| パラメータ | id: 製造実績UUID |
| 戻り値 | ProductionRecord (include: items.product, items.productLots) |

#### createProductionRecord

| 項目 | 内容 |
|------|------|
| 関数名 | `createProductionRecord(_prev: unknown, formData: FormData)` |
| 認証 | requireSession() |
| 入力 | FormData: productionDate, notes, items (JSON string) |
| 自動処理 | 製品ロット自動採番（PLT-YYYYMMDD-NNN） |
| 成功時 | `{ success: true }` + revalidatePath("/production") |
| エラー時 | `{ error: string }` |

**items JSON形式:**
```json
[
  { "productId": "uuid", "quantity": 100 },
  { "productId": "uuid", "quantity": 200 }
]
```

---

### 2.3 温度管理 Server Actions

**ファイル:** `src/actions/temperature.ts`

#### getTemperatureRecords

| 項目 | 内容 |
|------|------|
| 関数名 | `getTemperatureRecords(params?: { facilityId?: string; date?: string })` |
| 認証 | 不要 |
| パラメータ | facilityId: 設備UUID、date: 日付（YYYY-MM-DD） |
| 戻り値 | TemperatureRecord[] (include: facility, recordedBy) |
| ソート | recordedAt DESC |
| 件数制限 | 100件 |

#### createTemperatureRecord

| 項目 | 内容 |
|------|------|
| 関数名 | `createTemperatureRecord(_prev: unknown, formData: FormData)` |
| 認証 | requireSession() |
| 入力 | FormData: facilityId, temperature, notes |
| バリデーション | `createTemperatureRecordSchema` |
| 自動処理 | 閾値チェック → 異常時アラート自動生成 |
| 成功時 | `{ success: true }` + revalidatePath("/temperature") |

**温度異常検出ロジック:**
```
if (temperature > facility.tempUpperLimit) → isNormal=false, threshold=tempUpperLimit
if (temperature < facility.tempLowerLimit) → isNormal=false, threshold=tempLowerLimit
else → isNormal=true
```

#### getAlerts

| 項目 | 内容 |
|------|------|
| 関数名 | `getAlerts(status?: string)` |
| 認証 | 不要 |
| パラメータ | status: AlertStatus (OPEN/ACKNOWLEDGED/RESOLVED) |
| 戻り値 | TemperatureAlert[] (include: facility, temperatureRecord, resolvedBy) |
| ソート | createdAt DESC |

#### updateAlert

| 項目 | 内容 |
|------|------|
| 関数名 | `updateAlert(_prev: unknown, formData: FormData)` |
| 認証 | requireRole(["ADMIN", "MANAGER"]) |
| 入力 | FormData: id, status, correctiveAction |
| バリデーション | `updateAlertSchema` |
| 自動処理 | RESOLVED時にresolvedById/resolvedAtを設定 |
| 成功時 | `{ success: true }` + revalidatePath("/temperature/alerts") |

---

### 2.4 ロットトレーサビリティ Server Actions

**ファイル:** `src/actions/lots.ts`

#### searchProductLots

| 項目 | 内容 |
|------|------|
| 関数名 | `searchProductLots(query?: string)` |
| 認証 | 不要 |
| 検索 | lotNumber OR product.name の部分一致（case insensitive） |
| 戻り値 | ProductLot[] (include: product, productionRecordItem.productionRecord) |
| 件数制限 | 50件 |

#### searchMaterialLots

| 項目 | 内容 |
|------|------|
| 関数名 | `searchMaterialLots(query?: string)` |
| 認証 | 不要 |
| 検索 | lotNumber OR material.name の部分一致（case insensitive） |
| 戻り値 | MaterialLot[] (include: material) |
| 件数制限 | 50件 |

#### createMaterialLot

| 項目 | 内容 |
|------|------|
| 関数名 | `createMaterialLot(_prev: unknown, formData: FormData)` |
| 認証 | requireSession() |
| 入力 | FormData: materialId, receivedDate, expiryDate, quantity, supplierLot |
| 自動処理 | ロット番号自動採番（MLT-YYYYMMDD-NNN） |
| 成功時 | `{ success: true }` + revalidatePath("/lots") |

#### createLotLink

| 項目 | 内容 |
|------|------|
| 関数名 | `createLotLink(_prev: unknown, formData: FormData)` |
| 認証 | requireSession() |
| 入力 | FormData: materialLotId, productLotId, quantityUsed |
| 成功時 | `{ success: true }` + revalidatePath("/lots") |

#### traceForward

| 項目 | 内容 |
|------|------|
| 関数名 | `traceForward(materialLotId: string)` |
| 認証 | 不要 |
| 説明 | 原材料ロット → 製品ロットの前方トレース |
| 戻り値 | LotLink[] (include: productLot.product) |

#### traceBackward

| 項目 | 内容 |
|------|------|
| 関数名 | `traceBackward(productLotId: string)` |
| 認証 | 不要 |
| 説明 | 製品ロット → 原材料ロットの後方トレース |
| 戻り値 | LotLink[] (include: materialLot.material) |

#### getLotDetail

| 項目 | 内容 |
|------|------|
| 関数名 | `getLotDetail(id: string, type: "product" \| "material")` |
| 認証 | 不要 |
| 説明 | ロットの詳細情報とトレースデータを取得 |
| 戻り値 | ProductLot \| MaterialLot（関連データを含む） |

---

### 2.5 衛生管理 Server Actions

**ファイル:** `src/actions/hygiene.ts`

#### getHygieneRecords

| 項目 | 内容 |
|------|------|
| 関数名 | `getHygieneRecords(params?: { categoryId?: string; date?: string })` |
| 認証 | 不要 |
| 戻り値 | HygieneRecord[] (include: category, facility, recordedBy) |
| ソート | recordDate DESC |
| 件数制限 | 100件 |

#### getHygieneCategories

| 項目 | 内容 |
|------|------|
| 関数名 | `getHygieneCategories()` |
| 認証 | 不要 |
| フィルタ | isActive=true |
| ソート | sortOrder ASC |

#### createHygieneRecord

| 項目 | 内容 |
|------|------|
| 関数名 | `createHygieneRecord(_prev: unknown, formData: FormData)` |
| 認証 | requireSession() |
| 入力 | FormData: categoryId, facilityId, recordDate, details, result, notes |
| バリデーション | `createHygieneRecordSchema` |
| result選択肢 | PASS / FAIL / NA |
| 成功時 | `{ success: true }` + revalidatePath("/hygiene") |

---

### 2.6 製造目標 Server Actions

**ファイル:** `src/actions/targets.ts`

#### getProductionTargets

| 項目 | 内容 |
|------|------|
| 関数名 | `getProductionTargets(params?: { year?: string; month?: string; productId?: string })` |
| 認証 | 不要 |
| 戻り値 | ProductionTarget[] (include: product, setBy) |
| ソート | targetYear DESC, targetMonth DESC |

#### createProductionTarget

| 項目 | 内容 |
|------|------|
| 関数名 | `createProductionTarget(_prev: unknown, formData: FormData)` |
| 認証 | requireRole(["ADMIN", "MANAGER"]) |
| 入力 | FormData: productId, targetYear, targetMonth, targetQuantity, dailyTarget |
| バリデーション | `createProductionTargetSchema` |
| 重複チェック | productId + targetYear + targetMonth のユニーク制約 |
| 成功時 | `{ success: true }` + revalidatePath("/targets") |

#### updateProductionTarget

| 項目 | 内容 |
|------|------|
| 関数名 | `updateProductionTarget(_prev: unknown, formData: FormData)` |
| 認証 | requireRole(["ADMIN", "MANAGER"]) |
| 入力 | FormData: id, targetQuantity, dailyTarget |
| 成功時 | `{ success: true }` + revalidatePath("/targets") |

#### deleteProductionTarget

| 項目 | 内容 |
|------|------|
| 関数名 | `deleteProductionTarget(id: string)` |
| 認証 | requireRole(["ADMIN", "MANAGER"]) |
| 動作 | 物理削除 |

#### getTargetAnalysis

| 項目 | 内容 |
|------|------|
| 関数名 | `getTargetAnalysis(year: number, month: number)` |
| 認証 | 不要 |
| 説明 | 指定年月の目標達成率を分析 |
| 戻り値 | 製品ごとの目標・実績・達成率 |

**戻り値の型:**
```typescript
{
  productId: string;
  productName: string;
  productCode: string;
  unit: string;
  targetQuantity: number;
  actualQuantity: number;
  achievementRate: number; // パーセンテージ（小数第1位）
}[]
```

---

### 2.7 ロス管理 Server Actions

**ファイル:** `src/actions/loss.ts`

#### getLossRecords

| 項目 | 内容 |
|------|------|
| 関数名 | `getLossRecords(params?: { productId?: string; categoryId?: string; date?: string })` |
| 認証 | 不要 |
| 戻り値 | LossRecord[] (include: product, category, recordedBy) |
| ソート | recordDate DESC |
| 件数制限 | 100件 |

#### getLossCategories

| 項目 | 内容 |
|------|------|
| 関数名 | `getLossCategories()` |
| 認証 | 不要 |
| フィルタ | isActive=true |
| ソート | sortOrder ASC |

#### createLossRecord

| 項目 | 内容 |
|------|------|
| 関数名 | `createLossRecord(_prev: unknown, formData: FormData)` |
| 認証 | requireSession() |
| 入力 | FormData: productId, categoryId, recordDate, quantity, notes |
| バリデーション | `createLossRecordSchema` |
| 自動計算 | lossRate = (quantity / 当月製造量) * 100（小数第1位） |
| 成功時 | `{ success: true }` + revalidatePath("/loss") |

#### getLossReport

| 項目 | 内容 |
|------|------|
| 関数名 | `getLossReport(startDate: string, endDate: string)` |
| 認証 | 不要 |
| パラメータ | startDate, endDate: YYYY-MM-DD形式 |

**戻り値の型:**
```typescript
{
  byCategory: { category: string; totalQuantity: number; count: number }[];
  byProduct: { product: string; totalQuantity: number; count: number; unit: string }[];
  totalLoss: number;
  totalProduction: number;
  overallLossRate: number; // パーセンテージ（小数第1位）
  recordCount: number;
}
```

---

### 2.8 マスタ管理 Server Actions

**ファイル:** `src/actions/master.ts`

#### 製品マスタ

| 関数名 | 認証 | 説明 |
|--------|------|------|
| `getProducts()` | 不要 | 有効な製品一覧取得（code ASC） |
| `createProduct(_prev, formData)` | ADMIN/MANAGER | 製品登録（code重複チェックあり） |
| `updateProduct(_prev, formData)` | ADMIN/MANAGER | 製品更新 |
| `deleteProduct(id)` | ADMIN/MANAGER | 製品論理削除（isActive=false） |

**createProduct/updateProduct 入力:**
| フィールド | 型 | 必須 | ルール |
|-----------|-----|:----:|--------|
| code | string | はい | 1文字以上、ユニーク |
| name | string | はい | 1文字以上 |
| unit | string | はい | 1文字以上 |
| id | string | 更新時のみ | UUID |

#### 原材料マスタ

| 関数名 | 認証 | 説明 |
|--------|------|------|
| `getMaterials()` | 不要 | 有効な原材料一覧取得（code ASC） |
| `createMaterial(_prev, formData)` | ADMIN/MANAGER | 原材料登録 |
| `updateMaterial(_prev, formData)` | ADMIN/MANAGER | 原材料更新 |
| `deleteMaterial(id)` | ADMIN/MANAGER | 原材料論理削除 |

**追加フィールド:**
| フィールド | 型 | 必須 | ルール |
|-----------|-----|:----:|--------|
| supplier | string | いいえ | 仕入先名 |

#### 設備マスタ

| 関数名 | 認証 | 説明 |
|--------|------|------|
| `getFacilities()` | 不要 | 有効な設備一覧取得（code ASC） |
| `createFacility(_prev, formData)` | ADMIN/MANAGER | 設備登録 |
| `updateFacility(_prev, formData)` | ADMIN/MANAGER | 設備更新 |
| `deleteFacility(id)` | ADMIN/MANAGER | 設備論理削除 |

**追加フィールド:**
| フィールド | 型 | 必須 | ルール |
|-----------|-----|:----:|--------|
| type | enum | はい | REFRIGERATOR / FREEZER / HEATER / OTHER |
| tempLowerLimit | string | いいえ | 数値文字列、空文字はnull |
| tempUpperLimit | string | いいえ | 数値文字列、空文字はnull |
| location | string | いいえ | 設置場所 |

#### ユーザー管理

| 関数名 | 認証 | 説明 |
|--------|------|------|
| `getUsers()` | 不要 | 有効なユーザー一覧取得（passwordHash除外） |
| `createUser(_prev, formData)` | ADMIN | ユーザー登録（bcryptハッシュ化） |
| `updateUser(_prev, formData)` | ADMIN | ユーザー更新（パスワード空欄なら変更なし） |
| `deleteUser(id)` | ADMIN | ユーザー論理削除（自己削除不可） |

**createUser 入力:**
| フィールド | 型 | 必須 | ルール |
|-----------|-----|:----:|--------|
| name | string | はい | 1文字以上 |
| email | string | はい | 有効なメール形式、ユニーク |
| password | string | はい | 8文字以上 |
| role | enum | はい | ADMIN / MANAGER / WORKER |

**updateUser 入力:**
| フィールド | 型 | 必須 | ルール |
|-----------|-----|:----:|--------|
| id | string | はい | UUID |
| name | string | はい | 1文字以上 |
| email | string | はい | 有効なメール形式 |
| password | string | いいえ | 空文字なら変更しない、8文字以上 |
| role | enum | はい | ADMIN / MANAGER / WORKER |

---

## 3. エラーコード一覧

### 3.1 HTTP ステータスコード

| コード | 説明 | 発生条件 |
|--------|------|---------|
| 200 | 成功 | 正常なリクエスト |
| 400 | バリデーションエラー | 入力値が不正 |
| 401 | 認証エラー | 未認証、トークン不正/期限切れ |
| 403 | 権限エラー | ロール不足 |
| 500 | サーバーエラー | 予期しないエラー |

### 3.2 Server Action エラーレスポンス

Server Actionは例外をスローするか、`{ error: string }` を返却する。

| エラーメッセージ | 発生条件 |
|----------------|---------|
| "Unauthorized" | requireSession() で未認証 |
| "Forbidden" | requireRole() で権限不足 |
| "メールアドレスまたはパスワードが正しくありません" | ログイン認証失敗 |
| "このコードは既に使用されています" | マスタのコード重複 |
| "このメールアドレスは既に使用されています" | ユーザーのメール重複 |
| "この製品の同月の目標は既に設定されています" | 製造目標の重複 |
| "自分自身を削除することはできません" | 自己削除の試行 |
| "設備が見つかりません" | 温度記録時に設備が存在しない |
| "明細を1件以上入力してください" | 製造実績の明細が空 |
| "明細データが不正です" | items のJSON解析失敗 |
| "製造日を入力してください" | 製造日が未入力 |
| "必須項目を入力してください" | 原材料ロットの必須項目未入力 |
| "原材料ロットと製品ロットを選択してください" | ロット紐付けの選択不足 |

---

## 4. Middleware

**ファイル:** `src/middleware.ts`

| 項目 | 内容 |
|------|------|
| マッチャー | `/((?!_next/static\|_next/image\|favicon.ico).*)` |
| 公開パス | `/login`, `/api/auth/login` |
| スキップパス | `/_next`, `/favicon` |
| 認証方式 | Cookie `haccp-token` のJWT検証 |
| 失敗時動作 | `/login` にリダイレクト |

---

## 5. ルート一覧

### 5.1 ページルート

| # | パス | 種別 | レイアウト | 説明 |
|---|------|------|----------|------|
| 1 | `/login` | Client | (auth) | ログイン画面 |
| 2 | `/` | Client | (dashboard) | ダッシュボード |
| 3 | `/production` | Server/Client | (dashboard) | 製造実績一覧 |
| 4 | `/production/new` | Client | (dashboard) | 製造実績登録 |
| 5 | `/production/[id]` | Server | (dashboard) | 製造実績詳細 |
| 6 | `/temperature` | Server/Client | (dashboard) | 温度記録一覧 |
| 7 | `/temperature/new` | Client | (dashboard) | 温度記録登録 |
| 8 | `/temperature/alerts` | Server/Client | (dashboard) | アラート管理 |
| 9 | `/lots` | Client | (dashboard) | ロット検索・管理 |
| 10 | `/lots/[id]` | Server | (dashboard) | ロット詳細・トレース |
| 11 | `/hygiene` | Server/Client | (dashboard) | 衛生記録一覧 |
| 12 | `/hygiene/new` | Client | (dashboard) | 衛生記録登録 |
| 13 | `/targets` | Server/Client | (dashboard) | 製造目標一覧 |
| 14 | `/targets/set` | Client | (dashboard) | 製造目標設定 |
| 15 | `/targets/analysis` | Client | (dashboard) | 達成率分析 |
| 16 | `/loss` | Server/Client | (dashboard) | ロス記録一覧 |
| 17 | `/loss/new` | Client | (dashboard) | ロス記録登録 |
| 18 | `/loss/report` | Client | (dashboard) | ロスレポート |
| 19 | `/master/products` | Server/Client | (dashboard) | 製品マスタ |
| 20 | `/master/materials` | Server/Client | (dashboard) | 原材料マスタ |
| 21 | `/master/facilities` | Server/Client | (dashboard) | 設備マスタ |
| 22 | `/master/users` | Server/Client | (dashboard) | ユーザー管理 |

### 5.2 APIルート

| # | メソッド | パス | 説明 |
|---|---------|------|------|
| 1 | POST | `/api/auth/login` | ログイン |
| 2 | POST | `/api/auth/logout` | ログアウト |
| 3 | GET | `/api/auth/me` | 現在ユーザー情報 |
| 4 | GET | `/api/dashboard/kpi` | KPIデータ |
| 5 | GET | `/api/dashboard/alerts` | 未対応アラート |
| 6 | GET | `/api/dashboard/production-chart` | 製造実績グラフデータ |
| 7 | GET | `/api/dashboard/temperature-status` | 温度ステータス |
| 8 | GET | `/api/dashboard/recent-activities` | 最近のアクティビティ |
