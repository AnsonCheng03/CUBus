import { createApiClient } from '../shared-core/data/createApiClient';
import { seedDates } from '../shared-core/data/initData';
import { env } from './config';
import { e2eConfig } from '../test-support/e2eConfig';

export const mobileApiClient = e2eConfig.enabled
  ? {
      async fetchRealtime() {
        return e2eConfig.realtimeData;
      },
      async fetchServerDates() {
        return seedDates;
      },
      async fetchDelta() {
        return { modificationDates: seedDates };
      },
      async logEvent() {},
      async logSearch() {},
      async logRealtime() {},
    }
  : createApiClient({
      baseUrl: env.baseUrl,
      withCredentials: true,
      devMode: __DEV__,
    });

export const nativeApiClient = mobileApiClient;
