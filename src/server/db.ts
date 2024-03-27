import { PrismaClient } from "@prisma/client";

import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

import { env } from "~/env.js";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const libsql = createClient({
  // @ts-expect-error some oddity
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// 3. Instantiate the libSQL driver adapter
const adapter = new PrismaLibSQL(libsql);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
