import { TFunction } from "i18next";
import { outputDate } from "./Tools";

export interface BusData {
  [busNumber: string]: {
    schedule?: [
      string, // Start time
      string, // End time
      string, // Frequency
      string, // Days type (e.g., "TD,NT")
      string, // Days of the week
      string // Additional notes
    ];
    stations?: {
      name: string[];
      attr: string[];
      time: number[];
    };
    stats?: {
      status: string;
      prevstatus: string | null;
    };
    warning?: string;
    colorCode?: string;
  };
}

export interface GPSData
  extends Array<
    [
      string,
      {
        Lat: string;
        Lng: string;
        distance: number;
      }
    ]
  > {}

export const filterBusesBySchedule = (bus: BusData) => {
  const weekday =
    "WK-" +
    new Date().toLocaleDateString("en-US", { weekday: "short" }).toUpperCase();
  return Object.fromEntries(
    Object.entries(bus).filter(([busNumber, busData]) => {
      return (
        busData.schedule && busData.schedule[4].toUpperCase().includes(weekday)
      );
    })
  );
};

export const processBusStatus = (
  currentBusServices: any,
  thirtyMinBusService: any,
  bus: BusData
) => {
  for (const [busNumber, busStatus] of Object.entries(currentBusServices)) {
    if (!bus[busNumber]) {
      continue;
    }
    bus[busNumber]["stats"] = {
      status: busStatus as string,
      prevstatus: thirtyMinBusService[busNumber] ?? null,
    };
    if (bus[busNumber + "#"]) {
      bus[busNumber + "#"]["stats"] = bus[busNumber]["stats"];
    }
  }

  for (const [busNumber, busArr] of Object.entries(bus)) {
    if (
      busArr["stats"] &&
      busArr["stats"]["status"] === "no" &&
      busArr["stats"]["prevstatus"] !== "normal"
    ) {
      if (
        busArr["schedule"] &&
        busArr["schedule"][0] &&
        outputDate(busArr["schedule"][0] as string).getTime() >
          new Date().getTime()
      ) {
        busArr["warning"] = "First-bus-not-start";
      } else busArr["warning"] = "No-bus-available";
    } else if (busArr["stats"] && busArr["stats"]["status"] !== "normal") {
      busArr["warning"] = "Bus-status-unusual";
    } else {
      busArr["warning"] = (busArr["schedule"] && busArr["schedule"][5]) ?? "";
    }
  }
  return bus;
};

const getScheduledTimes = (
  t: TFunction,
  timetable: string[],
  busno: string,
  stationname: string,
  currtime: string,
  nowtime: string,
  warning: string | false,
  nextStation: any,
  config: { colorCode: string }
) => {
  const scheduledTimes = [];
  for (const time of timetable) {
    if (time >= currtime) {
      scheduledTimes.push({
        busno,
        direction: stationname.split("|")[1] ?? "mode-realtime",
        time: time.slice(0, -3),
        arrived: time <= nowtime,
        warning,
        nextStation,
        config,
      });
    }
  }
  return scheduledTimes;
};

const getNextStation = (
  t: TFunction,
  stations: { name: string[]; attr: string[] },
  currentStation: string,
  importantStations?: string[]
) => {
  const [currentStationName, currentStationAttr] = currentStation.split("|");
  const importantStationAfter: string[] = [];
  let foundIndex = -1;

  if (stations.name) {
    for (const [index, name] of stations.name.entries()) {
      if (foundIndex === -1) {
        if (
          name === currentStationName &&
          (currentStationAttr == "" ||
            stations.attr[index] === currentStationAttr)
        ) {
          foundIndex = index;
        }
      } else if (importantStations && importantStations.includes(name)) {
        if (importantStationAfter.includes(name)) {
          continue;
        }
        importantStationAfter.push(name);
      }
    }
  }

  if (foundIndex === -1 || foundIndex === stations.name.length - 1) {
    return null;
  }

  const route = stations.name.map((name, index) => {
    return (
      t(name) +
      (stations.attr[index] !== "NULL"
        ? " (" + t(stations.attr[index]) + ")"
        : "")
    );
  });

  for (const [index, name] of importantStationAfter.entries()) {
    importantStationAfter[index] = t(name);
  }

  return {
    route,
    stationName: stations.name[foundIndex + 1],
    startIndex: foundIndex,
    importantStationAfter,
  };
};

