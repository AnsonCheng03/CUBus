import { Router } from 'express';
import { z } from 'zod';
import type { LogRepository } from '../repositories/log-repository.js';
import { ReportArrivalError, type ReportArrivalService } from '../services/report-arrival-service.js';
import { formatHongKongSqlDate } from '../services/hong-kong-time.js';

const realtimeSchema = z.object({
  type: z.literal('realtime'),
  Dest: z.string(),
  Lang: z.string(),
  Token: z.string().optional(),
});

const searchSchema = z.object({
  type: z.literal('search'),
  Start: z.string(),
  Dest: z.string(),
  Departnow: z.union([z.boolean(), z.string(), z.number()]),
  Lang: z.string(),
  Token: z.string().optional(),
});

const reportArrivalSchema = z.object({
  type: z.literal('reportArrival'),
  Details: z.object({
    busNo: z.string(),
    stationIndex: z.coerce.number().int(),
  }),
  position: z.object({
    timestamp: z.coerce.number(),
    coords: z.object({
      latitude: z.coerce.number(),
      longitude: z.coerce.number(),
    }),
  }),
});

export function createLogsRouter(
  repository: LogRepository,
  reportArrivalService?: ReportArrivalService,
  tokenValidator?: (token: string) => boolean,
): Router {
  const router = Router();

  router.post(['/api/v2/events', '/api/v1/functions/logData.php'], async (request, response) => {
    const type = request.body?.type;

    try {
      const token = request.body?.Token;
      if (
        tokenValidator && token !== undefined && token !== null && token !== ''
        && !tokenValidator(String(token))
      ) {
        return response.type('text').send('Invalid token');
      }
      if (type === 'realtime') {
        const parsed = realtimeSchema.safeParse(request.body);
        if (!parsed.success) return response.type('text').send('Missing parameters');

        await repository.addRealtime({
          time: formatHongKongSqlDate(),
          destination: parsed.data.Dest,
          language: parsed.data.Lang,
        });
        return response.status(200).send();
      }

      if (type === 'search') {
        const parsed = searchSchema.safeParse(request.body);
        if (!parsed.success) return response.type('text').send('Missing parameters');

        await repository.addSearch({
          time: formatHongKongSqlDate(),
          start: parsed.data.Start,
          destination: parsed.data.Dest,
          departNow: parsed.data.Departnow,
          language: parsed.data.Lang,
        });
        return response.status(200).send();
      }

      if (type === 'reportArrival' && reportArrivalService) {
        const parsed = reportArrivalSchema.safeParse(request.body);
        if (!parsed.success) return response.type('text').send('Missing parameters');

        const result = await reportArrivalService.report({
          busNo: parsed.data.Details.busNo,
          stationIndex: parsed.data.Details.stationIndex,
          timestamp: parsed.data.position.timestamp,
          latitude: parsed.data.position.coords.latitude,
          longitude: parsed.data.position.coords.longitude,
        }, request.ip ?? 'unknown');
        return response.type('text').send(result);
      }

      if (type === undefined) return response.type('text').send('Missing type');
      return response.type('text').send('Invalid type');
    } catch (error) {
      if (error instanceof ReportArrivalError) {
        return response.type('text').send(error.message);
      }
      request.log.error({ err: error }, 'Failed to write analytics log');
      return response.type('text').send('Failed to log data');
    }
  });

  return router;
}
