import { resolve } from 'node:path';
import { loadConfig } from '../config.js';
import { JsonFileStore } from '../data/file-store.js';
import { createDatabasePool } from '../db.js';
import { MysqlBusRepository } from '../repositories/bus-repository.js';
import { generateTimetable } from './timetable-generator.js';

const config = loadConfig();
const pool = createDatabasePool(config.database);
try {
  const repository = new MysqlBusRepository(pool, config.database.database);
  const timetable = generateTimetable(await repository.getRoutes());
  await new JsonFileStore(resolve(config.dataDirectory)).writeAtomic('timetable.json', timetable);
} finally {
  await pool.end();
}
