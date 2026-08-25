import cors from 'cors';
import express, { type Express } from 'express';
import { pinoHttp } from 'pino-http';
import type { Logger } from 'pino';
import type { LogRepository } from './repositories/log-repository.js';
import type { JsonFileStore } from './data/file-store.js';
import type { ClientDataService } from './services/client-data-service.js';
import type { CusisService } from './services/cusis-service.js';
import { createClientDataRouter } from './routes/client-data.js';
import { createCusisRouter } from './routes/cusis.js';
import { createHealthRouter } from './routes/health.js';
import { createLogsRouter } from './routes/logs.js';
import { createRealtimeRouter } from './routes/realtime.js';

export type CreateAppOptions = {
  allowedOrigins: string[];
  logRepository: LogRepository;
  clientDataService: ClientDataService;
  cusisService: CusisService;
  files: JsonFileStore;
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
  app.use(createClientDataRouter(options.clientDataService));
  app.use(createRealtimeRouter(options.files));
  app.use(createLogsRouter(options.logRepository));
  app.use(createCusisRouter(options.cusisService));
  app.use((error: unknown, request: express.Request, response: express.Response, _next: express.NextFunction) => {
    request.log.error({ err: error }, 'Unhandled request error');
    response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } });
  });

  return app;
}
