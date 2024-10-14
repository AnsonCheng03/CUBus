import { TFunction } from "i18next";
import { processAndSortBuses } from "./getRealTime";
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
  };
}

const logRequest = () => {
  // try {
  //     $conn = new mysqli(getenv('DB_HOST'), getenv('DB_USER'), getenv('DB_PASS'), getenv('DB_NAME'));
  //     if ($conn->connect_error)
  //         die("Connection failed: " . $conn->connect_error);
  //     $stmt = $conn->prepare("INSERT INTO `logs` (`Time`, `Webpage`, `Start`, `Dest`, `Mode`, `Departnow`, `Lang`)
  //         VALUES (?, 'routesearch', ?, ?, ?, ?, ?);");
  //     $stmt->bind_param("ssssss", $Time, $Startsql, $Destsql, $searchMode, $departNow, $lang);
  //     $Time = (new DateTime())->format('Y-m-d H:i:s');
  //     $Startsql = $searchMode == "building" ? $_POST['Startbd'] : $_POST['Start'];
  //     $Destsql = $searchMode == "building" ? $_POST['Destbd'] : $_POST['Dest'];
  //     $stmt->execute();
  //     $stmt->close();
  //     $conn->close();
  // } catch (Exception $e) {
  // }
};

const filterBus = (
  bus: BusData,
  selectWeekday: string,
  selectDate: string,
  selectHour: string,
  selectMinute: string,
  departNow: boolean
) => {
  if (departNow === false) {
    return Object.fromEntries(
      Object.entries(bus).filter(([busNumber, busData]) => {
        const currentTime = outputDate(
          `${selectHour}:${selectMinute}`
        ).getTime();
        if (!busData.schedule) return false;
        const startTime = outputDate(busData.schedule[0]).getTime();
        const endTime = outputDate(busData.schedule[1]).getTime();
        if (currentTime < startTime || currentTime > endTime) {
          return false;
        }

        if (
          !busData.schedule[3].includes(selectDate) &&
          busData.schedule[3] !== selectDate
        ) {
          return false;
        }

        if (!busData.schedule[4].includes(selectWeekday)) {
          return false;
        }

        return true;
      })
    );
  } else {
    return Object.fromEntries(
      Object.entries(bus).filter(([busNumber, busData]) => {
        if (
          busData.stats &&
          busData.stats.status === "no" &&
          busData.stats.prevstatus !== "normal"
        ) {
          return false;
        } else if (
          busData.stats &&
          busData.stats.status === "suspended" &&
          busData.stats.prevstatus !== "normal"
        ) {
          return false;
        }
        return true;
      })
    );
  }
};

const getMultiBuildingFromStation = (
  routeSearchStart: string,
  routeSearchDest: string,
  station: { [key: string]: string[] },
  t: TFunction
) => {
  let startStation = [];
  let destStation = [];
  let totalStart = 0;
  let totalDest = 0;

  const routeSearchStartbd = routeSearchStart.split(" (");
  const routeSearchDestbd = routeSearchDest.split(" (");

  if (
    !routeSearchStartbd[0] ||
    !routeSearchDestbd[0] ||
    !routeSearchStartbd[1] ||
    !routeSearchDestbd[1]
  ) {
    return {
      error: true,
      message: "warning-noinput",
    };
  } else {
    routeSearchStartbd[1] = routeSearchStartbd[1].slice(0, -1);
    routeSearchDestbd[1] = routeSearchDestbd[1].slice(0, -1);
  }

  if (
    routeSearchStartbd[0] !== t(routeSearchStartbd[1]) ||
    routeSearchDestbd[0] !== t(routeSearchDestbd[1])
  ) {
    return {
      error: true,
      message: "warning-buildingMismatch",
    };
  }

  for (const [stationCode, val] of Object.entries(station)) {
    for (const building of val as string[]) {
      if (building === routeSearchStartbd[1]) {
        totalStart++;
        startStation.push(stationCode);
      }
      if (building === routeSearchDestbd[1]) {
        totalDest++;
        destStation.push(stationCode);
      }
    }
  }

  startStation = Array.from(new Set(startStation));
  destStation = Array.from(new Set(destStation));

  if (totalStart <= 0 || totalDest <= 0) {
    return {
      error: true,
      message: "building-error",
    };
  }

  return {
    error: false,
    startStation,
    destStation,
    totalStart,
    totalDest,
  };
};

function searchRoutes(
  startStation: string[],
  destStation: string[],
  bus: BusData,
  t: TFunction
) {
  let totalDest = destStation.length;
  let totalStart = startStation.length;
  let sameStation = false;
  interface RouteResult {
    busno: string[];
    start: string[];
    end: string[];
    time: number[];
    route: string[];
    routeIndex: number[];
  }

  const routeResult: any = [];

  for (let currDest = 0; currDest < totalDest; currDest++) {
    for (let currStart = 0; currStart < totalStart; currStart++) {
      if (startStation[currStart] === destStation[currDest]) {
        sameStation = true;
        continue;
      }

      for (const [busNo, line] of Object.entries(bus)) {
        const result = searchDirection(
          startStation[currStart],
          destStation[currDest],
          busNo,
          line.stations ? line.stations.name : [],
          line.stations ? line.stations.attr : [],
          line.stations ? line.stations.time : [],
          t
        );
        for (const newResult of result) {
          const timeOutput =
            newResult.time[0] === 0
              ? "N/A"
              : Math.round(newResult.time[0] / 60);

          routeResult.push({
            [newResult.start[1]]: {
              [busNo]: {
                end: newResult.end,
                start: {
                  translatedName: newResult.start[0],
                  attr: newResult.start[2],
                },
                route: newResult.route[0],
                routeIndex: newResult.routeIndex,
                timeused: timeOutput,
              },
            },
          });
        }
      }
    }
  }

  return {
    sameStation,
    routeResult,
  };
}

