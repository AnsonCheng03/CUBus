import type { AppData } from '../../shared-core/app/types';

export const REQUIRED_DATA_KEYS = [
  'timetable.json',
  'bus',
  'notice',
  'station',
  'GPS',
  'WebsiteLinks',
] as const;

export function findMissingRequiredData(appData: AppData) {
  return REQUIRED_DATA_KEYS.filter((key) => !appData[key]);
}
