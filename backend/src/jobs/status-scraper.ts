import { createHash } from 'node:crypto';
import { load } from 'cheerio';
import type { JsonFileStore } from '../data/file-store.js';
import { formatHongKongSqlDate } from '../services/hong-kong-time.js';

const ignoredAlertHashes = new Set([
  'a83f31c0d21b8492c3960d923a3d8bbb8a375d3dc2d8127c18fadafa6936e6fe',
  '9775994646898f87c18a42ae96ba19d6ecbbf6fe3227755c335e14088fb259ab',
]);

export type ScrapeResult = { status: Record<string, string>; alert: string[] };

export function parseTransportPages(englishHtml: string, chineseHtml = englishHtml): ScrapeResult {
  const $ = load(englishHtml);
  const status: Record<string, string> = {};
  $('span.hr-status').each((_index, element) => {
    const item = $(element);
    const busNo = item.parent().text().toUpperCase().replace('ROUTE', '').trim();
    if (!busNo) return;
    status[busNo] = item.hasClass('hr-status-delayed') ? 'delayed'
      : item.hasClass('hr-status-suspended') ? 'suspended'
      : item.hasClass('hr-status-normal') ? 'normal' : 'no';
  });
  const english = $('.home-popup-text > p').map((_index, element) => $(element).text()).get().join('\n');
  const chinesePage = load(chineseHtml);
  const chinese = chinesePage('.home-popup-text > p')
    .map((_index, element) => chinesePage(element).text()).get().join('\n') || english;
  if (!english) return { status, alert: [] };
  const base = [chinese, english];
  const hash = createHash('sha256').update(JSON.stringify(base, null, 2)).digest('hex');
  return { status, alert: ignoredAlertHashes.has(hash) ? [] : [...base, hash] };
}

export async function scrapeStatus(
  files: JsonFileStore,
  fetcher: typeof fetch = fetch,
): Promise<ScrapeResult> {
  let result: ScrapeResult;
  try {
    const [englishResponse, chineseResponse] = await Promise.all([
      fetcher('https://www.transport.cuhk.edu.hk/', { signal: AbortSignal.timeout(20_000) }),
      fetcher('https://www.transport.cuhk.edu.hk/tc/', { signal: AbortSignal.timeout(20_000) }),
    ]);
    if (!englishResponse.ok) throw new Error(`Transport page returned ${englishResponse.status}`);
    result = parseTransportPages(
      await englishResponse.text(),
      chineseResponse.ok ? await chineseResponse.text() : '',
    );
  } catch {
    result = { status: { ERROR: 'fetch' }, alert: await files.read<string[]>('Alert.json') };
  }

  const timeline = await files.read<Record<string, unknown>>('Status.json');
  timeline[formatHongKongSqlDate()] = result.status;
  const trimmed = Object.fromEntries(Object.entries(timeline).slice(-1_500));
  const date = formatHongKongSqlDate().slice(0, 10);
  await Promise.all([
    files.writeAtomic('Alert.json', result.alert),
    files.writeAtomic('Status.json', trimmed),
    files.writeAtomic(`prev-status/${date}.json`, trimmed),
  ]);
  return result;
}
