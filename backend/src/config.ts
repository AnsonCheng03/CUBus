import 'dotenv/config';
import { z } from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().max(65_535).default(3000),
  LOG_LEVEL: z.string().default('info'),
  DB_HOST: z.string().min(1),
  DB_PORT: z.coerce.number().int().positive().max(65_535).default(3306),
  DB_USER: z.string().min(1),
  DB_PASS: z.string(),
  DB_NAME: z.string().min(1),
  DB_CONNECTION_LIMIT: z.coerce.number().int().positive().default(10),
  DATA_DIR: z.string().min(1).default('./data'),
  BACKEND_RELEASE_DATE: z.string().default('2026-07-14 00:00:00'),
  ALLOWED_ORIGINS: z.string().default('http://localhost:5173'),
  CUSIS_ENDPOINT: z.string().url().default('https://campusapps.itsc.cuhk.edu.hk/store/CLASSSCHD/STT.asmx'),
  CUSIS_AES_KEY: z.string().min(1),
  CUSIS_AES_IV: z.string().min(1),
  CUSIS_MAX_FAILURES: z.coerce.number().int().positive().default(6),
  CUSIS_FAILURE_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
});

export type AppConfig = ReturnType<typeof loadConfig>;

export function loadConfig(environment: NodeJS.ProcessEnv = process.env) {
  const result = environmentSchema.safeParse(environment);

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join(', ');
    throw new Error(`Invalid backend environment: ${details}`);
  }

  return {
    environment: result.data.NODE_ENV,
    port: result.data.PORT,
    logLevel: result.data.LOG_LEVEL,
    database: {
      host: result.data.DB_HOST,
      port: result.data.DB_PORT,
      user: result.data.DB_USER,
      password: result.data.DB_PASS,
      database: result.data.DB_NAME,
      connectionLimit: result.data.DB_CONNECTION_LIMIT,
    },
    dataDirectory: result.data.DATA_DIR,
    releaseDate: result.data.BACKEND_RELEASE_DATE,
    cusis: {
      endpoint: result.data.CUSIS_ENDPOINT,
      aesKey: result.data.CUSIS_AES_KEY,
      aesIv: result.data.CUSIS_AES_IV,
      maxFailures: result.data.CUSIS_MAX_FAILURES,
      failureWindowMs: result.data.CUSIS_FAILURE_WINDOW_MS,
    },
    allowedOrigins: result.data.ALLOWED_ORIGINS.split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  };
}
