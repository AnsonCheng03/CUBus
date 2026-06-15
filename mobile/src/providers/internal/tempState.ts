import { useCallback, useState } from 'react';
import type { AppTempData, SearchStationTempState } from '../../shared-core/app/types';

export const DEFAULT_APP_TEMP_DATA: AppTempData = {
  realTimeStation: null,
  searchStation: null,
};

export function useTempState() {
  const [appTempData, setAppTempData] = useState<AppTempData>(DEFAULT_APP_TEMP_DATA);

  const setRealtimeStation = useCallback((station: string | null) => {
    setAppTempData((prev) => ({ ...prev, realTimeStation: station }));
  }, []);

  const setSearchStation = useCallback((searchStation: SearchStationTempState | null) => {
    setAppTempData((prev) => ({ ...prev, searchStation }));
  }, []);

  const clearTemporaryState = useCallback(() => {
    setAppTempData(DEFAULT_APP_TEMP_DATA);
  }, []);

  return {
    appTempData,
    setAppTempData,
    setRealtimeStation,
    setSearchStation,
    clearTemporaryState,
  };
}
