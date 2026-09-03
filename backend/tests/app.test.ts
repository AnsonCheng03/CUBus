import pino from 'pino';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import { JsonFileStore } from '../src/data/file-store.js';
import type { BusRepository } from '../src/repositories/bus-repository.js';
import type { LogRepository } from '../src/repositories/log-repository.js';
import type { ReportArrivalRepository } from '../src/repositories/report-arrival-repository.js';
import { ClientDataService } from '../src/services/client-data-service.js';
import { CusisService } from '../src/services/cusis-service.js';
import { ReportArrivalService } from '../src/services/report-arrival-service.js';

function setup(options: { notices?: Record<string, unknown>[] } = {}) {
  const repository: LogRepository = {
    addAppOpen: vi.fn().mockResolvedValue(undefined),
    addRealtime: vi.fn().mockResolvedValue(undefined),
    addSearch: vi.fn().mockResolvedValue(undefined),
  };
  const busRepository: BusRepository = {
    getModificationDates: vi.fn().mockResolvedValue({}),
    getRoutes: vi.fn().mockResolvedValue([]),
    getTranslations: vi.fn().mockResolvedValue([]),
    getStations: vi.fn().mockResolvedValue([]),
    getNotices: vi.fn().mockResolvedValue(options.notices ?? []),
    getGps: vi.fn().mockResolvedValue([]),
    getWebsites: vi.fn().mockResolvedValue([]),
  };
  const reportRepository: ReportArrivalRepository = {
    getStopCoordinates: vi.fn().mockResolvedValue(null),
    getStopsFrom: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockResolvedValue(undefined),
    deleteExpiredCalculated: vi.fn().mockResolvedValue(undefined),
    getAll: vi.fn().mockResolvedValue([]),
  };
  const files = new JsonFileStore('/tmp/cu-bus-backend-tests');
  const app = createApp({
    allowedOrigins: ['http://localhost:5173'],
    logRepository: repository,
    reportArrivalService: new ReportArrivalService(reportRepository),
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

  it('rejects non-empty log tokens that were not issued by client-data', async () => {
    const { app } = setup();
    const response = await request(app)
      .post('/api/v1/functions/logData.php')
      .send({ type: 'realtime', Dest: 'MTR', Lang: 'en', Token: 'invalid' });

    expect(response.status).toBe(200);
    expect(response.text).toBe('Invalid token');
  });

  it('serves canonical and legacy client-data routes', async () => {
    const { app } = setup();
    const canonical = await request(app).get('/api/v2/client-data');
    const legacy = await request(app).get('/api/v1/functions/getClientData.php');
    expect(canonical.body.server).toBe('2026-07-14 00:00:00');
    expect(legacy.body).toEqual(canonical.body);
  });

  it('serializes legacy BIGINT notice IDs in client-data responses', async () => {
    const { app } = setup({
      notices: [
        {
          ID: 1n,
          CHINESE: '測試通告',
          ENGLISH: 'Test notice',
          type: 'info',
          hide: 0,
          duration: 0,
          link: '',
          dismissible: true,
          saveDismiss: false,
        },
      ],
    });

    const response = await request(app).post('/api/v1/functions/getClientData.php').send({});

    expect(response.status).toBe(200);
    expect(response.body.notice[0].id).toBe(1);
  });

  it('does not include hidden notices in client-data responses', async () => {
    const { app } = setup({
      notices: [
        { ID: 1n, CHINESE: '隱藏', ENGLISH: 'Hidden', hide: true },
        { ID: 2n, CHINESE: '隱藏', ENGLISH: 'Hidden string', hide: '1' },
        { ID: 3n, CHINESE: '顯示', ENGLISH: 'Visible', hide: 0 },
      ],
    });

    const response = await request(app).post('/api/v1/functions/getClientData.php').send({});

    expect(response.status).toBe(200);
    expect(response.body.notice).toEqual([
      expect.objectContaining({ id: 3, content: ['顯示', 'Visible'] }),
    ]);
  });

  it('records the first client-data visit with the PHP-compatible app-open event', async () => {
    const { app, repository } = setup();
    const response = await request(app).get('/api/v1/functions/getClientData.php?lang=en');

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']?.[0]).toContain('cu_bus_visit=1');
    expect(repository.addAppOpen).toHaveBeenCalledWith(
      expect.objectContaining({ language: 'en', destination: '' }),
    );
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

  it('keeps the reportArrival compatibility URL', async () => {
    const { app } = setup();
    const response = await request(app)
      .post('/api/v1/functions/logData.php')
      .send({ type: 'reportArrival' });
    expect(response.status).toBe(200);
    expect(response.text).toBe('Missing parameters');
  });

  it('preserves the legacy CUSIS GET error status and invalid POST forms', async () => {
    const { app } = setup();
    const getResponse = await request(app).get('/cusis/api.php');
    const postResponse = await request(app).post('/api/v2/cusis/calendar').field('SID', '1');
    expect(getResponse.status).toBe(201);
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
