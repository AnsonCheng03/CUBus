import type { Pool, RowDataPacket } from 'mysql2/promise';

export const trackedTables = [
  'Route',
  'translateroute',
  'translatewebsite',
  'translatebuilding',
  'translateattribute',
  'station',
  'notice',
  'gps',
  'website',
] as const;

export const translationTables = [
  'translateroute',
  'translatewebsite',
  'translatebuilding',
  'translateattribute',
] as const;

type DatabaseRow = RowDataPacket & Record<string, unknown>;

export interface BusRepository {
  getModificationDates(): Promise<Record<string, string>>;
  getRoutes(): Promise<DatabaseRow[]>;
  getTranslations(): Promise<DatabaseRow[]>;
  getStations(): Promise<DatabaseRow[]>;
  getNotices(): Promise<DatabaseRow[]>;
  getGps(): Promise<DatabaseRow[]>;
  getWebsites(): Promise<DatabaseRow[]>;
}

export class MysqlBusRepository implements BusRepository {
  constructor(
    private readonly pool: Pool,
    private readonly databaseName: string,
  ) {}

  async getModificationDates(): Promise<Record<string, string>> {
    const [rows] = await this.pool.query<DatabaseRow[]>(
      `SELECT TABLE_NAME, COALESCE(UPDATE_TIME, CREATE_TIME) AS modifiedAt
       FROM information_schema.tables
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN (?)`,
      [this.databaseName, [...trackedTables]],
    );
    const dates: Record<string, string> = {};
    for (const row of rows) {
      if (row.TABLE_NAME && row.modifiedAt) {
        dates[String(row.TABLE_NAME)] = sqlValue(row.modifiedAt);
      }
    }
    return dates;
  }

  async getRoutes() {
    return this.query(`SELECT r.BUSNO, r.StartTime, r.EndTime, r.Period, r.Days,
      r.Weekdays, r.Warning, r.colorCode, rs.Location, rs.Direction, rs.TravelTime
      FROM Route r LEFT JOIN RouteStops rs ON r.BUSNO = rs.BUSNO
      ORDER BY r.BUSNO, rs.StopOrder`);
  }

  async getTranslations() {
    const output: DatabaseRow[] = [];
    for (const table of translationTables) {
      output.push(...(await this.query(`SELECT * FROM \`${table}\``)));
    }
    return output;
  }

  getStations() {
    return this.query(`SELECT s.建築物,
      CASE WHEN s.Area IS NOT NULL THEN gs.Station ELSE s.最近之車站 END AS 最近之車站
      FROM station s LEFT JOIN groupedStation gs ON s.Area = gs.Area`);
  }

  getNotices() {
    return this.query('SELECT * FROM notice');
  }

  getGps() {
    return this.query(`SELECT gps.Location, gps.Lat, gps.Lng, gps.ImportantStation,
      CASE WHEN COUNT(gs_other.Station) = 0 THEN NULL
      ELSE JSON_ARRAYAGG(gs_other.Station) END AS GroupedStations
      FROM gps
      LEFT JOIN groupedStation gs_self ON gps.Location = gs_self.Station
      LEFT JOIN groupedStation gs_other
        ON gs_self.Area = gs_other.Area AND gs_other.Station != gps.Location
      GROUP BY gps.Location, gps.Lat, gps.Lng, gps.ImportantStation`);
  }

  getWebsites() {
    return this.query('SELECT * FROM website');
  }

  private async query(sql: string): Promise<DatabaseRow[]> {
    const [rows] = await this.pool.query<DatabaseRow[]>(sql);
    return rows;
  }
}

function sqlValue(value: unknown): string {
  if (value instanceof Date) return value.toISOString().slice(0, 19).replace('T', ' ');
  return String(value);
}
