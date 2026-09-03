export type LanguageCode = 'en' | 'zh';

export type NetworkError = { realtime: boolean; batch: boolean };

export type PermitData = {
  name: string | null;
  sid: string | null;
  major: string | null;
  expiry: string | null;
  busMode?: 'shuttle_bus' | 'meet_class_bus';
};

export type SearchStationTempState = {
  routeSearchStart?: string;
  routeSearchDest?: string;
  departNow?: boolean;
  selectWeekday?: string;
  selectDate?: string;
  selectHour?: string;
  selectMinute?: string;
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

export type BusSchedule = [string, string, string, string, string, string];

export type BusStationSequence = {
  name: string[];
  attr: string[];
  time: number[];
};

export type BusStatusCode = 'normal' | 'delay' | 'suspended' | 'no' | string;

export type BusStatusInfo = {
  status: BusStatusCode;
  prevstatus: BusStatusCode | null;
};

export type BusEntry = {
  schedule?: BusSchedule;
  stations?: BusStationSequence;
  stats?: BusStatusInfo;
  warning?: string;
  colorCode?: string;
  scheduleType?: string;
  scheduleConfig?: {
    count?: number;
  };
};

export type BusData = Record<string, BusEntry>;

export type GPSStationInfo = {
  Lat: string;
  Lng: string;
  Grouped?: string[];
  ImportantStation?: string | null;
  distance?: number;
  error?: boolean;
  [key: string]: unknown;
};

export type GPSDataMap = Record<string, GPSStationInfo>;

export type NoticeItem = {
  id: number;
  content?: string[];
  pref?: {
    hide?: boolean | number | string;
    link?: string;
    type?:
      | 'primary'
      | 'secondary'
      | 'tertiary'
      | 'success'
      | 'warning'
      | 'danger'
      | 'light'
      | 'medium'
      | 'dark';
    dismissible?: boolean;
    duration?: number;
  };
};

export type WebsiteLink = [string[], string];

export type TranslationBundle = Record<string, string>;

export type TranslationPayload = {
  en?: TranslationBundle;
  zh?: TranslationBundle;
};

export type StationMap = Record<string, string[]>;

export type TimetableEntry = string | { average_time: string; count?: number };
export type TimetableRecord = Record<string, TimetableEntry[]>;
export type StationTimetable = Record<string, TimetableRecord>;

export type RealtimeStatusSnapshot = Record<string, BusStatusCode>;
export type RealtimeStatusTimeline = Record<string, RealtimeStatusSnapshot>;

export type RealtimeData = {
  'Status.json'?: RealtimeStatusTimeline;
  'reportedTime.json'?: StationTimetable;
  [key: string]: unknown;
};

export type AppData = {
  WebsiteLinks?: WebsiteLink[];
  bus?: BusData;
  station?: StationMap;
  GPS?: GPSDataMap;
  notice?: NoticeItem[];
  'timetable.json'?: StationTimetable;
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
  searchStation: SearchStationTempState | null;
};

export type ModificationDates = Record<string, string>;

export type ServerResponse = {
  WebsiteLinks?: WebsiteLink[];
  bus?: BusData;
  GPS?: GPSDataMap;
  notice?: NoticeItem[];
  station?: StationMap;
  timetable?: StationTimetable;
  translation?: TranslationPayload;
  token?: string;
  modificationDates?: ModificationDates;
  'timetable.json'?: StationTimetable;
  [key: string]: unknown;
};

export type SearchMode = 'building' | 'station' | string;

export type RouteSearchInput = {
  routeSearchStart: string;
  routeSearchDest: string;
  searchMode: SearchMode;
  selectWeekday: string;
  selectDate: string;
  selectHour: string;
  selectMinute: string;
  departNow: boolean;
};

export type RouteSearchErrorResult = {
  error: true;
  message: string;
};

export type RouteSearchResultItem = {
  time: number;
  outputTime: number;
  waitTime: number;
  busNo: string;
  start: string;
  end: string;
  route: string[];
  timeDisplay: string | number;
  routeIndex: number;
  arrivalTime: string;
  config: {
    colorCode?: string;
    scheduleType?: string;
    scheduleConfig?: {
      count?: number;
    };
  };
  warning?: string | false;
};

export type RouteSearchSuccessResult = {
  samestation: boolean;
  sortedResults: RouteSearchResultItem[];
};

export type RouteSearchResult = RouteSearchSuccessResult | RouteSearchErrorResult;

export type RealtimeNextStation = {
  route: string[];
  stationName: string;
  startIndex: number;
  importantStationAfter: string[];
};

export type RealtimeRowConfig = {
  colorCode: string;
  scheduleType?: string;
  scheduleConfig?: {
    count?: number;
  };
};

export type RealtimeRow = {
  busno: string;
  direction: string;
  time: string;
  arrived: boolean;
  warning: string | false;
  nextStation: RealtimeNextStation | null;
  config: RealtimeRowConfig;
};

export type SearchLogPayload = {
  start: string;
  dest: string;
  departNow: boolean;
  lang: string;
  token: string;
};

export type RealtimeLogPayload = {
  dest: string;
  lang: string;
  token: string;
};

export type GenericLogPayload = Record<string, unknown>;
