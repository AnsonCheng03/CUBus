import type { BusData, RouteSearchErrorResult, SearchMode, StationMap } from '../app/types';
import type { Translate } from '../i18n/translate';
import { outputDate } from '../utils/tools';

type StationResolution =
  | RouteSearchErrorResult
  | {
      error: false;
      startStation: string[];
      destStation: string[];
      totalStart: number;
      totalDest: number;
    };

export function filterBusBySearchWindow(
  bus: BusData,
  selectWeekday: string,
  selectDate: string,
  selectHour: string,
  selectMinute: string,
  departNow: boolean,
) {
  if (departNow) {
    return { ...bus };
  }

  return Object.fromEntries(
    Object.entries(bus).filter(([, busData]) => {
      const currentTime = outputDate(`${selectHour}:${selectMinute}`).getTime();
      if (!busData.schedule) return false;

      const endTime = outputDate(busData.schedule[1]).getTime();
      if (currentTime > endTime) return false;

      if (!busData.schedule[3].includes(selectDate) && busData.schedule[3] !== selectDate) {
        return false;
      }

      return busData.schedule[4].includes(selectWeekday);
    }),
  );
}

export function resolveRouteSearchStations(
  routeSearchStart: string,
  routeSearchDest: string,
  station: StationMap,
  t: Translate,
): StationResolution {
  const startStation: string[] = [];
  const destStation: string[] = [];
  let totalStart = 0;
  let totalDest = 0;

  const routeSearchStartbd = routeSearchStart.split(' (');
  const routeSearchDestbd = routeSearchDest.split(' (');

  if (!routeSearchStartbd[0] || !routeSearchStartbd[1] || !routeSearchDestbd[0] || !routeSearchDestbd[1]) {
    return {
      error: true,
      message: 'warning-noinput',
    };
  }

  routeSearchStartbd[1] = routeSearchStartbd[1].slice(0, -1);
  routeSearchDestbd[1] = routeSearchDestbd[1].slice(0, -1);

  if (routeSearchStartbd[0] !== t(routeSearchStartbd[1]) || routeSearchDestbd[0] !== t(routeSearchDestbd[1])) {
    return {
      error: true,
      message: t('warningBuildingMismatch'),
    };
  }

  for (const [stationCode, buildings] of Object.entries(station)) {
    for (const building of buildings) {
      if (building === routeSearchStartbd[1]) {
        totalStart += 1;
        startStation.push(stationCode);
      }
      if (building === routeSearchDestbd[1]) {
        totalDest += 1;
        destStation.push(stationCode);
      }
    }
  }

  if (totalStart <= 0 || totalDest <= 0) {
    return {
      error: true,
      message: 'building-error',
    };
  }

  return {
    error: false,
    startStation: Array.from(new Set(startStation)),
    destStation: Array.from(new Set(destStation)),
    totalStart,
    totalDest,
  };
}

export function resolveSearchStations(
  searchMode: SearchMode,
  routeSearchStart: string,
  routeSearchDest: string,
  station: StationMap,
  t: Translate,
) {
  if (searchMode === 'building') {
    return resolveRouteSearchStations(routeSearchStart, routeSearchDest, station, t);
  }

  return {
    error: false as const,
    startStation: [routeSearchStart],
    destStation: [routeSearchDest],
    totalStart: 1,
    totalDest: 1,
  };
}
