import { PrismaClient } from "@/db/generated/prisma/client/edge.js";
import { withAccelerate } from "@prisma/extension-accelerate";

// const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// export const prisma = globalForPrisma.prisma || new PrismaClient().$extends(withAccelerate());
export const prisma = new PrismaClient().$extends(withAccelerate());

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
