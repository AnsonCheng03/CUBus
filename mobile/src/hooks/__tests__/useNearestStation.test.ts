import { resolveNearestStationCode } from '../useNearestStation';

jest.mock('../../lib/location', () => ({
  getNearestStation: jest.fn(),
}));

const { getNearestStation } = jest.requireMock('../../lib/location') as {
  getNearestStation: jest.Mock;
};
const translate = ((key: string) => key) as any;

describe('resolveNearestStationCode', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
  });

  it('returns the nearest station code when GPS lookup succeeds', async () => {
    getNearestStation.mockResolvedValue([['MTR', { distance: 0.1 }]]);

    await expect(resolveNearestStationCode(translate, {} as never)).resolves.toBe('MTR');
  });

  it('throws when the nearest lookup reports an error station', async () => {
    getNearestStation.mockResolvedValue([['nearst_error', { error: true }]]);

    await expect(resolveNearestStationCode(translate, {} as never)).rejects.toThrow('nearst_error');
  });
});
