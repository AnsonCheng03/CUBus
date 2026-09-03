import type {
  ReportArrivalRepository,
  ReportRouteStop,
} from '../repositories/report-arrival-repository.js';
import { formatHongKongSqlDate } from './hong-kong-time.js';

export type ReportArrivalInput = {
  busNo: string;
  stationIndex: number;
  timestamp: number;
  latitude: number;
  longitude: number;
};

export class ReportArrivalError extends Error {}

type Clock = () => number;
type ReportedEntry = { location: string; time: number };
export type ReportedTimetable = Record<string, Record<string, Array<{
  count: number;
  average_time: string;
}>>>;

export class ReportArrivalService {
  private readonly clients = new Map<string, { reporting: boolean; lastReportedAt?: number }>();

  constructor(
    private readonly repository: ReportArrivalRepository,
    private readonly clock: Clock = Date.now,
  ) {}

  async report(input: ReportArrivalInput, clientKey: string): Promise<string> {
    const state = this.clients.get(clientKey) ?? { reporting: false };
    if (state.reporting) throw new ReportArrivalError('reporting-in-progress');
    state.reporting = true;
    this.clients.set(clientKey, state);

    try {
      const now = this.clock();
      if (state.lastReportedAt !== undefined && now - state.lastReportedAt < 300_000) {
        throw new ReportArrivalError('request-within-5mins');
      }

      const reportedAt = normalizeTimestamp(input.timestamp);
      if (now - reportedAt > 60_000) {
        throw new ReportArrivalError('report-invalid-time');
      }

      const nextStopOrder = input.stationIndex + 1;
      const coordinates = await this.repository.getStopCoordinates(input.busNo, nextStopOrder);
      const latitude = Number(coordinates?.Lat);
      const longitude = Number(coordinates?.Lng);
      if (!coordinates || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
        throw new ReportArrivalError('report-invalid-station');
      }

      const distance = Math.sqrt(
        Math.pow(latitude - input.latitude, 2) + Math.pow(longitude - input.longitude, 2),
      );
      if (!Number.isFinite(distance) || distance > 100 / 100_000) {
        throw new ReportArrivalError('report-invalid-distance');
      }

      const stops = await this.repository.getStopsFrom(input.busNo, nextStopOrder);
      if (stops.length === 0) return 'No data found';

      const originalTime = formatHongKongSqlDate(new Date(reportedAt));
      const rows = buildReportRows(stops, reportedAt, originalTime, input.busNo);
      await this.repository.insert(rows);
      state.lastReportedAt = now;
      return 'reported-arrival-time';
    } finally {
      state.reporting = false;
    }
  }

  async getReportedTimetable(): Promise<ReportedTimetable> {
    await this.repository.deleteExpiredCalculated();
    const rows = await this.repository.getAll();
    const grouped = new Map<string, ReportedEntry[]>();

    for (const row of rows) {
      const time = parseSqlDate(row.Time);
      if (time === null) continue;
      const key = `${row.BusNo}\u0000${row.StationIndex}`;
      const entries = grouped.get(key) ?? [];
      entries.push({ location: row.stationName, time });
      grouped.set(key, entries);
    }

    const result: ReportedTimetable = {};
    const cutoff = this.clock() / 1000 - 10 * 60;
    for (const [key, entries] of grouped) {
      const separator = key.lastIndexOf('\u0000');
      const busNo = key.slice(0, separator);
      const window: ReportedEntry[] = [];
      const groupedData: Array<{ count: number; average_time: string }> = [];
      let windowSum = 0;
      let groupIndex = -1;
      let lastLocation = '';

      for (const entry of entries) {
        lastLocation = entry.location;
        if (entry.time <= cutoff) continue;

        while (window.length > 0 && entry.time - window[0]!.time > 150) {
          const removed = window.shift()!;
          windowSum -= removed.time;
        }

        window.push(entry);
        windowSum += entry.time;
        if (window.length === 1) groupIndex += 1;
        groupedData[groupIndex] = {
          count: window.length,
          average_time: formatHongKongClock(Math.round(windowSum / window.length)),
        };
      }

      if (groupedData.length > 0 && lastLocation) {
        const locationResult = result[lastLocation] ?? {};
        locationResult[busNo] = groupedData;
        result[lastLocation] = locationResult;
      }
    }
    return result;
  }
}

function buildReportRows(
  stops: ReportRouteStop[],
  reportedAt: number,
  originalTime: string,
  busNo: string,
) {
  let calculatedAt = reportedAt;
  return stops.slice(0, -1).map((stop, index) => {
    calculatedAt += Math.floor(Number(stop.TravelTime));
    return {
      time: formatHongKongSqlDate(new Date(calculatedAt)),
      busNo,
      stationName: `${stop.Location}|${stop.Direction ?? ''}`,
      stationIndex: stop.StopOrder,
      calculatedBaseTime: index === 0 ? null : originalTime,
    };
  });
}

function normalizeTimestamp(value: number) {
  return value < 1_000_000_000_000 ? value * 1_000 : value;
}

function parseSqlDate(value: string | Date): number | null {
  if (value instanceof Date) {
    const timestamp = value.getTime();
    return Number.isFinite(timestamp) ? timestamp / 1_000 : null;
  }
  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/,
  );
  if (!match) return null;
  const [, year, month, day, hour, minute, second] = match;
  return Date.UTC(
    Number(year), Number(month) - 1, Number(day), Number(hour) - 8, Number(minute), Number(second),
  ) / 1_000;
}

function formatHongKongClock(epochSeconds: number) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Hong_Kong',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).format(new Date(epochSeconds * 1_000));
}
