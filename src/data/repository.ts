// src/data/repository.ts
import { kv } from "./storage";
import { fetchRealtime, fetchServerDates, fetchDelta } from "./api";
import {
  processors,
  normalizeTableName,
  pickFromResponseOrLocal,
} from "./processors";
import type { ModificationDates, ServerResponse } from "./types";

import gps from "../initDatas/gps.json";
import Route from "../initDatas/Route.json";
import station from "../initDatas/station.json";
import notice from "../initDatas/notice.json";
import website from "../initDatas/website.json";
import translation from "../initDatas/translation.json";
import timetable from "../initDatas/timetable.json";
import lastModifiedDates from "../initDatas/lastModifiedDates.json";

const localSeed: Record<string, any> = {
  translation,
  website,
  Route,
  gps,
  notice,
  station,
  "timetable.json": timetable,
};

export type RepoDeps = {
  i18next: any;
  setAppData: (updater: any) => void;
  setNetworkError: (updater: any) => void;
  setRealtimeData: (data: any) => void;
  setHint: (s: string) => void;
  t: (k: string) => string;
};

export function createRepository(deps: RepoDeps) {
  const { i18next, setAppData, setNetworkError, setRealtimeData, setHint, t } =
    deps;

  const processOne = async (table: string, data: any) => {
    // persist to local cache (except timetable large file if you wish)
    if (table !== "timetable.json") {
      await kv.set(`data-${table}`, data);
    }
    const handler = processors[table];
    if (handler) await handler(data, { i18next, setAppData });
  };

  const loadLocalOrSeed = async (table: string) => {
    const cached = await kv.get<any>(`data-${table}`);
    return cached ?? localSeed[table];
  };

  return {
    async initAndWarm(): Promise<ModificationDates | null> {
      try {
        const appSettings = await kv.get("appSettings");
        if (appSettings) {
          // caller setAppSettings outside repo if needed
        }
      } catch {
        await kv.clearAll();
      }

      const stored = await kv.get<ModificationDates>("lastModifiedDates");
      // warm UI with local/seed
      const seedDates = lastModifiedDates as ModificationDates;
      const seen = new Set<string>();
      for (const raw of Object.keys(seedDates)) {
        const table = normalizeTableName(raw, seen);
        if (!table) continue;
        const local = await loadLocalOrSeed(table);
        if (local) await processOne(table, local);
      }
      return stored ?? null;
    },

    async realtimeOnce() {
      try {
        const data = await fetchRealtime();
        setRealtimeData(data);
        setNetworkError((p: any) => ({ ...p, realtime: false }));
      } catch {
        setNetworkError((p: any) => ({ ...p, realtime: true }));
      }
    },

    async syncDelta(currentDates: ModificationDates | null) {
      try {
        setHint(t("DownloadFiles-Downloading"));
        const serverDates = await fetchServerDates();

        setHint(t("DownloadFiles-Fetching-Latest"));
        let resp: ServerResponse;
        try {
          resp = await fetchDelta(currentDates);
          setNetworkError((p: any) => ({ ...p, batch: false }));
        } catch {
          setNetworkError((p: any) => ({ ...p, batch: true }));
          resp = { lastModifiedDates }; // offline mode
        }

        setHint(t("DownloadFiles-Processing"));

        const seen = new Set<string>();
        for (const raw of Object.keys(serverDates)) {
          const table = normalizeTableName(raw, seen);
          if (!table) continue;

          const fallback = await loadLocalOrSeed(table);
          const tableData = pickFromResponseOrLocal(table, resp, fallback);
          if (tableData) await processOne(table, tableData);
        }

        if ("token" in resp) await processOne("token", resp.token);
        if ("modificationDates" in resp) {
          await kv.set("lastModifiedDates", resp.modificationDates);
        }

        setHint(t("StoreFile-Complete"));
      } catch (e: any) {
        setHint(t("StoreFile-Error"));
        setNetworkError((p: any) => ({ ...p, batch: true }));
        throw e;
      }
    },
  };
}
