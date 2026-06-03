import type { AppData, ModificationDates, ServerResponse } from '../app/types';

export interface KeyValueStore {
  get<T = any>(key: string): Promise<T | null>;
  set(key: string, value: any): Promise<void>;
  clearAll(): Promise<void>;
  remove?(key: string): Promise<void>;
}

export interface ResourceTranslator {
  addBundle(lang: 'en' | 'zh', namespace: string, resources: Record<string, string>): void;
}

export interface RepositoryApi {
  fetchRealtime(): Promise<ServerResponse>;
  fetchServerDates(): Promise<ModificationDates>;
  fetchDelta(current: ModificationDates | null): Promise<ServerResponse>;
}

export type AppDataUpdater = (updater: (prev: AppData) => AppData) => void;
