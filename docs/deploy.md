# デプロイ手順書

## 環境情報

| 項目 | 値 |
|------|-----|
| サーバーOS | Windows Server 2025 Standard |
| サーバーIP | 192.168.1.250 |
| SSHユーザー | Administrator |
| アプリURL | http://192.168.1.250:3000 |
| Docker | Docker Desktop for Windows |
| DB | PostgreSQL 17（Docker コンテナ） |

## 前提条件

- Mac側: `ssh Administrator@192.168.1.250` で接続できること
- 社外からの場合: L2TP/IPsec VPN（川上食品）に接続済みであること
- サーバー側: Docker Desktop がインストール・起動済みであること

## 初回セットアップ

### 1. サーバー上にディレクトリ作成

```bash
ssh Administrator@192.168.1.250 "New-Item -ItemType Directory -Force -Path C:\opt\haccp"
```

### 2. 本番用 .env.production を作成

ローカルで `.env.production.example` を元に `.env.production` を作成:

```bash
cp .env.production.example .env.production
# POSTGRES_PASSWORD と JWT_SECRET を強力な値に変更
```

サーバーへ転送:

```bash
scp .env.production Administrator@192.168.1.250:/opt/haccp/.env.production
```

### 3. 初回デプロイ（シードデータ付き）

```bash
./deploy.sh --seed
```

## 通常デプロイ

```bash
./deploy.sh
```

### deploy.sh の処理内容

1. SSH接続確認（VPN接続チェック）
2. `.env.production` の存在確認
3. rsync でファイル転送（node_modules, .git, .env 等は除外）
4. `docker compose up -d --build` でビルド＆起動
5. コンテナ起動確認

## サーバー保守コマンド

SSH接続後（`ssh Administrator@192.168.1.250`）:

```powershell
# コンテナ状態確認
cd /opt/haccp
docker compose ps

# アプリログ確認
docker compose logs --tail=100 app

# DBログ確認
docker compose logs --tail=50 db

# 再起動
docker compose restart app

# 完全再起動（DB含む）
docker compose down && docker compose up -d

# DB接続
docker compose exec db psql -U postgres -d kawakamishokuhin

# マイグレーション手動実行
docker compose exec app npx prisma migrate deploy

# シードデータ投入
docker compose exec app npx prisma db seed
```

## トラブルシューティング

### VPN接続できない
- Mac「システム設定 → VPN → 川上食品」でVPNをオンにする
- `ping 192.168.1.250` で疎通確認

### コンテナが起動しない
```powershell
docker compose logs app    # エラーログ確認
docker compose logs db     # DB起動ログ確認
```

### DBに接続できない
- `.env.production` の `POSTGRES_PASSWORD` が正しいか確認
- `docker compose ps` で db コンテナが healthy か確認

### ポートが使用中
- `APP_PORT` を `.env.production` で変更可能（デフォルト: 3000）

## アーキテクチャ

```
[Browser] --> :3000 --> [app container (Next.js)]
                              |
                              v
                        [db container (PostgreSQL)]
                              |
                        [pgdata volume]
```

- `app`: Next.js standalone + Prisma（起動時に自動マイグレーション）
- `db`: PostgreSQL 17、データは Docker volume `pgdata` に永続化
- DB ポート(5432)は外部公開しない（Docker内部ネットワークのみ）
