import { createCipheriv, randomUUID } from 'node:crypto';
import { load } from 'cheerio';

export type CusisConfig = {
  endpoint: string;
  aesKey: string;
  aesIv: string;
  maxFailures: number;
  failureWindowMs: number;
};

export class CusisAuthenticationError extends Error {}
export class CusisRateLimitError extends Error {}

type Fetcher = typeof fetch;
type TimetableRow = Record<string, string>;

export class CusisService {
  private readonly failures = new Map<string, { count: number; expiresAt: number }>();

  constructor(
    private readonly config: CusisConfig,
    private readonly fetcher: Fetcher = fetch,
  ) {}

  async createCalendar(sid: string, password: string, clientKey: string): Promise<string> {
    return buildCalendar(await this.getTimetable(sid, password, clientKey));
  }

  async getTimetable(sid: string, password: string, clientKey: string): Promise<TimetableRow[]> {
    this.assertAllowed(clientKey);
    let rows = await this.requestTimetable(sid, password);
    if (!rows) {
      rows = await this.requestTimetable(this.encrypt(sid), this.encrypt(password));
    }
    if (!rows) {
      this.recordFailure(clientKey);
      throw new CusisAuthenticationError('Invalid SID or password');
    }
    this.failures.delete(clientKey);
    return rows;
  }

  private assertAllowed(key: string) {
    const failure = this.failures.get(key);
    if (!failure) return;
    if (failure.expiresAt <= Date.now()) {
      this.failures.delete(key);
      return;
    }
    if (failure.count >= this.config.maxFailures) throw new CusisRateLimitError('Too many failed attempts');
  }

  private recordFailure(key: string) {
    const current = this.failures.get(key);
    const now = Date.now();
    const count = current && current.expiresAt > now ? current.count + 1 : 1;
    this.failures.set(key, { count, expiresAt: now + this.config.failureWindowMs });
  }

  private encrypt(value: string): string {
    const cipher = createCipheriv(
      'aes-256-cbc',
      Buffer.from(this.config.aesKey, 'utf8'),
      Buffer.from(this.config.aesIv, 'utf8'),
    );
    return Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]).toString('base64');
  }

  private async requestTimetable(sid: string, password: string): Promise<TimetableRow[] | null> {
    const body = `<?xml version="1.0" encoding="utf-8"?>` +
      `<soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">` +
      `<soap:Body><GetTimeTable xmlns="http://tempuri.org/"><asP1>${escapeXml(sid)}</asP1>` +
      `<asP2>${escapeXml(password)}</asP2><asP3>hk.edu.cuhk.ClassTT</asP3>` +
      `</GetTimeTable></soap:Body></soap:Envelope>`;
    try {
      const response = await this.fetcher(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'User-Agent': 'ClassTT/2.4 CFNetwork/1333.0.4 Darwin/21.5.0',
        },
        body,
        signal: AbortSignal.timeout(20_000),
      });
      if (!response.ok) return null;
      const text = load(await response.text()).text().trim();
      const parsed = JSON.parse(text);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch {
      return null;
    }
  }
}

function buildCalendar(rows: TimetableRow[]): string {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR', 'PRODID:-//CU Bus//CUSIS Timetable//EN', 'VERSION:2.0',
    'CALSCALE:GREGORIAN', 'X-WR-CALNAME:CUHK Timetable', 'X-WR-TIMEZONE:Asia/Hong_Kong',
  ];
  for (const row of rows) {
    try {
      const start = calendarDate(row.START_DT ?? '', row.MEETING_TIME_START ?? '');
      const end = calendarDate(row.START_DT ?? '', row.MEETING_TIME_END ?? '');
      const until = String(row.END_DT ?? '').replace(/-/g, '');
      lines.push(
        'BEGIN:VEVENT',
        `UID:${randomUUID()}@cu-bus.online`,
        `DTSTAMP:${now}`,
        `CREATED:${now}`,
        `DTSTART;TZID=Asia/Hong_Kong:${start}`,
        `DTEND;TZID=Asia/Hong_Kong:${end}`,
        `SUMMARY:${ics(`[${row.COMDESC ?? ''}] ${row.SUBJECT ?? ''}${row.CATALOG_NBR ?? ''}-${row.CLASS_SECTION ?? ''}`)}`,
        `DESCRIPTION:${ics(`Instructors: ${row.INSTRUCTORS ?? ''}\\nCourse: ${row.DESCR ?? ''}`)}`,
        `LOCATION:${ics(row.FDESCR ?? '')}`,
        `GEO:${Number(row.LAT).toFixed(6)};${Number(row.LNG).toFixed(6)}`,
        `RRULE:FREQ=WEEKLY;UNTIL=${until}T235959Z`,
        'END:VEVENT',
      );
    } catch {
      // Preserve PHP behavior: skip malformed timetable rows.
    }
  }
  lines.push('END:VCALENDAR');
  return `${lines.join('\r\n')}\r\n`;
}

function calendarDate(date: string, time: string) {
  return `${String(date).replace(/-/g, '')}T${String(time).replace(/:/g, '').padEnd(6, '0')}`;
}

function escapeXml(value: string) {
  return value.replace(/[<>&'\"]/g, (character) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
  })[character]!);
}

function ics(value: string) {
  return value.replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}
