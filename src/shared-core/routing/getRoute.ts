import type { TFunction } from 'i18next';
import type {
  AppSettings,
  BusData,
  RouteSearchInput,
  SearchMode,
  StationMap,
  StationTimetable,
} from '../app/types';
import { rankRouteCandidates } from './ranking';
import { searchRoutes } from './search';
import { filterBusBySearchWindow, resolveSearchStations } from './validation';

export type {
  BusData,
  RouteSearchErrorResult,
  RouteSearchInput,
  RouteSearchResult,
  RouteSearchResultItem,
  RouteSearchSuccessResult,
} from '../app/types';

export const calculateRoute = (
  t: TFunction,
  routeSearchStart: string,
  routeSearchDest: string,
  searchMode: SearchMode,
  selectWeekday: string,
  selectDate: string,
  selectHour: string,
  selectMinute: string,
  departNow: boolean,
  originalBus: BusData,
  station: StationMap,
  busSchedule: StationTimetable,
  busReportedSchedule: StationTimetable,
  appSettings: AppSettings,
  logRequest?: (start: string, dest: string, departNowFlag: boolean) => void,
) => {
  const routeInput: RouteSearchInput = {
    routeSearchStart,
    routeSearchDest,
    searchMode,
    selectWeekday,
    selectDate,
    selectHour,
    selectMinute,
    departNow,
  };

  const bus = filterBusBySearchWindow(
    originalBus,
    routeInput.selectWeekday,
    routeInput.selectDate,
    routeInput.selectHour,
    routeInput.selectMinute,
    routeInput.departNow,
  );

  const stationResolution = resolveSearchStations(
    routeInput.searchMode,
    routeInput.routeSearchStart,
    routeInput.routeSearchDest,
    station,
    t,
  );

  if (stationResolution.error) {
    return stationResolution;
  }

  const routeGroupResult = searchRoutes(
    stationResolution.startStation,
    stationResolution.destStation,
    bus,
    t,
  );

  if (routeGroupResult.candidates.length === 0) {
    return {
      error: true as const,
      message: 'No-BUS',
    };
  }

  if (logRequest) {
    logRequest(routeInput.routeSearchStart, routeInput.routeSearchDest, routeInput.departNow);
  }

  const sortedResults = rankRouteCandidates({
    t,
    candidates: routeGroupResult.candidates,
    bus,
    busSchedule,
    busReportedSchedule,
    appSettings,
    departNow: routeInput.departNow,
    selectHour: routeInput.selectHour,
    selectMinute: routeInput.selectMinute,
  });

  if (sortedResults.length === 0) {
    return {
      error: true as const,
      message: 'No-BUS',
    };
  }

  return {
    samestation: routeGroupResult.sameStation,
    sortedResults,
  };
};
