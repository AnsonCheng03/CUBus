import { localSeed, seedDates } from './initData';
import { normalizeTableName, pickFromResponseOrLocal, processors } from './processors';
import type { AppData, ModificationDates, NetworkError, RealtimeData } from '../app/types';
import type {
  AppDataUpdater,
  KeyValueStore,
  NetworkErrorUpdater,
  RealtimeDataSetter,
  RepositoryApi,
  ResourceTranslator,
} from '../platform/types';

export type RepoDeps = {
  cache: KeyValueStore;
  api: RepositoryApi;
  translator: ResourceTranslator;
  setAppData: AppDataUpdater;
  setNetworkError: NetworkErrorUpdater;
  setRealtimeData: RealtimeDataSetter;
  setHint: (hint: string) => void;
  t: (key: string) => string;
};

export function createRepository(deps: RepoDeps) {
  const { cache, api, translator, setAppData, setNetworkError, setRealtimeData, setHint, t } = deps;

  const processOne = async (table: string, data: unknown) => {
    if (table !== 'timetable.json') {
      await cache.set(`data-${table}`, data);
    }
    const handler = processors[table];
    if (handler) {
      await handler(data, { translator, setAppData });
    }
  };

  const loadLocalOrSeed = async (table: string) => {
    const cached = await cache.get<unknown>(`data-${table}`);
    return cached ?? localSeed[table as keyof typeof localSeed];
  };

  return {
    async initAndWarm(): Promise<ModificationDates | null> {
      try {
        await cache.get('appSettings');
      } catch {
        await cache.clearAll();
      }

      const stored = await cache.get<ModificationDates>('lastModifiedDates');
      const seen = new Set<string>();
      for (const raw of Object.keys(seedDates)) {
        const table = normalizeTableName(raw, seen);
        if (!table) continue;
        const local = await loadLocalOrSeed(table);
        if (local) await processOne(table, local);
      }
      return stored ?? null;
    },

    async realtimeOnce() {
      try {
        const data = await api.fetchRealtime();
        setRealtimeData(data as RealtimeData);
        setNetworkError((prev: NetworkError) => ({ ...prev, realtime: false }));
        return data;
      } catch {
        setNetworkError((prev: NetworkError) => ({ ...prev, realtime: true }));
        return null;
      }
    },

    async syncDelta(currentDates: ModificationDates | null) {
      try {
        setHint(t('DownloadFiles-Downloading'));
        const serverDates = await api.fetchServerDates();

        setHint(t('DownloadFiles-Fetching-Latest'));
        let response;
        try {
          response = await api.fetchDelta(currentDates);
          setNetworkError((prev: NetworkError) => ({ ...prev, batch: false }));
        } catch {
          setNetworkError((prev: NetworkError) => ({ ...prev, batch: true }));
          response = { modificationDates: seedDates };
        }

        setHint(t('DownloadFiles-Processing'));

        const seen = new Set<string>();
        for (const raw of Object.keys(serverDates)) {
          const table = normalizeTableName(raw, seen);
          if (!table) continue;

          const fallback = await loadLocalOrSeed(table);
          const tableData = pickFromResponseOrLocal(table, response, fallback);
          if (tableData) await processOne(table, tableData);
        }

        if ('token' in response) {
          await processOne('token', response.token);
        }

        const latestDates = response.modificationDates ?? serverDates;
        await cache.set('lastModifiedDates', latestDates);

        setHint(t('StoreFile-Complete'));
        return latestDates;
      } catch (error) {
        setHint(t('StoreFile-Error'));
        setNetworkError((prev: NetworkError) => ({ ...prev, batch: true }));
        throw error;
      }
    },
  };
}
