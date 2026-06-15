import type { AppData, ModificationDates, NetworkError, RealtimeData, ServerResponse } from '../app/types';

export interface KeyValueStore {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
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
export type NetworkErrorUpdater = (updater: (prev: NetworkError) => NetworkError) => void;
export type RealtimeDataSetter = (value: RealtimeData) => void;
