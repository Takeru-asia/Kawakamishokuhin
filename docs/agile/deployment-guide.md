# デプロイメントガイド

## 川上食品 HACCP管理システム

| 項目 | 内容 |
|------|------|
| プロジェクト名 | 川上食品 HACCP管理システム |
| バージョン | v1.0.0 |
| 最終更新日 | 2026-02-09 |

---

## 1. 前提条件

### 1.1 ソフトウェア要件

| ソフトウェア | バージョン | 必須 | 備考 |
|------------|----------|:----:|------|
| Node.js | 20.x 以上 | はい | LTS推奨 |
| npm | 10.x 以上 | はい | Node.jsに付属 |
| PostgreSQL | 17 | はい | Homebrew または公式インストーラー |
| Git | 最新版 | はい | ソースコード管理 |

### 1.2 ハードウェア要件（開発環境）

| 項目 | 推奨 |
|------|------|
| OS | macOS 14+ / Ubuntu 22.04+ / Windows 11 (WSL2) |
| メモリ | 8GB以上 |
| ストレージ | 2GB以上の空き容量 |

---

## 2. 環境構築手順

### 2.1 PostgreSQL のインストールと起動

#### macOS（Homebrew）

```bash
# PostgreSQL 17 のインストール
brew install postgresql@17

# PATHの設定（.zshrcまたは.bashrcに追加）
export PATH="/opt/homebrew/opt/postgresql@17/bin:$PATH"

# PostgreSQL の起動
brew services start postgresql@17

# 起動確認
psql --version
# psql (PostgreSQL) 17.x
```

#### Ubuntu / Debian

```bash
# PostgreSQL 17 のインストール
sudo apt-get update
sudo apt-get install postgresql-17

# サービス起動
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2.2 データベースの作成

```bash
# PostgreSQL に接続
psql -U postgres

# データベース作成
CREATE DATABASE kawakamishokuhin;

# 確認
\l

# 終了
\q
```

### 2.3 プロジェクトのセットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd Kawakamishokuhin

# 依存パッケージのインストール
npm install
```

### 2.4 環境変数の設定

プロジェクトルートに `.env` ファイルを作成する。

```bash
# .env ファイルの内容
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kawakamishokuhin?schema=public"
JWT_SECRET="kawakami-haccp-secret-key-change-in-production"
```

**環境変数一覧:**

| 変数名 | 必須 | 説明 | デフォルト値 |
|--------|:----:|------|-------------|
| DATABASE_URL | はい | PostgreSQL接続文字列 | なし |
| JWT_SECRET | はい | JWTトークン署名用シークレット | kawakami-haccp-secret-key-change-in-production |
| NODE_ENV | いいえ | 実行環境（development/production） | development |

**本番環境での注意:**
- `JWT_SECRET` は十分な長さ（32文字以上）のランダムな文字列に変更すること
- `DATABASE_URL` は本番DBの接続文字列に変更すること
- `NODE_ENV=production` を設定すること

### 2.5 データベースマイグレーション

```bash
# マイグレーションの実行
npx prisma migrate deploy

# Prisma Client の生成
npx prisma generate
```

### 2.6 初期データの投入（Seed）

```bash
# Seed データの投入
npx tsx prisma/seed.ts
```

**投入されるデータ:**
- 管理者ユーザー: admin@kawakami-foods.co.jp / admin1234
- 製品: 絹ごし豆腐、木綿豆腐、厚揚げ、油揚げ
- 設備: 冷蔵庫A（上限5℃）、冷蔵庫B（上限5℃）、冷凍庫（上限-15℃）、加熱設備（下限75℃）
- 衛生カテゴリ: 清掃、害虫駆除、水質検査、廃棄物管理
- ロスカテゴリ: 製造不良、破損、期限切れ、その他

### 2.7 開発サーバーの起動

```bash
# 開発サーバーの起動
npm run dev

# ブラウザでアクセス
# http://localhost:3000
```

### 2.8 初回ログイン

1. ブラウザで `http://localhost:3000` にアクセス
2. ログイン画面が表示される
3. 以下の認証情報でログイン:
   - メールアドレス: `admin@kawakami-foods.co.jp`
   - パスワード: `admin1234`
4. ダッシュボードが表示されれば成功

---

## 3. 本番ビルドとデプロイ

### 3.1 本番ビルド

```bash
# 本番ビルドの実行
npm run build

# ビルド成果物の確認
ls -la .next/
```

### 3.2 本番サーバーの起動

```bash
# 本番モードで起動
npm run start

# デフォルトで localhost:3000 で起動
```

### 3.3 プロセスマネージャー（PM2）での運用

```bash
# PM2 のインストール
npm install -g pm2

# アプリケーションの起動
pm2 start npm --name "haccp-system" -- start

# 状態確認
pm2 status

# ログ確認
pm2 logs haccp-system

# 再起動
pm2 restart haccp-system

# 停止
pm2 stop haccp-system

# 自動起動設定
pm2 startup
pm2 save
```

### 3.4 リバースプロキシ設定（Nginx）

```nginx
server {
    listen 80;
    server_name haccp.kawakami-foods.co.jp;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 4. データベース管理

### 4.1 バックアップ

```bash
# データベースのバックアップ
pg_dump -U postgres kawakamishokuhin > backup_$(date +%Y%m%d_%H%M%S).sql

# 圧縮バックアップ
pg_dump -U postgres kawakamishokuhin | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 4.2 リストア

```bash
# バックアップからの復元
psql -U postgres kawakamishokuhin < backup_YYYYMMDD_HHMMSS.sql

# 圧縮ファイルからの復元
gunzip -c backup_YYYYMMDD_HHMMSS.sql.gz | psql -U postgres kawakamishokuhin
```

