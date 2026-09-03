import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type {
  AppData,
  AppBootstrapStatus,
  AppSettings,
  AppTempData,
  NetworkError,
  RealtimeData,
  SearchStationTempState,
} from '../shared-core/app/types';
import { asyncStorageStore } from '../lib/storage';
import { mobileQueryKeys } from '../query/client';
import {
  useBootstrapDataQuery,
  useDelayedActivation,
  useDeltaSyncQuery,
  useRealtimeDataQuery,
} from '../query/hooks';
import { findMissingRequiredData } from './internal/requiredData';
import { DEFAULT_APP_TEMP_DATA, useTempState } from './internal/tempState';
import { e2eConfig } from '../test-support/e2eConfig';
import { preloadStartupVisuals } from '../lib/startupVisuals';

const MIN_BOOT_SCREEN_MS = 900;

type AppStateContextValue = {
  appData: AppData;
  appSettings: AppSettings;
  setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  appTempData: AppTempData;
  setRealtimeStation: (station: string | null) => void;
  setSearchStation: (state: SearchStationTempState | null) => void;
  clearTemporaryState: () => void;
  realtimeData: RealtimeData;
  networkError: NetworkError;
  isDownloaded: boolean;
  ready: boolean;
  bootStatus: AppBootstrapStatus;
  missingData: string[];
  hint: string;
  retryBoot: () => Promise<void>;
  refreshRealtime: () => Promise<void>;
  syncDelta: () => Promise<void>;
  resetApp: () => Promise<void>;
} | null;

