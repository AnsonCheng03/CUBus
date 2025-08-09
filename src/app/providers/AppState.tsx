import React, { createContext, useContext, useMemo, useState } from 'react';
import type {
  AppData,
  AppSettings,
  AppTempData,
  NetworkError,
  RealtimeData,
} from '@shared/types/app';

type AppState = {
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
};

const Ctx = createContext<AppState | null>(null);

export const AppStateProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [isDownloaded, setDownloadedState] = useState(false);
  const [appData, setAppData] = useState<AppData>({});
  const [appSettings, setAppSettings] = useState<AppSettings>({});
  const [networkError, setNetworkError] = useState<NetworkError>({ realtime: false, batch: false });
  const [appTempDataRaw, setAppTempDataRaw] = useState<AppTempData>({
    realTimeStation: null,
    searchStation: null,
  });
  const [realtimeData, setRealtimeData] = useState<RealtimeData>({});

  const setAppTempData = (key: string, value: unknown) => {
    setAppTempDataRaw((prev) => ({ ...prev, [key]: value }));
  };

  const value = useMemo<AppState>(
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
    }),
    [appData, appSettings, appTempDataRaw, networkError, realtimeData, isDownloaded],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAppState() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppState must be used within AppStateProvider');
  return ctx;
}
