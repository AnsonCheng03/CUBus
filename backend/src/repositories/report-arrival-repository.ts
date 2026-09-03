import { Prisma, PrismaClient } from '@prisma/client';
import { decimalString, prismaDateTimeFromHongKong } from '../prisma-date.js';

export type ReportRouteStop = {
  Location: string;
  Direction: string | null;
  StopOrder: number;
  TravelTime: number | string;
};

export type ReportArrivalRow = {
  ID: number;
  Time: string | Date;
  BusNo: string;
  stationName: string;
  StationIndex: number;
  calculatedBaseTime: string | Date | null;
};

export type ReportStopCoordinates = {
  Lat: number | string | null;
  Lng: number | string | null;
};

export interface ReportArrivalRepository {
  getStopCoordinates(busNo: string, stopOrder: number): Promise<ReportStopCoordinates | null>;
  getStopsFrom(busNo: string, stopOrder: number): Promise<ReportRouteStop[]>;
  insert(rows: Array<{
    time: string;
    busNo: string;
    stationName: string;
    stationIndex: number;
    calculatedBaseTime: string | null;
  }>): Promise<void>;
  deleteExpiredCalculated(): Promise<void>;
  getAll(): Promise<ReportArrivalRow[]>;
}

export class PrismaReportArrivalRepository implements ReportArrivalRepository {
  constructor(private readonly db: PrismaClient) {}

  async getStopCoordinates(busNo: string, stopOrder: number) {
    const row = await this.db.routeStop.findFirst({
      where: { busNo, stopOrder },
      select: { gps: { select: { lat: true, lng: true } } },
      orderBy: { routeStopId: 'asc' },
    });
    return row?.gps == null ? null : {
      Lat: decimalString(row.gps.lat),
      Lng: decimalString(row.gps.lng),
    };
  }

  async getStopsFrom(busNo: string, stopOrder: number) {
    const rows = await this.db.routeStop.findMany({
      where: { busNo, stopOrder: { gte: stopOrder } },
      orderBy: { stopOrder: 'asc' },
      select: { location: true, direction: true, stopOrder: true, travelTime: true },
    });
    return rows.map((row) => ({
      Location: row.location,
      Direction: row.direction,
      StopOrder: row.stopOrder,
      TravelTime: decimalString(row.travelTime) ?? '0',
    }));
  }

  async insert(rows: Array<{
    time: string;
    busNo: string;
    stationName: string;
    stationIndex: number;
    calculatedBaseTime: string | null;
  }>) {
    if (rows.length === 0) return;
    await this.db.reportArrival.createMany({ data: rows.map((row) => ({
      time: prismaDateTimeFromHongKong(row.time),
      busNo: row.busNo,
      stationName: row.stationName,
      stationIndex: row.stationIndex,
      calculatedBaseTime: row.calculatedBaseTime === null
        ? null
        : prismaDateTimeFromHongKong(row.calculatedBaseTime),
    })) });
  }

  async deleteExpiredCalculated() {
    // The column is a Hong Kong DATETIME without timezone. Keep the existing
    // database-side comparison instead of converting it through JS Date.
    await this.db.$executeRaw(Prisma.sql`
      DELETE FROM reportArrival
      WHERE Time < CONVERT_TZ(NOW(), '+00:00', '+08:00') - INTERVAL 30 MINUTE
        AND calculatedBaseTime IS NOT NULL
    `);
  }

  async getAll() {
    // DATE_FORMAT keeps the legacy wall-clock value intact. A MariaDB DATETIME
    // has no timezone, so turning it into a JS Date can shift it by eight hours.
    return this.db.$queryRaw<ReportArrivalRow[]>(Prisma.sql`
      SELECT ID,
        DATE_FORMAT(Time, '%Y-%m-%d %H:%i:%s') AS Time,
        BusNo, stationName, StationIndex,
        CASE WHEN calculatedBaseTime IS NULL THEN NULL
          ELSE DATE_FORMAT(calculatedBaseTime, '%Y-%m-%d %H:%i:%s')
        END AS calculatedBaseTime
      FROM reportArrival
      ORDER BY ID
    `);
  }
}
