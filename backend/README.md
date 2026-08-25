# CU Bus Node backend

This service replaces the former PHP API and scheduled jobs. It exposes clean v2 routes and compatibility aliases for already-installed clients.

## Current scope

- `GET /health`
- `GET|POST /api/v2/client-data`
- `GET /api/v2/realtime`
- `POST /api/v2/events`
- `POST /api/v2/cusis/calendar`
- legacy `/api/v1/functions/*.php` aliases
- legacy `POST /cusis/api.php` alias

The inactive `reportArrival` operation is retired. Realtime responses keep `reportedTime.json` as an empty object for old clients.

## Local setup

```sh
cp .env.example .env
npm install
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

Keep the existing production cron frequency and replace PHP command paths with:

```sh
cd /opt/cu-bus/backend && npm run job:scrape-status
cd /opt/cu-bus/backend && npm run job:generate-timetable
```

The scraper writes `Alert.json`, `Status.json`, and daily history. The timetable job reads the existing route tables. Every generated JSON replacement is atomic.

## Production cutover gate

Before routing production traffic to Node, capture sanitized `SHOW CREATE TABLE` output for all queried tables and copy the current runtime JSON into `DATA_DIR`. Run response-shape comparisons between PHP and Node using that fixture set. No production table is dropped by this project; `reportArrival` can be archived separately after backup.
