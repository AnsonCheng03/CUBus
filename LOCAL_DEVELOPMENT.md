# Local development

This setup runs MariaDB in Docker and runs the Node backend and Expo app on
the host for fast reloads.

## Start

From the repository root:

```sh
npm install
npm run dev:db
npm run backend:prisma:generate
npm run backend:dev
```

In another terminal, launch the iOS Simulator and the app:

```sh
open -a Simulator
npm run mobile:ios
```

`backend/.env.local` points Prisma at the Docker database on `127.0.0.1:3307`.
`mobile/.env.local` points the iOS Simulator at the host backend on port 3000.
Local scheduled jobs are disabled, so starting the backend does not scrape
CUHK or rewrite local status files.

The database is initialized from `backend/database/initial.sql` and then the
notice text-column migration. Initialization runs only for a new Docker
volume. To recreate the snapshot from scratch, use the destructive reset below
only when you are sure local data can be removed:

```sh
docker compose down -v
npm run dev:db
```

The CUSIS AES values in `backend/.env.local` are local placeholders; supply the
real development values before testing the CUSIS calendar endpoint.
