import { Router } from 'express';
import multer from 'multer';
import {
  CusisAuthenticationError,
  CusisRateLimitError,
  type CusisService,
} from '../services/cusis-service.js';

const form = multer({ storage: multer.memoryStorage(), limits: { fields: 4, fieldSize: 2_048 } });

export function createCusisRouter(service: CusisService): Router {
  const router = Router();
  const paths = ['/api/v2/cusis/calendar', '/cusis/api.php'];

  router.get(paths, (_request, response) => {
    response.status(405).json({ error: { code: 'METHOD_NOT_ALLOWED', message: 'Use POST' } });
  });
  router.post(paths, form.none(), async (request, response, next) => {
    const sid = String(request.body?.SID ?? '').trim();
    const password = String(request.body?.pwd ?? '');
    if (!sid || !password) {
      return response.status(400).json({ error: { code: 'INVALID_INPUT', message: 'SID and password are required' } });
    }
    try {
      const calendar = await service.createCalendar(sid, password, request.ip ?? 'unknown');
      response
        .status(200)
        .type('text/calendar; charset=utf-8')
        .attachment('cuhktimetable.ics')
        .send(calendar);
    } catch (error) {
      if (error instanceof CusisAuthenticationError) {
        return response.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: error.message } });
      }
      if (error instanceof CusisRateLimitError) {
        return response.status(429).json({ error: { code: 'RATE_LIMITED', message: error.message } });
      }
      next(error);
    }
  });
  return router;
}
