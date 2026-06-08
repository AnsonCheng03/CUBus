import { useMemo } from 'react';
import type { TFunction } from 'i18next';
import type { AppData, BusData } from '../../../src/shared-core/app/types';
import type { Coordinates } from '../../../src/shared-core/location/nearestStations';
import { distanceBetweenTwoPlace } from '../../../src/shared-core/location/nearestStations';
import type { RealtimeStationViewModel } from '../types/mobile';

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }

  return `${distanceKm.toFixed(distanceKm < 10 ? 1 : 0)}km`;
}

const MAX_VISIBLE_DISTANCE_KM = 1;

export function useRealtimeStationOptions(
  appData: AppData,
  selectedStation: string,
  currentCoords: Coordinates | null,
  t: TFunction,
  language: string,
): RealtimeStationViewModel {
  return useMemo(() => {
    const busStops = Object.values((appData.bus ?? {}) as BusData).flatMap(
      (busData) => busData.stations?.name.filter((stop): stop is string => Boolean(stop)) ?? [],
    );
    const gpsData = appData.GPS ?? {};
    const stationOptions = Array.from(new Set(busStops))
      .map((stop) => {
        const gpsStation = gpsData[stop];
        const distanceKm =
          currentCoords && gpsStation?.Lat && gpsStation?.Lng
            ? distanceBetweenTwoPlace(
                currentCoords.latitude,
                currentCoords.longitude,
                parseFloat(gpsStation.Lat),
                parseFloat(gpsStation.Lng),
                'K',
              )
            : null;

        return {
          label: t(stop),
          value: stop,
          distanceKm:
            distanceKm !== null && Number.isFinite(distanceKm) ? distanceKm : null,
          subtitle:
            distanceKm !== null &&
            Number.isFinite(distanceKm) &&
            distanceKm <= MAX_VISIBLE_DISTANCE_KM
              ? formatDistance(distanceKm)
              : undefined,
        };
      })
      .sort((left, right) => {
        if (left.distanceKm !== null && right.distanceKm !== null) {
          return left.distanceKm - right.distanceKm;
        }

        if (left.distanceKm !== null) {
          return -1;
        }

        if (right.distanceKm !== null) {
          return 1;
        }

        return left.label.localeCompare(right.label);
      })
      .map(({ distanceKm: _distanceKm, ...option }) => option);

    const importantStations = Object.keys(gpsData).filter(
      (key) => gpsData[key]?.ImportantStation !== null,
    );

    return {
      stationOptions,
      importantStations,
      groupedNearbyStops: gpsData[selectedStation]?.Grouped ?? [],
    };
  }, [appData.GPS, appData.bus, currentCoords, language, selectedStation, t]);
}
