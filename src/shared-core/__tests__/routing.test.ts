import { describe, expect, it } from 'vitest';
import translation from '../../initDatas/translation.json';
import routeSeed from '../../initDatas/Route.json';
import stationSeed from '../../initDatas/station.json';
import timetableSeed from '../../initDatas/timetable.json';
import { calculateRoute } from '../routing/getRoute';
import { processBusStatus } from '../realtime/getRealTime';

const englishTranslations = translation.en as unknown as Record<string, string | null>;
const t = ((key: string) => englishTranslations[key] ?? key) as any;

describe('shared routing core', () => {
  it('calculates at least one route between known campuses', () => {
    const result = calculateRoute(
      t,
      `${t('MTR')} (MTR)`,
      `${t('NAC')} (NAC)`,
      'building',
      'WK-Mon',
      'TD',
      '10',
      '00',
      true,
      routeSeed as any,
      stationSeed as any,
      timetableSeed as any,
      {},
      {},
    ) as any;

    expect(result.error).not.toBe(true);
    expect(result.sortedResults.length).toBeGreaterThan(0);
    expect(result.sortedResults[0]).toEqual(
      expect.objectContaining({
        busNo: expect.any(String),
        start: expect.any(String),
        arrivalTime: expect.any(String),
      }),
    );
  });

  it('annotates abnormal realtime status onto bus entries', () => {
    const bus = {
      A: {
        schedule: ['00:00', '23:59', '10', 'TD', 'WK-Mon', ''],
        stations: { name: ['MTR', 'NAC'], attr: ['NULL', 'NULL'], time: [0, 600] },
      },
    } as any;

    const processed = processBusStatus({ A: 'suspended' }, {}, bus);
    expect(processed.A.stats?.status).toBe('suspended');
    expect(processed.A.warning).toBe('Bus-suspended');
  });
});
