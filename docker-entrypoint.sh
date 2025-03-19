#!/bin/sh

# Create database directory if it doesn't exist
mkdir -p /app/prisma/data

# Set the DATABASE_URL environment variable if not already set
if [ -z "$DATABASE_URL" ]; then
    export DATABASE_URL="file:/app/prisma/data/reddit-clone.db"
fi

# First make sure the database structure exists
echo "Ensuring database structure exists..."
npx prisma db push --accept-data-loss

# Run Prisma migrations
echo "Running database migrations..."
npx prisma migrate deploy

# Check if database is empty by counting users
USER_COUNT=$(node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function checkUsers() {
  try {
    const count = await prisma.user.count();
    console.log(count);
  } catch (e) {
    console.log('0');
  } finally {
    await prisma.\$disconnect();
  }
}
checkUsers();
")

# Check if database should be seeded
if [ "$SEED_DATABASE" = "true" ] && [ "$USER_COUNT" = "0" ]; then
    echo "Database is empty. Seeding database..."
    node prisma/seed.js
    elif [ "$SEED_DATABASE" = "true" ] && [ "$USER_COUNT" != "0" ]; then
    echo "Database already contains data ($USER_COUNT users found). Skipping seed to preserve existing data."
else
    echo "Skipping database seeding (set SEED_DATABASE=true to seed empty databases)."
fi

# Start the application
echo "Starting CardiNet application..."
exec node_modules/.bin/next start