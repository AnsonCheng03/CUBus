import type { AppSettings, AppTempData, RealtimeData } from '../shared-core/app/types';
import { DEFAULT_APP_TEMP_DATA } from '../providers/internal/tempState';

type E2EScenario = 'default' | 'permit-saved' | 'route-search';

function parseJsonEnv<T>(raw: string | undefined, fallback: T): T {
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const scenario = (process.env.EXPO_PUBLIC_E2E_SCENARIO ?? 'default') as E2EScenario;
const enabled = process.env.EXPO_PUBLIC_E2E_MODE === '1';

function getScenarioAppSettings(currentScenario: E2EScenario): AppSettings {
  if (currentScenario === 'permit-saved') {
    return {
      schoolBusPermit: {
        name: 'Ada Lovelace',
        sid: '1155123456',
        major: 'CSCI',
        expiry: '06/2026',
      },
    };
  }

  return {};
}

function getScenarioTempData(currentScenario: E2EScenario): AppTempData {
  if (currentScenario === 'route-search') {
    return {
      realTimeStation: null,
      searchStation: {
        routeSearchStart: 'MTR (MTR)',
        routeSearchDest: 'NAC (NAC)',
        departNow: true,
        selectWeekday: 'WK-Mon',
        selectDate: 'TD',
        selectHour: '10',
        selectMinute: '00',
      },
    };
  }

  return DEFAULT_APP_TEMP_DATA;
}

const defaultRealtimeData: RealtimeData = {
  'Status.json': {},
  'reportedTime.json': {},
};

const scenarioAppSettings = getScenarioAppSettings(scenario);
const scenarioTempData = getScenarioTempData(scenario);

export const e2eConfig = {
  enabled,
  scenario,
  appSettings: {
    ...scenarioAppSettings,
    ...parseJsonEnv<AppSettings>(process.env.EXPO_PUBLIC_E2E_APP_SETTINGS_JSON, {}),
  },
  appTempData: {
    ...scenarioTempData,
    ...parseJsonEnv<AppTempData>(
      process.env.EXPO_PUBLIC_E2E_APP_TEMP_DATA_JSON,
      DEFAULT_APP_TEMP_DATA,
    ),
  },
  realtimeData: parseJsonEnv<RealtimeData>(
    process.env.EXPO_PUBLIC_E2E_REALTIME_JSON,
    defaultRealtimeData,
  ),
};
