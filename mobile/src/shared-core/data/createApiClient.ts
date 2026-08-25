import axios from 'axios';
import type {
  GenericLogPayload,
  ModificationDates,
  RealtimeLogPayload,
  SearchLogPayload,
  ServerResponse,
} from '../app/types';

export type ApiClientOptions = {
  baseUrl: string;
  withCredentials?: boolean;
  devMode?: boolean;
  timeoutMs?: number;
};

function stripTrailingSlash(value: string) {
  return value.endsWith('/') ? value.slice(0, -1) : value;
}

export function createApiClient(options: ApiClientOptions) {
  const { withCredentials = true, devMode = false, timeoutMs = 10_000 } = options;
  const baseUrl = stripTrailingSlash(options.baseUrl);
  const client = axios.create({
    withCredentials,
    timeout: devMode ? 0 : timeoutMs,
  });

  const shortTimeout = devMode ? 0 : Math.min(timeoutMs, 5_000);

  return {
    async fetchRealtime(): Promise<ServerResponse> {
      const response = await client.get<ServerResponse>(`${baseUrl}/realtime`, {
        timeout: shortTimeout,
      });
      return response.data;
    },

    async fetchServerDates(): Promise<ModificationDates> {
      const response = await client.get<ModificationDates>(`${baseUrl}/client-data`, {
        timeout: shortTimeout,
      });
      if (typeof response.data === 'string' || response.status !== 200) {
        throw new Error('Bad server dates response');
      }
      return response.data;
    },

    async fetchDelta(current: ModificationDates | null): Promise<ServerResponse> {
      const response = await client.post<ServerResponse>(
        `${baseUrl}/client-data`,
        current ?? {},
        { timeout: devMode ? 0 : timeoutMs },
      );
      return response.data;
    },

    async logEvent(payload: GenericLogPayload) {
      await client.post(`${baseUrl}/events`, payload, {
        timeout: devMode ? 0 : timeoutMs,
      });
    },

    async logSearch(input: SearchLogPayload) {
      if (!input.start || !input.dest) return;
      await client.post(
        `${baseUrl}/events`,
        {
          type: 'search',
          Start: input.start,
          Dest: input.dest,
          Departnow: input.departNow,
          Lang: input.lang,
          Token: input.token,
        },
        { timeout: devMode ? 0 : timeoutMs },
      );
    },

    async logRealtime(input: RealtimeLogPayload) {
      if (!input.dest) return;
      await client.post(
        `${baseUrl}/events`,
        {
          type: 'realtime',
          Dest: input.dest,
          Lang: input.lang,
          Token: input.token,
        },
        { timeout: devMode ? 0 : timeoutMs },
      );
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