const searchDirection = (
  start: string,
  dest: string,
  busno: string,
  line: string[],
  attrline: string[],
  timeline: number[],
  t: TFunction
) => {
  const possibilities: any[] = [];

  const startPositions = [];
  for (let index = 0; index < line.length; index++) {
    if (line[index] === start) {
      startPositions.push(index);
    }
  }

  startPositions.forEach((startPos) => {
    const searchLine = line.slice(startPos + 1);
    const destPositions = [];
    for (let index = 0; index < searchLine.length; index++) {
      if (searchLine[index] === dest) {
        destPositions.push(index);
      }
    }

    destPositions.forEach((relativeDestPos) => {
      const routeResult = buildRouteResult(
        busno,
        start,
        dest,
        line,
        attrline,
        timeline,
        startPos,
        relativeDestPos,
        t
      );

      if (routeResult) {
        possibilities.push(routeResult);
      }
    });
  });

  return possibilities;
};

const buildRouteResult = (
  busno: string,
  start: string,
  dest: string,
  line: string[],
  attrLine: string[],
  timeline: number[],
  startIndex: number,
  endIndex: number,
  t: TFunction
) => {
  let startPosition = t(start);
  if (attrLine[startIndex] && attrLine[startIndex] !== "NULL") {
    startPosition += ` (${t(attrLine[startIndex])})`;
  }

  const endPosition = t(dest);
  let endPositionAttr = "";
  if (attrLine[startIndex + endIndex + 1] !== "NULL") {
    endPositionAttr = ` (${t(attrLine[startIndex + endIndex + 1])})`;
  }

  const route = line
    .slice(0, startIndex + endIndex + 2)
    .map((station, index) => {
      return (
        t(station) +
        (attrLine[index] !== "NULL" ? ` (${t(attrLine[index])})` : "")
      );
    });

  return {
    busno: [busno],
    start: [startPosition, start, attrLine[startIndex] ?? null],
    end: endPosition + endPositionAttr,
    time: [
      timeline
        .slice(startIndex, startIndex + endIndex + 2)
        .reduce((acc, curr) => acc + curr, 0),
    ],
    route: [route],
    routeIndex: startIndex,
  };
};

export const calculateRoute = (
  t: TFunction,
  routeSearchStart: string,
  routeSearchDest: string,
  searchMode: string,
  selectWeekday: string,
  selectDate: string,
  selectHour: string,
  selectMinute: string,
  departNow: boolean,
  originalBus: BusData,
  station: { [key: string]: string[] },
  busSchedule: any,
  appSettings: any
) => {
  let routeCount = 0;
  let bus = filterBus(
    originalBus,
    selectWeekday,
    selectDate,
    selectHour,
    selectMinute,
    departNow
  );

  let startStation = [];
  let destStation = [];

  if (searchMode === "building") {
    const multiBuilding = getMultiBuildingFromStation(
      routeSearchStart,
      routeSearchDest,
      station,
      t
    );

    if (multiBuilding.error) {
      return multiBuilding;
    }

    startStation = multiBuilding.startStation as string[];
    destStation = multiBuilding.destStation as string[];
  } else {
    startStation = [routeSearchStart];
    destStation = [routeSearchDest];
  }

  const routeGroupResult = searchRoutes(startStation, destStation, bus, t);

  if (routeGroupResult.routeResult.length === 0) {
    return {
      error: true,
      message: "No-BUS",
    };
  }

  // $sortedResults = [];
  const sortedResults: any[] = [];

  routeGroupResult.routeResult.forEach((start: any) => {
    for (const [startStation, temp] of Object.entries(start)) {
      const outputSchedule = Object.fromEntries(
        Object.entries(busSchedule).filter(
          ([key]) => key.split("|")[0] === startStation
        )
      );

      for (const [busNo, busArray] of Object.entries(
        temp as { [key: string]: any }
      )) {
        let time = busArray.timeused;
        if (time === "N/A") {
          time = Number.MAX_SAFE_INTEGER;
        }

        const allBuses = processAndSortBuses(t, outputSchedule, bus, {
          busno: busNo,
          currtime: departNow
            ? null
            : outputDate(`${selectHour}:${selectMinute}`).toISOString(),
        });

        allBuses.forEach((busData: any) => {
          const busTime = outputDate(busData.time).getTime();

          const waitTime =
            (new Date(busTime).getTime() -
              (departNow
                ? new Date().getTime()
                : outputDate(`${selectHour}:${selectMinute}`).getTime())) /
            60000;
          const waitTimeInt = waitTime < 0 ? 0 : Math.floor(waitTime);

          if (waitTimeInt > 30) {
            return;
          }

          busArray.arrivalTime = new Date(busTime).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "numeric",
            hour12: false,
          });

          const outputTotalTime =
            appSettings.searchSortDontIncludeWaitTime === true
              ? time
              : time + waitTimeInt;

          sortedResults.push({
            time: outputTotalTime,
            busNo,
            start: busArray.start.translatedName,
            end: busArray.end,
            route: busArray.route,
            timeDisplay: busArray.timeused,
            routeIndex: busArray.routeIndex,
            arrivalTime: busArray.arrivalTime,
          });
        });
      }
    }
  });

  sortedResults.sort((a, b) => {
    if (a.time === b.time) {
      return (
        new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime()
      );
    }
    return a.time - b.time;
  });

  if (sortedResults.length === 0) {
    return {
      error: true,
      message: "No-BUS",
    };
  }

  return {
    samestation: routeGroupResult.sameStation,
    sortedResults,
  };
};
