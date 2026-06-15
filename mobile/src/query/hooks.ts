import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { AppData, RealtimeData, RealtimeLogPayload, SearchLogPayload } from '../shared-core/app/types';
import { mobileApiClient } from '../lib/api';
import { mobileQueryKeys } from './client';
import { bootstrapFromStorageAndSeed, type BootstrapState, syncServerDelta } from './dataPipeline';

export function useBootstrapDataQuery() {
  return useQuery({
    queryKey: mobileQueryKeys.bootstrap,
    queryFn: bootstrapFromStorageAndSeed,
    staleTime: Infinity,
    gcTime: Infinity,
  });
}

export function useRealtimeDataQuery(enabled: boolean) {
  return useQuery({
    queryKey: mobileQueryKeys.realtime,
    queryFn: () => mobileApiClient.fetchRealtime() as Promise<RealtimeData>,
    enabled,
    refetchInterval: enabled ? 10_000 : false,
  });
}

export function useDeltaSyncQuery(enabled: boolean) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: mobileQueryKeys.deltaSync,
    enabled,
    refetchInterval: enabled ? 5 * 60_000 : false,
    queryFn: async () => {
      const currentState =
        queryClient.getQueryData<BootstrapState>(mobileQueryKeys.bootstrap) ?? (await bootstrapFromStorageAndSeed());
      const result = await syncServerDelta(currentState.lastModifiedDates, mobileApiClient);
      queryClient.setQueryData(mobileQueryKeys.bootstrap, result.state);
      return result;
    },
  });
}

export function useBootstrapAppData() {
  return useBootstrapDataQuery().data?.appData ?? ({} as AppData);
}

export function useRealtimeServerData(enabled = true) {
  return useRealtimeDataQuery(enabled).data ?? ({} as RealtimeData);
}

export function useLogSearchMutation() {
  return useMutation({
    mutationKey: mobileQueryKeys.logSearch,
    mutationFn: (payload: SearchLogPayload) => mobileApiClient.logSearch(payload),
  });
}

export function useLogRealtimeMutation() {
  return useMutation({
    mutationKey: mobileQueryKeys.logRealtime,
    mutationFn: (payload: RealtimeLogPayload) => mobileApiClient.logRealtime(payload),
  });
}

export function useDelayedActivation(enabled: boolean, delayMs: number) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setActive(false);
      return;
    }

    const timer = setTimeout(() => {
      setActive(true);
    }, delayMs);

    return () => {
      clearTimeout(timer);
    };
  }, [delayMs, enabled]);

  return active;
}
