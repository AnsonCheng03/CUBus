import { resolve } from 'node:path';
import { loadConfig } from '../config.js';
import { JsonFileStore } from '../data/file-store.js';
import { scrapeStatus } from './status-scraper.js';

const config = loadConfig();
await scrapeStatus(new JsonFileStore(resolve(config.dataDirectory)));
