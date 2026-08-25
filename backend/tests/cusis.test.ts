import { describe, expect, it, vi } from 'vitest';
import { CusisAuthenticationError, CusisRateLimitError, CusisService } from '../src/services/cusis-service.js';

const config = {
  endpoint: 'https://example.test/cusis',
  aesKey: '12345678901234567890123456789012',
  aesIv: '1234567890123456',
  maxFailures: 1,
  failureWindowMs: 60_000,
};

describe('CusisService', () => {
  it('converts a SOAP-wrapped timetable into a calendar without exposing credentials', async () => {
    const rows = [{
      START_DT: '2026-09-01', MEETING_TIME_START: '09:30', MEETING_TIME_END: '10:15',
      END_DT: '2026-12-01', COMDESC: 'LEC', SUBJECT: 'CSCI', CATALOG_NBR: '1000',
      CLASS_SECTION: 'A', INSTRUCTORS: 'Teacher', DESCR: 'Course', FDESCR: 'Room',
      LAT: '22.419', LNG: '114.207',
    }];
    const fetcher = vi.fn().mockResolvedValue(new Response(`<string>${JSON.stringify(rows)}</string>`));
    const service = new CusisService(config, fetcher);
    const calendar = await service.createCalendar('1155000000', 'secret', 'client');

    expect(calendar).toContain('BEGIN:VCALENDAR');
    expect(calendar).toContain('DTSTART;TZID=Asia/Hong_Kong:20260901T093000');
    expect(calendar).not.toContain('secret');
  });

  it('rate-limits repeated failed authentication', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response('<string>null</string>'));
    const service = new CusisService(config, fetcher);
    await expect(service.createCalendar('1', 'bad', 'client')).rejects.toBeInstanceOf(CusisAuthenticationError);
    await expect(service.createCalendar('1', 'bad', 'client')).rejects.toBeInstanceOf(CusisRateLimitError);
  });
});
