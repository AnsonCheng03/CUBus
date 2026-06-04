import { useCallback } from 'react';
import type { TFunction } from 'i18next';
import type { GPSDataMap } from '../../../src/shared-core/app/types';
import { getNearestStation } from '../lib/location';

export function formatTranslatedStationLabel(t: TFunction, stationCode: string) {
  return `${t(stationCode)} (${stationCode.toUpperCase()})`;
}

export async function resolveNearestStationCode(t: TFunction, gpsData: GPSDataMap) {
  const result = await getNearestStation(t, gpsData);
  const candidate = result?.[0]?.[0];
  const metadata = result?.[0]?.[1];
  if (!candidate || metadata?.error) {
    return null;
  }
  return candidate;
}

export function useNearestStation(t: TFunction, gpsData: GPSDataMap) {
  return useCallback(async () => resolveNearestStationCode(t, gpsData), [gpsData, t]);
}
