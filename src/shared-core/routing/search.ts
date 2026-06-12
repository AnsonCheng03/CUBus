import type { BusData } from '../app/types';
import type { Translate } from '../i18n/translate';

export type RouteCandidate = {
  startStationCode: string;
  busNo: string;
  start: {
    translatedName: string;
    attr: string | null;
  };
  end: string;
  route: string[];
  routeIndex: number;
  timeused: number | 'N/A';
};

function buildRouteCandidate(
  busno: string,
  start: string,
  dest: string,
  line: string[],
  attrLine: string[],
  timeline: number[],
  startIndex: number,
  endIndex: number,
  t: Translate,
): RouteCandidate {
  let startPosition = t(start);
  if (attrLine[startIndex] && attrLine[startIndex] !== 'NULL') {
    startPosition += ` (${t(attrLine[startIndex])})`;
  }

  const endPosition = t(dest);
  const endAttrIndex = startIndex + endIndex + 1;
  const endPositionAttr =
    attrLine[endAttrIndex] && attrLine[endAttrIndex] !== 'NULL'
      ? ` (${t(attrLine[endAttrIndex])})`
      : '';

  const route = line.slice(0, endAttrIndex + 1).map((station, index) => {
    return `${t(station)}${attrLine[index] !== 'NULL' ? ` (${t(attrLine[index])})` : ''}`;
  });

  const totalTravelSeconds = timeline
    .slice(startIndex, endAttrIndex + 1)
    .reduce((acc, curr) => acc + curr, 0);

  return {
    startStationCode: start,
    busNo: busno,
    start: {
      translatedName: startPosition,
      attr: attrLine[startIndex] ?? null,
    },
    end: endPosition + endPositionAttr,
    route,
    routeIndex: startIndex,
    timeused: totalTravelSeconds === 0 ? 'N/A' : Math.round(totalTravelSeconds / 60),
  };
}

function searchDirection(
  start: string,
  dest: string,
  busno: string,
  line: string[],
  attrline: string[],
  timeline: number[],
  t: Translate,
) {
  const possibilities: RouteCandidate[] = [];
  const startPositions: number[] = [];

  for (let index = 0; index < line.length; index += 1) {
    if (line[index] === start) {
      startPositions.push(index);
    }
  }

  startPositions.forEach((startPos) => {
    const searchLine = line.slice(startPos + 1);
    const destPositions: number[] = [];

    for (let index = 0; index < searchLine.length; index += 1) {
      if (searchLine[index] === dest) {
        destPositions.push(index);
      }
    }

    destPositions.forEach((relativeDestPos) => {
      possibilities.push(
        buildRouteCandidate(
          busno,
          start,
          dest,
          line,
          attrline,
          timeline,
          startPos,
          relativeDestPos,
          t,
        ),
      );
    });
  });

  return possibilities;
}

export function searchRoutes(
  startStation: string[],
  destStation: string[],
  bus: BusData,
  t: Translate,
) {
  const candidates: RouteCandidate[] = [];
  let sameStation = false;

  for (const currentDest of destStation) {
    for (const currentStart of startStation) {
      if (currentStart === currentDest) {
        sameStation = true;
        continue;
      }

      for (const [busNo, line] of Object.entries(bus)) {
        candidates.push(
          ...searchDirection(
            currentStart,
            currentDest,
            busNo,
            line.stations?.name ?? [],
            line.stations?.attr ?? [],
            line.stations?.time ?? [],
            t,
          ),
        );
      }
    }
  }

  return { sameStation, candidates };
}
