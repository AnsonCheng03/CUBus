import { apiClient } from './api';
import { kv } from './storage';
import { createRepository as createSharedRepository } from '../shared-core/data/repository';
import type { AppData, NetworkError, RealtimeData } from '../shared-core/app/types';

export type RepoDeps = {
  i18next: {
    addResourceBundle: (
      lang: 'en' | 'zh',
      namespace: string,
      resources: Record<string, string>,
      deep?: boolean,
      overwrite?: boolean,
    ) => void;
  };
  setAppData: (updater: (prev: AppData) => AppData) => void;
  setNetworkError: (updater: (prev: NetworkError) => NetworkError) => void;
  setRealtimeData: (data: RealtimeData) => void;
  setHint: (hint: string) => void;
  t: (key: string) => string;
};

export function createRepository(deps: RepoDeps) {
  return createSharedRepository({
    cache: kv,
    api: apiClient,
    translator: {
      addBundle(lang, namespace, resources) {
        deps.i18next.addResourceBundle(lang, namespace, resources, true, true);
      },
    },
    setAppData: deps.setAppData,
    setNetworkError: deps.setNetworkError,
    setRealtimeData: deps.setRealtimeData,
    setHint: deps.setHint,
    t: deps.t,
  });
}
