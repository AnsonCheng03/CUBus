# PHP-to-Node endpoint parity

The Node server is intended to take over the existing PHP URLs first. The
mobile app now uses the v1-compatible paths. The v2 paths remain aliases and
are not required for the cutover.

| Existing PHP path | Node path | Status | Compatibility notes |
| --- | --- | --- | --- |
| `GET /api/v1/functions/getClientData.php` | Same path | Ready | Returns modification dates; records the first app visit with a short-lived cookie. |
| `POST /api/v1/functions/getClientData.php` | Same path | Ready | Preserves the delta response keys and always returns `timetable.json`. |
| `GET /api/v1/functions/getClientData.php?force=1` | Same path | Ready | Returns the full JSON payload. PHP wrapped this payload in browser download scripts. |
| `GET /api/v1/functions/getRealtimeData.php` | Same path | Ready | Returns the last 60 status snapshots and live `reportedTime.json`. |
| `POST /api/v1/functions/logData.php` | Same path | Ready | Supports `realtime`, `search`, and `reportArrival`; validates non-empty tokens issued by client-data. |
| `GET /cusis/api.php` | Same path | Ready | Returns raw timetable JSON. |
| `POST /cusis/api.php` | Same path | Ready | Returns `cuhktimetable.ics` and accepts both plain and browser-encrypted credentials. |
| `public/api/general/cron/getdatas.php` | In-process `* * * * *` schedule; manual fallback: `npm run job:scrape-status` | Ready | Writes `Alert.json`, `Status.json`, and daily `prev-status` history. |
| `public/api/general/cron/generatebustimetable.php` | In-process `0,30 * * * *` schedule; manual fallback: `npm run job:generate-timetable` | Ready | Reads `Route`/`RouteStops` and atomically writes `timetable.json`. |

## Deliberate differences

- The PHP `force` GET response used JavaScript download tags. Node returns the
  same full data as JSON, which is easier to consume and avoids generated
  browser markup.
- PHP sessions were replaced by a `cu_bus_visit` cookie for app-open logging
  and process-local token/failure tracking for CUSIS. The core API response
  and database behavior do not depend on PHP sessions.
- Legacy CUSIS failures keep HTTP status `201` and an HTML body. v2 failures
  use JSON errors with normal `4xx` statuses.
- The PHP files should remain untouched as rollback copies until the Node
  process, reverse proxy, database connection, and cron jobs have passed the
  production smoke test.

## Cutover checklist

1. Copy the existing `Data` directory to the Node `DATA_DIR`.
2. Set all values in `backend/.env`, especially the database and CUSIS keys.
3. Start Node and verify `/health`.
4. Verify the v1 paths above against the current PHP responses using the same
   data snapshot.
5. Switch the reverse proxy for `/api`, `/cusis`, and `/health` to Node.
6. Remove the PHP cron commands; the Node server runs the two schedules when `SCHEDULED_JOBS_ENABLED=true`.
7. Keep the PHP files until the first production status scrape, timetable
   generation, client sync, realtime request, log write, and CUSIS export all
   succeed.
