import { resolve } from 'node:path';
import { loadConfig } from '../config.js';
import { JsonFileStore } from '../data/file-store.js';
import { createDatabaseClient } from '../db.js';
import { PrismaBusRepository } from '../repositories/bus-repository.js';
import { generateTimetableFile } from './timetable-generator.js';

const config = loadConfig();
const db = createDatabaseClient(config.database);
try {
  const repository = new PrismaBusRepository(db, config.database.database);
  await generateTimetableFile(repository, new JsonFileStore(resolve(config.dataDirectory)));
} finally {
  await db.$disconnect();
}
