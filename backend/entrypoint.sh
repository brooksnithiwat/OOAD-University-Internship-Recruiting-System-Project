#!/bin/bash
set -e

# Verify DATABASE_URL and DIRECT_URL are set for Neon
if [ -z "$DATABASE_URL" ] || [ -z "$DIRECT_URL" ]; then
  echo "❌ Error: DATABASE_URL and DIRECT_URL environment variables are required for Neon"
  exit 1
fi

echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Running database seed..."
npm run prisma:seed

echo "🚀 Starting application..."
npm run start
