import { PrismaClient } from "@prisma/client";

type GlobalPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

function createPrismaClient() {
  const datasourceUrl =
    process.env.NODE_ENV === "production"
      ? process.env.DATABASE_URL
      : (process.env.DIRECT_URL ?? process.env.DATABASE_URL);

  if (datasourceUrl) {
    return new PrismaClient({ datasourceUrl });
  }

  return new PrismaClient();
}

const globalPrisma = globalThis as GlobalPrisma;

export const prisma = globalPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalPrisma.prisma = prisma;
}
