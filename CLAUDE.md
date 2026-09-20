# CLAUDE.md - 川上食品 HACCP管理システム

## Project Overview
川上食品向けのHACCP（Hazard Analysis and Critical Control Points）管理システム。
豆腐製造工場の温度管理、衛生管理、ロス管理、ロット追跡を行うWebアプリケーション。

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling**: Tailwind CSS 4 + clsx + tailwind-merge
- **ORM**: Prisma 7 (`prisma-client-js` generator) + PostgreSQL 17
- **Auth**: JWT (jose) + bcryptjs + custom session management
- **Charts**: Recharts 3
- **Data Fetching**: SWR 2
- **Validation**: Zod 4
- **Testing**: Vitest 4
- **Icons**: Lucide React

## Commands
```bash
npm run dev          # Dev server (Next.js)
npm run build        # Production build
npm run lint         # ESLint
npm run test         # Vitest (watch mode)
npm run test:run     # Vitest (single run)
npx tsc --noEmit     # Type check
npx prisma migrate dev    # Run migrations
npx prisma db seed        # Seed database
npx prisma studio         # DB GUI
```

## Project Structure
```
src/
├── app/
│   ├── (auth)/login/       # Login page
│   ├── (dashboard)/        # Main dashboard (layout with sidebar)
│   │   ├── temperature/    # Temperature monitoring (CCP)
│   │   ├── hygiene/        # Hygiene management
│   │   ├── loss/           # Loss tracking
│   │   ├── lots/           # Lot traceability
│   │   ├── production/     # Production records
│   │   ├── targets/        # Target management
│   │   └── master/         # Master data management
│   └── api/
│       ├── auth/           # Auth API routes
│       └── dashboard/      # Dashboard API routes
├── lib/
│   ├── prisma.ts           # Prisma client singleton
│   ├── auth.ts             # Auth utilities
│   ├── session.ts          # Session management
│   ├── constants.ts        # App constants
│   └── utils.ts            # Shared utilities
prisma/
├── schema.prisma           # DB schema (17 entities, 5 enums)
├── seed.ts                 # Seed data
└── migrations/             # Migration files
docs/
├── 要件定義書.md
├── design/                 # ER図, エンティティ一覧
└── 業務フロー図/
```

## Database
- PostgreSQL 17 (Homebrew): `brew services start postgresql@17`
- DB: `kawakamishokuhin`, User: `postgres`, Password: `postgres`
- Prisma 7 requires adapter: `new PrismaClient({ adapter: new PrismaPg({ connectionString }) })`
- **Do NOT use** `new PrismaClient()` without adapter — it will error

## Environment
Copy `.env.example` to `.env`:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kawakamishokuhin?schema=public"
JWT_SECRET="change-this-to-a-secure-random-string-in-production"
```

## Conventions
- Code comments in English, documentation in Japanese
- Snake_case DB columns mapped via Prisma `@map`
- All tables use UUID primary keys
- API routes return JSON with consistent error format
- Components use Tailwind utility classes

## Production（Vercel + Neon）— 2026-09-18 移行

| 項目 | 値 |
|------|-----|
| URL | https://kawakami-haccp.vercel.app |
| Vercel | team `blended-asia` / project `kawakami-haccp`（CLI デプロイ。GitHub 連携は未設定） |
| DB | Neon Postgres `kawakami-haccp-db`（Vercel Marketplace, region sin1） |
| Build | `vercel.json`: `prisma generate && prisma migrate deploy && next build`（マイグレーションはビルド時に自動適用） |
| Env (production) | `DATABASE_URL`(pooled) / `DATABASE_URL_UNPOOLED`(CLI用) / `JWT_SECRET` / `ADMIN_INITIAL_PASSWORD` （TZ は Vercel 予約変数のため `src/instrumentation.ts` で `process.env.TZ=Asia/Tokyo` を設定） |

### デプロイ

```bash
npm run build && npx tsc --noEmit && npm run test:run   # ローカル確認
vercel --prod --yes                                     # 本番デプロイ（migrate 込み）
```

### 本番DBに対する操作（seed 等）

```bash
vercel env pull /tmp/.env.prod --environment=production --yes
set -a; source /tmp/.env.prod; set +a
npx tsx prisma/seed.ts        # マスタ（冪等）
npx tsx prisma/seed-dummy.ts  # デモ用ダミー（60日分・冪等ではない）
npx tsx prisma/seed-lots.ts   # ロット・原材料紐付け（冪等）
```

### 本番 E2E

⚠ 本番に対して実行すると温度記録（9.5℃・notes「E2E 本番検証（異常値）」）とアラートが**実データとして残る**。実行後は削除すること。

```bash
E2E_BASE_URL=https://kawakami-haccp.vercel.app E2E_ADMIN_PASSWORD=... npx playwright test e2e/production-golden-path.spec.ts
```

### 注意事項

- `.env` / `.env.prod` / `.vercel` はコミットしない
- **Vercel CLI 53.2 の `vercel env add` は値を空で保存する不具合あり**（stdin / `--value` とも再現）。秘密情報は REST API（`POST /v10/projects/{id}/env?upsert=true`）で登録し、`vercel env pull` で長さを検証すること
- 旧オンプレ構成（Windows Server 192.168.1.250 / docker-compose / deploy.sh）は **廃止**。ファイルは参考として残置。詳細は `docs/deploy.md`
