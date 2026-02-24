# アーキテクチャ設計書

## 川上食品 HACCP管理システム

| 項目 | 内容 |
|------|------|
| プロジェクト名 | 川上食品 HACCP管理システム |
| バージョン | v1.0.0 |
| 最終更新日 | 2026-02-09 |

---

## 1. システムアーキテクチャ概要

```mermaid
graph TB
    subgraph "クライアント層"
        Browser["ブラウザ<br/>(Chrome/Firefox/Safari)"]
    end

    subgraph "Next.js アプリケーション"
        subgraph "フロントエンド"
            Pages["Pages<br/>(App Router)"]
            Components["UIコンポーネント<br/>(React 19)"]
            SWR["SWR<br/>(データフェッチング)"]
            Recharts["Recharts<br/>(グラフ描画)"]
        end

        subgraph "ミドルウェア層"
            MW["Middleware<br/>(JWT検証)"]
        end

        subgraph "バックエンド"
            APIRoutes["API Routes<br/>(REST API)"]
            ServerActions["Server Actions<br/>(フォーム処理)"]
            Auth["認証モジュール<br/>(jose + bcrypt)"]
            Validation["バリデーション<br/>(Zod v4)"]
            Session["セッション管理<br/>(JWT Payload)"]
        end

        subgraph "データアクセス層"
            Prisma["Prisma Client 7<br/>(ORM)"]
            PrismaPg["Prisma PG Adapter"]
        end
    end

    subgraph "データベース層"
        PG["PostgreSQL 17<br/>(17エンティティ)"]
    end

    Browser --> MW
    MW --> Pages
    Pages --> Components
    Pages --> SWR
    SWR --> APIRoutes
    Pages --> ServerActions
    Components --> Recharts
    ServerActions --> Auth
    ServerActions --> Validation
    ServerActions --> Session
    APIRoutes --> Auth
    APIRoutes --> Prisma
    ServerActions --> Prisma
    Prisma --> PrismaPg
    PrismaPg --> PG
```

---

## 2. 技術スタック

### 2.1 フロントエンド

| 技術 | バージョン | 用途 |
|------|----------|------|
| Next.js | 16.1.6 | フルスタックフレームワーク（App Router） |
| React | 19.2.3 | UIライブラリ |
| TypeScript | 5.x | 型安全なJavaScript |
| Tailwind CSS | 4.x | ユーティリティファーストCSS |
| Recharts | 3.7.0 | グラフ・チャート描画 |
| SWR | 2.4.0 | データフェッチング・キャッシュ・ポーリング |
| Lucide React | 0.563.0 | アイコンライブラリ |
| clsx | 2.1.1 | 条件付きクラス名結合 |
| tailwind-merge | 3.4.0 | Tailwind CSSクラスのマージ |

### 2.2 バックエンド

| 技術 | バージョン | 用途 |
|------|----------|------|
| Next.js Server Actions | - | フォーム処理・サーバーサイドロジック |
| Next.js API Routes | - | REST API エンドポイント |
| Prisma | 7.3.0 | ORM・データベースアクセス |
| @prisma/adapter-pg | 7.3.0 | PostgreSQL接続アダプター |
| jose | 6.1.3 | JWT生成・検証 |
| bcryptjs | 3.0.3 | パスワードハッシュ化 |
| Zod | 4.3.6 | スキーマバリデーション |
| pg | 8.18.0 | PostgreSQL Node.jsドライバ |

### 2.3 データベース

| 技術 | バージョン | 用途 |
|------|----------|------|
| PostgreSQL | 17 | リレーショナルデータベース |

### 2.4 開発ツール

| 技術 | バージョン | 用途 |
|------|----------|------|
| ESLint | 9.x | コード品質チェック |
| @tailwindcss/postcss | 4.x | Tailwind CSS PostCSS プラグイン |
| tsx | 4.21.0 | TypeScript実行（Seed用） |
| ts-node | 10.9.2 | TypeScript実行 |

---

## 3. ディレクトリ構造

