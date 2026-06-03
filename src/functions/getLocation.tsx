import { TFunction } from 'i18next';
import { Geolocation } from '@capacitor/geolocation';
import { sortGpsStations } from '../shared-core/location/nearestStations';

export async function getLocation(
  t: TFunction,
  gpsData: any,
  setSortedGPSData?: any,
  closeModal?: any,
) {
  try {
    if (closeModal) closeModal(true);
    const position = await Geolocation.getCurrentPosition();
    const sortedGpsData = sortGpsStations(t, gpsData, {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    });

    if (setSortedGPSData) {
      setSortedGPSData(sortedGpsData);
      return undefined;
    }

    return sortedGpsData;
  } catch (error: any) {
    if (setSortedGPSData) {
      setSortedGPSData([[t('GPS-error') + ': ' + error.message, { error: true }]]);
    }
    return [];
  }
}
