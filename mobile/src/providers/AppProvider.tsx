import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import type {
  AppData,
  AppSettings,
  AppTempData,
  ModificationDates,
  NetworkError,
  RealtimeData,
} from '../../../src/shared-core/app/types';
import { createRepository } from '../../../src/shared-core/data/repository';
import { asyncStorageStore } from '../lib/storage';
import { nativeApiClient } from '../lib/nativeApi';
import { i18next } from '../lib/i18n';

const Ctx = createContext<{
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  appSettings: AppSettings;
  setAppSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  appTempData: AppTempData;
  setAppTempData: (key: string, value: unknown) => void;
  networkError: NetworkError;
  setNetworkError: React.Dispatch<React.SetStateAction<NetworkError>>;
  realtimeData: RealtimeData;
  setRealtimeData: React.Dispatch<React.SetStateAction<RealtimeData>>;
  isDownloaded: boolean;
  setDownloadedState: React.Dispatch<React.SetStateAction<boolean>>;
  ready: boolean;
  hint: string;
  refreshRealtime: () => Promise<void>;
  syncDelta: () => Promise<void>;
  resetApp: () => Promise<void>;
} | null>(null);

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [ready, setReady] = useState(false);
  const [hint, setHint] = useState('Initializing');
  const [isDownloaded, setDownloadedState] = useState(false);
  const [appData, setAppData] = useState<AppData>({});
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  const [networkError, setNetworkError] = useState<NetworkError>({ realtime: false, batch: false });
  const [appTempDataRaw, setAppTempDataRaw] = useState<AppTempData>({
    realTimeStation: null,
    searchStation: null,
  });
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({});

  const repoRef = useRef<ReturnType<typeof createRepository> | null>(null);
  const datesRef = useRef<ModificationDates | null>(null);

  const setAppTempData = useCallback((key: string, value: unknown) => {
    setAppTempDataRaw((prev) => ({ ...prev, [key]: value }));
  }, []);

  const bootApp = useCallback(async () => {
    setHint(i18next.t('DownloadFiles-Initializing', { ns: 'preset' }) as string);
    const savedSettings = await asyncStorageStore.get<AppSettings>('appSettings');
    if (savedSettings) setAppSettings(savedSettings);

    repoRef.current = createRepository({
      cache: asyncStorageStore,
      api: nativeApiClient,
      translator: {
        addBundle(lang, namespace, resources) {
          i18next.addResourceBundle(lang, namespace, resources, true, true);
        },
      },
      setAppData,
      setNetworkError,
      setRealtimeData,
      setHint,
      t: (key: string) => i18next.t(key, { ns: 'preset' }) as string,
    });

    const current = await repoRef.current.initAndWarm();
    datesRef.current = current;
    setDownloadedState(true);
    setReady(true);
    setHint(i18next.t('DownloadFiles-Complete', { ns: 'preset' }) as string);

    if (repoRef.current) {
      await repoRef.current.realtimeOnce();
    }
    setTimeout(() => {
      const currentRepo = repoRef.current;
      if (!currentRepo) return;
      currentRepo
        .syncDelta(datesRef.current)
        .then((dates) => {
          datesRef.current = dates ?? datesRef.current;
        })
        .catch(() => {});
    }, 1200);
  }, []);

  useEffect(() => {
    bootApp().catch(() => {
      setReady(true);
      setHint(i18next.t('StoreFile-Error', { ns: 'preset' }) as string);
    });
  }, [bootApp]);

  useEffect(() => {
    if (!ready) return;
    asyncStorageStore.set('appSettings', appSettings).catch(() => {});
  }, [appSettings, ready]);

  useEffect(() => {
    if (!ready) return;

    let appState = AppState.currentState;
    let realtimeTimer: ReturnType<typeof setInterval> | null = null;
    let syncTimer: ReturnType<typeof setInterval> | null = null;

    const startTimers = () => {
      if (realtimeTimer || syncTimer) return;
      realtimeTimer = setInterval(() => {
        const currentRepo = repoRef.current;
        if (!currentRepo) return;
        currentRepo.realtimeOnce().catch(() => {});
      }, 10_000);
      syncTimer = setInterval(() => {
        const currentRepo = repoRef.current;
        if (!currentRepo) return;
        currentRepo
          .syncDelta(datesRef.current)
          .then((dates) => {
            datesRef.current = dates ?? datesRef.current;
          })
          .catch(() => {});
      }, 5 * 60_000);
    };

    const stopTimers = () => {
      if (realtimeTimer) clearInterval(realtimeTimer);
      if (syncTimer) clearInterval(syncTimer);
      realtimeTimer = null;
      syncTimer = null;
    };

    startTimers();
    const sub = AppState.addEventListener('change', (nextState) => {
      if (appState.match(/inactive|background/) && nextState === 'active') {
        startTimers();
        const currentRepo = repoRef.current;
        if (currentRepo) {
          currentRepo.realtimeOnce().catch(() => {});
        }
      }
      if (nextState.match(/inactive|background/)) {
        stopTimers();
      }
      appState = nextState;
    });

    return () => {
      stopTimers();
      sub.remove();
    };
  }, [ready]);

  const refreshRealtime = useCallback(async () => {
    if (repoRef.current) {
      await repoRef.current.realtimeOnce();
    }
  }, []);

  const syncDelta = useCallback(async () => {
    if (!repoRef.current) return;
    const nextDates = await repoRef.current.syncDelta(datesRef.current);
    datesRef.current = nextDates ?? datesRef.current;
  }, []);

  const resetApp = useCallback(async () => {
    await asyncStorageStore.clearAll();
    setAppData({});
    setAppSettings({});
    setRealtimeData({});
    setNetworkError({ realtime: false, batch: false });
    setAppTempDataRaw({ realTimeStation: null, searchStation: null });
    setDownloadedState(false);
    setReady(false);
    await bootApp();
  }, [bootApp]);

  const value = useMemo(
    () => ({
      appData,
      setAppData,
      appSettings,
      setAppSettings,
      appTempData: appTempDataRaw,
      setAppTempData,
      networkError,
      setNetworkError,
      realtimeData,
      setRealtimeData,
      isDownloaded,
      setDownloadedState,
      ready,
      hint,
      refreshRealtime,
      syncDelta,
      resetApp,
    }),
    [
      appData,
      appSettings,
      appTempDataRaw,
      hint,
      isDownloaded,
      networkError,
      ready,
      realtimeData,
      refreshRealtime,
      resetApp,
      setAppTempData,
      syncDelta,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used within AppProvider');
  return ctx;
}
