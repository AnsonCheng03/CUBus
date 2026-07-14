import { createApp } from './app.js';
import { loadConfig } from './config.js';
import { createDatabasePool } from './db.js';
import { createLogger } from './logger.js';
import { MysqlLogRepository } from './repositories/log-repository.js';

const config = loadConfig();
const logger = createLogger(config.logLevel);
const pool = createDatabasePool(config.database);
const app = createApp({
  allowedOrigins: config.allowedOrigins,
  logRepository: new MysqlLogRepository(pool),
  logger,
});

const server = app.listen(config.port, () => {
  logger.info({ port: config.port }, 'CU Bus backend listening');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down');
  server.close(async (error) => {
    await pool.end();
    if (error) {
      logger.error({ err: error }, 'HTTP server failed to close cleanly');
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
