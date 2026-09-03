import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { JsonFileStore } from '../src/data/file-store.js';
import { parseTransportPages, scrapeStatus } from '../src/jobs/status-scraper.js';
import { generateTimetable } from '../src/jobs/timetable-generator.js';

describe('status scraper', () => {
  it('maps route status and bilingual alerts', () => {
    const result = parseTransportPages(
      '<div>ROUTE 1A <span class="hr-status hr-status-delayed"></span></div><div class="home-popup-text"><p>Notice</p></div>',
      '<div class="home-popup-text"><p>通告</p></div>',
    );
    expect(result.status).toEqual({ '1A': 'delayed' });
    expect(result.alert.slice(0, 2)).toEqual(['通告', 'Notice']);
  });

  it('keeps English status data when the optional Chinese page fails', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'cu-bus-status-'));
    const files = new JsonFileStore(directory);
    const fetcher = async (url: string) => {
      if (url.endsWith('/tc/')) throw new Error('Chinese page unavailable');
      return new Response('<div>ROUTE 1A <span class="hr-status hr-status-normal"></span></div>');
    };

    const result = await scrapeStatus(files, fetcher);

    expect(result.status).toEqual({ '1A': 'normal' });
    expect(await files.read('Alert.json')).toEqual([]);
  });
});

describe('timetable generator', () => {
  it('groups departures by station and excludes the terminal stop', () => {
    const timetable = generateTimetable([
      { BUSNO: '1A', StartTime: '08:10', EndTime: '09:20', Period: '10', Location: 'A', Direction: null, TravelTime: 300 },
      { BUSNO: '1A', StartTime: '08:10', EndTime: '09:20', Period: '10', Location: 'B', Direction: 'N', TravelTime: 200 },
      { BUSNO: '1A', StartTime: '08:10', EndTime: '09:20', Period: '10', Location: 'C', Direction: null, TravelTime: 0 },
    ]);
    expect(timetable['A|']?.['1A']).toEqual(['08:10:00', '09:10:00']);
    expect(timetable['B|N']?.['1A']).toEqual(['08:15:00', '09:15:00']);
    expect(timetable['C|']).toBeUndefined();
  });
});
