import type { AppData, ModificationDates, ServerResponse } from '../shared-core/app/types';
import { localSeed, seedDates } from '../shared-core/data/initData';
import { normalizeTableName, pickFromResponseOrLocal, processors } from '../shared-core/data/processors';
import { i18next } from '../lib/i18n';
import { asyncStorageStore } from '../lib/storage';

export type BootstrapState = {
  appData: AppData;
  lastModifiedDates: ModificationDates | null;
};

const translator = {
  addBundle(lang: 'en' | 'zh', namespace: string, resources: Record<string, string>) {
    i18next.addResourceBundle(lang, namespace, resources, true, true);
  },
};

function getOrderedTables() {
  const seen = new Set<string>();
  const orderedTables: string[] = [];

  for (const raw of Object.keys(seedDates)) {
    const table = normalizeTableName(raw, seen);
    if (table) {
      orderedTables.push(table);
    }
  }

  return orderedTables;
}

async function applyTable(appData: AppData, table: string, data: unknown) {
  const handler = processors[table];
  if (!handler) {
    return appData;
  }

  let next = appData;
  await handler(data, {
    translator,
    setAppData(updater) {
      next = updater(next);
    },
  });
  return next;
}

async function buildAppDataFromTables(tableData: Record<string, unknown>) {
  let appData: AppData = {};
  for (const table of getOrderedTables()) {
    if (!(table in tableData)) {
      continue;
    }

    appData = await applyTable(appData, table, tableData[table]);
  }

  if ('token' in tableData) {
    appData = await applyTable(appData, 'token', tableData.token);
  }

  return appData;
}

async function readStoredOrSeedTable(table: string) {
  const stored = await asyncStorageStore.get<unknown>(`data-${table}`);
  return stored ?? localSeed[table as keyof typeof localSeed];
}

async function persistTable(table: string, data: unknown) {
  if (table === 'timetable.json') {
    return;
  }

  await asyncStorageStore.set(`data-${table}`, data);
}

export async function bootstrapFromStorageAndSeed(): Promise<BootstrapState> {
  const lastModifiedDates = await asyncStorageStore.get<ModificationDates>('lastModifiedDates');
  const tableData: Record<string, unknown> = {};

  for (const table of getOrderedTables()) {
    const localData = await readStoredOrSeedTable(table);
    if (localData != null) {
      tableData[table] = localData;
    }
  }

  const storedToken = await asyncStorageStore.get<string>('data-token');
  if (storedToken) {
    tableData.token = storedToken;
  }

  const appData = await buildAppDataFromTables(tableData);
  return {
    appData,
    lastModifiedDates: lastModifiedDates ?? null,
  };
}

export async function syncServerDelta(
  currentDates: ModificationDates | null,
  api: {
    fetchServerDates: () => Promise<ModificationDates>;
    fetchDelta: (current: ModificationDates | null) => Promise<ServerResponse>;
  },
) {
  const serverDates = await api.fetchServerDates();
  let response: ServerResponse;
  let batchError = false;

  try {
    response = await api.fetchDelta(currentDates);
  } catch {
    batchError = true;
    response = { modificationDates: seedDates };
  }

  const tableData: Record<string, unknown> = {};

  for (const table of getOrderedTables().filter((value) => value in serverDates || value === 'translation')) {
    const fallback = await readStoredOrSeedTable(table);
    const resolvedData = pickFromResponseOrLocal(table, response, fallback);
    if (resolvedData == null) {
      continue;
    }

    tableData[table] = resolvedData;
    await persistTable(table, resolvedData);
  }

  if ('token' in response && response.token != null) {
    tableData.token = response.token;
    await persistTable('token', response.token);
  } else {
    const storedToken = await asyncStorageStore.get<string>('data-token');
    if (storedToken) {
      tableData.token = storedToken;
    }
  }

  const nextDates = response.modificationDates ?? serverDates;
  await asyncStorageStore.set('lastModifiedDates', nextDates);

  return {
    state: {
      appData: await buildAppDataFromTables(tableData),
      lastModifiedDates: nextDates,
    },
    batchError,
  };
}
