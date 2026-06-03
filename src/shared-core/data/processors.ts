import type { AppData, ServerResponse } from '../app/types';
import type { ResourceTranslator } from '../platform/types';

export type ProcessDeps = {
  translator: ResourceTranslator;
  setAppData: (updater: (prev: AppData) => AppData) => void;
};

export type Processor = (data: any, deps: ProcessDeps) => Promise<void>;

export const processors: Record<string, Processor> = {
  translation: async (data, { translator }) => {
    if (data?.en) translator.addBundle('en', 'global', data.en);
    if (data?.zh) translator.addBundle('zh', 'global', data.zh);
  },
  website: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, WebsiteLinks: data }));
  },
  Route: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, bus: data }));
  },
  gps: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, GPS: data }));
  },
  notice: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, notice: data }));
  },
  station: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, station: data }));
  },
  'timetable.json': async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, ['timetable.json']: data }));
  },
  token: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, token: data }));
  },
};

export function normalizeTableName(name: string, seen: Set<string>): string | null {
  const translationTables = new Set([
    'translateroute',
    'translatewebsite',
    'translatebuilding',
    'translateattribute',
  ]);
  if (translationTables.has(name)) {
    if (seen.has('translation')) return null;
    seen.add('translation');
    return 'translation';
  }
  return name;
}

export function pickFromResponseOrLocal(
  table: string,
  response: ServerResponse,
  localFallback: any,
) {
  return table in response ? response[table] : localFallback;
}
