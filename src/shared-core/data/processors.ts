import type { AppData, ServerResponse } from '../app/types';
import type { ResourceTranslator } from '../platform/types';

export type ProcessDeps = {
  translator: ResourceTranslator;
  setAppData: (updater: (prev: AppData) => AppData) => void;
};

export type Processor = (data: unknown, deps: ProcessDeps) => Promise<void>;

export const processors: Record<string, Processor> = {
  translation: async (data, { translator }) => {
    const translationData = data as ServerResponse['translation'];
    if (translationData?.en) translator.addBundle('en', 'global', translationData.en);
    if (translationData?.zh) translator.addBundle('zh', 'global', translationData.zh);
  },
  website: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, WebsiteLinks: data as AppData['WebsiteLinks'] }));
  },
  Route: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, bus: data as AppData['bus'] }));
  },
  gps: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, GPS: data as AppData['GPS'] }));
  },
  notice: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, notice: data as AppData['notice'] }));
  },
  station: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, station: data as AppData['station'] }));
  },
  'timetable.json': async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, 'timetable.json': data as AppData['timetable.json'] }));
  },
  token: async (data, { setAppData }) => {
    setAppData((prev) => ({ ...prev, token: data as AppData['token'] }));
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
  localFallback: unknown,
) {
  if (table === 'translation') {
    const serverTranslation = response.translation;
    const localTranslation = localFallback as ServerResponse['translation'] | undefined;

    if (!serverTranslation) {
      return localFallback;
    }

    return {
      ...serverTranslation,
      en: {
        ...(serverTranslation.en ?? {}),
        ...(localTranslation?.en ?? {}),
      },
      zh: {
        ...(serverTranslation.zh ?? {}),
        ...(localTranslation?.zh ?? {}),
      },
    };
  }

  return table in response ? response[table] : localFallback;
}
