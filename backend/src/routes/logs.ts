import { Router } from 'express';
import { z } from 'zod';
import type { LogRepository } from '../repositories/log-repository.js';
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

export function createLogsRouter(repository: LogRepository): Router {
  const router = Router();

  router.post(['/api/v2/events', '/api/v1/functions/logData.php'], async (request, response) => {
    const type = request.body?.type;

    try {
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

      if (type === undefined) return response.type('text').send('Missing type');

      // reportArrival was hidden in every shipped UI and is intentionally retired.
      return response.type('text').send('Invalid type');
    } catch (error) {
      request.log.error({ err: error }, 'Failed to write analytics log');
      return response.type('text').send('Failed to log data');
    }
  });

  return router;
}
