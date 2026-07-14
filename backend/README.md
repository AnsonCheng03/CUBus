# CU Bus Node backend

This service is the incremental replacement for `public/api`. The PHP backend remains the production source for endpoints that have not yet been migrated.

## Current scope

- `GET /health`
- `POST /api/v1/functions/logData.php` with `type: "search"`
- `POST /api/v1/functions/logData.php` with `type: "realtime"`

`reportArrival` is not migrated. Keep the production `logData.php` route on PHP until that operation is implemented or a PHP fallback proxy is added.

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
