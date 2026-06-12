import * as Location from 'expo-location';
import type { GPSDataMap } from '../../../src/shared-core/app/types';
import type { Translate } from '../../../src/shared-core/i18n/translate';
import type { Coordinates } from '../../../src/shared-core/location/nearestStations';
import { sortGpsStations } from '../../../src/shared-core/location/nearestStations';

export async function getCurrentCoordinates(t: Translate): Promise<Coordinates> {
  console.log('[gps] requesting current coordinates');

  const servicesEnabled = await Location.hasServicesEnabledAsync();
  console.log('[gps] location services state', { servicesEnabled });

  const permission = await Location.requestForegroundPermissionsAsync();
  console.log('[gps] foreground permission response', {
    granted: permission.granted,
    status: permission.status,
    canAskAgain: permission.canAskAgain,
    expires: permission.expires,
  });

  if (!permission.granted) {
    console.warn('[gps] permission denied');
    throw new Error(t('GPS-error'));
  }

  console.log('[gps] requesting current position');
  const position = await Location.getCurrentPositionAsync({});
  const coords = {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  };

  console.log('[gps] current position received', {
    accuracy: position.coords.accuracy,
    altitude: position.coords.altitude,
    heading: position.coords.heading,
    latitude: coords.latitude,
    longitude: coords.longitude,
    speed: position.coords.speed,
  });

  return coords;
}

export async function getNearestStation(t: Translate, gpsData: GPSDataMap) {
  console.log('[gps] starting nearest-station lookup', {
    gpsStationCount: Object.keys(gpsData ?? {}).length,
  });
  const coords = await getCurrentCoordinates(t);
  const sortedStations = sortGpsStations(t, gpsData, {
    latitude: coords.latitude,
    longitude: coords.longitude,
  });

  console.log('[gps] nearest station candidates', {
    topCandidate: sortedStations?.[0]?.[0] ?? null,
    topCandidateMeta: sortedStations?.[0]?.[1] ?? null,
    resultCount: sortedStations?.length ?? 0,
  });

  return sortedStations;
}
