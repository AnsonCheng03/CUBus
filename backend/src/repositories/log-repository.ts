import { PrismaClient } from '@prisma/client';
import { prismaDateTimeFromHongKong } from '../prisma-date.js';

export type RealtimeLog = {
  time: string;
  destination: string;
  language: string;
};

export type SearchLog = RealtimeLog & {
  start: string;
  departNow: boolean | string | number;
};

export interface LogRepository {
  addAppOpen(entry: RealtimeLog): Promise<void>;
  addRealtime(entry: RealtimeLog): Promise<void>;
  addSearch(entry: SearchLog): Promise<void>;
}

export class PrismaLogRepository implements LogRepository {
  constructor(private readonly db: PrismaClient) {}

  async addAppOpen(entry: RealtimeLog): Promise<void> {
    await this.db.log.create({ data: {
      time: prismaDateTimeFromHongKong(entry.time),
      webpage: 'appOpen',
      start: '',
      destination: '',
      mode: '',
      showAllRoute: 0,
      departNow: 0,
      language: entry.language,
    } });
  }

  async addRealtime(entry: RealtimeLog): Promise<void> {
    await this.db.log.create({ data: {
      time: prismaDateTimeFromHongKong(entry.time),
      webpage: 'realtime',
      start: '',
      destination: entry.destination,
      mode: '',
      showAllRoute: 0,
      departNow: 0,
      language: entry.language,
    } });
  }

  async addSearch(entry: SearchLog): Promise<void> {
    await this.db.log.create({ data: {
      time: prismaDateTimeFromHongKong(entry.time),
      webpage: 'routesearch',
      start: entry.start,
      destination: entry.destination,
      mode: 'building',
      showAllRoute: 0,
      departNow: toTinyInt(entry.departNow),
      language: entry.language,
    } });
  }
}

function toTinyInt(value: boolean | string | number): number {
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (typeof value === 'number') return value === 0 ? 0 : 1;
  return value === '0' || value.toLowerCase() === 'false' ? 0 : 1;
}