export const processAndSortBuses = (
  t: TFunction,
  outputSchedule: any,
  bus: BusData,
  pref: any = null
) => {
  const allBuses = [];
  const nowtime = new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const currtime = pref?.currtime
    ? new Date(pref.currtime).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : new Date(new Date().getTime() - 5 * 60 * 1000).toLocaleTimeString(
        "en-GB",
        {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }
      );

  for (const [stationname, schedule] of Object.entries(outputSchedule)) {
    for (const [busno, timetable] of Object.entries(
      schedule as { [key: string]: any }
    )) {
      if (pref?.busno && busno !== pref.busno) {
        continue;
      }

      if (bus[busno] && timetable) {
        const warning = bus[busno]["warning"] ?? false;
        const nextStation = getNextStation(
          t,
          bus[busno]["stations"] ?? { name: [], attr: [] },
          stationname,
          pref?.importantStations
        );

        allBuses.push(
          ...getScheduledTimes(
            t,
            timetable,
            busno,
            stationname,
            currtime,
            nowtime,
            warning,
            nextStation,
            {
              colorCode: bus[busno]["colorCode"] ?? "rgb(254, 250, 183)",
            }
          )
        );
      }
    }
  }

  allBuses.sort((a, b) => {
    if (a.arrived && !b.arrived) {
      return -1;
    }
    if (!a.arrived && b.arrived) {
      return 1;
    }
    return a.time.localeCompare(b.time);
  });
  return allBuses;
};

export const generateRouteResult = (
  t: TFunction,
  bus: BusData,
  appData: any,
  searchStation: String | null = null,
  setRealtimeResult: any,
  importantStations: string[],
  displayAllBus: boolean
) => {
  const busSchedule = appData["timetable.json"];
  const busServices = appData["Status.json"];

  const busServiceKeys = Object.keys(busServices);
  const currentBusServices =
    busServiceKeys.length > 0
      ? busServices[busServiceKeys[busServiceKeys.length - 1]]
      : [];
  const thirtyMinBusService =
    busServiceKeys.length >= 60
      ? busServices[busServiceKeys[busServiceKeys.length - 60]]
      : [];

  let filteredBus = {};
  if (busServiceKeys.length === 0) {
    filteredBus = filterBusesBySchedule(bus);
  } else {
    filteredBus = filterBusesBySchedule(bus);
    filteredBus = processBusStatus(
      currentBusServices,
      thirtyMinBusService,
      filteredBus
    );
  }

  const outputSchedule = Object.fromEntries(
    Object.entries(busSchedule).filter(
      ([key]) => key.split("|")[0] === searchStation
    )
  );

  const allBuses = processAndSortBuses(t, outputSchedule, filteredBus, {
    importantStations,
  });

  const allBusWithoutWarning = allBuses.filter(
    (bus) => bus.warning !== "No-bus-available"
  );

  const lastBusWithoutWarningTime =
    allBusWithoutWarning.length === 0
      ? 0
      : allBusWithoutWarning[allBusWithoutWarning.length - 1].time;

  console.log(allBusWithoutWarning, lastBusWithoutWarningTime);

  // remove all buses with warning if < lastBusWithoutWarningTime
  const finalAllBuses = allBuses.filter((bus) => {
    if (bus.warning !== "No-bus-available") return true;
    if (allBusWithoutWarning.length === 0) return true;
    if (displayAllBus) return bus.time > lastBusWithoutWarningTime;
  });

  setRealtimeResult(finalAllBuses.slice(0, 10));
  return allBuses;
};
