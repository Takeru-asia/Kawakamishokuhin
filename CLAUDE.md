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

## Production Server（川上食品）

| 項目 | 値 |
|------|-----|
| OS | Windows Server 2025 Standard |
| IP | 192.168.1.250 |
| ユーザー | Administrator |
| SSH | 公開鍵認証済み（パスワード不要） |
| DB | PostgreSQL 17（Dockerコンテナ予定） |
| VPN | L2TP/IPsec 必須（社外からアクセスする場合） |

### 社外から作業する場合

MacのVPN設定（システム設定 → VPN）で「川上食品」をオンにしてからSSH接続する。

### SSH接続

```bash
ssh Administrator@192.168.1.250
```

`~/.ssh/config` にエイリアス設定済みの場合：

```bash
ssh kawakami
```

### デプロイ手順（暫定）

```bash
# 1. ビルド確認
npm run build

# 2. サーバーに転送
rsync -avz --exclude node_modules --exclude .git \
  ./ Administrator@192.168.1.250:/opt/haccp/

# 3. サーバー側で起動
ssh Administrator@192.168.1.250 "cd /opt/haccp && docker compose up -d --build"
```

### サーバー保守コマンド（SSH接続後）

```powershell
# コンテナ状態確認
docker compose ps

# ログ確認
docker compose logs --tail=50 app

# 再起動
docker compose restart app

# DB接続確認
docker compose exec db psql -U postgres -d kawakamishokuhin
```

### 注意事項

- `ssh-copy-id` はWindows PowerShellと非互換。公開鍵登録は手動で行うこと
- ファイアウォールは `Profile: Any` で設定済み（変更しないこと）
- 本番の `DATABASE_URL` はサーバー上の `.env` を参照（ローカルの `.env` と別管理）
- Docker構成は `/opt/haccp/docker-compose.yml` で管理予定