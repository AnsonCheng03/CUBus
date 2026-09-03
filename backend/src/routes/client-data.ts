import { Router } from 'express';
import type { LogRepository } from '../repositories/log-repository.js';
import type { ClientDataService } from '../services/client-data-service.js';
import { formatHongKongSqlDate } from '../services/hong-kong-time.js';

export function createClientDataRouter(
  service: ClientDataService,
  logRepository?: LogRepository,
): Router {
  const router = Router();
  const paths = ['/api/v2/client-data', '/api/v1/functions/getClientData.php'];

  router.get(paths, async (request, response, next) => {
    try {
      if (logRepository && request.query.force === undefined && !hasVisitCookie(request.headers.cookie)) {
        try {
          await logRepository.addAppOpen({
            time: formatHongKongSqlDate(),
            language: String(request.query.lang ?? 'null'),
            destination: '',
          });
          response.append('Set-Cookie', 'cu_bus_visit=1; Max-Age=86400; Path=/; SameSite=Lax');
        } catch (error) {
          request.log.warn({ err: error }, 'Failed to write app-open log');
        }
      }
      if (request.query.force !== undefined) {
        return response.json(await service.getDelta(null));
      }
      response.json(await service.getModificationDates());
    } catch (error) {
      next(error);
    }
  });
  router.post(paths, async (request, response, next) => {
    try {
      const dates = request.body && typeof request.body === 'object' ? request.body : null;
      response.json(await service.getDelta(dates));
    } catch (error) {
      next(error);
    }
  });
  return router;
}

function hasVisitCookie(cookieHeader: string | undefined) {
  return cookieHeader?.split(';').some((cookie) => cookie.trim().startsWith('cu_bus_visit=')) ?? false;
}
