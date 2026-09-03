import { Router } from 'express';
import type { JsonFileStore } from '../data/file-store.js';
import type { ReportArrivalService } from '../services/report-arrival-service.js';

export function createRealtimeRouter(files: JsonFileStore, reportArrivalService?: ReportArrivalService): Router {
  const router = Router();
  const paths = ['/api/v2/realtime', '/api/v1/functions/getRealtimeData.php'];
  router.get(paths, async (_request, response, next) => {
    try {
      const timeline = await files.read<Record<string, unknown>>('Status.json');
      response.json({
        'Status.json': Object.fromEntries(Object.entries(timeline).slice(-60)),
        'reportedTime.json': reportArrivalService
          ? await reportArrivalService.getReportedTimetable()
          : {},
      });
    } catch (error) {
      next(error);
    }
  });
  return router;
}