```
Kawakamishokuhin/
├── prisma/
│   ├── schema.prisma          # Prisma スキーマ定義（17エンティティ）
│   ├── seed.ts                # 初期データ投入スクリプト
│   └── migrations/            # マイグレーションファイル
├── src/
│   ├── middleware.ts           # Next.js Middleware（JWT認証チェック）
│   ├── actions/               # Server Actions
│   │   ├── auth.ts            # 認証（ログイン・ログアウト）
│   │   ├── production.ts      # 製造実績管理
│   │   ├── temperature.ts     # 温度管理・アラート
│   │   ├── lots.ts            # ロットトレーサビリティ
│   │   ├── hygiene.ts         # 衛生管理
│   │   ├── targets.ts         # 製造目標
│   │   ├── loss.ts            # ロス管理
│   │   └── master.ts          # マスタ管理（製品・原材料・設備・ユーザー）
│   ├── app/
│   │   ├── layout.tsx         # ルートレイアウト（html/body）
│   │   ├── globals.css        # グローバルCSS
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx   # ログイン画面
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx     # ダッシュボードレイアウト（Sidebar + Header）
│   │   │   ├── page.tsx       # ダッシュボード（KPI・グラフ・アラート）
│   │   │   ├── production/
│   │   │   │   ├── page.tsx       # 製造実績一覧
│   │   │   │   ├── new/page.tsx   # 製造実績登録
│   │   │   │   └── [id]/page.tsx  # 製造実績詳細
│   │   │   ├── temperature/
│   │   │   │   ├── page.tsx       # 温度記録一覧
│   │   │   │   ├── new/page.tsx   # 温度記録登録
│   │   │   │   └── alerts/page.tsx # アラート管理
│   │   │   ├── lots/
│   │   │   │   ├── page.tsx       # ロット検索・管理
│   │   │   │   └── [id]/page.tsx  # ロット詳細・トレース
│   │   │   ├── hygiene/
│   │   │   │   ├── page.tsx       # 衛生記録一覧
│   │   │   │   └── new/page.tsx   # 衛生記録登録
│   │   │   ├── targets/
│   │   │   │   ├── page.tsx       # 製造目標一覧
│   │   │   │   ├── set/page.tsx   # 製造目標設定
│   │   │   │   └── analysis/page.tsx # 達成率分析
│   │   │   ├── loss/
│   │   │   │   ├── page.tsx       # ロス記録一覧
│   │   │   │   ├── new/page.tsx   # ロス記録登録
│   │   │   │   └── report/page.tsx # ロスレポート
│   │   │   └── master/
│   │   │       ├── products/page.tsx   # 製品マスタ
│   │   │       ├── materials/page.tsx  # 原材料マスタ
│   │   │       ├── facilities/page.tsx # 設備マスタ
│   │   │       └── users/page.tsx      # ユーザー管理
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── login/route.ts     # POST: ログインAPI
│   │       │   ├── logout/route.ts    # POST: ログアウトAPI
│   │       │   └── me/route.ts        # GET: 現在ユーザー情報
│   │       └── dashboard/
│   │           ├── kpi/route.ts              # GET: KPIデータ
│   │           ├── alerts/route.ts           # GET: 未対応アラート
│   │           ├── production-chart/route.ts # GET: 製造実績グラフ
│   │           ├── temperature-status/route.ts # GET: 温度ステータス
│   │           └── recent-activities/route.ts  # GET: 最近のアクティビティ
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx    # サイドバーナビゲーション
│   │   │   └── header.tsx     # ヘッダー（ユーザー名・ログアウト）
│   │   └── ui/
│   │       ├── button.tsx     # ボタンコンポーネント
│   │       ├── input.tsx      # 入力フィールド
│   │       ├── select.tsx     # セレクトボックス
│   │       ├── table.tsx      # テーブル
│   │       ├── modal.tsx      # モーダルダイアログ
│   │       ├── badge.tsx      # バッジ（ステータス表示）
│   │       ├── pagination.tsx # ページネーション
│   │       ├── alert.tsx      # アラートメッセージ
│   │       └── card.tsx       # カードコンテナ
│   ├── lib/
│   │   ├── prisma.ts          # Prisma Client シングルトン
│   │   ├── auth.ts            # JWT生成・検証・Cookie管理
│   │   ├── session.ts         # セッション取得・権限チェック
│   │   └── utils.ts           # ユーティリティ関数（日付フォーマット等）
│   └── validations/
│       ├── auth.ts            # ログインバリデーション
│       ├── production.ts      # 製造実績バリデーション
│       ├── temperature.ts     # 温度記録・アラートバリデーション
│       ├── master.ts          # マスタ管理バリデーション
│       ├── hygiene.ts         # 衛生管理バリデーション
│       ├── lots.ts            # ロットバリデーション
│       ├── targets.ts         # 製造目標バリデーション
│       └── loss.ts            # ロス管理バリデーション
├── docs/                      # ドキュメント
├── package.json
├── tsconfig.json
├── next.config.ts
└── .env                       # 環境変数
```

