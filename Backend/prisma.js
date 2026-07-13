import { PrismaClient } from '@prisma/client';

let prisma;

if (process.env.TURSO_DATABASE_URL) {
} else {
  // Fallback to local SQLite database if TURSO_DATABASE_URL is not set
  prisma = new PrismaClient();
}

export default prisma;
