import mysql, { type Pool } from 'mysql2/promise';
import type { AppConfig } from './config.js';

export function createDatabasePool(config: AppConfig['database']): Pool {
  return mysql.createPool({
    ...config,
    charset: 'utf8mb4',
    enableKeepAlive: true,
    waitForConnections: true,
  });
}
