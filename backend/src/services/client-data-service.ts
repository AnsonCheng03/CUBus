import { randomBytes } from 'node:crypto';
import type { JsonFileStore } from '../data/file-store.js';
import {
  trackedTables,
  translationTables,
  type BusRepository,
} from '../repositories/bus-repository.js';
import { formatHongKongSqlDate } from './hong-kong-time.js';

const dataFiles = ['timetable.json', 'Alert.json'] as const;

export class ClientDataService {
  constructor(
    private readonly repository: BusRepository,
    private readonly files: JsonFileStore,
    private readonly releaseDate: string,
  ) {}

  async getModificationDates() {
    const dates = await this.repository.getModificationDates();
    for (const file of dataFiles) dates[file] = await this.files.modifiedAt(file);
    dates.server = this.releaseDate;
    return dates;
  }

  async getDelta(clientDates: Record<string, string> | null) {
    const dates = await this.getModificationDates();
    const outdated = new Set<string>();
    if (clientDates === null) {
      [...trackedTables, ...dataFiles].forEach((name) => outdated.add(name));
    } else {
      for (const [name, serverDate] of Object.entries(dates)) {
        if (name !== 'server' && (!clientDates[name] || clientDates[name] < serverDate)) {
          outdated.add(name);
        }
      }
    }

    const force = !clientDates?.server || clientDates.server < this.releaseDate;
    if (translationTables.some((name) => outdated.has(name))) {
      translationTables.forEach((name) => outdated.add(name));
    }

    const output: Record<string, unknown> = {};
    if (force || outdated.has('Route')) output.Route = mapRoutes(await this.repository.getRoutes());
    if (force || translationTables.some((name) => outdated.has(name))) {
      output.translation = mapTranslations(await this.repository.getTranslations());
    }
    if (force || outdated.has('station')) output.station = mapStations(await this.repository.getStations());
    if (force || outdated.has('notice') || outdated.has('Alert.json')) {
      output.notice = mapNotices(
        await this.repository.getNotices(),
        await this.files.read<unknown[]>('Alert.json'),
      );
    }
    if (force || outdated.has('gps')) output.gps = mapGps(await this.repository.getGps());
    if (force || outdated.has('website')) output.website = mapWebsites(await this.repository.getWebsites());

    // PHP always returned this file, even when its date was current.
    output['timetable.json'] = await this.files.read('timetable.json');
    output.modificationDates = dates;
    output.fetchTime = formatHongKongSqlDate();
    output.token = randomBytes(32).toString('hex');
    return output;
  }
}

function mapRoutes(rows: Record<string, unknown>[]) {
  const routes: Record<string, any> = {};
  for (const row of rows) {
    const busNo = String(row.BUSNO);
    routes[busNo] ??= {
      schedule: [row.StartTime, row.EndTime, row.Period, row.Days, row.Weekdays, row.Warning],
      colorCode: row.colorCode ?? 'rgb(254, 250, 183)',
      stations: { name: [], attr: [], time: [] },
    };
    if (row.Location) {
      routes[busNo].stations.name.push(row.Location);
      routes[busNo].stations.attr.push(row.Direction ?? 'NULL');
      routes[busNo].stations.time.push(Number(row.TravelTime ?? 0));
    }
  }
  return routes;
}

function mapTranslations(rows: Record<string, unknown>[]) {
  const translation: { en: Record<string, string>; zh: Record<string, string> } = { en: {}, zh: {} };
  for (const row of rows) {
    const code = String(row.Code);
    translation.en[code] = String(row.ENG ?? '');
    translation.zh[code] = String(row['中文'] ?? '');
  }
  return translation;
}

function mapStations(rows: Record<string, unknown>[]) {
  const stations: Record<string, string[]> = {};
  for (const row of rows) {
    const station = String(row['最近之車站'] ?? '');
    if (!station) continue;
    stations[station] ??= [];
    for (const value of [row['建築物'], station]) {
      const text = String(value ?? '');
      if (text && !stations[station].includes(text)) stations[station].push(text);
    }
  }
  return stations;
}

function mapNotices(rows: Record<string, unknown>[], alert: unknown[]) {
  const notices = rows.map((row) => ({
    content: [row.CHINESE, row.ENGLISH],
    id: row.ID,
    pref: {
      type: row.type ?? '', hide: row.hide ?? '', link: row.link ?? '',
      dismissible: row.dismissible ?? '', saveDismiss: row.saveDismiss ?? '',
      duration: row.duration ?? '',
    },
  }));
  if (Array.isArray(alert) && alert.length > 0) {
    notices.push({
      content: alert,
      id: 'alert',
      pref: { type: 'light', hide: 'false', link: '', dismissible: 'true', saveDismiss: 'false', duration: '' },
    } as any);
  }
  return notices;
}

function mapGps(rows: Record<string, unknown>[]) {
  const gps: Record<string, unknown> = {};
  for (const row of rows) {
    const grouped = row.GroupedStations;
    gps[String(row.Location)] = {
      Lat: row.Lat,
      Lng: row.Lng,
      ImportantStation: row.ImportantStation,
      Grouped: grouped == null ? null : typeof grouped === 'string' ? JSON.parse(grouped) : grouped,
    };
  }
  return gps;
}

function mapWebsites(rows: Record<string, unknown>[]) {
  return rows
    .filter((row) => row.URL && !String(row.URL).startsWith('//'))
    .map((row) => [[row['英文'], row['中文']], row.URL]);
}
