import type { BusData, RealtimeData, StationTimetable } from '../app/types';
import type { Translate } from '../i18n/translate';
import { filterBusesBySchedule, getRealtimeServiceSnapshots, processBusStatus } from './status';
import { pickSchedulesForStation, processAndSortBuses } from './schedule';

export type {
  BusData,
  BusEntry,
  BusStatusCode,
  GPSDataMap as GPSData,
  RealtimeNextStation,
  RealtimeRow,
  RealtimeRowConfig,
  RealtimeStatusSnapshot,
  RealtimeStatusTimeline,
} from '../app/types';
export { filterBusesBySchedule, processAndSortBuses, processBusStatus };

export const generateRouteResult = (
  t: Translate,
  bus: BusData,
  appData: { 'timetable.json'?: StationTimetable },
  realtimeData: RealtimeData,
  searchStation: string | null = null,
  setRealtimeResult: (rows: ReturnType<typeof processAndSortBuses>) => void,
  importantStations: string[],
  displayAllBus: boolean,
  setFetchError: (value: boolean) => void,
) => {
  const busSchedule = appData['timetable.json'];
  const busReportedSchedule = realtimeData['reportedTime.json'] ?? {};
  const busServices = realtimeData['Status.json'] ?? {};

  const { current, thirtyMinutesAgo } = getRealtimeServiceSnapshots(busServices);

  let filteredBus = filterBusesBySchedule(bus);
  if (Object.keys(busServices).length > 0) {
    filteredBus = processBusStatus(current, thirtyMinutesAgo, filteredBus, setFetchError);
  }

  const allBuses = processAndSortBuses(
    t,
    [
      pickSchedulesForStation(busSchedule, searchStation ?? ''),
      pickSchedulesForStation(busReportedSchedule, searchStation ?? ''),
    ],
    filteredBus,
    { importantStations },
  );

  const allBusWithoutWarning = allBuses.filter((entry) => entry.warning !== 'No-bus-available');
  const lastBusWithoutWarningTime =
    allBusWithoutWarning.length === 0
      ? ''
      : allBusWithoutWarning[allBusWithoutWarning.length - 1].time;

  const finalAllBuses = allBuses.filter((entry) => {
    if (entry.warning !== 'No-bus-available') return true;
    if (allBusWithoutWarning.length === 0) return true;
    return displayAllBus ? entry.time > lastBusWithoutWarningTime : false;
  });

  setRealtimeResult(finalAllBuses.slice(0, 10));
  return allBuses;
};
