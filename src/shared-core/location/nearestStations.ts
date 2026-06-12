import type { Translate } from '../i18n/translate';

interface GPSPoint {
  Lat: string;
  Lng: string;
  distance?: number;
  error?: boolean;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export type GPSData = Record<string, GPSPoint>;

export function distanceBetweenTwoPlace(
  firstLat: number,
  firstLon: number,
  secondLat: number,
  secondLon: number,
  unit: string,
) {
  const firstRadlat = (Math.PI * firstLat) / 180;
  const secondRadlat = (Math.PI * secondLat) / 180;
  const theta = firstLon - secondLon;
  const radtheta = (Math.PI * theta) / 180;
  let distance =
    Math.sin(firstRadlat) * Math.sin(secondRadlat) +
    Math.cos(firstRadlat) * Math.cos(secondRadlat) * Math.cos(radtheta);
  if (distance > 1) distance = 1;
  distance = Math.acos(distance);
  distance = (distance * 180) / Math.PI;
  distance = distance * 60 * 1.1515;
  if (unit === 'K') distance = distance * 1.609344;
  if (unit === 'N') distance = distance * 0.8684;
  return distance;
}

export function sortGpsStations(t: Translate, gpsData: GPSData, coords: Coordinates) {
  const updatedGpsData: GPSData = { ...gpsData };
  for (const key in updatedGpsData) {
    updatedGpsData[key].distance = distanceBetweenTwoPlace(
      coords.latitude,
      coords.longitude,
      parseFloat(updatedGpsData[key].Lat),
      parseFloat(updatedGpsData[key].Lng),
      'K',
    );
  }

  const sortedGpsData = Object.entries(updatedGpsData).sort(
    (a, b) => (a[1].distance || 0) - (b[1].distance || 0),
  );

  if ((sortedGpsData[0]?.[1].distance || 0) > 0.5) {
    return [[t('nearst_error'), { error: true } as GPSPoint]] as [string, GPSPoint][];
  }

  return sortedGpsData;
}
