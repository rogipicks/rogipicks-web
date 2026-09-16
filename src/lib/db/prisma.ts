/**
 * Prisma Client singleton instance
 * Pre-configured for serverless Next.js deployments (prevents multiple connections in development)
 */

// Note: If prisma is installed, this exports the PrismaClient instance.
// For now, this acts as a placeholder / adapter layer ready for database connection.

declare global {
  // eslint-disable-next-line no-var
  var prisma: unknown | undefined;
}

export const db = globalThis.prisma || null;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db;
}
