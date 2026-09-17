import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL!;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Small pool: on serverless each instance gets its own pool, and the
// managed DB (pooled connection string) multiplexes behind it.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
