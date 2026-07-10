import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.TURSO_DATABASE_URL) {
  console.warn("TURSO_DATABASE_URL provided but adapter is not imported. Using standard PrismaClient.");
  prisma = new PrismaClient();
} else {
  // Fallback to local SQLite database if TURSO_DATABASE_URL is not set
  prisma = new PrismaClient();
}

export default prisma;

