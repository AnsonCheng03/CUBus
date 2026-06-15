import type {
  RouteMapSelection,
  RouteSearchResultItem,
  RealtimeRow,
} from '../shared-core/app/types';

export function createRealtimeRouteMapSelection(
  row: RealtimeRow,
  token?: string,
): RouteMapSelection | null {
  if (!row.nextStation) {
    return null;
  }

  return {
    route: row.nextStation.route,
    currentIndex: row.nextStation.startIndex,
    details: {
      busNo: row.busno,
      stationIndex: row.nextStation.startIndex,
      token,
    },
  };
}

export function createRouteSearchRouteMapSelection(
  result: RouteSearchResultItem,
  token?: string,
): RouteMapSelection {
  return {
    route: result.route,
    currentIndex: result.routeIndex,
    details: {
      busNo: result.busNo,
      stationIndex: result.routeIndex,
      token,
    },
  };
}
