import { Router, type Request, type Response } from 'express';
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

  router.get(paths, async (request, response, next) => {
    const sid = String(request.query.SID ?? '').trim();
    const password = String(request.query.pwd ?? '');
    if (!sid || !password) {
      return sendError(request, response, 400, 'INVALID_INPUT', 'SID and password are required');
    }
    try {
      response.json(await service.getTimetable(sid, password, request.ip ?? 'unknown'));
    } catch (error) {
      if (error instanceof CusisAuthenticationError) {
        return sendError(request, response, 401, 'INVALID_CREDENTIALS', error.message);
      }
      if (error instanceof CusisRateLimitError) {
        return sendError(request, response, 429, 'RATE_LIMITED', error.message);
      }
      next(error);
    }
  });
  router.post(paths, form.none(), async (request, response, next) => {
    const sid = String(request.body?.SID ?? '').trim();
    const password = String(request.body?.pwd ?? '');
    if (!sid || !password) {
      return sendError(request, response, 400, 'INVALID_INPUT', 'SID and password are required');
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
        return sendError(request, response, 401, 'INVALID_CREDENTIALS', error.message);
      }
      if (error instanceof CusisRateLimitError) {
        return sendError(request, response, 429, 'RATE_LIMITED', error.message);
      }
      next(error);
    }
  });
  return router;
}

function sendError(
  request: Request,
  response: Response,
  status: number,
  code: string,
  message: string,
) {
  if (request.path === '/cusis/api.php') {
    const legacyMessage = code === 'INVALID_INPUT'
      ? '請輸入SID及密碼'
      : code === 'INVALID_CREDENTIALS'
        ? '帳戶名稱或密碼錯誤'
        : code === 'RATE_LIMITED'
          ? '密碼錯誤次數過多。連線已被封鎖，請稍後再試。'
          : message;
    return response
      .status(201)
      .type('html')
      .send(`<body style="margin:0;padding:2rem;text-align:center;font-size:2rem;">${escapeHtml(legacyMessage)}</body>`);
  }
  return response.status(status).json({ error: { code, message } });
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]!);
}
