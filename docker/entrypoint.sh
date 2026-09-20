#!/bin/sh
set -e

echo "=== HACCP System Starting ==="
echo "Running Prisma migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma
echo "Migrations complete."

echo "Starting application..."
exec "$@"
