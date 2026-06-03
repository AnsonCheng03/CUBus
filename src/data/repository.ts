import { apiClient } from './api';
import { kv } from './storage';
import { createRepository as createSharedRepository } from '../shared-core/data/repository';
import type { AppData } from '../shared-core/app/types';

export type RepoDeps = {
  i18next: any;
  setAppData: (updater: (prev: AppData) => AppData) => void;
  setNetworkError: (updater: any) => void;
  setRealtimeData: (data: any) => void;
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
