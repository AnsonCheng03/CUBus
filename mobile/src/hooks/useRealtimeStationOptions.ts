import { useMemo } from 'react';
import type { TFunction } from 'i18next';
import type { AppData, BusData } from '../../../src/shared-core/app/types';
import type { RealtimeStationViewModel } from '../types/mobile';

export function useRealtimeStationOptions(
  appData: AppData,
  selectedStation: string,
  t: TFunction,
): RealtimeStationViewModel {
  return useMemo(() => {
    const busStops = Object.values((appData.bus ?? {}) as BusData).flatMap(
      (busData) => busData.stations?.name.filter((stop): stop is string => Boolean(stop)) ?? [],
    );
    const stationOptions = Array.from(new Set(busStops))
      .sort()
      .map((stop) => ({ label: t(stop), value: stop }));

    const gpsData = appData.GPS ?? {};
    const importantStations = Object.keys(gpsData).filter(
      (key) => gpsData[key]?.ImportantStation !== null,
    );

    return {
      stationOptions,
      importantStations,
      groupedNearbyStops: gpsData[selectedStation]?.Grouped ?? [],
    };
  }, [appData.GPS, appData.bus, selectedStation, t]);
}
