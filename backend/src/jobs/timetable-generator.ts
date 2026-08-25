export type RouteRow = Record<string, unknown>;
export type Timetable = Record<string, Record<string, string[]>>;

export function generateTimetable(rows: RouteRow[]): Timetable {
  const routes = new Map<string, { start: string; end: string; period: string; stops: RouteRow[] }>();
  for (const row of rows) {
    const busNo = String(row.BUSNO);
    const route = routes.get(busNo) ?? {
      start: String(row.StartTime ?? ''), end: String(row.EndTime ?? ''),
      period: String(row.Period ?? ''), stops: [],
    };
    if (row.Location) route.stops.push(row);
    routes.set(busNo, route);
  }

  const output: Timetable = {};
  for (const [busNo, route] of routes) {
    const departures = getDepartures(route.start, route.end, route.period);
    let cumulativeTravel = 0;
    route.stops.slice(0, -1).forEach((stop, index) => {
      if (index > 0) cumulativeTravel += Number(route.stops[index - 1]?.TravelTime ?? 0);
      const name = `${String(stop.Location)}|${stop.Direction == null || stop.Direction === 'NULL' ? '' : String(stop.Direction)}`;
      output[name] ??= {};
      output[name][busNo] = departures.map((seconds) => formatTime(seconds + cumulativeTravel));
    });
  }
  return output;
}

function getDepartures(start: string, end: string, period: string): number[] {
  const [startHour = 0, startMinute = 0] = start.split(':').map(Number);
  const [endHour = 0, endMinute = 0] = end.split(':').map(Number);
  const values: number[] = [];
  for (const minute of period.split(',').map((value) => Number(value.replace(/[^0-9.]/g, '')))) {
    if (!Number.isFinite(minute)) continue;
    for (let hour = startHour; hour <= endHour; hour += 1) {
      if ((hour === startHour && minute < startMinute) || (hour === endHour && minute > endMinute)) continue;
      values.push(hour * 3_600 + minute * 60);
    }
  }
  return [...new Set(values)].sort((left, right) => left - right);
}

function formatTime(totalSeconds: number) {
  const normalized = ((Math.round(totalSeconds) % 86_400) + 86_400) % 86_400;
  const hours = Math.floor(normalized / 3_600);
  const minutes = Math.floor((normalized % 3_600) / 60);
  const seconds = normalized % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':');
}
