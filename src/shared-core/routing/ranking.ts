import type { TFunction } from 'i18next';
import type {
  AppSettings,
  BusData,
  RouteSearchResultItem,
  StationTimetable,
} from '../app/types';
import { processAndSortBuses, pickSchedulesForStation } from '../realtime/schedule';
import { outputDate } from '../utils/tools';
import type { RouteCandidate } from './search';

type RankRouteCandidatesArgs = {
  t: TFunction;
  candidates: RouteCandidate[];
  bus: BusData;
  busSchedule: StationTimetable;
  busReportedSchedule: StationTimetable;
  appSettings: AppSettings;
  departNow: boolean;
  selectHour: string;
  selectMinute: string;
};

export function rankRouteCandidates({
  t,
  candidates,
  bus,
  busSchedule,
  busReportedSchedule,
  appSettings,
  departNow,
  selectHour,
  selectMinute,
}: RankRouteCandidatesArgs) {
  let maxTimeWithoutWarning = 0;
  const sortedResults: RouteSearchResultItem[] = [];

  candidates.forEach((candidate) => {
    const outputSchedule = pickSchedulesForStation(busSchedule, candidate.startStationCode);
    const reportedSchedule = pickSchedulesForStation(busReportedSchedule, candidate.startStationCode);
    const routeTravelMinutes =
      candidate.timeused === 'N/A' ? Number.MAX_SAFE_INTEGER : candidate.timeused;

    const allBuses = processAndSortBuses(t, [outputSchedule, reportedSchedule], bus, {
      busno: candidate.busNo,
      currtime: departNow ? null : outputDate(`${selectHour}:${selectMinute}`).toISOString(),
    });

    allBuses.forEach((busData) => {
      const busTime = outputDate(busData.time).getTime();
      const selectedTime = departNow
        ? new Date().getTime()
        : outputDate(`${selectHour}:${selectMinute}`).getTime();
      const waitTime = (busTime - selectedTime) / 60000;
      const waitTimeInt = waitTime < 0 ? 0 : Math.floor(waitTime);
      const arrivalTime = new Date(busTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });

      if (waitTimeInt > maxTimeWithoutWarning && busData.warning !== 'No-bus-available') {
        maxTimeWithoutWarning = waitTimeInt > 60 ? 60 : waitTimeInt;
      }

      if (routeTravelMinutes + waitTimeInt > 60) {
        return;
      }

      const outputTotalTime =
        appSettings.searchSortDontIncludeWaitTime === true
          ? routeTravelMinutes
          : routeTravelMinutes + waitTimeInt;

      sortedResults.push({
        time: outputTotalTime,
        outputTime: routeTravelMinutes,
        waitTime: waitTimeInt,
        busNo: candidate.busNo,
        start: candidate.start.translatedName,
        end: candidate.end,
        route: candidate.route,
        timeDisplay: candidate.timeused,
        routeIndex: candidate.routeIndex,
        arrivalTime,
        config: busData.config || {},
        warning: departNow ? busData.warning : false,
      });
    });
  });

  return sortedResults
    .filter((busRow) => {
      if (busRow.warning !== 'No-bus-available') return true;
      return busRow.waitTime > maxTimeWithoutWarning;
    })
    .sort((left, right) => {
      if (left.time === right.time) {
        return new Date(left.arrivalTime).getTime() - new Date(right.arrivalTime).getTime();
      }
      return left.time - right.time;
    });
}
