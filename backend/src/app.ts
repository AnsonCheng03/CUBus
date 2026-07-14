import cors from 'cors';
import express, { type Express } from 'express';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import type { LogRepository } from './repositories/log-repository.js';
import { createHealthRouter } from './routes/health.js';
import { createLogsRouter } from './routes/logs.js';

export type CreateAppOptions = {
  allowedOrigins: string[];
  logRepository: LogRepository;
  logger: Logger;
};

export function createApp(options: CreateAppOptions): Express {
  const app = express();
  const allowedOrigins = new Set(options.allowedOrigins);

  app.disable('x-powered-by');
  app.use(pinoHttp({ logger: options.logger }));
  app.use(
    cors({
      credentials: true,
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
      origin(origin, callback) {
        if (!origin || allowedOrigins.has(origin)) return callback(null, true);
        return callback(null, false);
      },
    }),
  );
  app.use(express.json({ limit: '32kb' }));
  app.use(createHealthRouter());
  app.use(createLogsRouter(options.logRepository));

  return app;
}