---

## 4. データフロー

### 4.1 Server Actionフロー（フォーム送信）

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant F as フォーム (Client)
    participant SA as Server Action
    participant V as Zod Validation
    participant S as Session
    participant P as Prisma
    participant DB as PostgreSQL

    U->>F: フォーム入力・送信
    F->>SA: FormData送信
    SA->>S: requireSession() / requireRole()
    S-->>SA: JWT Payload (userId, role)
    SA->>V: スキーマバリデーション
    V-->>SA: パース結果
    alt バリデーション成功
        SA->>P: データ操作
        P->>DB: SQLクエリ
        DB-->>P: 結果
        P-->>SA: データ
        SA->>SA: revalidatePath()
        SA-->>F: { success: true }
    else バリデーション失敗
        SA-->>F: { error: "エラーメッセージ" }
    end
    F-->>U: UI更新
```

### 4.2 API Routeフロー（SWRポーリング）

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant C as Client Component
    participant SWR as SWR Hook
    participant MW as Middleware
    participant API as API Route
    participant P as Prisma
    participant DB as PostgreSQL

    U->>C: ページ表示
    C->>SWR: useSWR(url, fetcher, { refreshInterval: 30000 })
    loop 30秒ごと
        SWR->>MW: HTTP GET
        MW->>MW: JWT検証
        MW->>API: リクエスト転送
        API->>P: データ取得
        P->>DB: SQLクエリ
        DB-->>P: 結果
        P-->>API: データ
        API-->>SWR: JSON レスポンス
        SWR-->>C: データ更新
        C-->>U: UI再描画
    end
```

### 4.3 温度異常検出フロー

```mermaid
flowchart TD
    A[温度記録フォーム送信] --> B[Server Action: createTemperatureRecord]
    B --> C[セッション確認]
    C --> D[Zodバリデーション]
    D --> E[設備情報取得]
    E --> F{tempUpperLimit設定あり?}
    F -->|はい| G{温度 > 上限?}
    F -->|いいえ| H{tempLowerLimit設定あり?}
    G -->|はい| I[isNormal=false, threshold=上限値]
    G -->|いいえ| H
    H -->|はい| J{温度 < 下限?}
    H -->|いいえ| K[isNormal=true]
    J -->|はい| L[isNormal=false, threshold=下限値]
    J -->|いいえ| K
    I --> M[温度記録を保存]
    L --> M
    K --> M
    M --> N{isNormal=false?}
    N -->|はい| O[TemperatureAlert自動生成<br/>status=OPEN]
    N -->|いいえ| P[完了]
    O --> P
```

### 4.4 ロットトレーサビリティフロー

```mermaid
flowchart LR
    subgraph "原材料ロット"
        ML1["MLT-20260201-001<br/>大豆（北海道産）"]
        ML2["MLT-20260201-002<br/>にがり"]
    end

    subgraph "ロット紐付け<br/>(LotLink)"
        LL1["使用量: 50kg"]
        LL2["使用量: 2kg"]
        LL3["使用量: 30kg"]
    end

    subgraph "製品ロット"
        PL1["PLT-20260201-001<br/>絹ごし豆腐"]
        PL2["PLT-20260201-002<br/>木綿豆腐"]
    end

    ML1 --> LL1 --> PL1
    ML1 --> LL3 --> PL2
    ML2 --> LL2 --> PL1

    style ML1 fill:#e3f2fd
    style ML2 fill:#e3f2fd
    style PL1 fill:#e8f5e9
    style PL2 fill:#e8f5e9
```

