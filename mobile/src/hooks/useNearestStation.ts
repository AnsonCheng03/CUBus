import { useCallback } from 'react';
import type { TFunction } from 'i18next';
import type { GPSDataMap } from '../../../src/shared-core/app/types';
import type { Coordinates } from '../../../src/shared-core/location/nearestStations';
import { sortGpsStations } from '../../../src/shared-core/location/nearestStations';
import { getNearestStation } from '../lib/location';

export function formatTranslatedStationLabel(t: TFunction, stationCode: string) {
  return `${t(stationCode)} (${stationCode.toUpperCase()})`;
}

function resolveNearestStationResult(
  result: Awaited<ReturnType<typeof getNearestStation>>,
) {
  const candidate = result?.[0]?.[0];
  const metadata = result?.[0]?.[1];
  console.log('[gps] resolved nearest station code', {
    candidate: candidate ?? null,
    metadata: metadata ?? null,
  });
  if (!candidate || metadata?.error) {
    console.warn('[gps] nearest station resolution failed', {
      hasCandidate: Boolean(candidate),
      metadataError: metadata?.error ?? null,
    });
    if (candidate) {
      throw new Error(candidate);
    }
    return null;
  }
  return candidate;
}

export async function resolveNearestStationCode(t: TFunction, gpsData: GPSDataMap) {
  return resolveNearestStationResult(await getNearestStation(t, gpsData));
}

export function resolveNearestStationCodeFromCoordinates(
  t: TFunction,
  gpsData: GPSDataMap,
  coords: Coordinates,
) {
  return resolveNearestStationResult(sortGpsStations(t, gpsData, coords));
}

export function useNearestStation(t: TFunction, gpsData: GPSDataMap) {
  return useCallback(async () => resolveNearestStationCode(t, gpsData), [gpsData, t]);
}
