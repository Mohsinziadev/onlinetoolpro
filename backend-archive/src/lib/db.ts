import "server-only";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { ApiError } from "@/lib/api";

const g = globalThis as unknown as { __prisma?: PrismaClient };

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Lazily-created singleton (reused across hot reloads in development). */
export function db(): PrismaClient {
  if (!process.env.DATABASE_URL) {
    throw new ApiError(503, "DB_NOT_CONFIGURED", "Saving channels isn't available because the database hasn't been configured.");
  }
  if (!g.__prisma) {
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    g.__prisma = new PrismaClient({ adapter });
  }
  return g.__prisma;
}

/** BigInt → number for JSON (view counts are far below 2^53). */
export function big(v: bigint | null | undefined): number | null {
  return v === null || v === undefined ? null : Number(v);
}
