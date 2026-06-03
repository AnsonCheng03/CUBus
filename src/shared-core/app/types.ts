export type NetworkError = { realtime: boolean; batch: boolean };

export type PermitData = {
  name: string | null;
  sid: string | null;
  major: string | null;
  expiry: string | null;
};

export type RouteMapDetails = {
  busNo?: string;
  stationIndex?: number;
  token?: string;
};

export type RouteMapSelection = {
  route: string[];
  currentIndex: number;
  details?: RouteMapDetails;
};

export type AppBootstrapStatus =
  | 'initializing'
  | 'ready'
  | 'recoverable-error'
  | 'corrupted';

export type AppData = {
  WebsiteLinks?: any;
  bus?: unknown;
  station?: Record<string, string[]>;
  GPS?: Record<string, any>;
  notice?: unknown;
  ["timetable.json"]?: any;
  token?: string;
  [key: string]: unknown;
};

export type AppSettings = {
  searchSortDontIncludeWaitTime?: boolean;
  schoolBusPermit?: PermitData;
  [key: string]: unknown;
};

export type AppTempData = {
  realTimeStation: string | null;
  searchStation: Record<string, unknown> | null;
  [key: string]: unknown;
};

export type RealtimeData = Record<string, any>;
export type ModificationDates = Record<string, string>;

export type ServerResponse = {
  WebsiteLinks?: any;
  bus?: any;
  GPS?: any;
  notice?: any;
  station?: any;
  timetable?: any;
  translation?: { en: Record<string, string>; zh: Record<string, string> };
  token?: any;
  modificationDates?: ModificationDates;
  ["timetable.json"]?: any;
  [key: string]: any;
};
