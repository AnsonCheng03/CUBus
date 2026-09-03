import { PrismaClient } from '@prisma/client';
import type { AppConfig } from './config.js';

export function createDatabaseClient(config: AppConfig['database']): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url: config.url } },
  });
}