### 4.3 マイグレーション管理

```bash
# マイグレーション状態の確認
npx prisma migrate status

# 新しいマイグレーションの作成（開発時のみ）
npx prisma migrate dev --name <migration-name>

# 本番環境へのマイグレーション適用
npx prisma migrate deploy

# データベースのリセット（開発環境のみ）
npx prisma migrate reset
```

### 4.4 Prisma Studio（データ確認ツール）

```bash
# Prisma Studio の起動
npx prisma studio

# ブラウザで http://localhost:5555 にアクセス
```

---

## 5. 環境変数の管理

### 5.1 開発環境

```bash
# .env（ローカル開発用）
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kawakamishokuhin?schema=public"
JWT_SECRET="kawakami-haccp-secret-key-change-in-production"
```

### 5.2 本番環境

```bash
# .env.production
DATABASE_URL="postgresql://user:password@db-host:5432/kawakamishokuhin?schema=public&sslmode=require"
JWT_SECRET="<十分に長いランダム文字列>"
NODE_ENV="production"
```

**セキュリティ注意事項:**
- `.env` ファイルは `.gitignore` に含まれている（リポジトリにコミットしない）
- 本番環境のシークレットは環境変数マネージャー（AWS Systems Manager, Vault等）で管理することを推奨
- JWT_SECRET は本番環境では必ず変更すること

---

## 6. 動作確認チェックリスト

デプロイ後に以下の項目を確認する。

### 6.1 基本動作

- [ ] ログイン画面が表示される（`/login`）
- [ ] admin@kawakami-foods.co.jp / admin1234 でログインできる
- [ ] ダッシュボードが表示される
- [ ] KPIカードが正しく表示される
- [ ] サイドバーナビゲーションが機能する

### 6.2 HACCP機能

- [ ] 製造実績を登録できる
- [ ] 製品ロットが自動採番される
- [ ] 温度記録を登録できる
- [ ] 温度異常時にアラートが生成される
- [ ] ロット検索が機能する
- [ ] 衛生記録を登録できる

### 6.3 原価管理機能

- [ ] 製造目標を設定できる
- [ ] 達成率分析が正しく表示される
- [ ] ロス記録を登録できる
- [ ] ロスレポートが正しく表示される

### 6.4 マスタ管理

- [ ] 製品マスタのCRUDが機能する
- [ ] 原材料マスタのCRUDが機能する
- [ ] 設備マスタのCRUDが機能する
- [ ] ユーザー管理のCRUDが機能する

### 6.5 セキュリティ

- [ ] 未認証でのアクセスがリダイレクトされる
- [ ] WORKERがマスタ管理を操作できない
- [ ] MANAGERがユーザー管理を操作できない
- [ ] ログアウトが正しく機能する

---

## 7. トラブルシューティング

### 7.1 PostgreSQL に接続できない

**症状:** `Connection refused` エラー

**対処法:**
```bash
# PostgreSQL の状態確認
brew services list | grep postgresql

# 起動されていない場合
brew services start postgresql@17

# ポート確認
lsof -i :5432
```

### 7.2 Prisma マイグレーションエラー

**症状:** `P3009` - マイグレーションが見つからない

**対処法:**
```bash
# マイグレーション状態を確認
npx prisma migrate status

# 開発環境の場合はリセット
npx prisma migrate reset

# 本番環境の場合は手動で解決
npx prisma migrate resolve --applied <migration-name>
```

### 7.3 Prisma Client が古い

**症状:** 型エラーやメソッドが見つからない

**対処法:**
```bash
# Prisma Client の再生成
npx prisma generate
```

### 7.4 Seed 実行エラー

**症状:** `npx tsx prisma/seed.ts` でエラー

**対処法:**
```bash
# tsx のインストール確認
npx tsx --version

# 直接実行
npx tsx prisma/seed.ts

# 環境変数の確認
echo $DATABASE_URL
```

### 7.5 ビルドエラー

**症状:** `npm run build` が失敗する

**対処法:**
```bash
# node_modules の再インストール
rm -rf node_modules .next
npm install

# 型チェック
npx tsc --noEmit

# ビルド再実行
npm run build
```

### 7.6 JWT エラー

**症状:** ログイン後すぐにリダイレクトされる

**対処法:**
- `.env` の `JWT_SECRET` が正しく設定されているか確認
- ブラウザのCookieを確認（`haccp-token` が存在するか）
- サーバーログでJWT検証エラーを確認

### 7.7 ポート競合

**症状:** `EADDRINUSE: address already in use :::3000`

**対処法:**
```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# プロセスを停止
kill -9 <PID>

# または別のポートで起動
PORT=3001 npm run dev
```

---

## 8. 定期メンテナンス

### 8.1 推奨メンテナンス作業

| 作業 | 頻度 | 説明 |
|------|------|------|
| データベースバックアップ | 日次 | pg_dumpによるバックアップ |
| ログローテーション | 週次 | アプリケーションログの管理 |
| 依存パッケージ更新 | 月次 | `npm audit` + セキュリティパッチ適用 |
| PostgreSQL VACUUM | 週次 | データベースの最適化 |
| SSL証明書更新 | 年次 | HTTPS証明書の更新 |

### 8.2 監視項目

| 項目 | 閾値 | 対応 |
|------|------|------|
| CPU使用率 | 80%超 | スケールアップまたはクエリ最適化 |
| メモリ使用率 | 85%超 | メモリリーク調査、再起動 |
| ディスク使用量 | 90%超 | ログクリーンアップ、ストレージ拡張 |
| DB接続数 | 最大接続の80%超 | コネクションプール設定見直し |
| レスポンスタイム | 3秒超 | クエリ最適化、インデックス追加 |
