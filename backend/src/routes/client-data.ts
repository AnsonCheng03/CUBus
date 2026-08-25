import { Router } from 'express';
import type { ClientDataService } from '../services/client-data-service.js';

export function createClientDataRouter(service: ClientDataService): Router {
  const router = Router();
  const paths = ['/api/v2/client-data', '/api/v1/functions/getClientData.php'];

  router.get(paths, async (_request, response, next) => {
    try {
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
