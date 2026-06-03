import * as Location from 'expo-location';
import type { TFunction } from 'i18next';
import { sortGpsStations } from '../../../src/shared-core/location/nearestStations';

export async function getNearestStation(t: TFunction, gpsData: Record<string, any>) {
  const permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) {
    throw new Error(t('GPS-error'));
  }

  const position = await Location.getCurrentPositionAsync({});
  return sortGpsStations(t, gpsData, {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
  });
}
