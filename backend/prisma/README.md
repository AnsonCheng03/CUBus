# Prisma

The Node backend uses Prisma Client 6.16.2 against the existing MariaDB
database. `schema.prisma` maps the legacy table and column names to readable
TypeScript model and field names; it does not rename any database objects.

The development connection is kept in `backend/.env.local`, which is ignored
by Git. The helper script loads that file for Prisma CLI commands:

```sh
npm run prisma:validate
npm run prisma:generate
npm run prisma:pull:print
```

`prisma:pull:print` is the safe schema comparison command. It reads the
database and prints Prisma's introspection result without changing either the
database or `schema.prisma`.

The legacy `DATETIME` columns contain Hong Kong wall-clock values. The Node
repositories use `src/prisma-date.ts` when writing them and a database-side
`DATE_FORMAT` when reading report-arrival data, so Prisma's JavaScript `Date`
conversion does not shift those values by eight hours.

The existing database is managed by the reviewed SQL files in
`backend/database/`. The `2026-09-02-S4-notice-text-columns.sql` file records
the production `notice.CHINESE`/`notice.ENGLISH` change; production should
record it as already applied because the ALTER was performed manually. Do not
run `prisma db push`, `prisma migrate dev`, or `prisma migrate deploy` against
the existing database yet. The legacy
`station.Area -> groupedStation.Area` foreign key references a non-unique
column, which Prisma Client can read safely but Prisma Migrate cannot represent
as a normal relation. Before introducing Prisma migrations, create and review
a baseline that preserves this legacy constraint and mark it applied with
`prisma migrate resolve`; the baseline must not replay the existing data.
