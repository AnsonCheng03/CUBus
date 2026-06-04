import type {
  NoticeItem,
  PermitData,
  RealtimeRow,
  RouteSearchResult,
  RouteSearchResultItem,
  SearchStationTempState,
  WebsiteLink,
} from '../../../src/shared-core/app/types';

export type { NoticeItem, WebsiteLink, SearchStationTempState };
export type RealtimeRowData = RealtimeRow;
export type RouteSearchResultData = RouteSearchResult;
export type RouteSearchResultCard = RouteSearchResultItem;

export type RouteSearchPickerType = 'weekday' | 'date' | 'hour' | 'minute';

export type RouteSearchPickerValues = {
  weekday: string;
  date: string;
  hour: string;
  minute: string;
};

export type RouteSearchFormValue = Required<SearchStationTempState>;

export type RealtimeStationViewModel = {
  stationOptions: Array<{ label: string; value: string }>;
  groupedNearbyStops: string[];
  importantStations: string[];
};

export type PermitFormValue = {
  name: string;
  sid: string;
  major: string;
  expiry: string;
};
