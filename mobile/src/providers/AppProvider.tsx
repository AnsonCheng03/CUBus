import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type {
  AppData,
  AppBootstrapStatus,
  AppSettings,
  AppTempData,
  ModificationDates,
  NetworkError,
  RealtimeData,
  SearchStationTempState,
} from '../../../src/shared-core/app/types';
import { createRepository } from '../../../src/shared-core/data/repository';
import { asyncStorageStore } from '../lib/storage';
import { mobileApiClient } from '../lib/api';
import { i18next } from '../lib/i18n';
import { findMissingRequiredData } from './internal/requiredData';
import { DEFAULT_APP_TEMP_DATA, useTempState } from './internal/tempState';
import { usePollingLifecycle } from './internal/usePollingLifecycle';

type AppStateContextValue = {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  appSettings: AppSettings;
  setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  appTempData: AppTempData;
  setRealtimeStation: (station: string | null) => void;
  setSearchStation: (state: SearchStationTempState | null) => void;
  clearTemporaryState: () => void;
  networkError: NetworkError;
  setNetworkError: React.Dispatch<React.SetStateAction<NetworkError>>;
  realtimeData: RealtimeData;
  setRealtimeData: React.Dispatch<React.SetStateAction<RealtimeData>>;
  isDownloaded: boolean;
  setDownloadedState: React.Dispatch<React.SetStateAction<boolean>>;
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
  const [bootStatus, setBootStatus] = useState<AppBootstrapStatus>('initializing');
  const [hint, setHint] = useState('Initializing');
  const [isDownloaded, setDownloadedState] = useState(false);
  const [appData, setAppData] = useState<AppData>({});
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  const [networkError, setNetworkError] = useState<NetworkError>({ realtime: false, batch: false });
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({});

  const {
    appTempData,
    setAppTempData,
    setRealtimeStation,
    setSearchStation,
    clearTemporaryState,
  } = useTempState();

  const repoRef = useRef<ReturnType<typeof createRepository> | null>(null);
  const datesRef = useRef<ModificationDates | null>(null);
  const appDataRef = useRef<AppData>({});

  const setTrackedAppData = useCallback((updater: React.SetStateAction<AppData>) => {
    const next =
      typeof updater === 'function' ? (updater as (value: AppData) => AppData)(appDataRef.current) : updater;
    appDataRef.current = next;
    setAppData(next);
  }, []);

  const createRepositoryInstance = useCallback(() => {
    return createRepository({
      cache: asyncStorageStore,
      api: mobileApiClient,
      translator: {
        addBundle(lang, namespace, resources) {
          i18next.addResourceBundle(lang, namespace, resources, true, true);
        },
      },
      setAppData: setTrackedAppData,
      setNetworkError,
      setRealtimeData,
      setHint,
      t: (key: string) => i18next.t(key, { ns: 'preset' }) as string,
    });
  }, [setTrackedAppData]);

  const bootApp = useCallback(async () => {
    setBootStatus('initializing');
    setDownloadedState(false);
    setHint(i18next.t('DownloadFiles-Initializing', { ns: 'preset' }) as string);
    setNetworkError({ realtime: false, batch: false });

    const savedSettings = await asyncStorageStore.get<AppSettings>('appSettings');
    if (savedSettings) {
      setAppSettings(savedSettings);
    }

    repoRef.current = createRepositoryInstance();

    try {
      const current = await repoRef.current.initAndWarm();
      datesRef.current = current;
      setDownloadedState(true);

      const missing = findMissingRequiredData(appDataRef.current);
      if (missing.length > 0) {
        setBootStatus('corrupted');
        setHint(i18next.t('StoreFile-Error', { ns: 'preset' }) as string);
        return;
      }

      setBootStatus('ready');
      setHint(i18next.t('DownloadFiles-Complete', { ns: 'preset' }) as string);

      await repoRef.current.realtimeOnce();

      setTimeout(() => {
        repoRef.current
          ?.syncDelta(datesRef.current)
          .then((dates) => {
            datesRef.current = dates ?? datesRef.current;
          })
          .catch(() => {});
      }, 1200);
    } catch {
      setBootStatus('recoverable-error');
      setHint(i18next.t('StoreFile-Error', { ns: 'preset' }) as string);
    }
  }, [createRepositoryInstance]);

  useEffect(() => {
    bootApp().catch(() => {
      setBootStatus('recoverable-error');
      setHint(i18next.t('StoreFile-Error', { ns: 'preset' }) as string);
    });
  }, [bootApp]);

  useEffect(() => {
    if (bootStatus !== 'ready') {
      return;
    }

    asyncStorageStore.set('appSettings', appSettings).catch(() => {});
  }, [appSettings, bootStatus]);

  usePollingLifecycle({ bootStatus, repoRef, datesRef });

  const refreshRealtime = useCallback(async () => {
    await repoRef.current?.realtimeOnce();
  }, []);

  const syncDelta = useCallback(async () => {
    if (!repoRef.current) {
      return;
    }

    const nextDates = await repoRef.current.syncDelta(datesRef.current);
    datesRef.current = nextDates ?? datesRef.current;
  }, []);

  const resetApp = useCallback(async () => {
    await asyncStorageStore.clearAll();
    appDataRef.current = {};
    setAppData({});
    setAppSettings({});
    setRealtimeData({});
    setNetworkError({ realtime: false, batch: false });
    setAppTempData(DEFAULT_APP_TEMP_DATA);
    setDownloadedState(false);
    setBootStatus('initializing');
    await bootApp();
  }, [bootApp, setAppTempData]);

  const retryBoot = useCallback(async () => {
    await bootApp();
  }, [bootApp]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      appData,
      setAppData: setTrackedAppData,
      appSettings,
      setAppSettings,
      appTempData,
      setRealtimeStation,
      setSearchStation,
      clearTemporaryState,
      networkError,
      setNetworkError,
      realtimeData,
      setRealtimeData,
      isDownloaded,
      setDownloadedState,
      ready: bootStatus === 'ready',
      bootStatus,
      missingData: findMissingRequiredData(appData),
      hint,
      retryBoot,
      refreshRealtime,
      syncDelta,
      resetApp,
    }),
    [
      appData,
      appSettings,
      appTempData,
      bootStatus,
      clearTemporaryState,
      hint,
      isDownloaded,
      networkError,
      refreshRealtime,
      resetApp,
      retryBoot,
      realtimeData,
      setRealtimeStation,
      setSearchStation,
      setTrackedAppData,
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
