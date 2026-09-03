import { spawnSync } from 'node:child_process';
import dotenv from 'dotenv';

// Prisma 6 reads .env automatically, but this project keeps development
// secrets in .env.local. Load local values before forwarding the CLI command.
dotenv.config({ path: '.env.local' });
dotenv.config();

const result = spawnSync('prisma', process.argv.slice(2), {
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
