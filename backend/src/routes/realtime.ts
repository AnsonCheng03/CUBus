import { Router } from 'express';
import type { JsonFileStore } from '../data/file-store.js';

export function createRealtimeRouter(files: JsonFileStore): Router {
  const router = Router();
  const paths = ['/api/v2/realtime', '/api/v1/functions/getRealtimeData.php'];
  router.get(paths, async (_request, response, next) => {
    try {
      const timeline = await files.read<Record<string, unknown>>('Status.json');
      response.json({
        'Status.json': Object.fromEntries(Object.entries(timeline).slice(-60)),
        'reportedTime.json': {},
      });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
