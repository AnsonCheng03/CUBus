import type { Pool } from 'mysql2/promise';

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
  addRealtime(entry: RealtimeLog): Promise<void>;
  addSearch(entry: SearchLog): Promise<void>;
}

export class MysqlLogRepository implements LogRepository {
  constructor(private readonly pool: Pool) {}

  async addRealtime(entry: RealtimeLog): Promise<void> {
    await this.pool.execute(
      'INSERT INTO `logs` (`Time`, `Webpage`, `Dest`, `Lang`) VALUES (?, \'realtime\', ?, ?)',
      [entry.time, entry.destination, entry.language],
    );
  }

  async addSearch(entry: SearchLog): Promise<void> {
    await this.pool.execute(
      'INSERT INTO `logs` (`Time`, `Webpage`, `Start`, `Dest`, `Departnow`, `Lang`) VALUES (?, \'routesearch\', ?, ?, ?, ?)',
      [entry.time, entry.start, entry.destination, entry.departNow, entry.language],
    );
  }
}