**前方トレース（Forward）:** 原材料ロット ML1 → [PL1, PL2]（この大豆はどの製品に使われたか）
**後方トレース（Backward）:** 製品ロット PL1 → [ML1, ML2]（この豆腐にはどの原材料が使われたか）

---

## 5. セキュリティアーキテクチャ

### 5.1 認証フロー

```mermaid
sequenceDiagram
    participant U as ユーザー
    participant L as ログイン画面
    participant API as /api/auth/login
    participant DB as PostgreSQL
    participant JWT as JWT (jose)
    participant CK as Cookie

    U->>L: メール・パスワード入力
    L->>API: POST { email, password }
    API->>DB: SELECT user WHERE email
    DB-->>API: User レコード
    API->>API: bcrypt.compare(password, passwordHash)
    alt パスワード一致
        API->>JWT: SignJWT({ userId, email, name, role })
        JWT-->>API: JWT トークン (HS256, 8h有効)
        API->>CK: Set-Cookie: haccp-token=JWT
        Note over CK: httpOnly=true<br/>secure=true (本番)<br/>sameSite=lax<br/>maxAge=28800
        API-->>U: 200 { user }
    else パスワード不一致
        API-->>U: 401 { error }
    end
```

### 5.2 セキュリティ対策一覧

| 脅威 | 対策 | 実装箇所 |
|------|------|---------|
| パスワード漏洩 | bcryptjs (salt rounds=10) でハッシュ化 | `src/actions/master.ts` |
| セッションハイジャック | httpOnly Cookie + JWT | `src/lib/auth.ts` |
| CSRF | sameSite=lax Cookie + Server Actions | `src/lib/auth.ts` |
| XSS | Reactの自動エスケープ + httpOnly Cookie | React標準機能 |
| SQLインジェクション | Prismaのパラメータバインド | Prisma ORM |
| 不正アクセス | Middleware JWT検証 | `src/middleware.ts` |
| 権限昇格 | requireRole() によるロールチェック | `src/lib/session.ts` |
| トークン期限 | JWT 8時間有効期限 | `src/lib/auth.ts` |
| 自己削除防止 | userId比較チェック | `src/actions/master.ts` |

### 5.3 ロールベースアクセス制御

```mermaid
graph TD
    subgraph "ADMIN"
        A1["ユーザー管理"]
        A2["全マスタ管理"]
        A3["アラート対応"]
        A4["製造目標設定"]
        A5["全記録操作"]
    end

    subgraph "MANAGER"
        M1["マスタ管理<br/>(ユーザー以外)"]
        M2["アラート対応"]
        M3["製造目標設定"]
        M4["全記録操作"]
    end

    subgraph "WORKER"
        W1["記録登録<br/>(製造・温度・衛生・ロス)"]
        W2["ロット登録・紐付け"]
        W3["データ閲覧"]
    end
```

---

## 6. コンポーネントアーキテクチャ

### 6.1 レイアウト構造

```mermaid
graph TD
    RootLayout["RootLayout<br/>(html, body, metadata)"]

    RootLayout --> AuthLayout["(auth) Layout"]
    RootLayout --> DashLayout["(dashboard) Layout<br/>(Sidebar + Header)"]

    AuthLayout --> LoginPage["login/page.tsx"]

    DashLayout --> Dashboard["page.tsx (ダッシュボード)"]
    DashLayout --> Production["production/"]
    DashLayout --> Temperature["temperature/"]
    DashLayout --> Lots["lots/"]
    DashLayout --> Hygiene["hygiene/"]
    DashLayout --> Targets["targets/"]
    DashLayout --> Loss["loss/"]
    DashLayout --> Master["master/"]
```

### 6.2 共通UIコンポーネント

