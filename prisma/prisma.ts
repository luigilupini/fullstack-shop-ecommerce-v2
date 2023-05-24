import { PrismaClient } from '@prisma/client';

// PRISMA: BEST PRACTICE FOR INSTANTIATING PRISMA CLIENT WITH NEXT.JS ⭐️
// https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices
// To instantiate a single instance `PrismaClient` & save it on a global object.
// Then we keep a check to only instantiate a single instance of PrismaClient if
// it's not on a global object otherwise use the same instance again if already
// present to prevent instantiating extra PrismaClient instances.

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// After creating this file, you can now import this PrismaClient instance
// anywhere in your Next pages: import { prisma } from './prisma'
