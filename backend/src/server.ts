import { createApp } from './app.js';
import { resolve } from 'node:path';
import { loadConfig } from './config.js';
import { JsonFileStore } from './data/file-store.js';
import { createDatabaseClient } from './db.js';
import { createLogger } from './logger.js';
import { PrismaLogRepository } from './repositories/log-repository.js';
import { PrismaBusRepository } from './repositories/bus-repository.js';
import { PrismaReportArrivalRepository } from './repositories/report-arrival-repository.js';
import { ClientDataService } from './services/client-data-service.js';
import { CusisService } from './services/cusis-service.js';
import { ReportArrivalService } from './services/report-arrival-service.js';
import { scrapeStatus } from './jobs/status-scraper.js';
import { startScheduledJobs } from './jobs/scheduler.js';
import { generateTimetableFile } from './jobs/timetable-generator.js';

const config = loadConfig();
const logger = createLogger(config.logLevel);
const db = createDatabaseClient(config.database);
const files = new JsonFileStore(resolve(config.dataDirectory));
const busRepository = new PrismaBusRepository(db, config.database.database);
const reportArrivalService = new ReportArrivalService(new PrismaReportArrivalRepository(db));
const app = createApp({
  allowedOrigins: config.allowedOrigins,
  logRepository: new PrismaLogRepository(db),
  reportArrivalService,
  clientDataService: new ClientDataService(busRepository, files, config.releaseDate),
  cusisService: new CusisService(config.cusis),
  files,
  logger,
});

const scheduledJobs = config.scheduledJobsEnabled
  ? startScheduledJobs({
    logger,
    runStatus: () => scrapeStatus(files),
    runTimetable: () => generateTimetableFile(busRepository, files),
  })
  : undefined;

const server = app.listen(config.port, () => {
  logger.info({ port: config.port, scheduledJobs: config.scheduledJobsEnabled }, 'CU Bus backend listening');
});

async function shutdown(signal: string) {
  logger.info({ signal }, 'Shutting down');
  scheduledJobs?.stop();
  server.close(async (error) => {
    await db.$disconnect();
    if (error) {
      logger.error({ err: error }, 'HTTP server failed to close cleanly');
      process.exitCode = 1;
    }
  });
}

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