| コンポーネント | ファイル | 説明 |
|-------------|---------|------|
| Button | `components/ui/button.tsx` | ボタン（variant: primary/secondary/danger/ghost） |
| Input | `components/ui/input.tsx` | テキスト入力（ラベル・エラー表示対応） |
| Select | `components/ui/select.tsx` | セレクトボックス |
| Table | `components/ui/table.tsx` | データテーブル |
| Modal | `components/ui/modal.tsx` | モーダルダイアログ |
| Badge | `components/ui/badge.tsx` | ステータスバッジ（success/danger/warning/info） |
| Pagination | `components/ui/pagination.tsx` | ページネーション |
| Alert | `components/ui/alert.tsx` | アラートメッセージ（success/error/warning/info） |
| Card | `components/ui/card.tsx` | カードコンテナ（title/action対応） |

### 6.3 レイアウトコンポーネント

| コンポーネント | ファイル | 説明 |
|-------------|---------|------|
| Sidebar | `components/layout/sidebar.tsx` | 左サイドバーナビゲーション（固定幅240px） |
| Header | `components/layout/header.tsx` | 上部ヘッダー（タイトル・ユーザー名・ログアウト） |

---

## 7. データフェッチングパターン

### 7.1 Server Component（SSR）

Server Componentからは直接Server Actionを呼び出してデータを取得する。

```
page.tsx (Server Component)
  └── Server Action呼び出し（直接await）
       └── Prisma Query
            └── PostgreSQL
```

**使用箇所:** 製造実績一覧、温度記録一覧、ロット詳細 など

### 7.2 Client Component + SWR（CSR + ポーリング）

Client ComponentからはSWRを使用してAPI Routeからデータを取得する。30秒間隔のポーリングにより準リアルタイム更新を実現する。

```
page.tsx (Client Component)
  └── useSWR(url, fetcher, { refreshInterval: 30000 })
       └── fetch(API Route)
            └── Prisma Query
                 └── PostgreSQL
```

**使用箇所:** ダッシュボード（KPI、アラート、グラフ、温度ステータス）

### 7.3 Client Component + Server Action（フォーム）

フォーム送信にはuseActionState + Server Actionを使用する。

```
page.tsx (Client Component)
  └── useActionState(serverAction, initialState)
       └── <form action={formAction}>
            └── Server Action
                 └── Prisma Query
                      └── PostgreSQL
```

**使用箇所:** 全登録・更新フォーム

---

## 8. デプロイメントアーキテクチャ

### 8.1 開発環境

```mermaid
graph LR
    Dev["開発マシン<br/>(macOS)"]
    NextDev["Next.js Dev Server<br/>(localhost:3000)"]
    PG["PostgreSQL 17<br/>(localhost:5432)"]

    Dev --> NextDev
    NextDev --> PG
```

### 8.2 本番環境（想定）

```mermaid
graph LR
    Users["ユーザー"]
    CDN["CDN / Reverse Proxy"]
    App["Next.js<br/>(Node.js)"]
    PG["PostgreSQL 17<br/>(Managed DB)"]

    Users --> CDN
    CDN --> App
    App --> PG
```

---

## 9. 設計判断と根拠

| 判断 | 選択 | 根拠 |
|------|------|------|
| フレームワーク | Next.js 16 (App Router) | SSR/SSG対応、Server Actions、統合されたルーティング |
| ORM | Prisma 7 | 型安全なDB操作、マイグレーション管理、スキーマファースト |
| 認証 | JWT + httpOnly Cookie | ステートレス認証、XSS対策としてhttpOnly |
| バリデーション | Zod v4 | TypeScript統合、サーバー/クライアント共通スキーマ |
| データフェッチング | SWR | ダッシュボードのポーリング、キャッシュ管理 |
| グラフ | Recharts | React統合、レスポンシブ対応、宣言的API |
| CSS | Tailwind CSS v4 | 高速な開発、一貫したデザインシステム |
| PK | UUID | 分散環境対応、セキュリティ（推測困難） |
| 論理削除 | isActive フラグ | データ整合性維持、参照関係の保持 |
| ロット番号 | 自動採番 (PLT/MLT-YYYYMMDD-NNN) | 日付ベースの可読性、連番の衝突防止 |
