import { QueryClient } from '@tanstack/react-query';

export const mobileQueryKeys = {
  bootstrap: ['mobile', 'bootstrap'] as const,
  realtime: ['mobile', 'realtime'] as const,
  deltaSync: ['mobile', 'delta-sync'] as const,
  logSearch: ['mobile', 'log-search'] as const,
  logRealtime: ['mobile', 'log-realtime'] as const,
};

export const mobileQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      gcTime: 30 * 60_000,
      refetchOnReconnect: true,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