const AppStateContext = createContext<AppStateContextValue>(null);

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const queryClient = useQueryClient();
  const [hint, setHint] = useState('Initializing');
  const [startupVisualsReady, setStartupVisualsReady] = useState(false);
  const [appSettings, setAppSettings] = useState<AppSettings>(e2eConfig.appSettings ?? {});
  const [networkError, setNetworkError] = useState<NetworkError>({ realtime: false, batch: false });

  const { appTempData, setSearchStation, setRealtimeStation, clearTemporaryState } = useTempState(
    e2eConfig.enabled ? e2eConfig.appTempData ?? DEFAULT_APP_TEMP_DATA : DEFAULT_APP_TEMP_DATA,
  );

  const bootstrapQuery = useBootstrapDataQuery();
  const appData = bootstrapQuery.data?.appData ?? {};
  const missingData = useMemo(() => findMissingRequiredData(appData), [appData]);
  const bootstrapReadyForDisplay = useDelayedActivation(!bootstrapQuery.isPending, MIN_BOOT_SCREEN_MS);

  useEffect(() => {
    let mounted = true;

    preloadStartupVisuals()
      .catch((error: unknown) => {
        console.warn('[startup] visual preload failed; continuing with bundled assets', error);
      })
      .finally(() => {
        if (mounted) {
          setStartupVisualsReady(true);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const bootStatus: AppBootstrapStatus = !startupVisualsReady || !bootstrapReadyForDisplay
    ? 'initializing'
    : bootstrapQuery.isError
      ? 'recoverable-error'
      : missingData.length > 0
        ? 'corrupted'
        : 'ready';

  const deltaSyncEnabled = useDelayedActivation(bootStatus === 'ready' && !e2eConfig.enabled, 1200);
  const realtimeQuery = useRealtimeDataQuery(bootStatus === 'ready' && !e2eConfig.enabled);
  const realtimeData = realtimeQuery.data ?? (e2eConfig.enabled ? e2eConfig.realtimeData : {});
  const deltaSyncQuery = useDeltaSyncQuery(deltaSyncEnabled && bootStatus === 'ready');

  useEffect(() => {
    if (realtimeQuery.isError) {
      setNetworkError((current) =>
        current.realtime ? current : { ...current, realtime: true },
      );
      return;
    }

    if (!realtimeQuery.isFetching && realtimeQuery.isSuccess) {
      setNetworkError((current) =>
        current.realtime ? { ...current, realtime: false } : current,
      );
    }
  }, [realtimeQuery.isError, realtimeQuery.isFetching, realtimeQuery.isSuccess]);

  useEffect(() => {
    if (deltaSyncQuery.isError || deltaSyncQuery.data?.batchError === true) {
      setNetworkError((current) => (current.batch ? current : { ...current, batch: true }));
      return;
    }

    if (
      !deltaSyncQuery.isFetching &&
      deltaSyncQuery.isSuccess &&
      deltaSyncQuery.data?.batchError === false
    ) {
      setNetworkError((current) =>
        current.batch ? { ...current, batch: false } : current,
      );
    }
  }, [deltaSyncQuery.data?.batchError, deltaSyncQuery.isError, deltaSyncQuery.isFetching, deltaSyncQuery.isSuccess]);

  useEffect(() => {
    if (e2eConfig.enabled) {
      return;
    }

    asyncStorageStore.get<AppSettings>('appSettings').then((savedSettings) => {
      if (savedSettings) {
        setAppSettings(savedSettings);
      }
    });
  }, []);

  useEffect(() => {
    if (bootStatus === 'initializing') {
      setHint('DownloadFiles-Initializing');
      return;
    }

    if (bootStatus === 'recoverable-error' || bootStatus === 'corrupted') {
      setHint('StoreFile-Error');
      return;
    }

    if (deltaSyncQuery.fetchStatus === 'fetching') {
      setHint('DownloadFiles-Downloading');
      return;
    }

    setHint('DownloadFiles-Complete');
  }, [bootStatus, deltaSyncQuery.fetchStatus]);

  useEffect(() => {
    if (e2eConfig.enabled) {
      return;
    }

    if (bootStatus !== 'ready') {
      return;
    }

    asyncStorageStore.set('appSettings', appSettings).catch(() => {});
  }, [appSettings, bootStatus]);

  const refreshRealtime = useCallback(async () => {
    await realtimeQuery.refetch();
  }, [realtimeQuery]);

  const syncDelta = useCallback(async () => {
    setHint('DownloadFiles-Downloading');
    await deltaSyncQuery.refetch();
  }, [deltaSyncQuery]);

  const retryBoot = useCallback(async () => {
    setHint('DownloadFiles-Initializing');
    await queryClient.invalidateQueries({ queryKey: mobileQueryKeys.bootstrap });
    await bootstrapQuery.refetch();
  }, [bootstrapQuery, queryClient]);

  const resetApp = useCallback(async () => {
    await asyncStorageStore.clearAll();
    clearTemporaryState();
    setAppSettings(e2eConfig.enabled ? e2eConfig.appSettings ?? {} : {});
    setHint('DownloadFiles-Initializing');
    await queryClient.removeQueries({ queryKey: mobileQueryKeys.bootstrap });
    await queryClient.removeQueries({ queryKey: mobileQueryKeys.realtime });
    await queryClient.removeQueries({ queryKey: mobileQueryKeys.deltaSync });
    await bootstrapQuery.refetch();
  }, [bootstrapQuery, clearTemporaryState, queryClient]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      appData,
      appSettings,
      setAppSettings,
      appTempData,
      setRealtimeStation,
      setSearchStation,
      clearTemporaryState,
      realtimeData,
      networkError,
      isDownloaded: bootStatus === 'ready',
      ready: bootStatus === 'ready',
      bootStatus,
      missingData,
      hint,
      retryBoot,
      refreshRealtime,
      syncDelta,
      resetApp,
    }),
    [
      appSettings,
      appData,
      appTempData,
      bootStatus,
      clearTemporaryState,
      hint,
      missingData,
      networkError,
      realtimeData,
      refreshRealtime,
      resetApp,
      retryBoot,
      setRealtimeStation,
      setSearchStation,
      syncDelta,
    ],
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
};

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppProvider');
  }
  return ctx;
}
