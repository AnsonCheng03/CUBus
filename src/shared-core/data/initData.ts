import gps from '../../initDatas/gps.json';
import Route from '../../initDatas/Route.json';
import station from '../../initDatas/station.json';
import notice from '../../initDatas/notice.json';
import website from '../../initDatas/website.json';
import translation from '../../initDatas/translation.json';
import timetable from '../../initDatas/timetable.json';
import lastModifiedDates from '../../initDatas/lastModifiedDates.json';
import type { ModificationDates } from '../app/types';

export const localSeed: Record<string, any> = {
  translation,
  website,
  Route,
  gps,
  notice,
  station,
  'timetable.json': timetable,
};

export const seedDates = lastModifiedDates as ModificationDates;
