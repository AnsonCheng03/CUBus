import pino from 'pino';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';
import { createApp } from '../src/app.js';
import type { LogRepository } from '../src/repositories/log-repository.js';

function setup() {
  const repository: LogRepository = {
    addRealtime: vi.fn().mockResolvedValue(undefined),
    addSearch: vi.fn().mockResolvedValue(undefined),
  };
  const app = createApp({
    allowedOrigins: ['http://localhost:5173'],
    logRepository: repository,
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

  it('only emits CORS headers for an allowed origin', async () => {
    const { app } = setup();
    const allowed = await request(app).get('/health').set('Origin', 'http://localhost:5173');
    const blocked = await request(app).get('/health').set('Origin', 'https://example.com');

    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');
    expect(blocked.headers['access-control-allow-origin']).toBeUndefined();
  });
});
