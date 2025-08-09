export type NetworkError = { realtime: boolean; batch: boolean };

export type AppData = {
  bus?: unknown;
  station?: Record<string, string[]>;
  GPS?: Record<string, any>;
  notice?: unknown;
  token?: string;
  [k: string]: unknown;
};

export type AppSettings = {
  searchSortDontIncludeWaitTime?: boolean;
  schoolBusPermit?: {
    name: string | null;
    sid: string | null;
    major: string | null;
    expiry: string | null;
  };
  [k: string]: unknown;
};

export type AppTempData = {
  realTimeStation: string | null;
  searchStation: Record<string, unknown> | null;
  [k: string]: unknown;
};

export type RealtimeData = Record<string, any>;
