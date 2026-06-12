import type {
  BusData,
  RealtimeNextStation,
  RealtimeRow,
  RealtimeRowConfig,
  StationTimetable,
  TimetableEntry,
} from '../app/types';
import type { Translate } from '../i18n/translate';

function getScheduleTimeValue(entry: TimetableEntry, config: RealtimeRowConfig) {
  return config.scheduleType === 'reported' && typeof entry === 'object'
    ? entry.average_time
    : (entry as string);
}

function getReportedConfig(entry: TimetableEntry, config: RealtimeRowConfig): RealtimeRowConfig {
  if (config.scheduleType !== 'reported') {
    return config;
  }

  return {
    ...config,
    scheduleConfig: {
      count: typeof entry === 'object' ? entry.count : undefined,
    },
  };
}

function getScheduledTimes(
  busno: string,
  stationname: string,
  timetable: TimetableEntry[],
  currtime: string,
  nowtime: string,
  warning: string | false,
  nextStation: RealtimeNextStation | null,
  config: RealtimeRowConfig,
) {
  const scheduledTimes: RealtimeRow[] = [];

  for (const entry of timetable) {
    const timeValue = getScheduleTimeValue(entry, config);
    if (timeValue < currtime) {
      continue;
    }

    scheduledTimes.push({
      busno,
      direction: stationname.split('|')[1] ?? 'mode-realtime',
      time: timeValue.slice(0, -3),
      arrived: timeValue <= nowtime,
      warning,
      nextStation,
      config: getReportedConfig(entry, config),
    });
  }

  return scheduledTimes;
}

export function getNextStation(
  t: Translate,
  stations: { name: string[]; attr: string[] },
  currentStation: string,
  importantStations?: string[],
) {
  const [currentStationName, currentStationAttr] = currentStation.split('|');
  const importantStationAfter: string[] = [];
  let foundIndex = -1;

  for (const [index, name] of stations.name.entries()) {
    if (foundIndex === -1) {
      if (name === currentStationName && (currentStationAttr === '' || stations.attr[index] === currentStationAttr)) {
        foundIndex = index;
      }
      continue;
    }

    if (importantStations?.includes(name) && !importantStationAfter.includes(name)) {
      importantStationAfter.push(name);
    }
  }

  if (foundIndex === -1 || foundIndex === stations.name.length - 1) {
    return null;
  }

  const route = stations.name.map((name, index) =>
    `${t(name)}${stations.attr[index] !== 'NULL' ? ` (${t(stations.attr[index])})` : ''}`,
  );

  return {
    route,
    stationName: stations.name[foundIndex + 1],
    startIndex: foundIndex,
    importantStationAfter: importantStationAfter.map((name) => t(name)),
  };
}

export function processAndSortBuses(
  t: Translate,
  outputSchedule: StationTimetable[],
  bus: BusData,
  pref: {
    busno?: string;
    currtime?: string | Date | null;
    importantStations?: string[];
  } = {},
) {
  const allBuses: RealtimeRow[] = [];
  const nowtime = new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const currtime =
    pref.currtime != null
      ? new Date(pref.currtime).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : new Date(new Date().getTime() - 5 * 60 * 1000).toLocaleTimeString('en-GB', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });

  outputSchedule.forEach((scheduleValue, scheduleType) => {
    for (const [stationname, schedule] of Object.entries(scheduleValue)) {
      for (const [busno, timetable] of Object.entries(schedule)) {
        if (pref.busno && busno !== pref.busno) {
          continue;
        }

        if (!bus[busno] || !timetable) {
          continue;
        }

        const warning = bus[busno].warning ?? false;
        const nextStation = getNextStation(
          t,
          bus[busno].stations ?? { name: [], attr: [] },
          stationname,
          pref.importantStations,
        );

        allBuses.push(
          ...getScheduledTimes(
            busno,
            stationname,
            timetable,
            currtime,
            nowtime,
            warning,
            nextStation,
            {
              colorCode: bus[busno].colorCode ?? 'rgb(254, 250, 183)',
              scheduleType: scheduleType === 1 ? 'reported' : undefined,
            },
          ),
        );
      }
    }
  });

  allBuses.sort((left, right) => {
    if (left.arrived && !right.arrived) return -1;
    if (!left.arrived && right.arrived) return 1;
    return left.time.localeCompare(right.time);
  });

  return allBuses;
}

export function pickSchedulesForStation(source: StationTimetable | undefined, stationName: string) {
  if (!source) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(source).filter(([key]) => key.split('|')[0] === stationName),
  );
}
