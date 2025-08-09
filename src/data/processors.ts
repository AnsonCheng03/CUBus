import type { AppData, ServerResponse } from "./types";

export type ProcessDeps = {
  i18next: any;
  setAppData: (updater: (prev: AppData) => AppData) => void;
};

export type Processor = (data: any, deps: ProcessDeps) => Promise<void>;

export const processors: Record<string, Processor> = {
  translation: async (data, { i18next }) => {
    if (data?.en) i18next.addResourceBundle("en", "global", data.en);
    if (data?.zh) i18next.addResourceBundle("zh", "global", data.zh);
  },
  website: async (data, { setAppData }) => {
    setAppData((p) => ({ ...p, WebsiteLinks: data }));
  },
  Route: async (data, { setAppData }) => {
    setAppData((p) => ({ ...p, bus: data }));
  },
  gps: async (data, { setAppData }) => {
    setAppData((p) => ({ ...p, GPS: data }));
  },
  notice: async (data, { setAppData }) => {
    setAppData((p) => ({ ...p, notice: data }));
  },
  station: async (data, { setAppData }) => {
    setAppData((p) => ({ ...p, station: data }));
  },
  "timetable.json": async (data, { setAppData }) => {
    setAppData((p) => ({ ...p, ["timetable.json"]: data }));
  },
  token: async (data, { setAppData }) => {
    setAppData((p) => ({ ...p, token: data }));
  },
};

// helper to normalize translation tables from serverDates
export function normalizeTableName(
  name: string,
  seen: Set<string>
): string | null {
  const trans = new Set([
    "translateroute",
    "translatewebsite",
    "translatebuilding",
    "translateattribute",
  ]);
  if (trans.has(name)) {
    if (seen.has("translation")) return null;
    seen.add("translation");
    return "translation";
  }
  return name;
}

// pick data from response or local cache fallback
export function pickFromResponseOrLocal(
  table: string,
  resp: ServerResponse,
  localFallback: any
) {
  return table in resp ? (resp as any)[table] : localFallback;
}
