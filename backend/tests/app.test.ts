import pino from 'pino';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { JsonFileStore } from '../src/data/file-store.js';
import type { BusRepository } from '../src/repositories/bus-repository.js';
import type { LogRepository } from '../src/repositories/log-repository.js';
import { ClientDataService } from '../src/services/client-data-service.js';
import { CusisService } from '../src/services/cusis-service.js';

function setup() {
  const repository: LogRepository = {
    addRealtime: vi.fn().mockResolvedValue(undefined),
    addSearch: vi.fn().mockResolvedValue(undefined),
  };
  const busRepository: BusRepository = {
    getModificationDates: vi.fn().mockResolvedValue({}),
    getRoutes: vi.fn().mockResolvedValue([]),
    getTranslations: vi.fn().mockResolvedValue([]),
    getStations: vi.fn().mockResolvedValue([]),
    getNotices: vi.fn().mockResolvedValue([]),
    getGps: vi.fn().mockResolvedValue([]),
    getWebsites: vi.fn().mockResolvedValue([]),
  };
  const files = new JsonFileStore('/tmp/cu-bus-backend-tests');
  const app = createApp({
    allowedOrigins: ['http://localhost:5173'],
    logRepository: repository,
    clientDataService: new ClientDataService(busRepository, files, '2026-07-14 00:00:00'),
    cusisService: new CusisService({
      endpoint: 'https://example.test/cusis',
      aesKey: '12345678901234567890123456789012',
      aesIv: '1234567890123456',
      maxFailures: 6,
      failureWindowMs: 900_000,
    }),
    files,
    logger: pino({ enabled: false }),
  });

  return { app, repository };
}

describe('backend compatibility routes', () => {
  it('reports health without connecting to MySQL', async () => {
    const { app } = setup();
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: 'ok' });
  });

  it('writes a realtime log and preserves the empty PHP success body', async () => {
    const { app, repository } = setup();
    const response = await request(app).post('/api/v1/functions/logData.php').send({
      type: 'realtime',
      Dest: 'University Station',
      Lang: 'en',
      Token: '',
    });

    expect(response.status).toBe(200);
    expect(response.text).toBe('');
    expect(repository.addRealtime).toHaveBeenCalledWith(
      expect.objectContaining({ destination: 'University Station', language: 'en' }),
    );
  });

  it('writes a route search log', async () => {
    const { app, repository } = setup();
    const response = await request(app).post('/api/v1/functions/logData.php').send({
      type: 'search',
      Start: 'A',
      Dest: 'B',
      Departnow: true,
      Lang: 'zh',
      Token: '',
    });

    expect(response.status).toBe(200);
    expect(repository.addSearch).toHaveBeenCalledWith(
      expect.objectContaining({ start: 'A', destination: 'B', departNow: true, language: 'zh' }),
    );
  });

  it('preserves PHP-style validation messages', async () => {
    const { app } = setup();
    const response = await request(app)
      .post('/api/v1/functions/logData.php')
      .send({ type: 'realtime' });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Missing parameters');
  });

  it('serves canonical and legacy client-data routes', async () => {
    const { app } = setup();
    const canonical = await request(app).get('/api/v2/client-data');
    const legacy = await request(app).get('/api/v1/functions/getClientData.php');
    expect(canonical.body.server).toBe('2026-07-14 00:00:00');
    expect(legacy.body).toEqual(canonical.body);
  });

  it('keeps the realtime shape and legacy alias', async () => {
    const { app } = setup();
    const response = await request(app).get('/api/v1/functions/getRealtimeData.php');
    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({
      'Status.json': expect.any(Object),
      'reportedTime.json': {},
    }));
  });

  it('retires reportArrival without removing the compatibility URL', async () => {
    const { app } = setup();
    const response = await request(app)
      .post('/api/v1/functions/logData.php')
      .send({ type: 'reportArrival' });
    expect(response.status).toBe(200);
    expect(response.text).toBe('Invalid type');
  });

  it('rejects CUSIS GET credentials and invalid POST forms', async () => {
    const { app } = setup();
    const getResponse = await request(app).get('/cusis/api.php?SID=1&pwd=secret');
    const postResponse = await request(app).post('/api/v2/cusis/calendar').field('SID', '1');
    expect(getResponse.status).toBe(405);
    expect(postResponse.status).toBe(400);
  });

  it('only emits CORS headers for an allowed origin', async () => {
    const { app } = setup();
    const allowed = await request(app).get('/health').set('Origin', 'http://localhost:5173');
    const blocked = await request(app).get('/health').set('Origin', 'https://example.com');

    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
  });
});
