import { bootstrapFromStorageAndSeed, syncServerDelta } from '../dataPipeline';

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockAddResourceBundle = jest.fn();

jest.mock('../../lib/storage', () => ({
  asyncStorageStore: {
    get: (...args: unknown[]) => mockGet(...args),
    set: (...args: unknown[]) => mockSet(...args),
  },
}));

jest.mock('../../lib/i18n', () => ({
  i18next: {
    addResourceBundle: (...args: unknown[]) => mockAddResourceBundle(...args),
  },
}));

describe('mobile query data pipeline', () => {
  beforeEach(() => {
    mockGet.mockResolvedValue(null);
    mockSet.mockResolvedValue(undefined);
    mockAddResourceBundle.mockClear();
  });

  it('bootstraps app data from seed when storage is empty', async () => {
    const result = await bootstrapFromStorageAndSeed();

    expect(result.appData.bus).toBeDefined();
    expect(result.appData.station).toBeDefined();
    expect(result.appData.GPS).toBeDefined();
    expect(result.lastModifiedDates).toBeNull();
    expect(mockAddResourceBundle).toHaveBeenCalled();
  });

  it('prefers persisted table data over seed data during bootstrap', async () => {
    mockGet.mockImplementation(async (key: string) => {
      if (key === 'data-Route') {
        return {
          TEST: {
            schedule: ['00:00', '23:59', '10', 'TD', 'WK-Mon', ''],
            stations: { name: ['TEST'], attr: ['NULL'], time: [0] },
          },
        };
      }
      return null;
    });

    const result = await bootstrapFromStorageAndSeed();

    expect(result.appData.bus).toEqual(
      expect.objectContaining({
        TEST: expect.any(Object),
      }),
    );
  });

  it('syncs server delta, persists cache, and reports batch fallback without throwing', async () => {
    const result = await syncServerDelta(
      null,
      {
        fetchServerDates: async () => ({
          Route: '1',
          gps: '1',
          notice: '1',
          station: '1',
          website: '1',
          translateroute: '1',
          'timetable.json': '1',
        }),
        fetchDelta: async () => {
          throw new Error('network down');
        },
      },
    );

    expect(result.batchError).toBe(true);
    expect(result.state.appData.bus).toBeDefined();
    expect(mockSet).toHaveBeenCalledWith('lastModifiedDates', expect.any(Object));
  });
});
