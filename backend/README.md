# CU Bus Node backend

This service replaces the former PHP API and scheduled jobs. It exposes clean v2 routes and compatibility aliases for already-installed clients.

Endpoint-by-endpoint parity is tracked in [endpoint-parity.md](./endpoint-parity.md). The v1-compatible PHP paths are the migration target; v2 is retained as an alias.

## Current scope

- `GET /health`
- `GET|POST /api/v1/functions/getClientData.php` (v2 alias: `/api/v2/client-data`)
- `GET /api/v1/functions/getRealtimeData.php` (v2 alias: `/api/v2/realtime`)
- `POST /api/v1/functions/logData.php` (v2 alias: `/api/v2/events`)
- `POST /cusis/api.php` (v2 alias: `/api/v2/cusis/calendar`)
- `GET /cusis/api.php` for raw CUSIS timetable JSON
- `reportArrival` logging and live `reportedTime.json` aggregation
- PHP-compatible `/api/v1/functions/*.php` paths
- PHP-compatible `GET|POST /cusis/api.php` path

Database access is now Prisma-based. See [prisma/README.md](./prisma/README.md)
for schema mapping, safe introspection, and the existing-database baseline
restriction.

The legacy paths remain available during cutover, so existing mobile builds do not need to be updated at the same time as the server.

## Local setup

```sh
cp .env.example .env
npm install
npm run prisma:generate
npm run dev
```

Run validation with:

```sh
npm run typecheck
npm test
npm run build
```

The server validates all environment variables at startup. Tests inject a fake log repository and do not require MySQL.

## Scheduled jobs

The Express process starts the replacement schedules by default:

| Former cron expression | Node job |
| --- | --- |
| `* * * * *` | Status scraper (`getdatas.php`) |
| `0,30 * * * *` | Timetable generator (`generatebustimetable.php`) |

The `beta` and non-`beta` PHP entries point to the same logical jobs. They are
therefore intentionally consolidated into one status schedule and one
timetable schedule writing the configured `DATA_DIR`. Remove the old PHP cron
entries after cutover so each job runs only once. Set `SCHEDULED_JOBS_ENABLED=false`
on any additional backend instance; keep the scheduler enabled on exactly one
instance.

The one-off commands remain available for manual runs or for deployments that
choose to keep scheduling outside the Node process:

```sh
cd /opt/cu-bus/backend && npm run job:scrape-status       # one-off status run
cd /opt/cu-bus/backend && npm run job:generate-timetable  # one-off timetable run
```

The scraper writes `Alert.json`, `Status.json`, and daily history. The timetable job reads the existing route tables. Every generated JSON replacement is atomic.

## Production cutover

1. Provision Node.js 24 or newer and copy the current runtime JSON directory into `DATA_DIR` (`Status.json`, `Alert.json`, `timetable.json`, and `prev-status/`).
2. Copy `.env.example` to `.env` and set the production database, CUSIS keys, data directory, and allowed origins. Do not commit `.env`.
3. Install and build:

   ```sh
   npm ci
   npm run backend:build
   ```

4. Start `backend/dist/server.js` with a process manager and reverse-proxy `/api`, `/cusis`, and `/health` to the Node port. Keep static website routes on the existing web server.
5. Start the backend with `SCHEDULED_JOBS_ENABLED=true`, then smoke-test `/health`, `/api/v1/functions/getClientData.php`, `/api/v1/functions/getRealtimeData.php`, `/api/v1/functions/logData.php`, and `/cusis/api.php` after the first scheduled runs.
6. Keep the PHP files as a rollback copy until the Node responses and scheduled output have been checked in production. No production table is dropped by this project.

Before cutover, capture sanitized `SHOW CREATE TABLE` output for all queried tables and compare representative PHP/Node responses against the same JSON fixture set.
