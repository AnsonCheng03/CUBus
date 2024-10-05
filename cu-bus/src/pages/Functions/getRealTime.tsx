import { TFunction } from "i18next";

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
      busArr["warning"] = "No-bus-available";
    } else if (busArr["stats"] && busArr["stats"]["status"] !== "normal") {
      busArr["warning"] = "Bus-status-unusual";
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
  nextStation: any
) => {
  const scheduledTimes = [];
  for (const time of timetable) {
    if (time >= currtime) {
      scheduledTimes.push({
        busno,
        direction: t(stationname.split("|")[1]) ?? t("mode-realtime"),
        time: time.slice(0, -3),
        arrived: time <= nowtime,
        warning,
        nextStation,
      });
    }
  }
  return scheduledTimes;
};

const getNextStation = (
  t: TFunction,
  stations: { name: string[]; attr: string[] },
  currentStation: string
) => {
  const [currentStationName, currentStationAttr] = currentStation.split("|");
  let foundIndex = -1;

  if (stations.name) {
    for (const [index, name] of stations.name.entries()) {
      if (
        name === currentStationName &&
        (currentStationAttr == "" ||
          stations.attr[index] === currentStationAttr)
      ) {
        foundIndex = index;
        break;
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

  return {
    route,
    stationName: stations.name[foundIndex + 1],
    startIndex: foundIndex,
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
          stationname
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
            nextStation
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
  setRealtimeResult: any
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

  const allBuses = processAndSortBuses(t, outputSchedule, filteredBus);
  setRealtimeResult(allBuses);
};
