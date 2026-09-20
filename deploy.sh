#!/bin/bash
set -euo pipefail

# ===========================================
# 川上食品 HACCP管理システム - デプロイスクリプト
# ===========================================
# Usage: ./deploy.sh [--seed]
#   --seed: 初回デプロイ時にシードデータを投入

SERVER="Administrator@192.168.1.250"
REMOTE_DIR="C:/opt/haccp"
SEED=false

for arg in "$@"; do
  case $arg in
    --seed) SEED=true ;;
    *) echo "Unknown option: $arg"; exit 1 ;;
  esac
done

echo "=== [1/4] Pre-flight checks ==="

# Check SSH connectivity
if ! ssh -o ConnectTimeout=5 "$SERVER" "echo ok" > /dev/null 2>&1; then
  echo "ERROR: Cannot connect to $SERVER"
  echo "Hint: VPN（川上食品）に接続していますか？"
  exit 1
fi

# Check .env.production exists on server
if ! ssh "$SERVER" "Test-Path ${REMOTE_DIR}/.env.production" 2>/dev/null | grep -qi true; then
  echo "WARNING: ${REMOTE_DIR}/.env.production not found on server."
  echo "初回デプロイの場合は、先にサーバー上に .env.production を配置してください:"
  echo "  scp .env.production ${SERVER}:${REMOTE_DIR}/.env.production"
  echo ""
  read -p "Continue anyway? (y/N): " confirm
  if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    exit 1
  fi
fi

echo "=== [2/4] Syncing files to server ==="

# Create tar archive (Windows Server doesn't have rsync)
TAR_FILE="/tmp/haccp-deploy.tar.gz"
tar czf "$TAR_FILE" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=.env \
  --exclude=.env.local \
  --exclude=.env.production \
  --exclude=.env.production.example \
  -C "$(pwd)" .

# Upload and extract on server
scp "$TAR_FILE" "${SERVER}:${REMOTE_DIR}/deploy.tar.gz"
ssh "$SERVER" "cd ${REMOTE_DIR}; tar xzf deploy.tar.gz; Remove-Item deploy.tar.gz"
rm -f "$TAR_FILE"

echo "=== [3/4] Building and starting containers ==="
ssh "$SERVER" "cd ${REMOTE_DIR}; docker compose --env-file .env.production up -d --build"

echo "=== [4/4] Health check ==="
echo "Waiting for containers to start..."
sleep 5

ssh "$SERVER" "cd ${REMOTE_DIR}; docker compose --env-file .env.production ps"

# Optional: seed database on first deploy
if [ "$SEED" = true ]; then
  echo ""
  echo "=== Seeding database ==="
  ssh "$SERVER" "cd ${REMOTE_DIR}; docker compose --env-file .env.production exec app npx prisma db seed"
fi

echo ""
echo "=== Deploy complete ==="
echo "App: http://192.168.1.250:3000"
