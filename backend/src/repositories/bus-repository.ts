import { Prisma, PrismaClient } from '@prisma/client';
import { decimalString } from '../prisma-date.js';
import { formatHongKongSqlDate } from '../services/hong-kong-time.js';

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

type DatabaseRow = Record<string, unknown>;

export interface BusRepository {
  getModificationDates(): Promise<Record<string, string>>;
  getRoutes(): Promise<DatabaseRow[]>;
  getTranslations(): Promise<DatabaseRow[]>;
  getStations(): Promise<DatabaseRow[]>;
  getNotices(): Promise<DatabaseRow[]>;
  getGps(): Promise<DatabaseRow[]>;
  getWebsites(): Promise<DatabaseRow[]>;
}

export class PrismaBusRepository implements BusRepository {
  constructor(
    private readonly db: PrismaClient,
    private readonly databaseName: string,
  ) {}

  async getModificationDates(): Promise<Record<string, string>> {
    // Metadata is not a domain model, so this fixed information_schema query
    // remains raw SQL. The table list is a compile-time allowlist.
    const rows = await this.db.$queryRaw<Array<{
      TABLE_NAME: string | null;
      modifiedAt: Date | string | null;
    }>>(Prisma.sql`
      SELECT TABLE_NAME, COALESCE(UPDATE_TIME, CREATE_TIME) AS modifiedAt
      FROM information_schema.tables
      WHERE TABLE_SCHEMA = ${this.databaseName}
        AND TABLE_NAME IN (${Prisma.join(trackedTables)})
    `);

    const dates: Record<string, string> = {};
    for (const row of rows) {
      if (row.TABLE_NAME && row.modifiedAt) dates[row.TABLE_NAME] = sqlValue(row.modifiedAt);
    }
    return dates;
  }

  async getRoutes(): Promise<DatabaseRow[]> {
    const routes = await this.db.route.findMany({
      orderBy: { busNo: 'asc' },
      include: { routeStops: { orderBy: { stopOrder: 'asc' } } },
    });

    return routes.flatMap((route) => {
      const base = {
        BUSNO: route.busNo,
        StartTime: route.startTime,
        EndTime: route.endTime,
        Period: route.period,
        Days: route.days,
        Weekdays: route.weekdays,
        Warning: route.warning,
        colorCode: route.colorCode,
      };
      if (route.routeStops.length === 0) return [base];
      return route.routeStops.map((stop) => ({
        ...base,
        Location: stop.location,
        Direction: stop.direction,
        TravelTime: decimalString(stop.travelTime),
      }));
    });
  }

  async getTranslations(): Promise<DatabaseRow[]> {
    const [routes, websites, buildings, attributes] = await Promise.all([
      this.db.translateRoute.findMany({ orderBy: { code: 'asc' } }),
      this.db.translateWebsite.findMany({ orderBy: { code: 'asc' } }),
      this.db.translateBuilding.findMany({ orderBy: { code: 'asc' } }),
      this.db.translateAttribute.findMany({ orderBy: { code: 'asc' } }),
    ]);

    return [
      ...routes.map(translationRow),
      ...websites.map(translationRow),
      ...buildings.map(translationRow),
      ...attributes.map(translationRow),
    ];
  }

  async getStations(): Promise<DatabaseRow[]> {
    const [stations, groupedStations] = await Promise.all([
      this.db.station.findMany({
        select: { buildingCode: true, nearestStation: true, area: true },
        orderBy: { id: 'asc' },
      }),
      this.db.groupedStation.findMany({
        select: { area: true, station: true },
        orderBy: { id: 'asc' },
      }),
    ]);

    // station.Area references groupedStation.Area, which is not unique in the
    // legacy schema. Prisma cannot express that relation safely, so preserve
    // the PHP LEFT JOIN semantics in memory after two typed model reads.
    const byArea = new Map<string, Array<string | null>>();
    for (const grouped of groupedStations) {
      if (grouped.area === null) continue;
      const values = byArea.get(grouped.area) ?? [];
      values.push(grouped.station);
      byArea.set(grouped.area, values);
    }

    const output: DatabaseRow[] = [];
    for (const station of stations) {
      const nearest = station.area === null
        ? [station.nearestStation]
        : (byArea.get(station.area) ?? [null]);
      for (const nearestStation of nearest) {
        output.push({
          建築物: station.buildingCode,
          最近之車站: nearestStation,
        });
      }
    }
    return output;
  }

  async getNotices(): Promise<DatabaseRow[]> {
    const rows = await this.db.notice.findMany({ orderBy: { id: 'asc' } });
    return rows.map((row) => ({
      ID: row.id,
      Type: row.type,
      // ClientDataService historically reads this lower-case alias.
      type: row.type,
      CHINESE: row.chinese,
      ENGLISH: row.english,
      hide: row.hide,
      duration: row.duration,
      link: row.link,
      dismissible: row.dismissible,
      saveDismiss: row.saveDismiss,
    }));
  }

  async getGps(): Promise<DatabaseRow[]> {
    const [gpsRows, groupedStations] = await Promise.all([
      this.db.gps.findMany({ orderBy: { location: 'asc' } }),
      this.db.groupedStation.findMany({
        select: { area: true, station: true },
        orderBy: { id: 'asc' },
      }),
    ]);

    const groupsByStation = new Map<string, Array<{ area: string | null; station: string | null }>>();
    for (const grouped of groupedStations) {
      if (grouped.station === null) continue;
      const values = groupsByStation.get(grouped.station) ?? [];
      values.push(grouped);
      groupsByStation.set(grouped.station, values);
    }

    return gpsRows.map((gps) => {
      const relatedGroups = groupsByStation.get(gps.location) ?? [];
      const grouped: string[] = [];
      for (const self of relatedGroups) {
        if (self.area === null) continue;
        for (const other of groupedStations) {
          if (other.area === self.area && other.station !== null && other.station !== gps.location) {
            grouped.push(other.station);
          }
        }
      }

      return {
        Location: gps.location,
        Lat: decimalString(gps.lat),
        Lng: decimalString(gps.lng),
        ImportantStation: gps.importantStation,
        GroupedStations: grouped.length === 0 ? null : grouped,
      };
    });
  }

  async getWebsites(): Promise<DatabaseRow[]> {
    const rows = await this.db.website.findMany({ orderBy: { id: 'asc' } });
    return rows.map((row) => ({
      ID: row.id,
      中文: row.chinese,
      英文: row.english,
      URL: row.url,
    }));
  }
}

function translationRow(row: {
  code: string;
  appendToJs: string | null;
  chinese: string | null;
  english: string | null;
}): DatabaseRow {
  return {
    Code: row.code,
    'Append to js?': row.appendToJs,
    中文: row.chinese,
    ENG: row.english,
  };
}

function sqlValue(value: Date | string): string {
  return value instanceof Date ? formatHongKongSqlDate(value) : String(value);
}
